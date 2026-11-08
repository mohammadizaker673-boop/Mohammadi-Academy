import React from 'react';
import { Link } from 'react-router-dom';
import { Play, ExternalLink, Calendar, Facebook } from 'lucide-react';
import facebookData from '../data/facebookPosts.json';

export interface FacebookPost {
  id: string;
  title: string;
  caption: string;
  created_at: string;
  media_type: string;
  url: string;
  embed_url: string;
}

export const FACEBOOK_PAGE_URL = facebookData.page_url as string;
export const FACEBOOK_POSTS: FacebookPost[] = (facebookData.posts || []) as FacebookPost[];

export function formatPostDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * One synced Facebook video/post. Plays inline via Facebook's video plugin
 * (no Facebook login needed to watch), with a link out to the original post.
 */
export const FacebookVideoCard: React.FC<{ post: FacebookPost }> = ({ post }) => (
  <article className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex flex-col">
    <div className="relative aspect-video bg-black">
      <iframe
        src={post.embed_url}
        title={post.title}
        className="absolute inset-0 w-full h-full"
        style={{ border: 'none', overflow: 'hidden' }}
        scrolling="no"
        frameBorder="0"
        allowFullScreen
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        loading="lazy"
      />
    </div>
    <div className="p-5 flex flex-col flex-1">
      <h3 className="text-white font-bold leading-snug line-clamp-2">
        <Link to={`/videos/${post.id}`} className="hover:text-primary-300 transition-colors">
          {post.title}
        </Link>
      </h3>
      <p className="text-slate-400 text-sm mt-2 line-clamp-2">{post.caption}</p>
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
          <Calendar size={13} />
          {formatPostDate(post.created_at)}
        </span>
        <a
          href={post.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary-300 hover:text-white transition-colors"
        >
          <Play size={13} />
          Watch on Facebook
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  </article>
);

/** Grid of synced Facebook posts. `limit` caps how many are shown. */
export const FacebookVideoGrid: React.FC<{ limit?: number }> = ({ limit }) => {
  const posts = limit ? FACEBOOK_POSTS.slice(0, limit) : FACEBOOK_POSTS;
  if (posts.length === 0) {
    return (
      <p className="text-slate-400 text-center py-10">
        New videos from our Facebook page will appear here soon.
      </p>
    );
  }
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {posts.map(post => (
        <FacebookVideoCard key={post.id} post={post} />
      ))}
    </div>
  );
};

/** "Latest from Facebook" section for the homepage. */
export const LatestFacebookSection: React.FC = () => (
  <section className="py-20 relative">
    <div className="max-w-7xl mx-auto px-6">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 border border-[#1877F2]/25 rounded-full mb-4">
            <Facebook size={14} className="text-[#1877F2]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#60a5fa]">
              From our Facebook page
            </span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">Latest Videos &amp; Reminders</h2>
          <p className="text-slate-400 mt-3 max-w-2xl">
            The newest reminders from Quran The Ultimate Truth — the same videos we post on
            Facebook, right here on the academy website.
          </p>
        </div>
        <Link
          to="/videos"
          className="inline-flex items-center gap-2 px-5 py-3 border border-white/15 text-white rounded-full text-xs font-black uppercase tracking-[0.2em] hover:bg-white/5 transition-colors"
        >
          View all videos
        </Link>
      </div>
      <FacebookVideoGrid limit={3} />
      <div className="text-center mt-8">
        <a
          href={FACEBOOK_PAGE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary-300 hover:text-white transition-colors"
        >
          <Facebook size={16} />
          Follow Quran The Ultimate Truth on Facebook
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  </section>
);
