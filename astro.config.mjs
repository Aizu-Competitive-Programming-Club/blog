// @ts-check

import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import keystatic from '@keystatic/astro';
import cloudflare from '@astrojs/cloudflare';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const site = process.env.ASTRO_SITE ?? 'http://localhost:4321';
const base = process.env.ASTRO_BASE ?? '';

// https://astro.build/config
export default defineConfig({
	site,
	base,
	adapter: cloudflare(),
	integrations: [mdx(), react(), sitemap(), keystatic()],
	markdown: {
		remarkPlugins: [remarkMath],
		rehypePlugins: [rehypeKatex],
	},
});
