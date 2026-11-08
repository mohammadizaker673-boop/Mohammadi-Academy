/**
 * Generate public/sitemap.xml from the site's real data sources, so the
 * sitemap always matches what is actually published — no manual editing.
 *
 * Sources:
 *  - Static public routes (listed below).
 *  - Courses: every `id` in data/courses.ts -> /courses/<id>
 *  - Articles: every `id` in pages/ArticlesPage.tsx -> /articles/<id>
 *  - Facebook videos page: /videos (the page itself; the individual
 *    videos are Facebook embeds on that page, read from
 *    data/facebookPosts.json by the site, so they need no separate URLs).
 *
 * Runs automatically before every build (see package.json "prebuild"), so
 * each Vercel deploy ships a fresh sitemap. That is what makes it dynamic:
 * add a course, an article or a Facebook video, push, and the next deploy
 * includes it. Run manually with: node scripts/generateSitemap.cjs
 */

const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://mohammadiacademy.org';
const ROOT = path.join(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'sitemap.xml');

// path, changefreq, priority
const STATIC_ROUTES = [
  ['/', 'weekly', '1.0'],
  ['/courses', 'weekly', '0.9'],
  ['/quran-tajweed', 'monthly', '0.8'],
  ['/quran-translation', 'monthly', '0.8'],
  ['/islamic-studies', 'monthly', '0.8'],
  ['/learn-arabic', 'monthly', '0.8'],
  ['/hifz', 'monthly', '0.8'],
  ['/ai-tutor', 'monthly', '0.7'],
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

function main() {
  const urls = [...STATIC_ROUTES];

  // Courses -> /courses/<id> (skip the ones that already have a dedicated
  // static route, e.g. noorani-qaida, so they are not listed twice).
  const staticPaths = new Set(STATIC_ROUTES.map(r => r[0]));
  const courseIds = extractIds('data/courses.ts', /^\s*id: '([^']+)'/);
  for (const id of courseIds) {
    const p = `/courses/${id}`;
    if (!staticPaths.has(p)) urls.push([p, 'monthly', '0.7']);
  }

  // Facebook videos -> /videos/<post id> (each video gets its own
  // crawlable page with the full caption + VideoObject structured data)
  try {
    const fb = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'facebookPosts.json'), 'utf-8'));
    for (const p of fb.posts || []) {
      urls.push([`/videos/${p.id}`, 'weekly', '0.7']);
    }
  } catch (e) { /* no synced posts yet */ }

  // Articles -> /articles/<id>
  const articleIds = extractIds('pages/ArticlesPage.tsx', /^\s*id: '([^']+)'/);
  for (const id of articleIds) {
    urls.push([`/articles/${id}`, 'monthly', '0.6']);
  }

  const today = new Date().toISOString().slice(0, 10);
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ];
  for (const [loc, freq, pri] of urls) {
    lines.push(
      `  <url><loc>${SITE_URL}${loc}</loc><lastmod>${today}</lastmod><changefreq>${freq}</changefreq><priority>${pri}</priority></url>`
    );
  }
  lines.push('</urlset>');
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, lines.join('\n') + '\n', 'utf-8');
  const videoCount = urls.filter(u => u[0].startsWith('/videos/')).length;
  console.log(
    `Sitemap: ${urls.length} URLs (${STATIC_ROUTES.length} static, ${courseIds.length} courses, ${articleIds.length} articles, ${videoCount} videos) -> ${OUT}`
  );
}

main();
