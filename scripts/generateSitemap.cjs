/**
 * Generate public/sitemap.xml from the site's real data sources, so the
 * sitemap always matches what is actually published — no manual editing.
 *
 * Sources:
 *  - Static public routes (listed below).
 *  - Courses: every top-level `id` in data/courses.ts -> /courses/<id>
 *  - Articles: every `id` in pages/ArticlesPage.tsx -> /articles/<id>
 *  - Facebook videos: /videos/<post id> (each video gets its own
 *    crawlable page with the full caption + VideoObject structured data)
 *  - Knowledge store: categories and products in
 *    data/knowledgeStore.ts -> /store/category/<id>, /store/product/<id>
 *
 * Runs automatically before every build (see package.json "prebuild"), so
 * each Vercel deploy ships a fresh sitemap. That is what makes it dynamic:
 * add a course, an article, a video or a store item, push, and the next
 * deploy includes it. Run manually with: node scripts/generateSitemap.cjs
 *
 * The script VALIDATES its output and fails the build (exit 1) if the
 * sitemap is not well-formed XML or contains a known-dead URL, so a bad
 * sitemap can never deploy again.
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://mohammadiacademy.org';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'sitemap.xml');

// Dead Facebook post IDs that must never appear in the sitemap again.
// These posts were deleted from Facebook; their /videos/<id> pages 404.
const DEAD_FACEBOOK_IDS = [
  '1111795538300935', // Part 3 Reel 01 — "Who Was the Stranger…"
  '1112198251593997', // "Millions Have Eyes and Cannot See"
  '1112710914876064', // MBS Reel 01 — "The Leader of Makkah and Madinah…"
  '1111123108368178', // "Every Click, Every Like Is Being Watched"
  '1110142435132912', // Debate video — "If You Can Prove It…"
];

// Course ids that have a dedicated canonical page plus a JS redirect from
// /courses/<id> (see App.tsx) — only the canonical path belongs in the
// sitemap, never the /courses/<id> URL that just redirects.
const REDIRECTED_COURSE_IDS = new Set(['quran-translation', 'islamic-studies']);

// path, changefreq, priority, lastmod (optional — omitted unless a real
// date is known; a made-up lastmod misleads crawlers).
const STATIC_ROUTES = [
  ['/', 'weekly', '1.0'],
  ['/courses', 'weekly', '0.9'],
  ['/quran-tajweed', 'monthly', '0.8'],
  ['/quran-translation', 'monthly', '0.8'],
  ['/islamic-studies', 'monthly', '0.8'],
  ['/learn-arabic', 'monthly', '0.8'],
  ['/hifz', 'monthly', '0.8'],
  ['/articles', 'weekly', '0.7'],
  ['/videos', 'daily', '0.8'],
  ['/store', 'monthly', '0.6'],
  ['/about', 'monthly', '0.7'],
  ['/faq', 'monthly', '0.7'],
  ['/contact', 'monthly', '0.7'],
  ['/start', 'monthly', '0.8'],
];

function extractIds(file, regex) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  const ids = [];
  let m;
  const re = new RegExp(regex.source, 'gm');
  while ((m = re.exec(src)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  return ids;
}

/** Extract `id:` values from one exported array section of a file only. */
function extractSectionIds(file, sectionStart, regex) {
  const src = fs.readFileSync(path.join(ROOT, file), 'utf-8');
  const start = src.indexOf(sectionStart);
  if (start === -1) return [];
  const end = src.indexOf('\n];', start);
  const section = end === -1 ? src.slice(start) : src.slice(start, end);
  const ids = [];
  let m;
  const re = new RegExp(regex.source, 'gm');
  while ((m = re.exec(section)) !== null) {
    if (!ids.includes(m[1])) ids.push(m[1]);
  }
  return ids;
}

