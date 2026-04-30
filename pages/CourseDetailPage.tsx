import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, GraduationCap, CheckCircle, Calendar, Video, Globe, ArrowLeft, Play, Sparkles } from 'lucide-react';
import { courses } from '../data/courses';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '../components/LanguageSelector';
import LogoLink from '../components/LogoLink';

const CATEGORY_AI_MAP: Record<string, { name: string; emoji: string }> = {
  'quran': { name: 'Sheikh Noor', emoji: '📖' },
  'islamic-studies': { name: 'Ustadh Ibrahim', emoji: '🕌' },
  'language-learning': { name: "Mu'allim Ahmad", emoji: '🇸🇦' },
  'science': { name: 'Dr. Fatima', emoji: '🔬' },
  'information-technology': { name: 'Engineer Zain', emoji: '💻' },
  'digital-skills': { name: 'Engineer Zain', emoji: '💻' },
  'artificial-intelligence': { name: 'Engineer Zain', emoji: '💻' },
  'life-skills': { name: 'Mentor Aisha', emoji: '🌱' },
  'general-knowledge': { name: 'Noor AI', emoji: '✨' },
};

const CourseDetailPage: React.FC = () => {
  const { language } = useLanguage();
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === courseId);

  // Check if this is the Hifz course
  const isHifzCourse = courseId === 'hifz-quran';
  
  // Check if this is the Arabic Learning course
  const isArabicCourse = courseId === 'arabic-language';

  const handleLaunchCourse = () => {
    if (isHifzCourse) {
      navigate(`/hifz/hifz-quran`);
    } else if (isArabicCourse) {
      navigate('/learn-arabic');
    } else {
      // For other courses
      navigate(`/student/courses/${courseId}`);
    }
  };

  if (!course) {
    return (
      <div className="min-h-screen bg-[#050a12] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-primary-400 hover:text-primary-300">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  const scrollToEnroll = () => {
    document.getElementById('enroll-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const isFree = course.priceType === 'free' || course.pricing[0].pricePerMonth === 0;

  return (
    <div className="min-h-screen bg-[#050a12]">
      <header className="bg-[#050a12]/80 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <LogoLink showText={false} compact />
          <div className="flex gap-4 items-center">
            <LanguageSelector />
            <Link to="/" className="px-4 py-2 text-slate-300 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Home
            </Link>
            <Link to="/ai-tutor" className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm">
              AI Teachers
            </Link>
            {isHifzCourse && (
              <button
                onClick={handleLaunchCourse}
                className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-400/30 flex items-center gap-2 font-semibold"
              >
                <Play className="w-4 h-4" />
                Launch Hifz System
              </button>
            )}
            {isArabicCourse && (
              <button
                onClick={handleLaunchCourse}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg shadow-emerald-400/30 flex items-center gap-2 font-semibold"
              >
                <Play className="w-4 h-4" />
                Start Learning Arabic
              </button>
            )}
            <button 
              onClick={scrollToEnroll} 
              className="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg shadow-primary-400/30"
            >
              {isHifzCourse || isArabicCourse ? 'Enroll / Learn More' : 'Enroll Now'}
            </button>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary-600 to-accent-600 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Back to Home
            </Link>
            <span className="text-white/60">|</span>
            <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white">
              {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
            </span>
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">{course.title}</h1>
          {course.titleArabic && <p className="text-3xl text-sky-100 mb-6 font-arabic">{course.titleArabic}</p>}
          <p className="text-xl text-white/90 max-w-3xl mb-8">{course.description}</p>
          
          {isHifzCourse && (
            <button
              onClick={handleLaunchCourse}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-slate-100 transition-all shadow-xl flex items-center gap-3"
            >
              <Play className="w-6 h-6" />
              🌟 Start Your Hifz Journey Now
            </button>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><GraduationCap className="w-6 h-6 text-primary-400" />Course Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-slate-300">
                <Users className="w-5 h-5 text-primary-400" />
                <span>Age group: {course.ageGroup ? course.ageGroup.toUpperCase() : course.ageRange}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Clock className="w-5 h-5 text-primary-400" />
                <span>Duration: {course.duration}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Globe className="w-5 h-5 text-primary-400" />
                <span>Language: {course.languages && course.languages.length > 0 ? course.languages.map(lang => lang.charAt(0).toUpperCase() + lang.slice(1)).join(', ') : 'Dari / Pashto / English'}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <BookOpen className="w-5 h-5 text-primary-400" />
                <span>Price: {isFree ? 'Free' : `$${course.pricing[0].pricePerMonth}/month`}</span>
              </div>
              {course.lowBandwidthFriendly && (
                <div className="flex items-center gap-3 text-slate-300">
                  <span className="w-5 h-5">📶</span>
                  <span>Low bandwidth friendly</span>
                </div>
              )}
            </div>
            <div className="mt-6">
              <button onClick={scrollToEnroll} className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg shadow-primary-400/30">
                Start Course
              </button>
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Users className="w-6 h-6 text-primary-400" />Who Is This Course For?</h2>
              <p className="text-slate-300 text-lg">{course.targetAudience}</p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><CheckCircle className="w-6 h-6 text-primary-400" />What You'll Learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {course.learningOutcomes.map(outcome => (
                  <div key={outcome.id} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-300">{outcome.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {course.syllabus && course.syllabus.length > 0 && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Calendar className="w-6 h-6 text-primary-400" />Course Syllabus ({course.syllabus.length} Weeks)</h2>
                <div className="space-y-4">
                  {course.syllabus.map(week => (
                    <div key={week.week} className="bg-white/5 border border-white/10 rounded-lg p-5 hover:border-primary-500/50 transition-all">
                      <h3 className="text-lg font-semibold text-primary-400 mb-2">Week {week.week}: {week.title}</h3>
                      <ul className="space-y-2">
                        {week.topics.map((topic, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-slate-300">
                            <span className="text-primary-400 mt-1">•</span><span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Class Format Section - Conditional */}
            {course.classFormat && (course.classFormat.duration || course.classFormat.mode?.length > 0 || course.classFormat.materials?.length > 0) && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><Video className="w-6 h-6 text-primary-400" />Class Format</h2>
                <div className="space-y-4">
                  {course.classFormat.duration && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Duration</h3>
                      <p className="text-slate-300">{course.classFormat.duration}</p>
                    </div>
                  )}
                  {course.classFormat.mode && course.classFormat.mode.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Mode</h3>
                      <div className="flex flex-wrap gap-2">
                        {course.classFormat.mode.map((mode, idx) => (
                          <span key={idx} className="px-3 py-1 bg-primary-500/20 border border-primary-500/50 rounded-full text-primary-400">
                            {mode}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {course.classFormat.materials && course.classFormat.materials.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">Learning Materials</h3>
                      <ul className="space-y-2">
                        {course.classFormat.materials.map((material, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-slate-300">
                            <CheckCircle className="w-4 h-4 text-primary-400" />
                            {material}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Requirements Section - Conditional */}
            {course.requirements && course.requirements.length > 0 && (
              <section className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2"><BookOpen className="w-6 h-6 text-primary-400" />Requirements</h2>
                <ul className="space-y-3">
                  {course.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-slate-300">
                      <span className="text-primary-400 text-xl">→</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* AI Teacher CTA */}
            <section className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-400/20 rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">{CATEGORY_AI_MAP[course.category]?.emoji || '✨'}</div>
              <h2 className="text-2xl font-black text-white mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-400" />
                Need help with this subject?
              </h2>
              <p className="text-slate-300 mb-6 max-w-lg mx-auto">
                Ask <span className="text-primary-300 font-bold">{CATEGORY_AI_MAP[course.category]?.name || 'Noor AI'}</span>, your AI teacher specialized in {course.title}. Get instant answers and explanations 24/7.
              </p>
              <Link
                to="/ai-tutor"
                className="inline-block px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black rounded-xl text-sm uppercase tracking-wider hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg"
              >
                Ask AI Teacher →
              </Link>
            </section>
          </div>
      </div>
    </div>
  );
};

export default CourseDetailPage;
