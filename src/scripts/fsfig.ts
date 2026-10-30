/**
 * 研究の図: DIY-SDFS をモチーフにした縦長の canvas。
 *   センサー（軍艦島の振動計）→ FUSE プロセス（ユーザー空間）→ カーネル境界 → ブロック割り当て表 → 複数 NAS
 * データブロックが上から下へ流れ、割り当て表のセルが灯り、NAS の使用量が少しずつ増える。
 */
import { colors, reduce, dpr, TAU } from './fig';

type Blk = { pts: { x: number; y: number }[]; d: number; len: number; cell: number; nas: number; born: number };

export type FsOptions = { labels?: boolean };
export function createFsFig(canvas: HTMLCanvasElement, o: FsOptions = {}) {
  const labels = o.labels ?? true;
  const g = canvas.getContext('2d')!;
  const MONO = '"DM Mono", ui-monospace, monospace';
  let W = 0, H = 0;
  const fit = () => {
    const r = canvas.getBoundingClientRect(); W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    cells.length = 0;
  };

  // ---- レイアウト（高さ 380 を基準に、縦方向は H に合わせて伸縮）
  const L = () => {
    const k = H / 380, pad = 12;
    const sensors = [0.12, 0.31, 0.5, 0.69, 0.88].map((u) => ({ x: pad + u * (W - pad * 2), y: 30 * k }));
    const fuse = { x: W / 2, y: 118 * k, w: Math.min(W * 0.62, 250), h: 44 * k };
    const kernelY = 170 * k;
    const cw = Math.max(3.5, 7 * k), gap = Math.max(1, 2 * k), rows = 5;
    const cols = Math.max(12, Math.floor((W - pad * 2 + gap) / (cw + gap)));
    const gridW = cols * (cw + gap) - gap, gx = Math.round((W - gridW) / 2), gy = Math.round(192 * k);
    const busY = 262 * k;
    const nw = Math.min(64, (W - pad * 2) / 4 - 10), nh = 56 * k;
    const nas = [0, 1, 2, 3].map((i) => ({ x: pad + (W - pad * 2) * (0.125 + i * 0.25), y: 318 * k, w: nw, h: nh }));
    return { k, pad, sensors, fuse, kernelY, grid: { cols, rows, cw, gap, gx, gy }, busY, nas };
  };

  // ---- 状態
  type Cell = { on: number; nas: number };
  const cells: Cell[] = [];
  const blocks: Blk[] = [];
  const usage = [0.42, 0.31, 0.55, 0.2]; // NAS の使用率（0..1）。受信するたび少し増え、満杯近くで戻る
  const led = [0, 0, 0, 0]; // 受信直後に光る
  let nextCell = 0, nextNas = 0, spawnIn = 0.3, now = 0, T = 0;
  const SPEED = 130;

  const path = (si: number, nas: number, cellIdx: number) => {
    const l = L(), s = l.sensors[si], f = l.fuse, gr = l.grid, n = l.nas[nas];
    const cx = gr.gx + (cellIdx % gr.cols) * (gr.cw + gr.gap) + gr.cw / 2, cy = gr.gy + Math.floor(cellIdx / gr.cols) * (gr.cw + gr.gap) + gr.cw / 2;
    const pts = [
      { x: s.x, y: s.y + 8 },
      { x: f.x + (s.x - f.x) * 0.25, y: f.y - f.h / 2 },
      { x: f.x, y: f.y + f.h / 2 },
      { x: f.x, y: l.kernelY },
      { x: cx, y: cy },
      { x: cx, y: l.busY },
      { x: n.x, y: l.busY },
      { x: n.x, y: n.y - n.h / 2 + 6 },
    ];
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    return { pts, len };
  };
  const at = (b: Blk, d: number) => {
    let rest = d;
    for (let i = 1; i < b.pts.length; i++) {
      const p = b.pts[i - 1], q = b.pts[i], sl = Math.hypot(q.x - p.x, q.y - p.y);
      if (rest <= sl) { const u = sl ? rest / sl : 0; return { x: p.x + (q.x - p.x) * u, y: p.y + (q.y - p.y) * u, seg: i }; }
      rest -= sl;
    }
    const e = b.pts[b.pts.length - 1]; return { x: e.x, y: e.y, seg: b.pts.length };
  };
  const spawn = (progress = 0) => {
    const l = L();
    if (!cells.length) for (let i = 0; i < l.grid.cols * l.grid.rows; i++) cells.push({ on: -1, nas: 0 });
    const si = Math.floor(Math.random() * l.sensors.length), nas = nextNas, cell = nextCell;
    nextNas = (nextNas + 1 + Math.floor(Math.random() * 2)) % 4;
    nextCell = (nextCell + 1 + Math.floor(Math.random() * 3)) % cells.length;
    const p = path(si, nas, cell);
    blocks.push({ ...p, d: p.len * progress, cell, nas, born: now });
  };

  // ---- 描画
  const draw = (t: number, dt: number) => {
    const c = colors(), l = L();
    g.clearRect(0, 0, W, H);
    if (W < 10 || H < 10) return;
    // 薄いドット格子
    g.fillStyle = c.rule;
    for (let y = 8; y < H; y += 16) for (let x = 8; x < W; x += 16) g.fillRect(x, y, 1, 1);

    // センサー: 小さな円と、広がる波紋
    l.sensors.forEach((s, i) => {
      const ph = (t * 0.5 + i * 0.37) % 1;
      g.strokeStyle = c.ai; g.lineWidth = 1;
      const sr = Math.max(2.5, 4 * l.k), ring = 14 * l.k;
      if (!reduce) for (const o of [0, 0.5]) {
        const u = (ph + o) % 1;
        g.globalAlpha = (1 - u) * 0.5; g.beginPath(); g.arc(s.x, s.y, sr + u * ring, 0, TAU); g.stroke();
      } else { g.globalAlpha = 0.35; g.beginPath(); g.arc(s.x, s.y, sr + ring * 0.5, 0, TAU); g.stroke(); }
      g.globalAlpha = 1;
      g.fillStyle = c.paper; g.beginPath(); g.arc(s.x, s.y, sr, 0, TAU); g.fill(); g.stroke();
      g.fillStyle = c.ai; g.beginPath(); g.arc(s.x, s.y, sr * 0.4, 0, TAU); g.fill();
      // センサーから FUSE への集線
      g.strokeStyle = c.rule; g.beginPath(); g.moveTo(s.x, s.y + 8); g.lineTo(l.fuse.x + (s.x - l.fuse.x) * 0.25, l.fuse.y - l.fuse.h / 2); g.stroke();
    });

    // FUSE プロセス（ユーザー空間）。中にハッシュ風のストライプが流れる
    const f = l.fuse;
    g.fillStyle = c.paper; g.strokeStyle = c.ink2; g.lineWidth = 1.2; g.lineJoin = 'round';
    g.beginPath(); g.rect(f.x - f.w / 2, f.y - f.h / 2, f.w, f.h); g.fill(); g.stroke();
    g.save(); g.beginPath(); g.rect(f.x - f.w / 2 + 1, f.y - f.h / 2 + 1, f.w - 2, f.h - 2); g.clip();
    g.strokeStyle = c.aiSoft; g.lineWidth = 3;
    const sh = reduce ? 0 : (t * 18) % 12;
    for (let x = f.x - f.w / 2 - 12 + sh; x < f.x + f.w / 2 + 12; x += 12) { g.beginPath(); g.moveTo(x, f.y + f.h / 2); g.lineTo(x + 10, f.y - f.h / 2); g.stroke(); }
    g.restore();
    if (labels) {
      g.fillStyle = c.ink2; g.font = `10px ${MONO}`; g.textBaseline = 'middle'; g.textAlign = 'center';
      g.fillText('FUSE  ·  DIY-SDFS', f.x, f.y);
      g.textAlign = 'left';
    }

    // ユーザー空間 / カーネルの境界
    g.strokeStyle = c.mute; g.lineWidth = 1; g.setLineDash([4, 4]);
    g.beginPath(); g.moveTo(l.pad, l.kernelY); g.lineTo(W - l.pad, l.kernelY); g.stroke(); g.setLineDash([]);
    if (labels) {
      g.fillStyle = c.mute; g.font = `9px ${MONO}`;
      g.textBaseline = 'bottom'; g.fillText('user space', l.pad, l.kernelY - 3);
      g.textBaseline = 'top'; g.fillText('kernel  /  VFS', l.pad, l.kernelY + 4);
    }
    // FUSE からカーネルへの縦線
    g.strokeStyle = c.rule; g.beginPath(); g.moveTo(f.x, f.y + f.h / 2); g.lineTo(f.x, l.kernelY); g.stroke();

    // ブロック割り当て表。灯ったセルはゆっくり消える
    const gr = l.grid;
    if (!cells.length) for (let i = 0; i < gr.cols * gr.rows; i++) cells.push({ on: -1, nas: 0 });
    for (let i = 0; i < cells.length; i++) {
      const x = gr.gx + (i % gr.cols) * (gr.cw + gr.gap), y = gr.gy + Math.floor(i / gr.cols) * (gr.cw + gr.gap), ce = cells[i];
      const age = ce.on < 0 ? 1e9 : now - ce.on;
      const a = reduce ? (ce.on < 0 ? 0 : 0.7) : Math.max(0, 1 - age / 30);
      g.fillStyle = c.paper2; g.fillRect(x, y, gr.cw, gr.cw);
      if (a > 0) { g.globalAlpha = 0.25 + a * 0.75; g.fillStyle = c.ai; g.fillRect(x, y, gr.cw, gr.cw); g.globalAlpha = 1; }
    }
    // 割り当て表から NAS へのバス
    g.strokeStyle = c.rule; g.lineWidth = 1;
    g.beginPath(); g.moveTo(l.nas[0].x, l.busY); g.lineTo(l.nas[3].x, l.busY); g.stroke();
    l.nas.forEach((n) => { g.beginPath(); g.moveTo(n.x, l.busY); g.lineTo(n.x, n.y - n.h / 2); g.stroke(); });

    // NAS 4 台。ディスクスロット 3 本・受信 LED・使用量ゲージ
    l.nas.forEach((n, i) => {
      led[i] = Math.max(0, led[i] - dt * 2.5);
      g.fillStyle = c.paper; g.strokeStyle = c.ink2; g.lineWidth = 1.2;
      g.beginPath(); g.rect(n.x - n.w / 2, n.y - n.h / 2, n.w, n.h); g.fill(); g.stroke();
      g.strokeStyle = c.rule;
      for (let s = 0; s < 3; s++) { const y = n.y - n.h / 2 + (12 + s * 10) * l.k; g.beginPath(); g.moveTo(n.x - n.w / 2 + 8, y); g.lineTo(n.x + n.w / 2 - 8, y); g.stroke(); }
      g.fillStyle = led[i] > 0 ? c.ai : c.rule; g.beginPath(); g.arc(n.x + n.w / 2 - 7, n.y - n.h / 2 + 7 * l.k, 2, 0, TAU); g.fill();
      const gy = n.y + n.h / 2 - 9 * l.k, gw = n.w - 16;
      g.fillStyle = c.paper2; g.fillRect(n.x - gw / 2, gy, gw, 4);
      g.fillStyle = c.ai; g.fillRect(n.x - gw / 2, gy, gw * usage[i], 4);
    });
    if (labels) {
      g.fillStyle = c.mute; g.font = `9px ${MONO}`; g.textBaseline = 'top'; g.textAlign = 'center';
      l.nas.forEach((n, i) => g.fillText(`storage${i + 1}`, n.x, n.y + n.h / 2 + 5));
      g.textAlign = 'left';
    }

    // 流れるブロック
    if (!reduce) {
      spawnIn -= dt;
      if (spawnIn <= 0) {
        spawnIn = 0.16 + Math.random() * 0.3;
        spawn();
        if (Math.random() < 0.35) spawn(); // ときどき同時に 2 つ
      }
    } else if (!blocks.length) {
      [0.05, 0.14, 0.26, 0.38, 0.52, 0.63, 0.7, 0.82, 0.9].forEach((p) => spawn(p));
      cells.forEach((ce, i) => { if ((i * 7919) % 11 < 4) ce.on = 0; });
    }
    for (let i = blocks.length - 1; i >= 0; i--) {
      const b = blocks[i];
      b.d += SPEED * Math.max(0.6, l.k) * dt;
      const p = at(b, b.d);
      if (p.seg >= 5 && cells[b.cell].on < b.born) cells[b.cell].on = now; // 表に到達したら灯す
      if (b.d >= b.len) {
        blocks.splice(i, 1); led[b.nas] = 1;
        usage[b.nas] = usage[b.nas] > 0.92 ? 0.18 : usage[b.nas] + 0.006;
        continue;
      }
      const inFuse = p.seg === 3; // FUSE の中を通っている間は薄く
      g.globalAlpha = inFuse ? 0.35 : 1;
      const bs = Math.max(4, 6 * l.k) / 2;
      g.fillStyle = c.ai; g.fillRect(p.x - bs, p.y - bs, bs * 2, bs * 2);
      g.strokeStyle = c.paper; g.lineWidth = 1; g.strokeRect(p.x - bs - 0.5, p.y - bs - 0.5, bs * 2 + 1, bs * 2 + 1);
      g.globalAlpha = 1;
    }
  };

  // ---- ループ。画面外では止める
  let last = 0, raf = 0, visible = false;
  const frame = (ts: number) => {
    const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
    last = ts; now = ts / 1000; T += dt;
    draw(T, dt);
  };
  const tick = (ts: number) => { frame(ts); if (visible) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; } };
  const wake = () => { if (!raf && !reduce) raf = requestAnimationFrame(tick); };
  fit();
  new ResizeObserver(() => { fit(); blocks.length = 0; if (reduce) frame(performance.now()); }).observe(canvas);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }, { rootMargin: '80px' }).observe(canvas);
  if (reduce) frame(performance.now());
  return { fit };
}
