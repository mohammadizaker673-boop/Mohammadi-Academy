import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, ExternalLink, Video } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import BackButton from '../components/BackButton';
import LogoLink from '../components/LogoLink';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';
import { FacebookVideoGrid, FACEBOOK_PAGE_URL, FACEBOOK_POSTS } from '../components/FacebookVideos';

const VideosPage: React.FC = () => {
  const { language } = useLanguage();
  let t = TRANSLATIONS[language];
  if (!t) {
    t = TRANSLATIONS['en'];
  }

  useEffect(() => {
    if (t && t.dir) {
      document.documentElement.dir = t.dir;
      document.documentElement.lang = language;
    }
  }, [language, t]);

  if (!t) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2>Error: Translations not loaded</h2>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a12] text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#050a12]/90 backdrop-blur border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <BackButton />
            <LogoLink />
          </div>
          <LanguageSelector />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-14">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#1877F2]/10 border border-[#1877F2]/25 rounded-full mb-5">
            <Video size={14} className="text-[#60a5fa]" />
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-[#60a5fa]">
              Quran The Ultimate Truth
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black">Videos &amp; Reminders</h1>
          <p className="text-slate-400 mt-4 max-w-2xl mx-auto">
            Short Islamic reminders and lessons from our Facebook page — the same videos
            we publish there, collected here so you can watch them any time. New videos
            appear here automatically whenever we post them on Facebook.
          </p>
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#1877F2] text-white rounded-full text-sm font-bold hover:bg-[#1667d8] transition-colors"
          >
            <Facebook size={16} />
            Follow us on Facebook
            <ExternalLink size={14} />
          </a>
        </div>

        <FacebookVideoGrid />

        <p className="text-center text-slate-500 text-sm mt-12">
          Showing the {FACEBOOK_POSTS.length} most recent posts from our Facebook page.
          Want to learn the Quran live with a teacher?{' '}
          <Link to="/start" className="text-primary-300 font-bold hover:text-white">
            Start learning
          </Link>
          .
        </p>
      </main>
    </div>
  );
};

export default VideosPage;
