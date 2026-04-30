import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, Clock, Users, GraduationCap, ArrowRight, Filter, Search } from 'lucide-react';
import { courses } from '../data/courses';
import { fetchAutomatedCourses } from '../services/automatedCourseService';
import { AutomatedCourse } from '../types/automated-course.types';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';
import LanguageSelector from '../components/LanguageSelector';
import LogoLink from '../components/LogoLink';
import BackButton from '../components/BackButton';
import { getCourseDetailPath } from '../utils/courseRouting';
import { DepthOrbs } from '../components/motion/MotionElements';

const CoursesPage: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [exploreOpen, setExploreOpen] = useState<boolean>(false);
  const [automatedCourses, setAutomatedCourses] = useState<AutomatedCourse[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  useEffect(() => {
    const ageGroupParam = searchParams.get('ageGroup');
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('q');
    if (ageGroupParam) {
      setSelectedAgeGroup(ageGroupParam);
    }
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    if (searchParam) {
      setSearchTerm(searchParam);
    }
  }, [searchParams]);

  useEffect(() => {
    const loadAutomatedCourses = async () => {
      try {
        const data = await fetchAutomatedCourses();
        setAutomatedCourses(data.filter(course => course.isActive && course.status === 'published'));
      } catch (error) {
        console.error('Failed to load automated courses:', error);
      }
    };

    loadAutomatedCourses();
  }, []);

  if (!t) {
    return (
      <div style={{ color: 'white', padding: '20px', textAlign: 'center' }}>
        <h2>Error: Translations not loaded</h2>
      </div>
    );
  }

  const normalizeText = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\p{L}\p{N}]+/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  const normalizedSearchTerm = normalizeText(searchTerm);
  const searchTokens = normalizedSearchTerm ? normalizedSearchTerm.split(' ') : [];

  const filteredCourses = courses.filter(course => {
    const courseAgeGroup = course.ageGroup ?? 'all';
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
    const ageGroupMatch = selectedAgeGroup === 'all' || courseAgeGroup === selectedAgeGroup;
    const languageMatch =
      selectedLanguage === 'all' ||
      !course.languages ||
      course.languages.includes(selectedLanguage as any);
    const searchableText = normalizeText([
      course.title,
      course.titleArabic,
      course.description,
      course.targetAudience,
      course.category,
      course.ageGroup,
      course.level,
      ...(course.learningOutcomes?.map(outcome => outcome.description) ?? [])
    ]
      .filter(Boolean)
      .join(' '));
    const searchMatch = searchTokens.length === 0 || searchTokens.every(token => searchableText.includes(token));
    return categoryMatch && levelMatch && ageGroupMatch && languageMatch && searchMatch;
  });

  const filteredAutomatedCourses = automatedCourses.filter(course => {
    const categoryMatch = selectedCategory === 'all' || course.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || course.level === selectedLevel;
    const ageGroupMatch = selectedAgeGroup === 'all' || course.ageGroup === selectedAgeGroup;
    const languageMatch = selectedLanguage === 'all' || course.language === selectedLanguage;
    const searchableText = normalizeText([
      course.title,
      course.description,
      course.category,
      course.ageGroup,
      course.level
    ]
      .filter(Boolean)
      .join(' '));
    const searchMatch = searchTokens.length === 0 || searchTokens.every(token => searchableText.includes(token));
    return categoryMatch && levelMatch && ageGroupMatch && languageMatch && searchMatch;
  });

  const sections = [
    {
      id: 'islamic',
      title: 'Islamic & Quran Studies',
      categories: ['quran', 'islamic-studies']
    },
    {
      id: 'languages',
      title: 'Languages',
      categories: ['language-learning']
    },
    {
      id: 'tech',
      title: 'Technology & Science',
      categories: ['artificial-intelligence', 'information-technology', 'science', 'digital-skills']
    },
    {
      id: 'general',
      title: 'General Skills',
      categories: ['general-knowledge', 'life-skills']
    }
  ];

  const sectionedCourses = sections
    .map(section => ({
      ...section,
      courses: filteredCourses.filter(course => section.categories.includes(course.category))
    }))
    .filter(section => section.courses.length > 0);

  const categoryOptions = [
    { value: 'all', label: t.form.allCourses },
    { value: 'quran', label: 'Quran & Tajweed' },
    { value: 'islamic-studies', label: 'Islamic Studies' },
    { value: 'language-learning', label: 'Languages' },
    { value: 'science', label: 'Science' },
    { value: 'information-technology', label: 'Information Technology' },
    { value: 'artificial-intelligence', label: 'Artificial Intelligence' },
    { value: 'general-knowledge', label: 'General Knowledge' },
    { value: 'life-skills', label: 'Life Skills' },
    { value: 'digital-skills', label: 'Digital Skills' }
  ];

  return (
    <div className="min-h-screen bg-[#050a12] relative overflow-hidden">
      <DepthOrbs count={4} colors={['rgba(59,130,246,0.10)', 'rgba(245,158,11,0.06)', 'rgba(139,92,246,0.08)', 'rgba(16,185,129,0.06)']} />
      <header className="fixed top-0 w-full z-50 bg-[#050a12]/80 backdrop-blur-2xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 lg:grid-cols-[auto,minmax(0,48rem),auto] items-center gap-4">
          <div className="flex items-center gap-4 justify-center lg:justify-start">
            <div className="relative">
              <button
                type="button"
                onClick={() => setExploreOpen(prev => !prev)}
                className="text-slate-300 hover:text-white transition-colors text-sm font-semibold uppercase tracking-wider"
                aria-haspopup="true"
                aria-expanded={exploreOpen}
              >
                Explore Courses
              </button>
              {exploreOpen && (
                <div className="absolute left-0 mt-3 w-56 rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-xl shadow-xl z-50">
                  <div className="py-2">
                    {categoryOptions.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(option.value);
                          setExploreOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          selectedCategory === option.value
                            ? 'text-white bg-white/10'
                            : 'text-slate-300 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                    <div className="border-t border-slate-800 my-2"></div>
                    <Link
                      to="/articles"
                      onClick={() => setExploreOpen(false)}
                      className="block px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      Articles
                    </Link>
                  </div>
                </div>
              )}
            </div>
            <LogoLink showText compact />
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-3xl">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onFocus={() => setShowSuggestions(searchTerm.length > 0)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder="Search courses... (e.g., Quran, Arabic, Islamic Studies)"
                aria-label="Search courses"
                className="w-full px-6 py-3.5 pr-12 bg-white/5 border border-white/10 rounded-xl text-slate-200 placeholder:text-slate-500 focus:border-primary-400 focus:outline-none transition-all duration-200"
              />
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              
              {/* Search suggestions dropdown */}
              {showSuggestions && searchTerm.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-40 p-4 max-h-64 overflow-y-auto">
                  <p className="text-sm text-slate-400 mb-3">Search Results for "{searchTerm}"</p>
                  {filteredCourses.length > 0 || filteredAutomatedCourses.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {filteredAutomatedCourses.slice(0, 3).map(course => (
                        <Link
                          key={course.id}
                          to={`/automated/${course.id}`}
                          onClick={() => setShowSuggestions(false)}
                          className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                        >
                          <span className="font-semibold">{course.title}</span>
                          <span className="text-xs text-slate-500 ml-2">• Automated</span>
                        </Link>
                      ))}
                      {filteredCourses.slice(0, 3).map(course => (
                        <Link
                          key={course.id}
                          to={getCourseDetailPath(course.id)}
                          onClick={() => setShowSuggestions(false)}
                          className="block px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
                        >
                          <span className="font-semibold">{course.title}</span>
                          {course.titleArabic && <span className="text-xs text-slate-500 ml-2">• {course.titleArabic}</span>}
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">No courses found matching "{searchTerm}"</p>
                  )}
                  {(filteredCourses.length > 3 || filteredAutomatedCourses.length > 3) && (
                    <button
                      onClick={() => setShowSuggestions(false)}
                      className="w-full mt-3 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded text-sm transition-colors"
                    >
                      View all results
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-4 items-center justify-center lg:justify-end">
            <LanguageSelector />
            <Link to="/create-course" className="px-4 py-2 text-primary-300 hover:text-primary-200 transition-colors flex items-center gap-1 font-semibold text-sm">
              <span>✨</span> Create Course
            </Link>
            <Link to="/ai-tutor" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">AI Teachers</Link>
            <Link to="/login" className="px-4 py-2 text-slate-300 hover:text-white transition-colors">{t.nav.login}</Link>
            <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-400 hover:to-accent-400 transition-all">{t.nav.enroll}</Link>
          </div>
        </div>
      </header>

      <section className="pt-32 pb-16 px-4 text-center">
        <div className="max-w-4xl mx-auto page-enter">
          <h1 className="text-5xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 animate-text-glow">{t.form.ourCourses}</h1>
          <p className="text-xl text-slate-300 mb-8">{t.form.comprehensiveEducation}</p>
          <Link
            to="/create-course"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full text-white font-bold hover:from-violet-400 hover:to-purple-400 transition-all shadow-lg shadow-violet-500/20"
          >
            ✨ Create Your Own Course with AI
          </Link>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div className="flex justify-start">
          <BackButton to="/" label="← Back to Home" variant="secondary" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-wrap gap-4 items-center justify-center">
          <div className="flex items-center gap-2"><Filter className="w-5 h-5 text-primary-400" /><span className="text-slate-300">{t.form.filterBy}:</span></div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:border-primary-400 focus:outline-none">
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:border-primary-400 focus:outline-none">
            <option value="all">{t.form.allLevels}</option>
            <option value="beginner">{t.form.beginner}</option>
            <option value="intermediate">{t.form.intermediate}</option>
            <option value="advanced">{t.form.advanced}</option>
          </select>
          <select value={selectedAgeGroup} onChange={(e) => setSelectedAgeGroup(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:border-primary-400 focus:outline-none">
            <option value="all">All Ages</option>
            <option value="children">Children (5-9)</option>
            <option value="preteens">Pre-Teens (10-14)</option>
            <option value="youth">Youth (15-20)</option>
            <option value="adults">Adults (21+)</option>
          </select>
          <select value={selectedLanguage} onChange={(e) => setSelectedLanguage(e.target.value)} className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-200 focus:border-primary-400 focus:outline-none">
            <option value="all">All Languages</option>
            <option value="dari">Dari (Persian)</option>
            <option value="persian">Persian</option>
            <option value="pashto">Pashto</option>
            <option value="english">English</option>
            <option value="arabic">Arabic</option>
            <option value="urdu">Urdu</option>
          </select>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-12">
        {/* Search Results Header */}
        {searchTerm && (
          <div className="bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/30 rounded-xl p-6 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">Search Results for "{searchTerm}"</h2>
            <p className="text-slate-300">
              Found {filteredAutomatedCourses.length + filteredCourses.length} course{filteredAutomatedCourses.length + filteredCourses.length !== 1 ? 's' : ''} matching your search
            </p>
          </div>
        )}
        
        {/* No Results Message */}
        {searchTerm && filteredCourses.length === 0 && filteredAutomatedCourses.length === 0 && (
          <div className="text-center py-20 bg-white/5 rounded-xl border border-white/10">
            <div className="mb-4 text-5xl">🔍</div>
            <p className="text-slate-300 text-lg font-semibold mb-2">
              No courses found for "{searchTerm}"
            </p>
            <p className="text-slate-400 mb-6">
              Try searching for: Quran, Arabic, Islamic Studies, AI, or other keywords
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
              }}
              className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors"
            >
              View All Courses
            </button>
          </div>
        )}
        
        {filteredAutomatedCourses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">Automated Premium Courses</h2>
              <span className="text-sm text-slate-400">{filteredAutomatedCourses.length} courses</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAutomatedCourses.map(course => (
                <div key={course.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all duration-300 group">
                  <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <GraduationCap className="w-10 h-10 text-white" />
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">Automated</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="px-2 py-1 text-xs bg-white/15 rounded-full text-white">{course.level}</span>
                      <span className="px-2 py-1 text-xs bg-white/15 rounded-full text-white">{course.accessDurationDays} days</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-300 mb-4 line-clamp-3">{course.description}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-400"><Users className="w-4 h-4" /><span>{course.ageRange || 'All ages'}</span></div>
                      <div className="flex items-center gap-2 text-sm text-slate-400"><Clock className="w-4 h-4" /><span>Self-paced</span></div>
                      <div className="flex items-center gap-2 text-sm text-slate-400"><BookOpen className="w-4 h-4" /><span>{course.language}</span></div>
                    </div>
                    <div className="mb-6 p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">Access</p>
                      {course.priceType === 'free' ? (
                        <p className="text-2xl font-bold text-primary-300">Free</p>
                      ) : (
                        <p className="text-2xl font-bold text-primary-300">${course.price}</p>
                      )}
                      <p className="text-xs text-slate-500">{course.accessDurationDays} days access</p>
                    </div>
                    <Link to={`/automated/${course.id}`} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-600 hover:to-blue-600 transition-all">
                      View Details <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {sectionedCourses.map(section => (
          <div key={section.id} className="reveal" style={{ transitionDelay: '100ms' }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white">{section.title}</h2>
              <span className="text-sm text-slate-400">{section.courses.length} courses</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 stagger-children">
              {section.courses.map(course => (
                <div key={course.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:border-primary-400/50 transition-all duration-300 group depth-card reveal">
                  <div className="bg-gradient-to-br from-primary-600 to-accent-600 p-6">
                    <div className="flex justify-between items-start mb-3">
                      <GraduationCap className="w-10 h-10 text-white" />
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">{course.level.charAt(0).toUpperCase() + course.level.slice(1)}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{course.title}</h3>
                    {course.titleArabic && <p className="text-primary-100 text-lg font-arabic">{course.titleArabic}</p>}
                    <div className="mt-3 flex flex-wrap gap-2">
                      {course.ageGroup && (
                        <span className="px-2 py-1 text-xs bg-white/15 rounded-full text-white">{course.ageGroup.toUpperCase()}</span>
                      )}
                      {course.lowBandwidthFriendly && (
                        <span className="px-2 py-1 text-xs bg-white/15 rounded-full text-white">Low Bandwidth</span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-slate-300 mb-4 line-clamp-3">{course.description}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-center gap-2 text-sm text-slate-400"><Users className="w-4 h-4" /><span>{course.ageRange}</span></div>
                      <div className="flex items-center gap-2 text-sm text-slate-400"><Clock className="w-4 h-4" /><span>{course.duration}</span></div>
                      <div className="flex items-center gap-2 text-sm text-slate-400"><BookOpen className="w-4 h-4" /><span>{course.learningOutcomes.length} Learning Outcomes</span></div>
                      {course.languages && course.languages.length > 0 && (
                        <div className="flex items-center gap-2 text-sm text-slate-400"><span className="w-4 h-4">🌐</span><span>{course.languages.map(lang => lang.charAt(0).toUpperCase() + lang.slice(1)).join(', ')}</span></div>
                      )}
                    </div>
                    <div className="mb-6 p-3 bg-slate-900/50 rounded-lg">
                      <p className="text-sm text-slate-400 mb-1">Starting from</p>
                      {course.priceType === 'free' || course.pricing[0].pricePerMonth === 0 ? (
                        <p className="text-2xl font-bold text-primary-300">Free</p>
                      ) : (
                        <p className="text-2xl font-bold text-primary-300">${course.pricing[0].pricePerMonth}/month</p>
                      )}
                      <p className="text-xs text-slate-500">{course.pricing[0].label}</p>
                    </div>
                    <Link to={getCourseDetailPath(course.id)} className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg hover:from-primary-400 hover:to-accent-400 transition-all">
                      {t.form.viewDetails} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to={`/learn/${course.id}`} className="flex items-center justify-center gap-2 w-full px-4 py-2.5 mt-2 border border-emerald-500/30 bg-emerald-500/10 rounded-lg text-emerald-400 hover:bg-emerald-500/20 transition-all text-sm font-semibold">
                      ▶ Start Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {!searchTerm && filteredCourses.length === 0 && (
          <div className="text-center py-20">
            <p className="text-slate-400 text-lg">
              No courses found matching your filters. Try adjusting your selection.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default CoursesPage;
