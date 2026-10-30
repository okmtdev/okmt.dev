# okmt.dev

中島 祐樹（旧姓：岡本）の個人サイト。Astro 製の静的サイトで、GitHub Pages から `https://okmt.dev` で配信します。

## 開発

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ に静的出力
```

## コンテンツの編集場所

| 何を直すか | ファイル |
| --- | --- |
| 名前・生年月日・居住地・資格・特許・キャッチコピー・愛犬写真のパス | `src/data/profile.ts` |
| キャリア（changelog） | `src/data/career.ts` |
| 強み（本文） | `src/data/strengths.ts` |
| 強みの図（技・数・進） | `src/components/FigTech.astro` / `FigData.astro` / `FigDrive.astro`（ホバー説明文は各ファイルの `cap`） |
| プライベートの項目 | `src/components/OffClock.astro` の `items` |
| 研究と論文 | `src/data/publications.ts`（説明文は `src/components/Research.astro`） |
| 手掛けてきたもの（Shipped） | `src/content/products/*.md` |
| 外部リンク（フッター） | `src/data/profile.ts` の `links` |

### プロダクトを追加する

`src/content/products/` に Markdown を1枚置くだけでトップページに並びます。`order` が小さいほど先頭、`featured: true` で背景色が変わります。本文（frontmatter の下）を書くと「詳しく」で開く折りたたみになります。

```md
---
title: 新しいプロダクト
titleEn: New product
org: RevComm
period: "2026.01 —"
role: 担当PdM
roleEn: Product Manager
summary: 日本語の要約 1〜2 文。
summaryEn: English summary in one or two sentences.
status: ongoing        # shipped | ongoing | poc | sunset
tags: [Tag1, Tag2]
link: https://example.com   # 任意
linkLabel: Example          # 任意
order: 15
featured: false
---

任意の本文。Markdown が使えます。
```

### 愛犬の写真

`public/images/` に置き、`src/data/profile.ts` の `dogPhotos` のパスと alt、キャプションを差し替えてください。1枚目は基本情報の横（縦長 4:5）、2枚目以降は「仕事の外」（正方形）に出ます。大きい写真は `sips -Z 1600 画像.jpg` で縮小してから置くと軽くなります。

### OGP 画像

`public/og.png`（1200×630）。作り直すときは `scripts/og.html` を 1200×630 でスクリーンショットして差し替えます。

## デプロイ

`main` に push すると `.github/workflows/deploy.yml` がビルドして GitHub Pages に公開します。

初回だけ GitHub 側の設定が必要です。

1. リポジトリの Settings → Pages → Source を **GitHub Actions** にする。
2. 同じ画面の Custom domain に `okmt.dev` を入れる（`public/CNAME` と一致）。DNS が通ったら Enforce HTTPS をオン。
3. お名前.com の DNS レコード設定で、`okmt.dev`（ホスト名は空）の A レコードを GitHub Pages の IP 4 つ（185.199.108.153 / 185.199.109.153 / 185.199.110.153 / 185.199.111.153）に向ける。`www` は CNAME で `okmtdev.github.io` に向けると、GitHub 側が `okmt.dev` へリダイレクトしてくれる。
