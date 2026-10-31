# okmt.dev

Personal site. Built with [Astro](https://astro.build), served from GitHub Pages at [okmt.dev](https://okmt.dev).

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # static output in dist/
```

## Structure

| Content | File |
| --- | --- |
| Profile, catch copy, links, photos | `src/data/profile.ts` |
| Career changelog | `src/data/career.ts` |
| Strengths copy | `src/data/strengths.ts` |
| Strength figures (hover captions in `cap`) | `src/components/FigTech.astro`, `FigData.astro`, `FigDrive.astro` |
| Hero and career background figures | `src/scripts/fig.ts` |
| Research figure | `src/scripts/fsfig.ts` |
| Publications | `src/data/publications.ts` |
| About section (facts, likes, photos) | `src/components/About.astro` |
| Archive page (products + research) | `src/pages/archive.astro`, `src/components/Appendix.astro` |
| Products | `src/content/products/*.md` |
| Theme tokens | `src/styles/global.css` (dark only) |

### Products

Drop a Markdown file into `src/content/products/`. Lower `order` comes first; `featured: true` keeps it above the fold, the rest sit behind the expand button.

```md
---
title: Product name
titleEn: Product name
org: Org
period: "2026.01 —"
role: 担当PdM
roleEn: Product Manager
summary: 一行の要約。
summaryEn: One-line summary.
status: shipped        # shipped | ongoing | poc | sunset
tags: [Tag]
link: https://example.com
order: 15
featured: false
---
```

### OG image

`public/og.png` (1200×630) is a screenshot of `scripts/og.html`. Re-render it with a headless browser after editing the template.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the site and publishes it to GitHub Pages.

DNS for `okmt.dev` is managed in Cloudflare (DNS only, no proxy): four A records to the GitHub Pages IPs on the apex, and a `www` CNAME to `okmtdev.github.io`. `public/CNAME` must stay `okmt.dev`.

## Analytics

Cloudflare Web Analytics (cookie-free) via the beacon script in `src/layouts/Base.astro`, included only in production builds. View the numbers under Analytics & Logs → Web Analytics in the Cloudflare dashboard.
