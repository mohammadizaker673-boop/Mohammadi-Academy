/**
 * Sync the latest posts from the "Quran The Ultimate Truth" Facebook Page
 * into data/facebookPosts.json, which the website renders as its Videos page
 * and the "Latest from Facebook" section on the homepage.
 *
 * How it works:
 *  1. `facebook-cli pages posts list` gives the recent post IDs + captions.
 *  2. `facebook-cli post read` gives each post's permalink, media type and
 *     publish time.
 *  3. The merged list (newest first, max 12) is written to
 *     data/facebookPosts.json. The file is committed to git, so the site
 *     needs no Facebook credentials in the browser and no backend.
 *
 * Run it manually:  node scripts/syncFacebookPosts.cjs
 * It is also run on a schedule (see the cron job) so new posts appear on
 * the site automatically. After the JSON changes, commit + push to `main`
 * and Vercel redeploys the site.
 */

const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const FB_CLI = '/opt/hatch/bin/facebook-cli';
const PAGE_ID = '102223505933258';
const PAGE_NAME = 'Quran The Ultimate Truth';
const PAGE_URL = 'https://facebook.com/Quranultimatetruth';
const MAX_POSTS = 12;
const OUT_PATH = path.join(__dirname, '..', 'data', 'facebookPosts.json');

function runCli(args) {
  const out = execFileSync(FB_CLI, args, { encoding: 'utf-8', timeout: 120000 });
  return JSON.parse(out);
}

function firstLine(caption) {
  const line = (caption || '').split('\n').map(s => s.trim()).find(Boolean) || '';
  return line.length > 110 ? line.slice(0, 107) + '…' : line;
}

/**
 * Fetch the reel/video page and pull its og:image — the video's real
 * thumbnail frame. Used for the video page's social card and the
 * VideoObject structured data Google needs to index the video.
 * Uses curl (Node's https gets its socket hung up by Facebook).
 * Returns '' when the page cannot be read (thumbnail is optional).
 */
function fetchThumbnail(pageUrl) {
  try {
    const html = execFileSync('curl', [
      '-s', '-L', '--max-time', '25',
      '-A', 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      pageUrl,
    ], { encoding: 'utf-8', maxBuffer: 4 * 1024 * 1024 });
    const m = html.match(/<meta property="og:image" content="([^"]+)"/);
    return m ? m[1].replace(/&amp;/g, '&') : '';
  } catch (e) {
    return '';
  }
}

function mediaKind(mediaType) {
  if (!mediaType) return 'post';
  if (mediaType.includes('video') || mediaType.includes('reel')) return 'video';
  if (mediaType.includes('photo') || mediaType.includes('image')) return 'photo';
  return 'post';
}

async function main() {
  const list = runCli(['pages', 'posts', 'list', '--page-id', PAGE_ID, '--limit', '10']);
  const results = list.results || [];
  const posts = [];

  for (const r of results) {
    const id = String(r.object_id || '');
    if (!id) continue;
    let detail = null;
    try {
      const d = runCli(['post', 'read', '--post-id', id]);
      detail = (d.posts && d.posts[0]) || null;
    } catch (e) {
      console.error(`post read failed for ${id}: ${e.message}`);
    }
    if (!detail) continue;

    const caption = detail.post_caption || (r.metadata && r.metadata.caption_excerpt) || '';
    const url = detail.url || `https://www.facebook.com/${PAGE_ID}/posts/${id}`;
    const created = (detail.post_created_at && detail.post_created_at.utc)
      || (detail.created_at) || '';
    const thumbnail_url = fetchThumbnail(url);
    posts.push({
      id,
      title: firstLine(caption),
      caption: caption.trim(),
      created_at: created,
      media_type: mediaKind(detail.media_type),
      url,
      thumbnail_url,
      embed_url: 'https://www.facebook.com/plugins/video.php?href='
        + encodeURIComponent(url) + '&show_text=false&width=560',
    });
  }

  // Keep any previously synced posts that are no longer in the latest 10
  // (so the page never shrinks below what we already published), then
  // dedupe and cap at MAX_POSTS, newest first.
  let previous = [];
  try {
    previous = JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8')).posts || [];
  } catch (e) { /* first run */ }
  const seen = new Set(posts.map(p => p.id));
  for (const p of previous) {
    if (!seen.has(p.id)) { posts.push(p); seen.add(p.id); }
  }
  posts.sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)));
  const trimmed = posts.slice(0, MAX_POSTS);

  const payload = {
    synced_at: new Date().toISOString(),
    page_id: PAGE_ID,
    page_name: PAGE_NAME,
    page_url: PAGE_URL,
    posts: trimmed,
  };
  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf-8');
  console.log(`Synced ${trimmed.length} posts -> ${OUT_PATH}`);
}

main();
