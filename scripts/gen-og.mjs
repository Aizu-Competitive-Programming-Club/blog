import fg from 'fast-glob';
import matter from 'gray-matter';
import path from 'node:path';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import sharp from 'sharp';
import satori from 'satori';

const INPUT_DIR = 'src/content/posts';
const OUTPUT_DIR_OG = 'public/og';
const OUTPUT_DIR_HERO = 'public/hero';
const WIDTH = 1200;
const HEIGHT = 630;
const HERO_SCALE = 2;
const HERO_WIDTH = WIDTH * HERO_SCALE;
const HERO_HEIGHT = HEIGHT * HERO_SCALE;

// ローカルに置いたフォントを読み込む
const fontData = await readFile('public/fonts/NotoSansJP-Subset.ttf');

const files = await fg('**/*.{md,mdx}', { cwd: INPUT_DIR });
await mkdir(OUTPUT_DIR_OG, { recursive: true });
await mkdir(OUTPUT_DIR_HERO, { recursive: true });

const seenRouteSlugs = new Map();

const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const slugify = (s = '') =>
  String(s)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'author';

const slugifySegment = (segment = '') => {
  const raw = String(segment).normalize('NFKC').trim();
  const ascii = raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  if (ascii) return ascii;
  // Fallback for non-ascii segments: keep stable and filesystem-safe.
  return encodeURIComponent(raw).toLowerCase().replace(/%/g, '');
};

const slugifyPath = (p = '') =>
  String(p)
    .split('/')
    .filter(Boolean)
    .map(slugifySegment)
    .join('/');

const mimeFromExt = (p = '') => {
  const ext = p.toLowerCase().split('.').pop();
  switch (ext) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'svg':
    case 'svgz':
      return 'image/svg+xml';
    default:
      return 'application/octet-stream';
  }
};

for (const file of files) {
  const full = path.join(INPUT_DIR, file);
  const raw = await readFile(full, 'utf8');
  const { data } = matter(raw);
  const fileSlug = file.replace(/\.(mdx?|md)$/i, '').replace(/\/index$/, '');
  const routeSlug = String(data.slug ?? fileSlug);

  const prev = seenRouteSlugs.get(routeSlug);
  if (prev) {
    throw new Error(
      `Duplicate route slug detected: "${routeSlug}"\n- ${prev}\n- ${full}\n\nFix by making frontmatter.slug unique.`
    );
  }
  seenRouteSlugs.set(routeSlug, full);

  const assetSlug = slugifyPath(routeSlug);
  const title = data.title ?? routeSlug;
  const description = data.description ?? '';
  const author = data.author ?? 'Unknown';
  const authorKey = slugify(author);

  // author icon (optional)
  let authorIconDataUrl = null;
  const iconCandidates = [];
  if (data.authorIcon) {
    iconCandidates.push(path.join(path.dirname(full), data.authorIcon));
  }
  // shared icons under public/icons/<author>.png
  iconCandidates.push(path.join('public/icons', `${authorKey}.png`));

  for (const iconPath of iconCandidates) {
    try {
      const iconBin = await readFile(iconPath);
      const mime = mimeFromExt(iconPath);
      if (mime === 'image/svg+xml') {
        authorIconDataUrl = `data:${mime};base64,${iconBin.toString('base64')}`;
        break;
      }

      // Normalize potentially huge raster icons to a small PNG to keep
      // satori/sharp stable and reduce base64 size.
      const normalized = await sharp(iconBin)
        .resize(128, 128, { fit: 'cover' })
        .png()
        .toBuffer();
      authorIconDataUrl = `data:image/png;base64,${normalized.toString('base64')}`;
      break;
    } catch (e) {
      // continue to next candidate
    }
  }

  const s = (n) => n * HERO_SCALE;

  const authorNode = {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: s(14),
        marginTop: s(28),
        fontSize: s(28),
        color: '#cbd5e1',
      },
      children: [
        authorIconDataUrl
          ? {
              type: 'img',
              props: {
                src: authorIconDataUrl,
                width: s(64),
                height: s(64),
                style: {
                  width: `${s(64)}px`,
                  height: `${s(64)}px`,
                  borderRadius: '999px',
                  objectFit: 'cover',
                  background: '#1e293b',
                },
              },
            }
          : {
              type: 'div',
              props: {
                style: {
                  width: `${s(64)}px`,
                  height: `${s(64)}px`,
                  borderRadius: '999px',
                  background: '#1e293b',
                  color: '#e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: s(30),
                },
                children: esc(String(author).slice(0, 1).toUpperCase()),
              },
            },
        {
          type: 'div',
          props: {
            style: { display: 'flex', flexDirection: 'column', gap: s(6) },
            children: [
              {
                type: 'div',
                props: { style: { fontSize: s(22), color: '#94a3b8' }, children: 'Author' },
              },
              { type: 'div', props: { style: { fontSize: s(28), fontWeight: 600 }, children: esc(author) } },
            ],
          },
        },
      ],
    },
  };

  // satori で SVG を作成
  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: HERO_WIDTH,
          height: HERO_HEIGHT,
          display: 'flex',
          flexDirection: 'column',
          padding: s(60),
          background: '#0f172a',
          color: '#e2e8f0',
          fontFamily: 'Noto Sans JP',
        },
        children: [
          {
            type: 'div',
            props: {
              style: { fontSize: s(28), color: '#94a3b8', marginBottom: s(24) },
              children: 'Aizu Competitive Programming Club',
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: s(70), fontWeight: 700, lineHeight: 1.15, marginBottom: s(20) },
              children: esc(title),
            },
          },
          {
            type: 'div',
            props: {
              style: { fontSize: s(32), color: '#cbd5e1', lineHeight: 1.3 },
              children: esc(description),
            },
          },
          { type: 'div', props: { style: { flex: '1 1 auto' } } },
          authorNode,
        ],
      },
    },
    {
      width: HERO_WIDTH,
      height: HERO_HEIGHT,
      fonts: [
        {
          name: 'Noto Sans JP',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  );

  // sharp で PNG/WebP へ
  const heroPng = await sharp(Buffer.from(svg)).png().toBuffer();
  const ogPng = await sharp(heroPng).resize(WIDTH, HEIGHT).png().toBuffer();

  const ogPath = path.join(OUTPUT_DIR_OG, `${assetSlug}.png`);
  const heroPath = path.join(OUTPUT_DIR_HERO, `${assetSlug}.png`);
  await mkdir(path.dirname(ogPath), { recursive: true });
  await mkdir(path.dirname(heroPath), { recursive: true });
  await writeFile(ogPath, ogPng);
  await writeFile(heroPath, heroPng);
}

console.log(`Generated OGP for ${files.length} posts.`);