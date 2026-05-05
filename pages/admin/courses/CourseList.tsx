import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { BookOpen, Edit, Eye, EyeOff, Rocket, Play, Search, Filter, DollarSign, Users, Clock, GraduationCap, Globe, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { courses as allCoursesData } from '../../../data/courses';

const CATEGORY_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  'quran': { label: 'Quran & Tajweed', emoji: '📖', color: 'emerald' },
  'islamic-studies': { label: 'Islamic Studies', emoji: '🕌', color: 'purple' },
  'language-learning': { label: 'Languages', emoji: '🌐', color: 'blue' },
  'general-knowledge': { label: 'General Knowledge', emoji: '📚', color: 'amber' },
  'life-skills': { label: 'Life Skills', emoji: '🌱', color: 'teal' },
  'digital-skills': { label: 'Digital Skills', emoji: '💻', color: 'cyan' },
  'science': { label: 'Science', emoji: '🔬', color: 'rose' },
  'information-technology': { label: 'IT & Coding', emoji: '⚙️', color: 'indigo' },
  'artificial-intelligence': { label: 'AI & Technology', emoji: '🤖', color: 'violet' },
};

interface AutomatedCourseData {
  id: string;
  title: string;
  category: string;
  description?: string;
  status?: string;
  isActive?: boolean;
  accessDurationDays?: number;
}

