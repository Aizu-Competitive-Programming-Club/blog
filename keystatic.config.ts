import { config, fields, collection } from '@keystatic/core';
import { block } from '@keystatic/core/content-components';

const repo = 'Aizu-Competitive-Programming-Club/blog';

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
									label: 'Tweet ID',
									description: 'Numeric ID from the tweet URL',
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
