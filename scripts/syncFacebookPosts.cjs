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

const DRIVE_CLI = '/opt/hatch/bin/hatch_gws_cli';
const DRIVE_THUMB_FOLDER = '1ZaFmG9MPNcNbLLqWymQsE0XmVNQn-yVU'; // "Academy Video Thumbnails"

/** Permanent public thumbnail URL for a Drive file id. */
function driveThumbUrl(driveId) {
  return `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
}

/**
 * Save a video's thumbnail where Google can always fetch it: upload it to
 * the "Academy Video Thumbnails" Drive folder, make it public, and return
 * its Drive file id. Facebook CDN links (scontent.xx.fbcdn.net) expire
 * within days (the oe= param) and change on every sync, so Google can
 * never rely on them — that is why most videos show no thumbnail in
 * search and are not eligible for video results. A public Drive file
 * never expires. Returns '' when the download or upload fails.
 *
 * NOTE: the site's GitHub push cannot carry binary files (UTF-8 only),
 * which is why thumbnails live on Drive instead of in the repo. The
 * automated sync only uploads when a genuinely new video appears; when
 * the Drive call cannot run unattended it falls back to the Facebook
 * link and retries on the next run.
 */
function uploadThumbnailToDrive(id, fbUrl) {
  if (!fbUrl) return '';
  const tmp = `/tmp/thumb_${id}.jpg`;
  try {
    execFileSync('curl', ['-s', '-L', '--max-time', '30',
      '-A', 'Mozilla/5.0', '-o', tmp, fbUrl],
      { encoding: 'utf-8', timeout: 60000 });
    const buf = fs.readFileSync(tmp);
    if (buf.length < 1000 || buf[0] !== 0xFF || buf[1] !== 0xD8 || buf[2] !== 0xFF) return '';
    const out = execFileSync(DRIVE_CLI, ['drive', '+upload', tmp,
      '--parent', DRIVE_THUMB_FOLDER], { encoding: 'utf-8', timeout: 120000 });
    const driveId = JSON.parse(out).id;
    if (!driveId) return '';
    execFileSync(DRIVE_CLI, ['drive', 'permissions', 'create',
      '--params', JSON.stringify({ fileId: driveId }),
      '--json', JSON.stringify({ type: 'anyone', role: 'reader' })],
      { encoding: 'utf-8', timeout: 60000 });
    return driveId;
  } catch (e) {
    return '';
  } finally {
    try { fs.unlinkSync(tmp); } catch (e) { /* already gone */ }
  }
}

/**
 * Make sure a post's thumbnail_url is the permanent Drive URL, reusing
 * the stored Drive file id when it exists (no re-upload on every sync).
 * Returns the post (mutated).
 */
function ensureDriveThumbnail(p) {
  if (p.thumbnail_drive_id) {
    p.thumbnail_url = driveThumbUrl(p.thumbnail_drive_id);
    return p;
  }
  const fb = p.thumbnail_facebook || fetchThumbnail(p.url);
  const driveId = uploadThumbnailToDrive(p.id, fb);
  if (driveId) {
    p.thumbnail_drive_id = driveId;
    p.thumbnail_url = driveThumbUrl(driveId);
    p.thumbnail_facebook = fb;
  }
  return p;
}

function mediaKind(mediaType) {
  if (!mediaType) return 'post';
  if (mediaType.includes('video') || mediaType.includes('reel')) return 'video';
  if (mediaType.includes('photo') || mediaType.includes('image')) return 'photo';
  return 'post';
}

/**
 * Verify a previously synced post still exists on Facebook.
 * The list endpoint is inconsistent — it keeps returning posts that
 * were removed — so a direct `post read` is the only reliable check.
 * Returns the post detail when it still exists, null when the read
 * fails (e.g. 404 POST_NOT_FOUND) or returns nothing.
 */
function verifyPost(id) {
  try {
    const d = runCli(['post', 'read', '--post-id', id]);
    return (d.posts && d.posts[0]) || null;
  } catch (e) {
    return null;
  }
}

async function main() {
  const list = runCli(['pages', 'posts', 'list', '--page-id', PAGE_ID, '--limit', '10']);
  const results = list.results || [];
  const posts = [];

  // Previously synced posts, by id — so a re-sync reuses the stored
  // Drive thumbnail id instead of uploading a duplicate every run.
  let previous = [];
  try {
    previous = JSON.parse(fs.readFileSync(OUT_PATH, 'utf-8')).posts || [];
  } catch (e) { /* first run */ }
  const prevById = new Map(previous.map(p => [p.id, p]));

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
    const prev = prevById.get(id);
    const fbThumb = prev && prev.thumbnail_facebook ? prev.thumbnail_facebook : fetchThumbnail(url);
    // Reuse the stored Drive thumbnail when this post was synced before.
    const driveId = (prev && prev.thumbnail_drive_id)
      ? prev.thumbnail_drive_id
      : uploadThumbnailToDrive(id, fbThumb);
    posts.push({
      id,
      title: firstLine(caption),
      caption: caption.trim(),
      created_at: created,
      media_type: mediaKind(detail.media_type),
      url,
      thumbnail_url: driveId ? driveThumbUrl(driveId) : fbThumb,
      thumbnail_drive_id: driveId || '',
      thumbnail_facebook: fbThumb || '',
      embed_url: 'https://www.facebook.com/plugins/video.php?href='
        + encodeURIComponent(url) + '&show_text=false&width=560',
    });
  }

  // Keep any previously synced posts that are no longer in the latest 10
  // (so the page never shrinks below what we already published), but only
  // if they still exist on Facebook. Previously this re-added old posts
  // blindly, so posts removed from Facebook (e.g. 1111795538300935 and
  // 1112198251593997, both 404 since 2026-11-10) kept coming back and
  // their video pages on the site stayed dead.
  // (`previous` was already loaded at the top of main, for thumbnail reuse.)
  const seen = new Set(posts.map(p => p.id));
  for (const p of previous) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);
    if (verifyPost(p.id)) {
      ensureDriveThumbnail(p);
      posts.push(p);
    } else {
      console.log(`Dropping removed post ${p.id} (${p.title || 'no title'}) — no longer on Facebook`);
    }
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