export default function CourseList() {
  const navigate = useNavigate();
  const [automatedCourses, setAutomatedCourses] = useState<AutomatedCourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLoading(false);
    fetchAutomated();
  }, []);

  const fetchAutomated = async () => {
    try {
      const snap = await getDocs(collection(db, 'automated_courses'));
      setAutomatedCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as AutomatedCourseData)));
    } catch { /* ignore */ }
  };

  // All unique categories from courses
  const categories = useMemo(() => {
    const cats = new Set(allCoursesData.map(c => c.category));
    return Array.from(cats);
  }, []);

  // Filtered courses
  const filteredCourses = useMemo(() => {
    return allCoursesData.filter(c => {
      const matchSearch = !searchTerm || c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCat = selectedCategory === 'all' || c.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [searchTerm, selectedCategory]);

  // Group by category
  const groupedCourses = useMemo(() => {
    const groups: Record<string, typeof filteredCourses> = {};
    for (const c of filteredCourses) {
      if (!groups[c.category]) groups[c.category] = [];
      groups[c.category].push(c);
    }
    return groups;
  }, [filteredCourses]);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const getCatInfo = (cat: string) => CATEGORY_LABELS[cat] || { label: cat, emoji: '📁', color: 'slate' };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <BookOpen className="text-primary-400" size={32} />
            All Courses
          </h1>
          <p className="text-slate-400 mt-1">{allCoursesData.length} courses across {categories.length} categories</p>
        </div>
        <Link
          to="/admin/courses/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:from-primary-400 hover:to-accent-400 transition-all text-sm"
        >
          <Plus size={18} />
          Create Course
        </Link>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:border-primary-500/50 focus:outline-none"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-primary-500/50 focus:outline-none appearance-none cursor-pointer min-w-[200px]"
        >
          <option value="all" className="bg-slate-800">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat} className="bg-slate-800">{getCatInfo(cat).emoji} {getCatInfo(cat).label}</option>
          ))}
        </select>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-primary-400">{allCoursesData.length}</p>
          <p className="text-xs text-slate-400 mt-1">Total Courses</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-emerald-400">{allCoursesData.filter(c => c.priceType === 'free').length}</p>
          <p className="text-xs text-slate-400 mt-1">Free Courses</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-accent-400">{allCoursesData.filter(c => c.priceType === 'paid').length}</p>
          <p className="text-xs text-slate-400 mt-1">Paid Courses</p>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
          <p className="text-3xl font-black text-violet-400">{categories.length}</p>
          <p className="text-xs text-slate-400 mt-1">Categories</p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Interactive Course Systems */}
          <div className="bg-gradient-to-r from-primary-500/5 to-accent-500/5 border border-primary-400/20 rounded-2xl p-6">
            <h2 className="text-xl font-black text-white mb-4 flex items-center gap-2">
              <Rocket className="text-primary-400" size={22} />
              Interactive Learning Platforms
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white/5 border border-emerald-500/20 rounded-xl p-5 hover:border-emerald-500/40 transition">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">📖</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Hifz Management System</h3>
                    <p className="text-slate-400 text-xs">Memorization tracking, revision, analytics</p>
                  </div>
                </div>
                <button onClick={() => navigate('/hifz')} className="w-full px-4 py-2 bg-emerald-500/20 text-emerald-300 font-bold rounded-lg hover:bg-emerald-500/30 transition text-sm flex items-center justify-center gap-2">
                  <Rocket size={14} /> Launch
                </button>
              </div>
              <div className="bg-white/5 border border-blue-500/20 rounded-xl p-5 hover:border-blue-500/40 transition">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🌙</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">Arabic Learning Platform</h3>
                    <p className="text-slate-400 text-xs">AI-powered, A1-C2 levels, pronunciation</p>
                  </div>
                </div>
                <button onClick={() => navigate('/learn-arabic')} className="w-full px-4 py-2 bg-blue-500/20 text-blue-300 font-bold rounded-lg hover:bg-blue-500/30 transition text-sm flex items-center justify-center gap-2">
                  <Rocket size={14} /> Launch
                </button>
              </div>
            </div>
          </div>

          {/* Courses grouped by category */}
          {Object.entries(groupedCourses).map(([category, coursesInCat]) => {
            const catInfo = getCatInfo(category);
            const isCollapsed = collapsedCategories.has(category);

            return (
              <div key={category} className="bg-white/[0.02] border border-white/10 rounded-2xl overflow-hidden">
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{catInfo.emoji}</span>
                    <div className="text-left">
                      <h2 className="text-lg font-bold text-white">{catInfo.label}</h2>
                      <p className="text-xs text-slate-400">{coursesInCat.length} course{coursesInCat.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  {isCollapsed ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronUp size={20} className="text-slate-400" />}
                </button>

                {/* Course Cards */}
                {!isCollapsed && (
                  <div className="px-6 pb-4 space-y-3">
                    {coursesInCat.map(course => {
                      const isFree = course.priceType === 'free' || course.pricing[0]?.pricePerMonth === 0;
                      return (
                        <div key={course.id} className="bg-slate-800/60 border border-white/5 rounded-xl p-5 hover:border-primary-400/20 transition group">
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="text-base font-bold text-white truncate">{course.title}</h3>
                                {course.titleArabic && <span className="text-sm text-slate-400 font-arabic">{course.titleArabic}</span>}
                              </div>
                              <p className="text-sm text-slate-400 line-clamp-1 mb-2">{course.description}</p>
                              <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                <span className="flex items-center gap-1">
                                  <GraduationCap size={12} className="text-primary-400" />
                                  {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Users size={12} className="text-primary-400" />
                                  {course.ageRange || course.ageGroup}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock size={12} className="text-primary-400" />
                                  {course.duration}
                                </span>
                                <span className="flex items-center gap-1">
                                  <DollarSign size={12} className={isFree ? 'text-emerald-400' : 'text-accent-400'} />
                                  {isFree ? 'Free' : `$${course.pricing[0]?.pricePerMonth}/mo`}
                                </span>
                                {course.languages && (
                                  <span className="flex items-center gap-1">
                                    <Globe size={12} className="text-primary-400" />
                                    {course.languages.length} languages
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Link
                                to={`/courses/${course.id}`}
                                className="px-3 py-2 bg-white/5 text-slate-300 hover:bg-white/10 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                              >
                                <Eye size={14} /> Preview
                              </Link>
                              <Link
                                to={`/admin/courses/view/${course.id}`}
                                className="px-3 py-2 bg-slate-700 text-white hover:bg-slate-600 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                              >
                                <Eye size={14} /> Details
                              </Link>
                              <button
                                onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                                className="px-3 py-2 bg-primary-600 text-white hover:bg-primary-500 rounded-lg transition text-xs font-semibold flex items-center gap-1"
                              >
                                <Edit size={14} /> Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}

          {/* No results */}
          {filteredCourses.length === 0 && (
            <div className="text-center py-16 bg-white/5 rounded-2xl border border-white/10">
              <Search size={48} className="mx-auto text-slate-600 mb-4" />
              <p className="text-xl font-bold text-white mb-2">No courses found</p>
              <p className="text-slate-400">Try a different search term or category filter.</p>
            </div>
          )}

          {/* Automated Courses */}
          {automatedCourses.length > 0 && (
            <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Play size={20} className="text-accent-400" />
                Automated Courses
              </h2>
              <div className="space-y-3">
                {automatedCourses.map(course => (
                  <div key={course.id} className="bg-slate-800/60 border border-white/5 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-white">{course.title}</h3>
                      <p className="text-xs text-slate-400">{course.category} · {course.accessDurationDays} days access</p>
                    </div>
                    <Link to={`/automated/${course.id}`} className="px-3 py-2 bg-primary-600 text-white rounded-lg text-xs font-bold hover:bg-primary-500 transition">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
