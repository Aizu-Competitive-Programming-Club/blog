# Blog

Astro-based blog with MDX + KaTeX, build-time OGP/hero image generation, and a Keystatic admin UI.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
├── public/
├── src/
│   ├── components/
│   ├── content/
│   ├── layouts/
│   └── pages/
├── astro.config.mjs
├── README.md
├── package.json
└── tsconfig.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

The `src/content/` directory contains "collections" of related Markdown and MDX documents. Use `getCollection()` to retrieve posts from `src/content/blog/`, and type-check your frontmatter using an optional schema. See [Astro's Content Collections docs](https://docs.astro.build/en/guides/content-collections/) to learn more.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run prebuild`        | Generate OGP/hero images into `public/`          |
| `npm run new-post -- ...` | Create a new post file template (`.mdx`)         |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

### New post helper

Create a new post with a machine-generated id (also used as the default URL slug):

```sh
npm run new-post -- --title "My Post Title" --author "Your Name"
```

Optional: set a custom URL slug (must be unique):

```sh
npm run new-post -- --title "My Post Title" --slug "custom-slug"
```

This creates a single file in `src/content/posts/<slug>.mdx`.

## Keystatic

The admin UI is available at `/keystatic`.

### Local mode (default)

If you do not set Keystatic GitHub environment variables, Keystatic uses local storage mode.

```sh
npm run dev
```

Then open `http://localhost:4321/keystatic`.

### GitHub mode (for Cloudflare Pages)

Set these environment variables (as Cloudflare Pages Secrets in both Preview and Production):

- `KEYSTATIC_GITHUB_CLIENT_ID`
- `KEYSTATIC_GITHUB_CLIENT_SECRET`
- `KEYSTATIC_SECRET` (32+ characters)
- `PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`

In GitHub mode, Keystatic will create branches prefixed with `keystatic/`.

### Cloudflare Pages binding

The Cloudflare adapter uses a KV namespace binding named `SESSION` for sessions.

- Create a KV namespace
- Bind it as `SESSION` in your Cloudflare Pages project (Preview and Production)

## Credit

This theme started from the Astro blog starter kit.
