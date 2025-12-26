// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const site = process.env.ASTRO_SITE ?? 'http://localhost:4321';
const base = process.env.ASTRO_BASE ?? '';

// https://astro.build/config
export default defineConfig({
	site,
	base,
	integrations: [mdx(), sitemap()],
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex],
	},
});
