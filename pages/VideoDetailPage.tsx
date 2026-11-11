import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Facebook, ExternalLink, Calendar, ArrowLeft, Play } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import BackButton from '../components/BackButton';
import LogoLink from '../components/LogoLink';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';
import {
  FACEBOOK_POSTS,
  FACEBOOK_PAGE_URL,
  formatPostDate,
  type FacebookPost,
} from '../components/FacebookVideos';
import { Seo } from '../components/Seo';

const SITE_URL = 'https://mohammadiacademy.org';

/**
 * One Facebook video, on its own page, so Google can crawl and index it:
 * real title, the full caption as readable text, the video player, and
 * VideoObject structured data (name, description, thumbnail, upload date,
 * embed URL) so it can appear in Google video results.
 */
const VideoDetailPage: React.FC = () => {
  const { videoId } = useParams<{ videoId: string }>();
  const { language } = useLanguage();
  let t = TRANSLATIONS[language];
  if (!t) {
    t = TRANSLATIONS['en'];
  }

  const post: FacebookPost | undefined = FACEBOOK_POSTS.find(p => p.id === videoId);

  useEffect(() => {
    if (t && t.dir) {
      document.documentElement.dir = t.dir;
      document.documentElement.lang = language;
    }
  }, [language, t]);

  // Per-video SEO: title, description, canonical and social card.
  useEffect(() => {
    if (!post) return;
    const pageUrl = `${SITE_URL}/videos/${post.id}`;
    document.title = `${post.title} | Mohammadi Academy`;
    const setMeta = (attr: string, key: string, value: string) => {
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', value);
    };
    const desc = post.caption.replace(/\s+/g, ' ').trim().slice(0, 155);
    setMeta('name', 'description', desc);
    setMeta('property', 'og:title', post.title);
    setMeta('property', 'og:description', desc);
    setMeta('property', 'og:type', 'video.other');
    setMeta('property', 'og:url', pageUrl);
    if (post.thumbnail_url) setMeta('property', 'og:image', post.thumbnail_url);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', post.title);
    setMeta('name', 'twitter:description', desc);
    let canon = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canon) {
      canon = document.createElement('link');
      canon.setAttribute('rel', 'canonical');
      document.head.appendChild(canon);
    }
    canon.setAttribute('href', pageUrl);
  }, [post]);

  if (!t) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2>Error: Translations not loaded</h2>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#050a12] text-white">
        <Seo
          title="Video Not Found"
          description="This video may have been removed from our Facebook page, Quran The Ultimate Truth. Watch our latest Islamic reminders and lessons."
          path={videoId ? `/videos/${videoId}` : '/videos'}
          noindex
        />
        <header className="sticky top-0 z-40 bg-[#050a12]/90 backdrop-blur border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <BackButton />
              <LogoLink />
            </div>
            <LanguageSelector />
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-6 py-20 text-center">
          <h1 className="text-3xl font-black">Video not found</h1>
          <p className="text-slate-400 mt-4">
            This video may have been removed from our Facebook page.
          </p>
          <Link
            to="/videos"
            className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-sm font-bold"
          >
            <ArrowLeft size={16} />
            Back to all videos
          </Link>
        </main>
      </div>
    );
  }

  const pageUrl = `${SITE_URL}/videos/${post.id}`;
  const videoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: post.title,
    description: post.caption,
    uploadDate: post.created_at,
    embedUrl: post.embed_url,
    contentUrl: post.url,
    ...(post.thumbnail_url ? { thumbnailUrl: post.thumbnail_url } : {}),
    publisher: {
      '@type': 'Organization',
      name: 'Mohammadi Online Quran Academy',
      url: SITE_URL,
    },
  };

  const related = FACEBOOK_POSTS.filter(p => p.id !== post.id).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#050a12] text-white">
      <script type="application/ld+json">{JSON.stringify(videoJsonLd)}</script>

      <header className="sticky top-0 z-40 bg-[#050a12]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton />
            <LogoLink />
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <Link
          to="/videos"
          className="inline-flex items-center gap-2 text-sm font-bold text-primary-300 hover:text-white transition-colors"
        >
          <ArrowLeft size={15} />
          All videos
        </Link>

        <h1 className="text-3xl md:text-4xl font-black leading-tight mt-6">{post.title}</h1>
        <p className="text-slate-400 text-sm mt-3 inline-flex items-center gap-2">
          <Calendar size={14} />
          {formatPostDate(post.created_at)}
          <span aria-hidden="true">·</span>
          Quran The Ultimate Truth
        </p>

        <div className="relative aspect-video bg-black rounded-2xl overflow-hidden mt-8 border border-white/10">
          <iframe
            src={post.embed_url}
            title={post.title}
            className="absolute inset-0 w-full h-full"
            style={{ border: 'none', overflow: 'hidden' }}
            scrolling="no"
            frameBorder="0"
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-lg font-bold mb-3">About this video</h2>
          <p className="text-slate-300 whitespace-pre-line leading-relaxed">{post.caption}</p>
        </div>

        <div className="flex flex-wrap gap-4 mt-8">
          <a
            href={post.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1877F2] text-white rounded-full text-sm font-bold hover:bg-[#1667d8] transition-colors"
          >
            <Facebook size={16} />
            Watch on Facebook
            <ExternalLink size={14} />
          </a>
          <Link
            to="/start"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/15 text-white rounded-full text-sm font-bold hover:bg-white/5 transition-colors"
          >
            <Play size={15} />
            Learn the Quran live with a teacher
          </Link>
        </div>

        {related.length > 0 && (
          <section className="mt-14">
            <h2 className="text-2xl font-black mb-6">More videos</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map(r => (
                <Link
                  key={r.id}
                  to={`/videos/${r.id}`}
                  className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-primary-400/50 transition-colors"
                >
                  {r.thumbnail_url ? (
                    <img
                      src={r.thumbnail_url}
                      alt={r.title}
                      className="w-full aspect-video object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full aspect-video bg-slate-800 flex items-center justify-center">
                      <Play size={28} className="text-slate-500" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-bold leading-snug line-clamp-2 text-sm">{r.title}</h3>
                    <p className="text-slate-500 text-xs mt-2">{formatPostDate(r.created_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="text-center text-slate-500 text-sm mt-12">
          This video is from our Facebook page,{' '}
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary-300 font-bold hover:text-white"
          >
            Quran The Ultimate Truth
          </a>
          .
        </p>
      </main>
    </div>
  );
};

export default VideoDetailPage;
