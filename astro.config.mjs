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
	vite: {
		plugins: [
			{
				name: 'keystatic-unescape-content',
				enforce: 'pre',
				transform(code, id) {
					if (!id) return null;

					// Vite often appends query strings (e.g. `?astroContent`) to module ids.
					// Normalize first so this runs in both local and Cloudflare builds.
					const normalizedId = id.split('?')[0].replaceAll('\\\\', '/');
					if (!normalizedId.includes('/src/content/')) return null;
					if (!/\.(md|mdx)$/.test(normalizedId)) return null;

					const unescapeOutsideFences = (input) => {
						// Minimal fence skipper for triple-backtick blocks.
						const lines = input.split(/\r?\n/);
						let inFence = false;
						let fence = '';
						for (let i = 0; i < lines.length; i++) {
							const line = lines[i];
							const fenceMatch = line.match(/^\s*(```|~~~)/);
							if (fenceMatch) {
								const marker = fenceMatch[1];
								if (!inFence) {
									inFence = true;
									fence = marker;
								} else if (marker === fence) {
									inFence = false;
									fence = '';
								}
								continue;
							}

							if (inFence) continue;

							lines[i] = lines[i]
								// Footnotes: "\[^1]" / "\[^1]:" -> "[^1]" / "[^1]:"
								.replace(/\\\[\^/g, '[^')
								// Limited HTML: "\<span ...>" / "\</span>" -> "<span ...>" / "</span>"
								.replace(/\\<span\b/gi, '<span')
								.replace(/\\<\/(?:span)\s*>/gi, '</span>')
								// Keystatic sometimes produces: "\<\span>"
								.replace(/\\<\\span\s*>/gi, '</span>');
						}
						return lines.join('\n');
					};

					const out = unescapeOutsideFences(code);
					return out === code ? null : { code: out, map: null };
				},
			},
		],
	},
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
