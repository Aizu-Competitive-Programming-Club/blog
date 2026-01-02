import { config, fields, collection } from '@keystatic/core';
import { block, mark } from '@keystatic/core/content-components';
import { paletteIcon } from '@keystar/ui/icon/icons/paletteIcon';

const repo = { owner: 'Aizu-Competitive-Programming-Club', name: 'blog' } as const;

const storage = import.meta.env.DEV
	? {
			kind: 'local' as const,
	  }
	: {
			kind: 'github' as const,
			repo,
			branchPrefix: 'keystatic/',
	  };

export default config({
	storage,
	collections: {
		posts: collection({
			label: 'Posts',
			slugField: 'title',
			path: 'src/content/posts/*',
			format: { contentField: 'content' },
			schema: {
				title: fields.slug({
					name: {
						label: 'Title',
						description: 'Post title (shown to readers)',
					},
					slug: {
						label: 'Slug',
						description: 'Used in the URL and filename (must be unique)',
					},
				}),
				pubDate: fields.date({
					label: 'Publish date',
					description: 'YYYY-MM-DD',
				}),
				description: fields.text({
					label: 'Description',
					multiline: true,
				}),
				tags: fields.array(fields.text({ label: 'Tag' }), {
					label: 'Tags',
					itemLabel: (props) => props.value,
				}),
				author: fields.text({
					label: 'Author',
				}),
				draft: fields.checkbox({
					label: 'Draft',
					description: 'Prevent this post from being published',
				}),
				content: fields.mdx({
					label: 'Content',
					components: {
						Tweet: block({
							label: 'Tweet',
							schema: {
								id: fields.text({
									label: 'Tweet URL or ID',
									description: 'Paste a tweet URL (x.com/twitter.com) or the numeric tweet ID',
								}),
							},
						}),
						Color: mark({
							label: 'Color',
							icon: paletteIcon,
							tag: 'span',
							style: (props) => {
								const custom = props.value.value?.trim();
								const preset = props.value.preset;
								const color = custom || (preset === 'custom' ? '' : preset);
								return color ? { color } : {};
							},
							schema: {
								preset: fields.select({
									label: 'Preset',
									description: 'Pick a preset color, or choose Custom and set a CSS color value below.',
									options: [
										{ label: 'black', value: 'black' },
										{ label: 'gray', value: 'gray' },
										{ label: 'saddlebrown', value: 'saddlebrown' },
										{ label: 'green', value: 'green' },
										{ label: 'cyan', value: 'cyan' },
										{ label: 'blue', value: 'blue' },
										{ label: 'yellow', value: 'yellow' },
										{ label: 'orange', value: 'orange' },
										{ label: 'red', value: 'red' },
										{ label: 'silver', value: 'silver' },
										{ label: 'gold', value: 'gold' },
										{ label: 'custom', value: 'custom' },
									],
									defaultValue: 'blue',
								}),
								value: fields.text({
									label: 'Custom color (optional)',
									description:
										'Overrides the preset when set. Examples: cyan, #00ffff, rgb(0 255 255), hsl(180 100% 50%).',
								}),
							},
						}),
					},
					options: {
						image: {
							directory: 'public/images',
							publicPath: '/images/',
						},
					},
				}),
			},
		}),
	},
});
