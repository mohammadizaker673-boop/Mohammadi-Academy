import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BookOpen, Heart, Star, Clock, ArrowRight } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import BackButton from '../components/BackButton';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';
import LogoLink from '../components/LogoLink';

const ArticlesPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  let t = TRANSLATIONS[language];
  
  // Fallback to English if translations are not available
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

  const articles = [
    {
      id: 'light-of-knowledge',
      title: 'The Light of Knowledge: Finding Truth in a World of Confusion',
      excerpt: 'In today\'s world, we\'re surrounded by information from every direction. Discover how the Qur\'an guides us to true knowledge and wisdom.',
      category: 'Knowledge & Learning',
      readTime: '8 min read',
      audience: 'Mixed Audience',
      gradient: 'from-primary-500 to-accent-500',
    },
    {
      id: 'raising-children-with-values',
      title: 'Raising Children with Islamic Values in a Modern World',
      excerpt: 'Parenting in the modern age comes with unique challenges. Learn practical approaches to instill Islamic values while allowing your children to thrive.',
      category: 'Family & Parenting',
      readTime: '10 min read',
      audience: 'Parents',
      gradient: 'from-accent-500 to-primary-500',
    },
    {
      id: 'finding-peace-in-prayer',
      title: 'Finding Inner Peace Through Prayer and Reflection',
      excerpt: 'In a fast-paced world, discover how Islamic prayer offers more than ritual – it offers genuine peace and connection with the Divine.',
      category: 'Spiritual Growth',
      readTime: '7 min read',
      audience: 'Mixed Audience',
      gradient: 'from-sky-500 to-primary-500',
    },
  ];

  return (
    <div className="min-h-screen bg-[#050a12]">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#050a12]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <LogoLink showText={false} compact />
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              Home
            </Link>
            <Link to="/courses" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              Courses
            </Link>
            <Link to="/ai-tutor" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">
              AI Teachers
            </Link>
            <Link to="/login" className="px-5 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider hover:from-primary-400 hover:to-accent-400 transition-all">
              Login
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden mt-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-accent-500/10 blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto">
          <BackButton to="/" label="← Back to Home" variant="light" className="mb-6" />
          
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-6 py-2 bg-primary-500/20 border border-primary-400/30 rounded-full text-primary-300 text-sm font-bold uppercase tracking-wider mb-6">
              <BookOpen size={16} />
              {t.articles.title}
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
              {t.articles.heading}
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              {t.articles.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 gap-8">
            {articles.map((article) => (
              <div
                key={article.id}
                onClick={() => navigate(`/articles/${article.id}`)}
                className="group relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-8 hover:border-primary-400/50 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-2"
              >
                {/* Category Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500/20 to-accent-500/20 border border-primary-400/30 rounded-full text-primary-300 text-sm font-bold uppercase tracking-wider mb-4">
                  <Star size={14} />
                  {article.category}
                </div>

                {/* Title */}
                <h2 className="text-3xl font-black text-white mb-4 group-hover:text-primary-300 transition-colors">
                  {article.title}
                </h2>

                {/* Excerpt */}
                <p className="text-lg text-slate-300 leading-relaxed mb-6">
                  {article.excerpt}
                </p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-6 text-sm text-slate-400 mb-6">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-primary-400" />
                    {article.readTime}
                  </div>
                  <div className="flex items-center gap-2">
                    <Heart size={16} className="text-accent-400" />
                    {article.audience}
                  </div>
                </div>

                {/* Read More Button */}
                <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-bold rounded-xl transition-all shadow-lg group-hover:shadow-primary-500/50">
                  {t.articles.readArticle}
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-primary-500/20 to-accent-500/20 backdrop-blur-xl border border-primary-400/30 rounded-3xl p-12 text-center">
            <BookOpen size={48} className="mx-auto text-primary-400 mb-6" />
            <h3 className="text-3xl font-black text-white mb-4">
              {t.articles.joinCommunity}
            </h3>
            <p className="text-xl text-slate-300 mb-8">
              {t.articles.joinText}
            </p>
            <button
              onClick={() => navigate('/courses')}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-black rounded-xl uppercase tracking-wider transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              {t.form.ourCourses}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#050a12] py-8">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-slate-500 text-sm">&copy; 2026 Mohammadi Online Quran Academy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ArticlesPage;
