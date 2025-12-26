import fg from 'fast-glob';
import matter from 'gray-matter';
import path from 'node:path';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';

const POSTS_DIR = 'src/content/posts';

const getArg = (name) => {
	const key = `--${name}`;
	const i = process.argv.indexOf(key);
	if (i === -1) return undefined;
	const v = process.argv[i + 1];
	if (!v || v.startsWith('--')) return '';
	return v;
};

const hasFlag = (name) => process.argv.includes(`--${name}`);

const slugifyAscii = (s = '') => {
	const out = String(s)
		.normalize('NFKC')
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '');
	return out || 'post';
};

const fileSlugFromPath = (relPath = '') =>
	relPath.replace(/\.(mdx?|md)$/i, '').replace(/\/index$/, '');

const loadExistingRouteSlugs = async () => {
	const files = await fg('**/*.{md,mdx}', { cwd: POSTS_DIR });
	const slugs = new Set();
	for (const file of files) {
		const full = path.join(POSTS_DIR, file);
		const raw = await readFile(full, 'utf8');
		const { data } = matter(raw);
		const fileSlug = fileSlugFromPath(file);
		const routeSlug = String(data.slug ?? fileSlug);
		slugs.add(routeSlug);
	}
	return slugs;
};

const ensureUniqueSlug = (desired, existing) => {
	if (!existing.has(desired)) return desired;
	for (let i = 2; i < 10_000; i++) {
		const candidate = `${desired}-${i}`;
		if (!existing.has(candidate)) return candidate;
	}
	throw new Error(`Could not find unique slug for: ${desired}`);
};

const formatTokyoParts = (date = new Date()) => {
	// Use Asia/Tokyo consistently (GitHub Actions uses UTC by default).
	const parts = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'Asia/Tokyo',
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
	}).formatToParts(date);
	const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
	return {
		yyyy: map.year,
		mm: map.month,
		dd: map.day,
		hh: map.hour,
		min: map.minute,
		ss: map.second,
	};
};

const main = async () => {
	const title = getArg('title') ?? 'New Post';
	const author = getArg('author') ?? 'Unknown';
	const draft = hasFlag('publish') ? false : true;

	const now = new Date();
	const tokyo = formatTokyoParts(now);
	const timestamp = `${tokyo.yyyy}${tokyo.mm}${tokyo.dd}${tokyo.hh}${tokyo.min}${tokyo.ss}`; // YYYYMMDDHHMMSS (Asia/Tokyo)
	const id = `${timestamp}-${randomUUID().slice(0, 8)}`;
	const postDir = path.join(POSTS_DIR, id);

	const existingSlugs = await loadExistingRouteSlugs();
	const requestedSlug = getArg('slug');
	// In "A" mode, default to a machine-generated slug (same as directory name)
	// so URLs and OG/hero asset names are collision-free and stable.
	let slug = requestedSlug ? slugifyAscii(requestedSlug) : id;
	if (requestedSlug) {
		if (existingSlugs.has(slug)) {
			throw new Error(`Slug already exists: "${slug}" (pick another with --slug)`);
		}
	} else {
		// Extremely unlikely, but keep it robust.
		slug = ensureUniqueSlug(slug, existingSlugs);
	}

	const pubDate = `${tokyo.yyyy}-${tokyo.mm}-${tokyo.dd}`; // YYYY-MM-DD (Asia/Tokyo)

	await mkdir(path.join(postDir, 'images'), { recursive: true });

	const frontmatter = [
		'---',
		`title: ${JSON.stringify(title)}`,
		`slug: ${JSON.stringify(slug)}`,
		`pubDate: ${pubDate}`,
		`description: ""`,
		`tags: []`,
		`author: ${JSON.stringify(author)}`,
		`draft: ${draft ? 'true' : 'false'}`,
		'---',
		'',
		'',
	].join('\n');

	await writeFile(path.join(postDir, 'index.md'), frontmatter, 'utf8');

	// eslint-disable-next-line no-console
	console.log(`Created: ${postDir}`);
	// eslint-disable-next-line no-console
	console.log(`- Edit: ${path.join(postDir, 'index.md')}`);
	// eslint-disable-next-line no-console
	console.log(`- Images: ${path.join(postDir, 'images/')}`);
	// eslint-disable-next-line no-console
	console.log(`- URL: /${slug}/`);
	// eslint-disable-next-line no-console
	console.log('Tip: add --publish to start with draft: false');
	// eslint-disable-next-line no-console
	console.log('Tip: pass --slug <value> only if you want a custom URL');
};

await main();
