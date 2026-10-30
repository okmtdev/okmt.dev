import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * プロダクト／成果物。src/content/products/ に Markdown を1枚追加すれば
 * トップページの「Shipped」に自動で並びます（order 昇順）。
 */
const products = defineCollection({
  loader: glob({ base: './src/content/products', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string(),
    org: z.string(),                       // 所属・提供元（例: RevComm）
    period: z.string(),                    // 例: "2024.10 — 2025.06" / "2025.07 —"
    role: z.string(),                      // 例: "立ち上げPdM"
    roleEn: z.string(),
    summary: z.string(),                   // 日本語 1〜2文
    summaryEn: z.string(),
    status: z.enum(['shipped', 'ongoing', 'poc', 'sunset']).default('shipped'),
    tags: z.array(z.string()).default([]),
    link: z.string().url().optional(),
    linkLabel: z.string().optional(),
    image: z.string().optional(),          // /images/... 任意
    order: z.number().default(100),        // 小さいほど先頭
    featured: z.boolean().default(false),
  }),
});

export const collections = { products };
