import React, { useEffect, useMemo, useRef, useState } from 'react';
import { TRANSLATIONS, PHONE_NUMBER } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import LogoLink from '../components/LogoLink';
import ThemeToggle from '../components/ThemeToggle';
import { FeaturesSection } from '../components/FeaturesSection';
import { FooterSocialLinks } from '../components/FooterSocialLinks';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import backgroundImage from '../Photos/FullLogo.jpg';
import { initializeSampleFeatures } from '../utils/sampleFeatures';
import { Search, Menu, X, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { courses } from '../data/courses';
import { getCourseDetailPath } from '../utils/courseRouting';
import NoorBackground from '../components/NoorBackground';
import { generateAIText, hasOpenRouterApiKey } from '../services/aiService';

const HomePage: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [exploreOpen, setExploreOpen] = useState(false);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const exploreRef = useRef<HTMLDivElement>(null);

  // Hero AI search state
  const [heroSearch, setHeroSearch] = useState('');
  const [heroResults, setHeroResults] = useState<typeof courses>([]);
  const [aiCourse, setAiCourse] = useState<{ title: string; description: string; modules: string[]; duration: string; level: string } | null>(null);
  const [heroSearching, setHeroSearching] = useState(false);
  const [heroSearched, setHeroSearched] = useState(false);

  if (!t) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2>Error: Translations not loaded</h2>
      </div>
    );
  }

  const exploreCategories = useMemo(
    () => [
      { value: 'quran', label: t.exploreCategories?.quran || 'Quran & Tajweed' },
      { value: 'islamic-studies', label: t.exploreCategories?.islamicStudies || 'Islamic Studies' },
      { value: 'language-learning', label: t.exploreCategories?.languages || 'Languages' },
      { value: 'artificial-intelligence', label: t.exploreCategories?.ai || 'Artificial Intelligence' },
      { value: 'information-technology', label: t.exploreCategories?.it || 'Information Technology' },
      { value: 'science', label: t.exploreCategories?.science || 'Science' },
      { value: 'general-knowledge', label: t.exploreCategories?.generalKnowledge || 'General Knowledge' },
      { value: 'life-skills', label: t.exploreCategories?.lifeSkills || 'Life Skills' },
      { value: 'digital-skills', label: t.exploreCategories?.digitalSkills || 'Digital Skills' }
    ],
    [language, t]
  );

  const exploreGroups = useMemo(() => {
    return exploreCategories
      .map(category => ({
        ...category,
        courses: courses.filter(course => course.category === category.value)
      }))
      .filter(group => group.courses.length > 0);
  }, [exploreCategories]);

  useEffect(() => {
    document.documentElement.dir = t.dir;
    document.documentElement.lang = language;
    // Initialize sample features on first load
    initializeSampleFeatures();
  }, [language, t.dir]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exploreRef.current && !exploreRef.current.contains(event.target as Node)) {
        setExploreOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExploreOpen(false);
      }
    };

    if (exploreOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [exploreOpen]);

  const handleHeroSearch = async () => {
    const query = heroSearch.trim();
    if (!query) return;
    setHeroSearching(true);
    setHeroSearched(false);
    setAiCourse(null);

    // 1. Search existing courses
    const q = query.toLowerCase();
    const matched = courses.filter(c => {
      const text = [c.title, c.titleArabic, c.description, c.category, c.targetAudience, ...(c.learningOutcomes?.map(o => o.description) || [])].join(' ').toLowerCase();
      return q.split(' ').some(word => word.length > 2 && text.includes(word));
    }).slice(0, 4);
    setHeroResults(matched);

    // 2. If no/few matches and AI is available, generate a custom course
    if (matched.length < 2 && hasOpenRouterApiKey()) {
      try {
        const raw = await generateAIText({
          messages: [
            { role: 'system', content: 'You are an educational course designer for Mohammadi Academy. Given a topic, create a short course outline. Return ONLY valid JSON with keys: title (string), description (1-2 sentences), modules (array of 5-6 module title strings), duration (e.g. "4 weeks"), level (beginner/intermediate/advanced). No markdown fences.' },
            { role: 'user', content: `Create a course outline for someone who wants to learn: "${query}"` },
          ],
          maxTokens: 600,
          temperature: 0.5,
          jsonMode: true,
        });
        const parsed = JSON.parse(raw.replace(/```json?/gi, '').replace(/```/g, '').trim());
        setAiCourse(parsed);
      } catch {
        // Silently fail — we still show existing results
      }
    }
    setHeroSearching(false);
    setHeroSearched(true);
  };

  return (
    <>
      {/* Noor Divine Light Animation */}
      <NoorBackground />

      {/* Admin floating badge — only visible to admins */}
      {user?.role === 'admin' && (
        <a
          href="/admin"
          className="fixed bottom-6 right-6 z-[9999] flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white text-sm font-black rounded-2xl shadow-2xl shadow-red-900/50 transition-all hover:scale-105"
          title="Admin Dashboard"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          Admin Dashboard
        </a>
      )}

      {/* Background Decorative Mandala — subtle */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-0 overflow-hidden flex items-center justify-center">
         <div className="w-[120vw] h-[120vw] border-[1px] border-white/40 rounded-full flex items-center justify-center">
            <div className="w-[100vw] h-[100vw] border-[1px] border-white/30 rounded-full flex items-center justify-center rotate-45">
               <div className="w-[80vw] h-[80vw] border-[1px] border-white/20 rounded-full"></div>
            </div>
         </div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Logo + Desktop nav links */}
          <div className="flex items-center gap-5">
            <LogoLink />
            <div ref={exploreRef} className="hidden lg:block">
              <button
                type="button"
                onClick={() => setExploreOpen(prev => !prev)}
                className="text-slate-300 hover:text-primary-400 transition-colors text-[11px] font-black uppercase tracking-[0.2em]"
                aria-haspopup="true"
                aria-expanded={exploreOpen}
              >
                {t.nav.explore}
              </button>
              {exploreOpen && (
                <div className="fixed top-16 left-6 md:left-8 w-[720px] max-w-[92vw] max-h-[calc(100vh-100px)] rounded-2xl border border-white/5 bg-black/90 shadow-2xl backdrop-blur-2xl z-50 p-5 overflow-y-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t.nav.exploreSubjects}</p>
                      <h3 className="text-lg font-black text-white">{t.nav.findPath}</h3>
                    </div>
                    <Link
                      to="/courses"
                      onClick={() => setExploreOpen(false)}
                      className="text-xs font-black uppercase tracking-[0.2em] text-primary-300 hover:text-white"
                    >
                      {t.nav.viewAllCourses}
                    </Link>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {exploreGroups.map(group => (
                      <div key={group.value} className="rounded-xl border border-white/10 bg-white/5 p-3">
                        <Link
                          to={`/courses?category=${group.value}`}
                          onClick={() => setExploreOpen(false)}
                          className="flex items-center justify-between mb-3"
                        >
                          <span className="text-sm font-black text-white">{group.label}</span>
                          <span className="text-[10px] uppercase tracking-wider text-slate-400">{group.courses.length} {t.nav.courses_label}</span>
                        </Link>
                        <div className="space-y-2">
                          {group.courses.slice(0, 4).map(course => (
                            <Link
                              key={course.id}
                              to={getCourseDetailPath(course.id)}
                              onClick={() => setExploreOpen(false)}
                              className="block text-sm text-slate-300 hover:text-white transition-colors"
                            >
                              {course.title}
                            </Link>
                          ))}
                        </div>
                        {group.courses.length > 4 && (
                          <Link
                            to={`/courses?category=${group.value}`}
                            onClick={() => setExploreOpen(false)}
                            className="mt-3 inline-flex text-[10px] font-black uppercase tracking-[0.2em] text-primary-300 hover:text-white"
                          >
                            {t.nav.seeMore}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <Link
              to="/start"
              className="hidden lg:block text-slate-300 hover:text-primary-400 transition-colors text-[11px] font-black uppercase tracking-[0.2em]"
            >
              {t.nav.startLearning}
            </Link>
            <Link
              to="/ai-tutor"
              className="hidden lg:block text-slate-300 hover:text-primary-400 transition-colors text-[11px] font-black uppercase tracking-[0.2em]"
            >
              AI Teachers
            </Link>
            <Link
              to="/store"
              className="hidden lg:block text-slate-300 hover:text-primary-400 transition-colors text-[11px] font-black uppercase tracking-[0.2em]"
            >
              {t.nav.knowledgeStore}
            </Link>
            <Link
              to="/meetings"
              className="hidden lg:block text-slate-300 hover:text-primary-400 transition-colors text-[11px] font-black uppercase tracking-[0.2em]"
            >
              Meetings
            </Link>
          </div>

          {/* Center: Search - desktop only */}
          <div className="hidden lg:flex justify-center flex-1 max-w-2xl mx-auto">
            <form
              className="relative w-full max-w-2xl"
              onSubmit={(event) => {
                event.preventDefault();
                const trimmed = searchTerm.trim();
                if (trimmed) {
                  navigate(`/courses?q=${encodeURIComponent(trimmed)}`);
                  setShowSearchSuggestions(false);
                } else {
                  navigate('/courses');
                }
              }}
            >
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSearchSuggestions(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowSearchSuggestions(false), 200)}
                placeholder={t.nav.searchPlaceholder}
                aria-label="Search courses"
                className="w-full px-6 py-3 pr-12 bg-white/10 border border-white/15 rounded-full text-white placeholder:text-slate-400 focus:border-primary-400 focus:outline-none transition-all"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              
              {/* Search suggestions dropdown */}
              {showSearchSuggestions && searchTerm.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 border border-white/10 rounded-xl shadow-xl z-40 p-4 max-h-64 overflow-y-auto backdrop-blur-xl">
                  <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider">{t.nav.quickResults} "{searchTerm}"</p>
                  <div className="space-y-2">
                    {courses.filter(c => {
                      const searchText = `${c.title} ${c.titleArabic || ''} ${c.description} ${c.category}`.toLowerCase();
                      return searchTerm.toLowerCase().split(' ').every(term => searchText.includes(term));
                    }).slice(0, 5).map(course => (
                      <Link
                        key={course.id}
                        to={getCourseDetailPath(course.id)}
                        onClick={() => setShowSearchSuggestions(false)}
                        className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/10 rounded transition-colors"
                      >
                        <span className="font-semibold">{course.title}</span>
                        {course.titleArabic && <span className="text-xs text-slate-500 ml-2">• {course.titleArabic}</span>}
                      </Link>
                    ))}
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-3 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm font-semibold transition-colors"
                  >
                    {t.nav.viewAllResults} "{searchTerm}"
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Right: Auth buttons (desktop) + Theme/Language + Hamburger */}
          <div className="flex items-center gap-3">
            {/* Desktop auth buttons */}
            <div className="hidden lg:flex items-center gap-3">
            {/* Login/Dashboard Button */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student'}
                  className="px-5 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg hover:from-primary-400 hover:to-accent-400 transition-all"
                >
                  {t.nav.dashboard}
                </Link>
                <button
                  onClick={() => logout()}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-[11px] font-black uppercase tracking-wider transition-all"
                >
                  {t.nav.logout}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-full text-[11px] font-black uppercase tracking-wider transition-all"
                >
                  {t.nav.login}
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider shadow-lg hover:from-primary-400 hover:to-accent-400 transition-all"
                >
                  {t.nav.signUp}
                </Link>
              </div>
            )}
            </div>
            <ThemeToggle />
            <LanguageSelector />
            {/* Hamburger button — mobile only */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden p-2 text-slate-300 hover:text-white transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile slide-down menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-black/95 backdrop-blur-2xl border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
            <div className="max-w-7xl mx-auto px-4 py-5 space-y-4">
              {/* Mobile search */}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  const trimmed = searchTerm.trim();
                  if (trimmed) navigate(`/courses?q=${encodeURIComponent(trimmed)}`);
                  else navigate('/courses');
                  setMobileMenuOpen(false);
                }}
              >
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t.nav.searchPlaceholder}
                  className="w-full px-5 py-3 bg-white/10 border border-white/15 rounded-xl text-white placeholder:text-slate-400 focus:border-primary-400 focus:outline-none"
                />
              </form>
              {/* Mobile nav links */}
              <div className="flex flex-col gap-1">
                <Link to="/courses" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors">{t.nav.explore}</Link>
                <Link to="/start" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors">{t.nav.startLearning}</Link>
                <Link to="/ai-tutor" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors">AI Teachers</Link>
                <Link to="/store" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors">{t.nav.knowledgeStore}</Link>
                <Link to="/meetings" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors">Meetings</Link>
                <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors">{t.footerExtra?.aboutUs || 'About Us'}</Link>
                <Link to="/faq" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors">FAQ</Link>
                <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 text-slate-200 hover:bg-white/5 rounded-lg text-sm font-semibold transition-colors">{t.footerExtra?.contactUs || 'Contact Us'}</Link>
              </div>
              {/* Mobile auth buttons */}
              <div className="flex gap-3 pt-2 border-t border-white/10">
                {user ? (
                  <>
                    <Link to={user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student'} onClick={() => setMobileMenuOpen(false)} className="flex-1 px-5 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-center text-sm font-bold">{t.nav.dashboard}</Link>
                    <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="px-5 py-3 bg-white/10 text-white rounded-xl text-sm font-bold">{t.nav.logout}</button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1 px-5 py-3 bg-white/10 text-white rounded-xl text-center text-sm font-bold">{t.nav.login}</Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1 px-5 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl text-center text-sm font-bold">{t.nav.signUp}</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-primary-400/10 border border-primary-400/20 rounded-full">
              <span className="w-2.5 h-2.5 bg-primary-400 rounded-full animate-pulse shadow-glow"></span>
              <span className="text-primary-300 text-[10px] font-black tracking-[0.3em] uppercase">{t.name}</span>
            </div>
            <h1 className="text-5xl sm:text-7xl font-black leading-[1.05] tracking-tight text-white drop-shadow-2xl">
              {t.tagline}
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed font-medium">
              {t.heroSub}
            </p>
            {t.mission && (
              <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-400/30 rounded-2xl p-6">
                <p className="text-lg text-primary-200 italic leading-relaxed font-medium">
                  {t.mission}
                </p>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-5">
              <Link
                to="/register"
                className="group relative px-10 py-5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-black rounded-[1.5rem] text-sm uppercase tracking-[0.25em] transition-all shadow-2xl shadow-primary-500/30 hover:shadow-primary-500/50 hover:scale-105"
              >
                <span className="relative z-10">{t.nav.register}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-accent-400 to-accent-500 rounded-[1.5rem] blur-xl opacity-0 group-hover:opacity-50 transition-opacity"></div>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-primary-400/10 to-accent-500/10 blur-3xl rounded-full"></div>
            <div className="relative rounded-[3rem] overflow-hidden shadow-2xl border-2 border-white/10 bg-black">
              <img src={backgroundImage} alt={t.name} className="w-full h-full object-cover" style={{ mixBlendMode: 'screen', filter: 'brightness(1.2) contrast(1.1)' }} />
              {/* Search overlay on image */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6 pt-16">
                <h3 className="text-lg font-black text-white mb-3">What do you want to learn?</h3>
                <form onSubmit={(e) => { e.preventDefault(); handleHeroSearch(); }} className="flex gap-2">
                  <input
                    type="text"
                    value={heroSearch}
                    onChange={(e) => { setHeroSearch(e.target.value); setHeroSearched(false); }}
                    placeholder="e.g. Tajweed, Python, Arabic, First Aid..."
                    className="flex-1 px-4 py-3 bg-white/15 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder:text-slate-300 focus:border-primary-400 focus:outline-none text-sm"
                  />
                  <button
                    type="submit"
                    disabled={heroSearching || !heroSearch.trim()}
                    className="px-5 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold disabled:opacity-50 hover:from-primary-400 hover:to-accent-400 transition-all flex items-center gap-2 text-sm"
                  >
                    {heroSearching ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                  </button>
                </form>
                {!heroSearched && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {['Quran', 'Arabic', 'Tajweed', 'Python', 'Islamic Studies', 'English'].map(topic => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => { setHeroSearch(topic); }}
                        className="px-2.5 py-1 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full text-[11px] text-white/80 hover:text-white hover:bg-white/20 transition-all"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            {/* Search results dropdown below image */}
            {heroSearched && (
              <div className="mt-4 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-3">
                {heroResults.length > 0 && (
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">Matching Courses</p>
                    <div className="space-y-2">
                      {heroResults.map(c => (
                        <Link
                          key={c.id}
                          to={getCourseDetailPath(c.id)}
                          className="flex items-center justify-between gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:border-primary-400/40 transition-all group"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{c.title}</p>
                            <p className="text-xs text-slate-400 truncate">{c.category.replace('-', ' ')} · {c.level}</p>
                          </div>
                          <ArrowRight size={14} className="text-slate-400 group-hover:text-primary-400 flex-shrink-0 transition-colors" />
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {aiCourse && (
                  <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-400/20 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-primary-400" />
                      <p className="text-xs text-primary-300 font-bold uppercase tracking-wider">AI-Generated Course</p>
                    </div>
                    <h4 className="text-base font-black text-white mb-1">{aiCourse.title}</h4>
                    <p className="text-xs text-slate-300 mb-3">{aiCourse.description}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-slate-300">{aiCourse.duration}</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-slate-300">{aiCourse.level}</span>
                      <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] text-slate-300">{aiCourse.modules.length} modules</span>
                    </div>
                    <div className="space-y-1 mb-3">
                      {aiCourse.modules.slice(0, 4).map((m, i) => (
                        <p key={i} className="text-xs text-slate-400 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-[9px] font-bold flex-shrink-0">{i + 1}</span>
                          {m}
                        </p>
                      ))}
                      {aiCourse.modules.length > 4 && (
                        <p className="text-xs text-slate-500">+{aiCourse.modules.length - 4} more modules</p>
                      )}
                    </div>
                    <Link
                      to="/ai-tutor"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg text-xs font-bold hover:from-primary-400 hover:to-accent-400 transition-all"
                    >
                      <Sparkles size={12} /> Start Learning with AI
                    </Link>
                  </div>
                )}

                {heroResults.length === 0 && !aiCourse && (
                  <div className="text-center py-3">
                    <p className="text-sm text-slate-400 mb-3">No exact matches found for &quot;{heroSearch}&quot;</p>
                    <Link
                      to="/ai-tutor"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg text-xs font-bold hover:from-primary-400 hover:to-accent-400 transition-all"
                    >
                      <Sparkles size={12} /> Ask AI Teacher Instead
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-400/10 blur-[120px] rounded-full"></div>
      </header>


      {/* Tuition Packages */}
      <section id="pricing" className="py-20 bg-[#0e1436]/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 reveal">
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-8 tracking-tight">{t.pricing.title}</h2>
            <div className="w-20 h-2 bg-primary-500 mx-auto rounded-full mb-10"></div>
            <p className="text-slate-400 max-w-2xl mx-auto font-medium text-sm">{t.pricing.subtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger-children">
            {/* Basic Package */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-[2rem] p-10 hover:border-primary-400/50 transition-all hover:shadow-2xl hover:shadow-sky-400/10 hover:-translate-y-2 group reveal depth-card">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-white mb-4">{t.pricing.basic}</h3>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl font-black text-white">$15</span>
                  <span className="text-slate-400 mb-2 font-bold">/ {t.pricing.month}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                {(t.pricing.basicFeatures || ['2 Classes Per Week', '30-Minute Sessions', 'Qualified Teacher']).map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-300 leading-relaxed">{feature}</span>
                </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl text-center uppercase tracking-wider transition-all shadow-lg group-hover:scale-105">
                {t.pricing.register || t.nav.register}
              </Link>
            </div>

            {/* Standard Package - Popular */}
            <div className="relative bg-gradient-to-br from-primary-500/20 to-accent-500/20 border-2 border-primary-400 rounded-[2rem] p-10 hover:border-primary-400/50 transition-all hover:shadow-2xl hover:shadow-primary-400/10 hover:-translate-y-2 group">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white text-xs font-black uppercase tracking-wider">
                {t.pricing.popular}
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-white mb-4">{t.pricing.standard}</h3>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl font-black text-white">$25</span>
                  <span className="text-slate-400 mb-2 font-bold">/ {t.pricing.month}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                {(t.pricing.standardFeatures || ['3 Classes Per Week', '45-Minute Sessions', 'Certified Teacher', 'Progress Reports']).map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-300 leading-relaxed">{feature}</span>
                </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full px-8 py-5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 text-white font-black rounded-xl text-center uppercase tracking-wider transition-all shadow-lg group-hover:scale-105">
                {t.pricing.register || t.nav.register}
              </Link>
            </div>

            {/* Premium Package */}
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 border-2 border-white/20 rounded-[2rem] p-10 hover:border-primary-400/50 transition-all hover:shadow-2xl hover:shadow-sky-400/10 hover:-translate-y-2 group">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-black text-white mb-4">{t.pricing.premium}</h3>
                <div className="flex items-end justify-center gap-2">
                  <span className="text-5xl font-black text-white">$40</span>
                  <span className="text-slate-400 mb-2 font-bold">/ {t.pricing.month}</span>
                </div>
              </div>
              <ul className="space-y-4 mb-10">
                {(t.pricing.premiumFeatures || ['5 Classes Per Week', '60-Minute Sessions', 'Expert Teacher', 'Weekly Reports', 'Priority Support']).map((feature: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-primary-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-slate-300 leading-relaxed">{feature}</span>
                </li>
                ))}
              </ul>
              <Link to="/register" className="block w-full px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-black rounded-xl text-center uppercase tracking-wider transition-all shadow-lg group-hover:scale-105">
                {t.pricing.register || t.nav.register}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-500/5 blur-[120px] rounded-full"></div>
      </section>


      {/* Student Journey */}
      <section className="py-20 bg-[#0b1231]/80 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-300">{t.studentJourney?.label || 'Student Journey'}</p>
            <h2 className="text-4xl sm:text-5xl font-black text-white mt-4">{t.studentJourney?.title || 'A clear roadmap from enrollment to certification'}</h2>
            <p className="text-slate-300 max-w-3xl mx-auto mt-4">{t.studentJourney?.subtitle || 'Parents and students always know what comes next, how progress is measured, and when certification is earned.'}</p>
          </div>

          <div className="grid lg:grid-cols-[2fr,1fr] gap-10 items-start">
            <div className="bg-gradient-to-br from-white/5 to-white/0 border border-white/10 rounded-[2rem] p-8">
              <div className="flex flex-wrap gap-4">
                {(t.studentJourney?.steps || [
                  'Browse & Enroll',
                  'Interactive Lessons',
                  'Practice & Quizzes',
                  'Track Progress',
                  'Earn Certificate'
                ]).map((step: string, index: number) => (
                  <div key={step} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-3">
                    <span className="w-7 h-7 rounded-full bg-primary-500/30 text-primary-200 text-xs font-black flex items-center justify-center">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-white">{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 grid sm:grid-cols-3 gap-4">
                {(t.studentJourney?.levels || [
                  { label: 'Beginner', detail: 'Foundation courses & guided learning' },
                  { label: 'Intermediate', detail: 'Skill-building with practice exercises' },
                  { label: 'Advanced', detail: 'Mastery projects & certification' }
                ]).map((level: any) => (
                  <div key={level.label} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{level.label}</p>
                    <p className="text-white font-semibold mt-2">{level.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-primary-400/30 bg-gradient-to-br from-primary-500/15 to-accent-500/15 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-primary-200">{t.studentJourney?.progressTracking || 'Progress Tracking'}</p>
                <h3 className="text-2xl font-black text-white mt-3">{t.studentJourney?.liveDashboard || 'Live dashboard for parents and students'}</h3>
                <p className="text-slate-200 mt-3">{t.studentJourney?.liveDashboardDesc || 'Attendance, teacher feedback, learning milestones, and monthly reports in one place.'}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t.studentJourney?.certification || 'Certification'}</p>
                <h3 className="text-xl font-black text-white mt-3">{t.studentJourney?.earnCertificates || 'Earn verified certificates'}</h3>
                <p className="text-slate-300 mt-3">{t.studentJourney?.earnCertificatesDesc || 'Students receive certificates at key milestones and final completion.'}</p>
                <Link
                  to="/courses"
                  className="mt-5 inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-xs font-black uppercase tracking-[0.3em]"
                >
                  {t.studentJourney?.startJourney || 'Explore Courses'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Content Section */}
      <FeaturesSection maxItems={6} />

      {/* AI Teachers Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14 reveal">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary-400/10 border border-primary-400/20 rounded-full mb-6 animate-glow">
              <Sparkles size={16} className="text-primary-400" />
              <span className="text-primary-300 text-[10px] font-black tracking-[0.3em] uppercase">AI-Powered Learning</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
              Meet Your AI Teachers
            </h2>
            <p className="text-lg text-slate-300 max-w-2xl mx-auto">
              Get instant, personalized help from subject-specialized AI tutors — available 24/7, free for all students.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10 stagger-children">
            {[
              { emoji: '📖', name: 'Sheikh Noor', subject: 'Quran & Tajweed', color: 'from-emerald-500 to-teal-500' },
              { emoji: '🕌', name: 'Ustadh Ibrahim', subject: 'Islamic Studies', color: 'from-amber-500 to-orange-500' },
              { emoji: '🇸🇦', name: "Mu'allim Ahmad", subject: 'Arabic Language', color: 'from-blue-500 to-indigo-500' },
              { emoji: '🔬', name: 'Dr. Fatima', subject: 'Science & STEM', color: 'from-violet-500 to-purple-500' },
              { emoji: '💻', name: 'Engineer Zain', subject: 'IT & Digital Skills', color: 'from-cyan-500 to-blue-500' },
              { emoji: '🌱', name: 'Mentor Aisha', subject: 'Life Skills & Career', color: 'from-rose-500 to-pink-500' },
              { emoji: '🌍', name: 'Teacher Mariam', subject: 'English, Farsi & Pashto', color: 'from-teal-500 to-emerald-500' },
              { emoji: '✨', name: 'Noor AI', subject: 'General Tutor', color: 'from-primary-500 to-accent-500' },
            ].map((teacher) => (
              <Link
                key={teacher.name}
                to="/ai-tutor"
                className="group bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-primary-400/40 hover:bg-white/[0.08] transition-all reveal depth-card"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${teacher.color} flex items-center justify-center text-xl mb-3 animate-float-slow`}>
                  {teacher.emoji}
                </div>
                <h3 className="text-base font-black text-white mb-0.5">{teacher.name}</h3>
                <p className="text-xs text-slate-400">{teacher.subject}</p>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/ai-tutor"
              className="inline-block px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black rounded-xl text-sm uppercase tracking-wider hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg"
            >
              Start Learning with AI →
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0e1436]/80 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-black text-white mb-6">{t.footerExtra?.aboutUs || t.aboutUs?.title || 'About Us'}</h3>
              <p className="text-slate-300 leading-relaxed">{t.name} - {t.footerExtra?.aboutDesc || 'Excellence in Quranic education for all ages'}</p>
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-6">{t.footerExtra?.quickLinks || 'Quick Links'}</h3>
              <ul className="space-y-3">
                <li><Link to="/courses" className="text-slate-300 hover:text-primary-400 transition-colors">{t.nav.courses}</Link></li>
                <li><Link to="/ai-tutor" className="text-slate-300 hover:text-primary-400 transition-colors">AI Teachers</Link></li>
                <li><Link to="/parent" className="text-slate-300 hover:text-primary-400 transition-colors">{t.footerExtra?.parentDashboard || 'Parent Dashboard'}</Link></li>
                <li><Link to="/about" className="text-slate-300 hover:text-primary-400 transition-colors">{t.footerExtra?.aboutUs || t.aboutUs?.title || 'About Us'}</Link></li>
                {language === 'en' && <li><Link to="/quran" className="text-slate-300 hover:text-primary-400 transition-colors">{t.footerExtra?.quranLink || 'Quran'}</Link></li>}
                <li><a href="#pricing" className="text-slate-300 hover:text-primary-400 transition-colors">{t.footer.tuition}</a></li>
                <li><Link to="/register" className="text-slate-300 hover:text-primary-400 transition-colors">{t.nav.register}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-black text-white mb-6">{t.footerExtra?.contactUs || t.dashboard?.common?.contact || 'Contact Us'}</h3>
            </div>
            <FooterSocialLinks />
          </div>
          <div className="border-t border-white/10 pt-8 text-center">
            <p className="text-slate-400 text-sm">&copy; 2026 {t.shortName}. {t.footerExtra?.allRights || 'All rights reserved.'}</p>
          </div>
        </div>
      </footer>
    </>
  );
};

export default HomePage;
