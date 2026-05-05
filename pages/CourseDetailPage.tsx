import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, GraduationCap, CheckCircle, Calendar, Video, Globe, ArrowLeft, Play, Sparkles, Shield, CreditCard } from 'lucide-react';
import { courses } from '../data/courses';
import LanguageSelector from '../components/LanguageSelector';
import LogoLink from '../components/LogoLink';
import { DepthOrbs } from '../components/motion/MotionElements';

// ─── Enrollment helpers ──────────────────────────────────
const ENROLLMENT_KEY = 'ma_enrollments';

const getEnrollments = (): Record<string, { plan: number; enrolledAt: string }> => {
  try {
    const raw = localStorage.getItem(ENROLLMENT_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
};

const enrollInCourse = (courseId: string, planIndex: number) => {
  const enrollments = getEnrollments();
  enrollments[courseId] = { plan: planIndex, enrolledAt: new Date().toISOString() };
  localStorage.setItem(ENROLLMENT_KEY, JSON.stringify(enrollments));
};

const isEnrolled = (courseId: string): boolean => {
  return !!getEnrollments()[courseId];
};

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
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === courseId);

  const isHifzCourse = courseId === 'hifz-quran';
  const isArabicCourse = courseId === 'arabic-language';

  const [enrolled, setEnrolled] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(0);
  const [showEnrollSuccess, setShowEnrollSuccess] = useState(false);

  useEffect(() => {
    if (courseId) setEnrolled(isEnrolled(courseId));
  }, [courseId]);

  const handleEnroll = () => {
    if (!courseId) return;
    enrollInCourse(courseId, selectedPlan);
    setEnrolled(true);
    setShowEnrollSuccess(true);
    setTimeout(() => setShowEnrollSuccess(false), 3000);
  };

  const handleLaunchCourse = () => {
    if (!enrolled) {
      document.getElementById('enroll-section')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }
    if (isHifzCourse) navigate('/hifz/hifz-quran');
    else if (isArabicCourse) navigate('/learn-arabic');
    else navigate(`/learn/${courseId}`);
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
    <div className="min-h-screen bg-[#050a12] relative overflow-hidden">
      <DepthOrbs count={3} colors={['rgba(59,130,246,0.10)', 'rgba(245,158,11,0.07)', 'rgba(139,92,246,0.08)']} />

      {/* Enrollment success toast */}
      {showEnrollSuccess && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl shadow-2xl shadow-emerald-500/30 flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-5 h-5" />
          Enrolled successfully! You can now start learning.
        </div>
      )}

      <header className="bg-[#050a12]/80 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <LogoLink showText={false} compact />
          <div className="flex gap-3 items-center">
            <LanguageSelector />
            <Link to="/courses" className="px-4 py-2 text-slate-300 hover:text-white transition-colors flex items-center gap-2 text-sm">
              <ArrowLeft className="w-4 h-4" /> Courses
            </Link>
            {enrolled ? (
              <button
                onClick={handleLaunchCourse}
                className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-400/30 flex items-center gap-2 font-semibold text-white text-sm"
              >
                <Play className="w-4 h-4" />
                Start Learning
              </button>
            ) : (
              <button
                onClick={scrollToEnroll}
                className="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg shadow-primary-400/30 text-white font-semibold text-sm"
              >
                Enroll Now
              </button>
            )}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary-600 to-accent-600 py-16 px-4 relative overflow-hidden">
        {/* Decorative orbit ring */}
        <div className="absolute -right-40 -top-40 w-[500px] h-[500px] pointer-events-none opacity-20" aria-hidden="true">
          <div className="absolute inset-0 rounded-full border border-white/10 animate-spin-slow" />
          <div className="absolute inset-16 rounded-full border border-white/[0.06]" style={{ animationDirection: 'reverse' }} />
        </div>
        <div className="max-w-7xl mx-auto page-enter relative z-10">
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
          
          {isHifzCourse && enrolled && (
            <button
              onClick={handleLaunchCourse}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-slate-100 transition-all shadow-xl flex items-center gap-3"
            >
              <Play className="w-6 h-6" />
              🌟 Start Your Hifz Journey Now
            </button>
          )}
          {isHifzCourse && !enrolled && (
            <button
              onClick={scrollToEnroll}
              className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold text-lg hover:bg-slate-100 transition-all shadow-xl flex items-center gap-3"
            >
              <CreditCard className="w-6 h-6" />
              Enroll to Start Hifz
            </button>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8">
          <section className="bg-white/5 border border-white/10 rounded-xl p-6 reveal depth-card">
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
              {enrolled ? (
                <button onClick={handleLaunchCourse} className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-400/30 flex items-center gap-2 font-semibold text-white">
                  <Play className="w-5 h-5" />
                  Start Learning
                </button>
              ) : (
                <button onClick={scrollToEnroll} className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg shadow-primary-400/30 flex items-center gap-2 font-semibold text-white">
                  <CreditCard className="w-5 h-5" />
                  {isFree ? 'Enroll for Free' : 'Enroll Now'}
                </button>
              )}
            </div>
          </section>

          <section className="bg-white/5 border border-white/10 rounded-xl p-6 reveal" style={{ transitionDelay: '100ms' }}>
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2"><Users className="w-6 h-6 text-primary-400" />Who Is This Course For?</h2>
              <p className="text-slate-300 text-lg">{course.targetAudience}</p>
            </section>

            <section className="bg-white/5 border border-white/10 rounded-xl p-6 reveal" style={{ transitionDelay: '150ms' }}>
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
              <section className="bg-white/5 border border-white/10 rounded-xl p-6 reveal" style={{ transitionDelay: '200ms' }}>
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
              <section className="bg-white/5 border border-white/10 rounded-xl p-6 reveal">
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
              <section className="bg-white/5 border border-white/10 rounded-xl p-6 reveal">
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

            {/* ─── Enrollment Section ─── */}
            <section id="enroll-section" className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-2 border-primary-400/30 rounded-2xl p-8 reveal" style={{ transitionDelay: '250ms' }}>
              <div className="text-center mb-8">
                <Shield className="w-10 h-10 text-primary-400 mx-auto mb-3" />
                <h2 className="text-3xl font-black text-white mb-2">
                  {enrolled ? 'You\'re Enrolled!' : (isFree ? 'Enroll for Free' : 'Choose Your Plan & Enroll')}
                </h2>
                <p className="text-slate-300 max-w-lg mx-auto">
                  {enrolled
                    ? 'You have access to this course. Start learning anytime.'
                    : 'Select a plan that fits your schedule and begin your learning journey today.'}
                </p>
              </div>

              {enrolled ? (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 font-bold mb-6">
                    <CheckCircle className="w-5 h-5" />
                    Enrolled
                  </div>
                  <div>
                    <button
                      onClick={handleLaunchCourse}
                      className="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-black text-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3 mx-auto"
                    >
                      <Play className="w-6 h-6" />
                      Start Learning Now
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Pricing Plans */}
                  <div className={`grid gap-4 mb-8 ${course.pricing.length === 1 ? 'max-w-md mx-auto' : course.pricing.length === 2 ? 'grid-cols-1 sm:grid-cols-2 max-w-2xl mx-auto' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
                    {course.pricing.map((plan, idx) => {
                      const isSelected = selectedPlan === idx;
                      const isPlanFree = plan.pricePerMonth === 0;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedPlan(idx)}
                          className={`text-left p-6 rounded-2xl border-2 transition-all ${
                            isSelected
                              ? 'border-primary-400 bg-primary-500/15 shadow-lg shadow-primary-500/10'
                              : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.08]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-primary-400' : 'border-slate-500'}`}>
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-400" />}
                            </div>
                            {idx === 1 && course.pricing.length > 2 && (
                              <span className="px-2 py-0.5 bg-accent-500/20 text-accent-400 text-xs font-bold rounded-full">POPULAR</span>
                            )}
                          </div>
                          <p className="text-3xl font-black text-white mb-1">
                            {isPlanFree ? 'Free' : `$${plan.pricePerMonth}`}
                            {!isPlanFree && <span className="text-sm text-slate-400 font-normal">/month</span>}
                          </p>
                          <p className="text-sm text-slate-300">{plan.label}</p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Enroll button */}
                  <div className="text-center">
                    <button
                      onClick={handleEnroll}
                      className="px-10 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl text-white font-black text-lg hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg shadow-primary-500/20 flex items-center gap-3 mx-auto"
                    >
                      <CreditCard className="w-6 h-6" />
                      {isFree ? 'Enroll for Free' : `Enroll — $${course.pricing[selectedPlan].pricePerMonth}/month`}
                    </button>
                    <p className="text-xs text-slate-500 mt-3">
                      {isFree ? 'No payment required. Start learning immediately.' : 'Payment will be processed securely. Cancel anytime.'}
                    </p>
                  </div>
                </>
              )}
            </section>

            {/* AI Teacher CTA */}
            <section className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-400/20 rounded-2xl p-8 text-center reveal animate-glow">
              <div className="text-4xl mb-3 animate-float">{CATEGORY_AI_MAP[course.category]?.emoji || '✨'}</div>
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
