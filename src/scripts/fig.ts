/**
 * キャリアの節目を描く canvas 図。ヒーロー（年表タブ）とキャリア（各エントリの背景）で共有する。
 *   view: mail = 2021 メール配信、biz = 2022 起業、wave = 音声波形（flavor dev / pm で質感が変わる）
 * 粒子（封筒・人）の出し方は 2 通り:
 *   spray を渡す … 画面全体のオーバーレイ canvas にばら撒く（ヒーロー）
 *   渡さない     … 自分の canvas の中だけで跳ね返る（キャリアの背景）
 */
export type View = 'mail' | 'biz' | 'wave';
export type Flavor = 'dev' | 'pm';
export type FigOptions = {
  canvas: HTMLCanvasElement;
  spray?: HTMLCanvasElement;
  /** 閉じ込めモードのとき、図を描く高さ（canvas の縦中央に置く）。省略時は canvas 全体 */
  figHeight?: number;
};

export const TAU = Math.PI * 2;
const YJ = '#d6213f'; // Yahoo の赤を少し落としたもの
const SANS = '"Zen Kaku Gothic New", system-ui, sans-serif';
const MONO = '"DM Mono", ui-monospace, monospace';
export const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const dpr = Math.min(window.devicePixelRatio || 1, 2);

let c = { ai: '', aiSoft: '', rule: '', ink: '', ink2: '', mute: '', paper: '', paper2: '' };
const readColors = () => {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  c = { ai: v('--ai'), aiSoft: v('--ai-soft'), rule: v('--rule'), ink: v('--ink'), ink2: v('--ink-2'), mute: v('--mute'), paper: v('--paper'), paper2: v('--paper-2') };
};
readColors();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', readColors);
/** 現在の配色（CSS 変数から読んだもの）。他の図からも使う */
export const colors = () => c;

// 2023 / 2025 の波形の右から流れ込む言葉。[右側 1 行目, 右側 2 行目, 左側 日本語, 左側 英語]
const pmWords: [string, string, string, string][] = [
  ['アポ・成約を増やしたい', 'Win more meetings and deals', 'MiiTel Phone', 'MiiTel Phone'],
  ['CRM に履歴を残したい', 'Keep call history in the CRM', 'CRM 連携', 'CRM integrations'],
  ['成果の出る“勝ちパターン”を作りたい', 'Find the patterns that win', 'MiiTel Analytics', 'MiiTel Analytics'],
  ['自社でデータ活用したい', 'Use the data in our own systems', 'MiiTel API（β）', 'MiiTel API (beta)'],
  ['冒頭が聞こえない・途中で途切れる', 'Audio cuts at the start or drops mid-call', '通話品質改善（発生から効果確認まで）', 'Call-quality fixes, from report to verified effect'],
  ['ノンコア業務の自動化', 'Automate non-core work', 'MiiTel Phone', 'MiiTel Phone'],
  ['外部アプリケーションとデータを紐付け', 'Link data with external apps', '各種 Webhook', 'Webhooks'],
  ['大量のユーザーを一括で移したい', 'Move users in bulk', 'ユーザー移行スクリプト', 'User migration scripts'],
  ['有効な営業スキルを定量可視化', 'Quantify the sales skills that work', 'MiiTel Analytics', 'MiiTel Analytics'],
  ['要望が多すぎて追えない', 'Too many requests to track', 'VoC の自動分類', 'Auto-classified VoC'],
];
const devWords: [string, string, string, string][] = [
  ['const [contacts, setContacts] = useState<Contact[]>([])', 'React · TypeScript', '連絡帳機能', 'Contact book'],
  ['qr = qrcode.make(f"{BASE_URL}/q/{code}")', 'Python', 'QR コード管理', 'QR code management'],
  ['terraform plan -out=migration.tfplan', 'Terraform', '無停止大規模データ移行', 'Zero-downtime data migration'],
  ["await page.getByRole('button', { name: '発信' }).click()", 'Playwright · TypeScript', 'E2E テスト自動化', 'E2E test automation'],
  ['scheduler.add_job(collect_voc, "cron", hour=3)', 'Python', 'VoC 自動収集', 'Automated VoC collection'],
  ['useEffect(() => { void fetchContacts() }, [])', 'React · TypeScript', '連絡帳機能', 'Contact book'],
  ['@router.post("/qr/{code}", status_code=201)', 'Python · FastAPI', 'QR コード管理', 'QR code management'],
  ['try (var tx = db.begin()) { copyBatch(tx, cursor); }', 'Java', '無停止大規模データ移行', 'Zero-downtime data migration'],
  ["await expect(page.getByText('通話中')).toBeVisible()", 'Playwright · TypeScript', 'E2E テスト自動化', 'E2E test automation'],
  ['df.groupby("category").size().sort_values()', 'Python · pandas', 'VoC 自動収集', 'Automated VoC collection'],
];
const FLOW_V = 92; // px/s。2023 / 2025 とも同じ速さ

