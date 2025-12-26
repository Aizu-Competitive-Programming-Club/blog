import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/posts/` directory.
	loader: glob({ base: './src/content/posts', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			slug: z.string().optional(),
			description: z.string().default(''),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			tags: z.array(z.string()).default([]),
			author: z.string().default('Unknown'),
			authorIcon: image().optional(),
			heroImage: image().optional(),
			ogImage: image().optional(),
			draft: z.boolean().default(false),
		}),
});

export const collections = { blog };
