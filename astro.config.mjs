// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkKeystaticMathFix from './src/remark/keystaticMathFix.mjs';
import rehypeKeystaticMathFix from './src/rehype/keystaticMathFix.mjs';

const site = process.env.ASTRO_SITE ?? 'http://localhost:4321';
const base = process.env.ASTRO_BASE ?? '';

// https://astro.build/config
export default defineConfig({
	site,
	base,
	adapter: cloudflare(),
	integrations: [
		mdx({
			rehypePlugins: [rehypeKeystaticMathFix, rehypeKatex],
			remarkPlugins: [remarkMath, remarkKeystaticMathFix],
		}),
		react(),
		sitemap(),
		keystatic(),
	],
	markdown: {
		remarkPlugins: [remarkMath, remarkKeystaticMathFix],
		rehypePlugins: [rehypeKeystaticMathFix, rehypeKatex],
	},
});