type Kind = 'mail' | 'node';
type P = { kind: Kind; x: number; y: number; vx: number; vy: number; born: number; rot: number; life: number };
type Wd = { x: number; top: boolean; i: number; crossed: number };
type Node = { x: number; y: number; r: number; ph: number; d: number; kind: 0 | 1 | 2 };
type Lane = { lane: number; x: number; v: number; seg: number; w: number };

const rr = (g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  g.beginPath();
  if ('roundRect' in g) g.roundRect(x, y, w, h, r); else g.rect(x, y, w, h);
  g.fill();
};
const envelope = (g: CanvasRenderingContext2D, x: number, y: number, w: number, rot: number, stroke: string, alpha = 1) => {
  const h = w * 0.66;
  g.save(); g.translate(x, y); g.rotate(rot); g.globalAlpha = alpha;
  g.fillStyle = c.paper; g.strokeStyle = stroke; g.lineWidth = 1.4; g.lineJoin = 'round';
  g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(0, h * 0.14); g.lineTo(w / 2, -h / 2); g.stroke();
  g.restore();
};

export function createFig(o: FigOptions) {
  const fig = o.canvas, spray = o.spray ?? null, contained = !spray;
  const fx = fig.getContext('2d')!;
  const sx = spray ? spray.getContext('2d')! : fx;

  // ---- サイズ。W/H は図を描く領域、BW/BH は粒子が跳ね回る箱、oy は図の縦オフセット
  let CW = 0, CH = 0, W = 0, H = 0, oy = 0, BW = 0, BH = 0;
  const fit = () => {
    const r = fig.getBoundingClientRect(); CW = r.width; CH = r.height;
    fig.width = Math.round(CW * dpr); fig.height = Math.round(CH * dpr); fx.setTransform(dpr, 0, 0, dpr, 0, 0);
    W = CW;
    if (spray) {
      H = CH; oy = 0; BW = innerWidth; BH = innerHeight;
      spray.width = Math.round(BW * dpr); spray.height = Math.round(BH * dpr); sx.setTransform(dpr, 0, 0, dpr, 0, 0);
    } else {
      H = Math.min(CH, o.figHeight ?? CH); oy = (CH - H) / 2; BW = CW; BH = CH;
    }
    bizNodes = null;
  };

  // ---- 状態
  let mode: View = 'wave', flavor: Flavor = 'pm', from = 0.3, to = 0.54, modeT = 0, now = 0;

  // ---- 染み出す粒子。初速はまちまち、等速直線運動、箱の端で反射
  //      mail = 2021 の封筒、node = 2022 の人（近くの人と線でつながる）
  const parts: P[] = [];
  const SPEED: Record<Kind, [number, number]> = { mail: [80, 340], node: [25, 80] };
  const LIFE: Record<Kind, number> = { mail: 16, node: 24 };
  const K = contained ? 0.6 : 1; // 閉じ込めるときは遅く・短く
  let emitIn = 0;
  const spawnP = (kind: Kind, px: number, py: number) => {
    let x: number, y: number;
    if (spray) {
      const r = fig.getBoundingClientRect(); x = r.left + px; y = r.top + py;
      if (x < 0 || x > BW || y < 0 || y > BH) return;
    } else { x = px; y = py + oy; }
    const a = Math.random() * TAU, [lo, hi] = SPEED[kind], sp = (lo + Math.random() * (hi - lo)) * K;
    parts.push({ kind, x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, born: now, rot: (Math.random() - 0.5) * 0.9, life: LIFE[kind] * K });
    if (parts.length > (contained ? 40 : 80)) parts.shift();
    if (spray) spray.hidden = false;
  };
  const sprayStep = (dt: number) => {
    if (spray) {
      if (!parts.length) { if (!spray.hidden) { sx.clearRect(0, 0, BW, BH); spray.hidden = true; } return; }
      sx.clearRect(0, 0, BW, BH);
      // 図が画面外にスクロールされたら、残っている粒子は 4 秒以内に消す
      const fr = fig.getBoundingClientRect();
      if (fr.bottom < 0 || fr.top > BH) parts.forEach((e) => { e.born = Math.min(e.born, now - e.life + 4); });
    } else if (!parts.length) return;
    const mw = contained ? (W < 560 ? 22 : 16) : BW < 560 ? 28 : 20, link = contained ? 90 : 130;
    const alpha = (e: P) => { const age = now - e.born; return Math.max(0.05, Math.min(1, age / 0.3 + 0.1, (e.life - age) / 2)); };
    for (let i = parts.length - 1; i >= 0; i--) {
      const e = parts[i];
      if (now - e.born >= e.life) { parts.splice(i, 1); continue; }
      const m = e.kind === 'mail' ? mw / 2 : 6;
      e.x += e.vx * dt; e.y += e.vy * dt;
      if (e.x < m) { e.x = m; e.vx = Math.abs(e.vx); } else if (e.x > BW - m) { e.x = BW - m; e.vx = -Math.abs(e.vx); }
      if (e.y < m) { e.y = m; e.vy = Math.abs(e.vy); } else if (e.y > BH - m) { e.y = BH - m; e.vy = -Math.abs(e.vy); }
    }
    // 人どうしは近いと線でつながる
    const nodes = parts.filter((e) => e.kind === 'node');
    sx.strokeStyle = c.ink2; sx.lineWidth = 1;
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i], b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d > link) continue;
      sx.globalAlpha = (1 - d / link) * 0.5 * Math.min(alpha(a), alpha(b));
      sx.beginPath(); sx.moveTo(a.x, a.y); sx.lineTo(b.x, b.y); sx.stroke();
    }
    for (const e of parts) {
      const a = alpha(e);
      if (e.kind === 'mail') { envelope(sx, e.x, e.y, mw, e.rot, YJ, a); continue; }
      sx.globalAlpha = a;
      sx.beginPath(); sx.arc(e.x, e.y, 3.5, 0, TAU); sx.fillStyle = c.aiSoft; sx.fill(); sx.strokeStyle = c.ai; sx.lineWidth = 1.2; sx.stroke();
    }
    sx.globalAlpha = 1;
  };
  const fadeParts = () => { parts.forEach((e) => { e.born = Math.min(e.born, now - e.life + 1); }); };

  // ---- 2023 / 2025: 右から左へ流れる音声波形。右から言葉が流れ込み、現在の線を越えると左側で別の言葉になる
  //      2023 (dev): コード片 → 作ったもの。2025 (pm): VoC → 機能
  const flow: Wd[] = [];
  let wordIn = 0.6, wordIdx = 0;
  const wave = (t: number, dt: number) => {
    const mid = H / 2, amp0 = H * 0.42, dev = flavor === 'dev';
    const words = dev ? devWords : pmWords;
    const bars = Math.max(48, Math.floor(W / (dev ? 4 : 7))), bw = W / bars;
    // 「現在」の帯。広い画面では指定どおり（やや左）、狭い画面では左右を分ける線が画面の真ん中に来るようにする
    const span = to - from, from_ = W < 560 ? 0.5 - span : from, to_ = W < 560 ? 0.5 : to;
    const lineX = to_ * W, fv = FLOW_V;
    if (dev) {
      fx.strokeStyle = c.rule; fx.lineWidth = 1; fx.setLineDash([2, 5]);
      for (const l of [0.33, 0.66, 1]) {
        fx.beginPath(); fx.moveTo(0, mid - amp0 * l); fx.lineTo(W, mid - amp0 * l); fx.moveTo(0, mid + amp0 * l); fx.lineTo(W, mid + amp0 * l); fx.stroke();
      }
      fx.setLineDash([]);
      fx.beginPath();
      for (let k = 0; k <= 40; k++) { const x = (k / 40) * W; fx.moveTo(x, H - (k % 5 === 0 ? 8 : 4)); fx.lineTo(x, H); }
      fx.stroke();
    } else {
      fx.fillStyle = c.aiSoft; fx.fillRect(from_ * W, 6, (to_ - from_) * W, H - 12);
    }
    const tops: number[] = [];
    const scroll = (t * fv) / bw;
    for (let i = 0; i < bars; i++) {
      const x = i / bars, u = i + scroll;
      const env = 0.25 + 0.75 * Math.pow(Math.sin(x * Math.PI), 1.1);
      const a = (Math.sin(u * 0.33) * 0.5 + 0.5) * (Math.sin(u * 0.12) * 0.5 + 0.5) * (0.8 + 0.2 * Math.sin(t * 2 + i));
      const amp = (0.15 + a * 0.85) * env * amp0;
      tops.push(amp);
      fx.fillStyle = x >= from_ && x < to_ ? c.ai : c.rule;
      if (dev) fx.fillRect(i * bw + bw * 0.35, mid - amp, Math.max(1, bw * 0.3), amp * 2);
      else rr(fx, i * bw + bw * 0.22, mid - amp, bw * 0.56, amp * 2, bw * 0.28);
    }
    if (dev) {
      fx.strokeStyle = c.rule; fx.lineWidth = 1; fx.beginPath(); fx.moveTo(0, mid); fx.lineTo(W, mid); fx.stroke();
      fx.strokeStyle = c.ai; fx.globalAlpha = 0.45; fx.beginPath();
      tops.forEach((amp, i) => { const x = i * bw + bw / 2; if (i) fx.lineTo(x, mid - amp); else fx.moveTo(x, mid - amp); });
      fx.stroke(); fx.globalAlpha = 1;
    }
    // 言葉の流れ。上下交互に出す
    if (!reduce) {
      wordIn -= dt;
      if (wordIn <= 0) { wordIn = (dev ? 1.8 : 2.5) + Math.random() * 1; const k = wordIdx++; flow.push({ x: W + 8, top: k % 2 === 0, i: k % words.length, crossed: -1 }); }
      for (let i = flow.length - 1; i >= 0; i--) {
        const w = flow[i]; w.x -= fv * dt;
        if (w.crossed < 0 && w.x <= lineX) w.crossed = t;
        if (w.x < -260) flow.splice(i, 1);
      }
    } else if (!flow.length) {
      flow.push({ x: W * 0.72, top: true, i: 0, crossed: -1 }, { x: W * 0.2, top: false, i: 1, crossed: 0 });
    }
    flow.forEach((w) => {
      const done = w.crossed >= 0, wd = words[w.i % words.length];
      let [l1, l2] = done ? [wd[2], wd[3]] : [wd[0], wd[1]];
      const f1 = done || !dev ? `500 12px ${SANS}` : `11px ${MONO}`, f2 = `10px ${MONO}`;
      const y = w.top ? 10 : H - 29;
      fx.font = f1;
      // 線の右側が狭い画面では、入りきらない行末を省略する
      if (!done) { const maxW = W - lineX - 14; while (fx.measureText(l1).width > maxW && l1.length > 6) l1 = l1.slice(0, -2) + '…'; }
      const w1 = fx.measureText(l1).width;
      fx.font = f2; const w2 = fx.measureText(l2).width;
      const bwid = Math.max(w1, w2) + 12;
      const fade = Math.min(1, (W - w.x) / 40, (w.x + 240) / 60);
      fx.globalAlpha = fade * 0.92; fx.fillStyle = c.paper; fx.fillRect(w.x - 6, y - 2, bwid, 28);
      fx.globalAlpha = fade; fx.textBaseline = 'top';
      fx.fillStyle = done ? c.ai : dev ? c.ink2 : c.mute; fx.font = f1; fx.fillText(l1, w.x, y);
      fx.fillStyle = c.mute; fx.font = f2; fx.fillText(l2, w.x, y + 15);
      if (done) { fx.fillStyle = c.ai; fx.fillRect(w.x - 6, y - 2, 2, 28); }
      fx.globalAlpha = 1;
    });
    // 現在の線と、越えた瞬間の波紋
    fx.fillStyle = c.ai; fx.fillRect(lineX - 0.75, 0, 1.5, H);
    flow.forEach((w) => {
      const k = w.crossed < 0 ? 1 : (t - w.crossed) / 0.6; if (k >= 1) return;
      fx.strokeStyle = c.ai; fx.globalAlpha = 1 - k; fx.lineWidth = 1.5;
      fx.beginPath(); fx.arc(lineX, w.top ? 16 : H - 16, 4 + k * 18, 0, TAU); fx.stroke(); fx.globalAlpha = 1;
    });
    if (dev) {
      fx.fillStyle = c.ai; fx.beginPath(); fx.moveTo(lineX - 4, 0); fx.lineTo(lineX + 4, 0); fx.lineTo(lineX, 5); fx.fill();
    } else {
      fx.fillStyle = c.ai; fx.beginPath(); fx.arc(lineX, H - 7, 4.5, 0, TAU); fx.fill();
      fx.strokeStyle = c.paper; fx.lineWidth = 1.5; fx.stroke();
    }
  };

  // ---- 2022: 左に 20 人のネットワーク（代表 1・社員 4・アルバイト 15）、右に曼荼羅チャート
  let bizNodes: Node[] | null = null;
  let bizEdges: [number, number][] = [];
  const bizBuild = () => {
    const pad = 12, half = W / 2 - pad;
    const cx = pad + half / 2, cy = H / 2, rx = half / 2 - 14, ry = H / 2 - 12;
    let seed = 2022;
    const rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;
    const ns: Node[] = [{ x: cx, y: cy, r: 7, ph: 0, d: 0, kind: 0 }];
    const es: [number, number][] = [];
    const hubA: number[] = [];
    for (let i = 0; i < 4; i++) {
      const a = Math.PI / 4 + (i * Math.PI) / 2 + (rnd() - 0.5) * 0.4;
      hubA.push(a);
      ns.push({ x: cx + Math.cos(a) * rx * 0.5, y: cy + Math.sin(a) * ry * 0.55, r: 5, ph: rnd() * TAU, d: 0.25 + i * 0.1, kind: 1 });
      es.push([0, i + 1]);
    }
    for (let i = 0; i < 15; i++) {
      const hub = i % 4;
      const a = hubA[hub] + (rnd() - 0.5) * 1.5, k = 0.72 + rnd() * 0.28;
      ns.push({ x: cx + Math.cos(a) * rx * k, y: cy + Math.sin(a) * ry * k, r: 3.5, ph: rnd() * TAU, d: 0.7 + i * 0.07, kind: 2 });
      es.push([hub + 1, ns.length - 1]);
    }
    for (let i = 5; i < ns.length; i++) {
      if (rnd() > 0.45) continue;
      let best = -1, bd = 1e9;
      for (let j = 5; j < ns.length; j++) {
        if (j === i) continue;
        const d = (ns[i].x - ns[j].x) ** 2 + (ns[i].y - ns[j].y) ** 2;
        if (d < bd) { bd = d; best = j; }
      }
      if (best > 0) es.push([i, best]);
    }
    bizNodes = ns; bizEdges = es;
  };
  const biz = (t: number, dt: number) => {
    if (!bizNodes) bizBuild();
    const ns = bizNodes!;
    const pos = (n: Node) => ({ x: n.x + Math.sin(t * 0.6 + n.ph) * 2.5, y: n.y + Math.cos(t * 0.5 + n.ph) * 2 });
    const sc = (n: Node) => (reduce ? 1 : Math.min(1, Math.max(0, (modeT - n.d) / 0.4)));
    fx.strokeStyle = c.rule; fx.lineWidth = 1;
    bizEdges.forEach(([a, b]) => {
      const s = Math.min(sc(ns[a]), sc(ns[b])); if (s <= 0) return;
      const p = pos(ns[a]), q = pos(ns[b]);
      fx.globalAlpha = s; fx.beginPath(); fx.moveTo(p.x, p.y); fx.lineTo(q.x, q.y); fx.stroke();
    });
    fx.fillStyle = c.ai;
    if (!reduce) bizEdges.slice(0, 19).forEach(([a, b], i) => {
      if (sc(ns[b]) < 1) return;
      const p = pos(ns[a]), q = pos(ns[b]), u = (t * 0.22 + i * 0.37) % 1;
      fx.globalAlpha = 0.9; fx.beginPath(); fx.arc(p.x + (q.x - p.x) * u, p.y + (q.y - p.y) * u, 1.8, 0, TAU); fx.fill();
    });
    fx.globalAlpha = 1;
    ns.forEach((n) => {
      const s = sc(n); if (s <= 0) return;
      const p = pos(n);
      fx.beginPath(); fx.arc(p.x, p.y, n.r * s, 0, TAU);
      fx.fillStyle = n.kind === 0 ? c.ai : n.kind === 1 ? c.paper : c.aiSoft; fx.fill();
      fx.strokeStyle = n.kind === 1 ? c.ink2 : c.ai; fx.lineWidth = 1.2; fx.stroke();
    });
    // 人のネットワークが外へ染み出す
    if (!reduce && modeT > 1.2) {
      emitIn -= dt;
      if (emitIn <= 0) { emitIn = 0.5 + Math.random() * 0.4; const n = ns[1 + Math.floor(Math.random() * (ns.length - 1))], p = pos(n); spawnP('node', p.x, p.y); }
    }
    // 曼荼羅チャート 9×9。中央ブロックの 8 マスが外側 8 ブロックの中心に対応する
    const pad = 12, half = W / 2 - pad, cell = Math.floor(Math.min(half, H - 6) / 9), G = cell * 9;
    const gx = Math.round(W / 2 + pad + (half - G) / 2), gy = Math.round((H - G) / 2);
    const outer = [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2], [2, 1], [2, 0], [1, 0]];
    const act = outer[Math.floor(t / 1.6) % 8];
    for (let i = 0; i < 9; i++) for (let j = 0; j < 9; j++) {
      const bi = Math.floor(i / 3), bj = Math.floor(j / 3), cb = bi === 1 && bj === 1, bc = i % 3 === 1 && j % 3 === 1;
      const k = cb ? (i % 3) * 3 + (j % 3) : 9 + (bi * 3 + bj) * 9 + (i % 3) * 3 + (j % 3);
      const s = reduce ? 1 : Math.min(1, Math.max(0, (modeT - 0.2 - k * 0.018) / 0.3));
      if (s <= 0) continue;
      fx.fillStyle = cb && bc ? c.ai : cb || bc ? c.aiSoft : c.paper2;
      const x = gx + j * cell, y = gy + i * cell, sz = cell * s, o = (cell - sz) / 2;
      fx.fillRect(x + o, y + o, sz, sz);
      fx.strokeStyle = c.rule; fx.lineWidth = 1; fx.strokeRect(x + o + 0.5, y + o + 0.5, sz - 1, sz - 1);
    }
    if (reduce || modeT > 2.2) {
      fx.strokeStyle = c.ai; fx.lineWidth = 1.5;
      fx.strokeRect(gx + act[1] * 3 * cell + 0.5, gy + act[0] * 3 * cell + 0.5, 3 * cell - 1, 3 * cell - 1);
      fx.strokeRect(gx + (3 + act[1]) * cell + 0.5, gy + (3 + act[0]) * cell + 0.5, cell - 1, cell - 1);
    }
  };

  // ---- 2021: DB → BATCH → MTA → INBOX。MTA からは外へばら撒く
  const lane: Lane[] = [];
  let spawnIn = 0.1;
  const mailLayout = () => {
    const compact = W < 560, s = compact ? 1.2 : 1;
    const xs = compact ? [0.1, 0.5, 0.9] : [0.05, 0.34, 0.64, 0.95];
    const kinds = compact ? ['db', 'batch', 'inbox'] : ['db', 'batch', 'mta', 'inbox'];
    return { s, st: kinds.map((k, i) => ({ k, x: xs[i] * W })), em: kinds.length - 2, env: compact ? 26 : 18, gap: compact ? 20 : 15 };
  };
  const station = (k: string, x: number, y: number, s: number) => {
    fx.strokeStyle = c.ink2; fx.fillStyle = c.paper; fx.lineWidth = 1.2; fx.lineJoin = 'round';
    const w = 58 * s, h = 48 * s;
    if (k === 'db') {
      const rx = 20 * s, ry = 6 * s, hh = 26 * s;
      fx.beginPath(); fx.moveTo(x - rx, y - hh); fx.lineTo(x - rx, y + hh); fx.ellipse(x, y + hh, rx, ry, 0, Math.PI, 0, true); fx.lineTo(x + rx, y - hh); fx.fill(); fx.stroke();
      fx.beginPath(); fx.ellipse(x, y - hh, rx, ry, 0, 0, TAU); fx.fill(); fx.stroke();
      fx.strokeStyle = c.rule;
      for (const d of [-8, 9]) { fx.beginPath(); fx.ellipse(x, y + d * s, rx, ry, 0, 0, Math.PI); fx.stroke(); }
    } else if (k === 'batch') {
      fx.beginPath(); fx.rect(x - w / 2, y - h / 2, w, h); fx.fill(); fx.stroke();
      fx.strokeStyle = c.mute; fx.lineWidth = 1.5 * s;
      for (const d of [-11, 0, 11]) { fx.beginPath(); fx.moveTo(x - 17 * s, y + d * s); fx.lineTo(x + 17 * s, y + d * s); fx.stroke(); }
    } else if (k === 'mta') {
      fx.beginPath(); fx.rect(x - w / 2, y - h / 2, w, h); fx.fill(); fx.stroke();
      fx.fillStyle = c.ink2; fx.beginPath(); fx.arc(x - 10 * s, y, 3 * s, 0, TAU); fx.fill();
      fx.strokeStyle = c.mute; fx.lineWidth = 1.5;
      for (const r of [9, 16]) { fx.beginPath(); fx.arc(x - 10 * s, y, r * s, -0.7, 0.7); fx.stroke(); }
    } else {
      fx.beginPath(); fx.rect(x - w / 2, y - h / 2, w, h); fx.fill(); fx.stroke();
      fx.fillStyle = c.ink2; fx.fillRect(x - 15 * s, y - h / 2 + 9 * s, 30 * s, 3 * s);
      fx.strokeStyle = c.rule; fx.beginPath(); fx.moveTo(x - w / 2, y + h / 2 - 12 * s); fx.lineTo(x + w / 2, y + h / 2 - 12 * s); fx.stroke();
    }
  };
  const mail = (dt: number) => {
    const L = mailLayout(), y0 = H / 2;
    const dbX = L.st[0].x, emX = L.st[L.em].x, inX = L.st[L.st.length - 1].x;
    fx.strokeStyle = c.rule; fx.lineWidth = 1; fx.beginPath();
    for (const l of [-1, 0, 1]) { fx.moveTo(dbX, y0 + l * L.gap); fx.lineTo(emX, y0 + l * L.gap); }
    fx.moveTo(emX, y0); fx.lineTo(inX, y0); fx.stroke();
    if (!reduce) {
      if (modeT < dt + 1e-6 && !lane.length) {
        for (let i = 0; i < 7; i++) lane.push({ lane: (i % 3) - 1, x: dbX + Math.random() * (emX - dbX), v: (120 + Math.random() * 110) * L.s, seg: 0, w: L.env });
      }
      spawnIn -= dt;
      if (spawnIn <= 0) {
        spawnIn = 0.22 + Math.random() * 0.3;
        lane.push({ lane: Math.floor(Math.random() * 3) - 1, x: dbX + 6, v: (120 + Math.random() * 110) * L.s, seg: 0, w: L.env });
      }
      for (let i = lane.length - 1; i >= 0; i--) {
        const m = lane[i]; m.x += m.v * dt;
        if (m.seg === 0 && m.x >= emX) {
          if (Math.random() < 0.3) { m.seg = 1; m.lane = 0; }
          else { lane.splice(i, 1); spawnP('mail', emX, y0 + m.lane * L.gap); continue; }
        }
        if (m.seg === 1 && m.x >= inX - 8 * L.s) lane.splice(i, 1);
      }
    } else if (!lane.length) {
      for (let i = 0; i < 5; i++) lane.push({ lane: (i % 3) - 1, x: dbX + (0.18 + i * 0.16) * (emX - dbX), v: 0, seg: 0, w: L.env });
      lane.push({ lane: 0, x: emX + (inX - emX) * 0.5, v: 0, seg: 1, w: L.env });
    }
    lane.forEach((m) => envelope(fx, m.x, y0 + m.lane * L.gap, m.w, 0, YJ));
    L.st.forEach((s) => station(s.k, s.x, y0, L.s));
  };

  // ---- ループ。画面外にいる間は止める（ヒーローは粒子が残っている間だけ続ける）
  let last = 0, raf = 0, visible = false;
  const frame = (ts: number) => {
    const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0;
    last = ts; now = ts / 1000; modeT += dt;
    fx.clearRect(0, 0, CW, CH);
    if (W < 10 || H < 10) return;
    fx.save(); fx.translate(0, oy);
    if (mode === 'wave') wave(now, dt); else if (mode === 'biz') biz(now, dt); else mail(dt);
    fx.restore();
    sprayStep(dt);
  };
  const tick = (ts: number) => {
    frame(ts);
    if (visible || parts.length) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
  };
  const wake = () => { if (!raf && !reduce) raf = requestAnimationFrame(tick); };
  fit();
  new ResizeObserver(() => { fit(); if (reduce) frame(performance.now()); }).observe(fig);
  if (spray) addEventListener('resize', fit);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) wake(); }, { rootMargin: '80px' }).observe(fig);
  if (reduce) frame(performance.now());

  const set = (v: View, f: Flavor = 'pm', fr = 0.3, t = 0.54) => {
    if (v !== mode || f !== flavor) { fadeParts(); mode = v; modeT = 0; lane.length = 0; flow.length = 0; spawnIn = 0.1; emitIn = 0.4; wordIn = 0.6; }
    flavor = f; from = fr; to = t;
    if (reduce) frame(performance.now()); else wake();
  };
  return { set, fit };
}