function main() {
  const urls = [...STATIC_ROUTES];
  const staticPaths = new Set(STATIC_ROUTES.map(r => r[0]));

  // Courses -> /courses/<id>.
  // Top-level course objects in data/courses.ts use exactly 4 spaces of
  // indent for their `id:` line. The old /^\s*id:/ pattern also matched
  // the syllabus level ids (level-a1, level-b1, …) nested 8 spaces deep,
  // producing bogus /courses/level-* URLs that soft-404 — never again.
  const courseIds = extractIds('data/courses.ts', /^    id: '([^']+)'/);
  for (const id of courseIds) {
    if (REDIRECTED_COURSE_IDS.has(id)) continue; // canonical page only
    const p = `/courses/${id}`;
    if (!staticPaths.has(p)) urls.push([p, 'monthly', '0.7']);
  }

  // Facebook videos -> /videos/<post id>, with the post's real publish
  // date as lastmod. Dead posts are skipped (the sync script already
  // drops them, but never trust a single layer).
  try {
    const fb = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'facebookPosts.json'), 'utf-8'));
    for (const p of fb.posts || []) {
      if (DEAD_FACEBOOK_IDS.includes(p.id)) continue;
      const lastmod = p.created_at ? String(p.created_at).slice(0, 10) : undefined;
      urls.push([`/videos/${p.id}`, 'weekly', '0.7', lastmod]);
    }
  } catch (e) { /* no synced posts yet */ }

  // Articles -> /articles/<id>
  const articleIds = extractIds('pages/ArticlesPage.tsx', /^\s*id: '([^']+)'/);
  for (const id of articleIds) {
    urls.push([`/articles/${id}`, 'monthly', '0.6']);
  }

  // Knowledge store -> /store/category/<id> and /store/product/<id>.
  // Scoped to the STORE_CATEGORIES / STORE_PRODUCTS arrays so the
  // testimonial, purchase and download ids in the same file are not picked up.
  const categoryIds = extractSectionIds(
    'data/knowledgeStore.ts',
    'export const STORE_CATEGORIES',
    /^\s*id: '([^']+)'/
  );
  for (const id of categoryIds) {
    urls.push([`/store/category/${id}`, 'monthly', '0.6']);
  }
  const productIds = extractSectionIds(
    'data/knowledgeStore.ts',
    'export const STORE_PRODUCTS',
    /^\s*id: '([^']+)'/
  );
  for (const id of productIds) {
    urls.push([`/store/product/${id}`, 'monthly', '0.6']);
  }

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const [loc, freq, pri, lastmod] of urls) {
    const lastmodTag = lastmod ? `<lastmod>${lastmod}</lastmod>` : '';
    lines.push(
      `  <url><loc>${SITE_URL}${loc}</loc>${lastmodTag}<changefreq>${freq}</changefreq><priority>${pri}</priority></url>`
    );
  }
  lines.push('</urlset>');
  const xml = lines.join('\n') + '\n';

  // ─── Build-time validation: fail loudly rather than deploy a bad sitemap ───
  const fail = (msg) => {
    console.error(`SITEMAP ERROR: ${msg}`);
    process.exit(1);
  };
  const urlOpen = (xml.match(/<url>/g) || []).length;
  const urlClose = (xml.match(/<\/url>/g) || []).length;
  if (
    !xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>') ||
    !xml.trimEnd().endsWith('</urlset>') ||
    urlOpen === 0 ||
    urlOpen !== urlClose
  ) {
    fail('generated sitemap is not well-formed XML.');
  }
  for (const dead of DEAD_FACEBOOK_IDS) {
    if (xml.includes(dead)) {
      fail(`sitemap contains dead Facebook post ${dead} — refusing to write.`);
    }
  }
  if (/\/courses\/level-/.test(xml)) {
    fail('sitemap contains bogus /courses/level-* URLs.');
  }
  for (const id of REDIRECTED_COURSE_IDS) {
    if (xml.includes(`/courses/${id}`)) {
      fail(`sitemap contains redirected /courses/${id} (canonical is /${id}).`);
    }
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, xml, 'utf-8');
  const videoCount = urls.filter(u => u[0].startsWith('/videos/')).length;
  const storeCount = urls.filter(u => u[0].startsWith('/store/')).length;
  console.log(
    `Sitemap: ${urls.length} URLs (${STATIC_ROUTES.length} static, ${courseIds.length} courses, ${articleIds.length} articles, ${videoCount} videos, ${storeCount} store) -> ${OUT}`
  );
}

main();
