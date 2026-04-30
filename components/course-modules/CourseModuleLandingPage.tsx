import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Award, BarChart3, BookOpen, CheckCircle, Clock, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { CourseModuleTone, DedicatedCourseModule } from '../../types/dedicated-course.types';
import { hasRestrictedCourseAccess } from '../../services/courseAccessService';
import { getCourseDetailPath, getCoursePlayerPath } from '../../utils/courseRouting';
import { getLessonOutlineItems, resolveLessonResources, resolveOptionalLessonResources } from '../../utils/courseModuleResources';

interface CourseModuleLandingPageProps {
  course: DedicatedCourseModule;
}

const toneClasses: Record<CourseModuleTone, string> = {
  emerald: 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30 text-emerald-200',
  blue: 'from-blue-500/20 to-blue-600/10 border-blue-500/30 text-blue-200',
  amber: 'from-amber-500/20 to-amber-600/10 border-amber-500/30 text-amber-100',
  rose: 'from-rose-500/20 to-rose-600/10 border-rose-500/30 text-rose-100',
  violet: 'from-violet-500/20 to-violet-600/10 border-violet-500/30 text-violet-100',
  cyan: 'from-cyan-500/20 to-cyan-600/10 border-cyan-500/30 text-cyan-100'
};

const formatLanguage = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

const CourseModuleLandingPage: React.FC<CourseModuleLandingPageProps> = ({ course }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [hasAccess, setHasAccess] = useState(course.metadata.priceType !== 'paid');
  const [checkingAccess, setCheckingAccess] = useState(course.metadata.priceType === 'paid');
  const allLessons = useMemo(() => course.sections.flatMap((section) => section.lessons), [course.sections]);
  const totalLessons = allLessons.length;
  const [selectedLessonId, setSelectedLessonId] = useState(allLessons[0]?.id ?? '');
  const priceLabel = course.metadata.priceType === 'free' || course.metadata.pricing[0]?.pricePerMonth === 0
    ? 'Free Access'
    : `$${course.metadata.pricing[0]?.pricePerMonth}/month`;

  const selectedLesson = useMemo(
    () => allLessons.find((lesson) => lesson.id === selectedLessonId) || allLessons[0] || null,
    [allLessons, selectedLessonId]
  );
  const selectedSection = useMemo(
    () => course.sections.find((section) => section.lessons.some((lesson) => lesson.id === selectedLesson?.id)) || null,
    [course.sections, selectedLesson]
  );
  const selectedLessonResources = useMemo(
    () => selectedLesson ? resolveLessonResources(selectedLesson) : [],
    [selectedLesson]
  );
  const selectedOptionalResources = useMemo(
    () => selectedLesson ? resolveOptionalLessonResources(selectedLesson) : [],
    [selectedLesson]
  );
  const selectedLessonOutline = useMemo(
    () => selectedLesson ? getLessonOutlineItems(selectedLesson) : [],
    [selectedLesson]
  );

  useEffect(() => {
    if (!selectedLessonId && allLessons[0]?.id) {
      setSelectedLessonId(allLessons[0].id);
      return;
    }

    if (selectedLessonId && !allLessons.some((lesson) => lesson.id === selectedLessonId) && allLessons[0]?.id) {
      setSelectedLessonId(allLessons[0].id);
    }
  }, [allLessons, selectedLessonId]);

  const handleLessonPreviewSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    window.requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  useEffect(() => {
    if (course.metadata.priceType !== 'paid') {
      setHasAccess(true);
      setCheckingAccess(false);
      return;
    }

    if (!user?.uid) {
      setHasAccess(false);
      setCheckingAccess(false);
      return;
    }

    let active = true;

    const loadAccess = async () => {
      setCheckingAccess(true);
      try {
        const allowed = await hasRestrictedCourseAccess({
          userId: user.uid,
          role: user.role,
          courseId: course.metadata.id,
          sourceType: 'catalog',
          isPremiumCourse: course.metadata.priceType === 'paid'
        });
        if (active) {
          setHasAccess(allowed);
        }
      } catch (error) {
        console.error(`Failed to check ${course.metadata.id} access`, error);
        if (active) {
          setHasAccess(false);
        }
      } finally {
        if (active) {
          setCheckingAccess(false);
        }
      }
    };

    loadAccess();

    return () => {
      active = false;
    };
  }, [course.metadata.id, course.metadata.priceType, user?.uid, user?.role]);

  const handleEnroll = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: getCourseDetailPath(course.metadata.id) } } });
      return;
    }

    if (course.metadata.priceType === 'paid' && !hasAccess) {
      return;
    }

    navigate(getCoursePlayerPath(course.metadata.id, user.role));
  };

  const ctaLabel = !user
    ? (course.metadata.priceType === 'paid' ? 'Login to Check Access' : course.enrollmentCta)
    : checkingAccess
      ? 'Checking Access...'
      : course.metadata.priceType === 'paid'
        ? hasAccess
          ? user.role === 'teacher'
            ? 'Open Teaching View'
            : 'Open Course'
          : 'Access Managed by Admin'
        : course.enrollmentCta;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      <header className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-b border-white/10 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-primary-300 font-black">Muhammadi Online Academy</p>
            <h1 className="text-xl font-black text-white mt-1">{course.metadata.title}</h1>
          </div>
          <button
            onClick={() => navigate('/courses')}
            className="px-5 py-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition flex items-center gap-2"
          >
            <ArrowLeft size={16} /> Back to Courses
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 text-primary-300 text-sm font-black mb-5">
              {course.heroBadge}
            </span>
            <h2 className="text-5xl font-black text-white leading-tight">{course.heroHeadline}</h2>
            {course.metadata.titleArabic ? (
              <p className="text-2xl text-slate-200 font-arabic mt-4">{course.metadata.titleArabic}</p>
            ) : null}
            <p className="text-xl text-slate-200 mt-6 max-w-3xl">{course.heroSummary}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-primary-400">{totalLessons}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">Lessons</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-accent-300">{course.estimatedHours}h</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">Guided Time</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-green-400">{priceLabel}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">Pricing</p>
              </div>
              <div className="bg-white/10 rounded-2xl p-4">
                <p className="text-2xl font-black text-blue-400">{course.staff.length}</p>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-1">Staff Roles</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-8">
              <button
                onClick={handleEnroll}
                disabled={checkingAccess || (course.metadata.priceType === 'paid' && !!user && !hasAccess)}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black text-lg hover:from-primary-400 hover:to-accent-400 transition shadow-xl"
              >
                {ctaLabel}
              </button>
              <div className="px-5 py-4 rounded-2xl bg-white/10 text-slate-200 text-sm max-w-sm">
                Languages: {course.metadata.languages?.map(formatLanguage).join(', ') || 'English'}
              </div>
            </div>
            {course.metadata.priceType === 'paid' ? (
              <p className="text-sm text-slate-400 mt-4 max-w-2xl">
                Premium access is controlled by academy administrators. Assigned students and teachers can open the dedicated course player from their dashboards.
              </p>
            ) : null}
          </div>

          <div className="relative">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-primary-500/20 to-accent-500/20 blur-3xl" />
            <div className="relative bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-[2rem] p-10">
              <div className="text-7xl mb-6">📘</div>
              <h3 className="text-2xl font-black text-white">What this course includes</h3>
              <div className="space-y-3 mt-6">
                {course.features.slice(0, 4).map((feature) => (
                  <div key={feature.title} className="flex items-start gap-3 text-slate-200">
                    <span className="text-2xl">{feature.icon}</span>
                    <div>
                      <p className="font-bold text-white">{feature.title}</p>
                      <p className="text-sm text-slate-400 mt-1">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-300">Learning Outcomes</p>
            <h3 className="text-4xl font-black text-white mt-4">What students will achieve</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {course.metadata.learningOutcomes.map((outcome) => (
              <div key={outcome.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 flex items-start gap-3">
                <CheckCircle className="text-green-400 mt-0.5" size={20} />
                <p className="text-slate-200">{outcome.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-300">Course Structure</p>
            <h3 className="text-4xl font-black text-white mt-4">Section-by-section learning path</h3>
            <p className="text-sm text-slate-400 mt-4">Click any lesson card to open its full lesson preview and materials.</p>
          </div>
          <div className="space-y-5">
            {course.sections.map((section) => (
              <div key={section.id} className="rounded-[2rem] bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-8 flex flex-col lg:flex-row gap-6 lg:items-start">
                <div className="text-5xl">{section.icon}</div>
                <div className="flex-1">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div>
                      <h4 className="text-2xl font-black text-white">{section.title}</h4>
                      <p className="text-slate-300 mt-2">{section.description}</p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-2xl font-black text-primary-400">{section.lessons.length}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-1">Lessons</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                    {section.lessons.map((lesson) => {
                      const active = lesson.id === selectedLesson?.id;
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => handleLessonPreviewSelect(lesson.id)}
                          className={`rounded-2xl border px-4 py-4 text-left transition ${
                            active
                              ? 'border-primary-400 bg-primary-500/10 shadow-[0_0_0_1px_rgba(56,189,248,0.35)]'
                              : 'border-white/10 bg-white/5 hover:bg-white/10 cursor-pointer'
                          }`}
                        >
                          <p className="text-sm font-black text-white">{lesson.title}</p>
                          <p className="text-xs text-slate-400 mt-2">{lesson.estimatedMinutes} min • {lesson.materials.length} materials</p>
                          <p className="text-[11px] text-primary-300 mt-3 uppercase tracking-[0.2em]">Open Lesson Preview</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {selectedLesson ? (
            <div ref={previewRef} className="mt-8 grid grid-cols-1 xl:grid-cols-[1.05fr,0.95fr] gap-6">
              <div className="rounded-[2rem] bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 p-8 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-primary-300 font-black">Lesson Preview</p>
                    <h4 className="text-3xl font-black text-white mt-3">{selectedLesson.title}</h4>
                    <p className="text-sm text-slate-400 mt-2">{selectedSection?.title} • Lesson {selectedLesson.order}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEnroll}
                    disabled={checkingAccess || (course.metadata.priceType === 'paid' && !!user && !hasAccess)}
                    className="px-5 py-3 rounded-xl bg-white/10 text-slate-100 hover:bg-white/15 transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    Open In Full Course
                  </button>
                </div>

                <p className="text-slate-200 leading-relaxed">{selectedLesson.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</p>
                    <p className="text-lg font-black text-white mt-2">{selectedLesson.estimatedMinutes} min</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Objectives</p>
                    <p className="text-lg font-black text-white mt-2">{selectedLesson.objectives.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Core Materials</p>
                    <p className="text-lg font-black text-white mt-2">{selectedLessonResources.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Optional Extensions</p>
                    <p className="text-lg font-black text-white mt-2">{selectedOptionalResources.length}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <h5 className="text-sm font-black uppercase tracking-[0.2em] text-primary-300 mb-3">Lesson Objectives</h5>
                  <ul className="space-y-2">
                    {selectedLesson.objectives.map((objective) => (
                      <li key={objective} className="flex items-start gap-2 text-slate-200 text-sm">
                        <span className="w-2 h-2 rounded-full bg-primary-400 mt-1.5" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <h5 className="text-sm font-black uppercase tracking-[0.2em] text-accent-300 mb-3">Lesson Outline</h5>
                  <div className="space-y-3">
                    {selectedLessonOutline.map((item) => (
                      <div key={item.id} className="rounded-xl bg-slate-950/30 border border-white/5 p-4">
                        <p className="text-white font-bold">{item.title}</p>
                        <p className="text-sm text-slate-300 mt-2">{item.summary}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-[2rem] bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <BookOpen className="text-emerald-300" size={22} />
                    <h5 className="text-2xl font-black text-white">Lesson Materials</h5>
                  </div>
                  <div className="space-y-4">
                    {selectedLessonResources.map((resource) => (
                      <div key={resource.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-white font-bold">{resource.title}</p>
                          <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-200 text-xs uppercase tracking-[0.2em]">{resource.type}</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-3">{resource.description}</p>
                        <ul className="space-y-2 mt-4">
                          {(resource.includedItems || []).map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-[2rem] bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <Clock className="text-orange-300" size={22} />
                    <h5 className="text-2xl font-black text-white">Optional Extension Path</h5>
                  </div>
                  <div className="space-y-4">
                    {selectedOptionalResources.map((resource) => (
                      <div key={resource.id} className="rounded-2xl border border-dashed border-white/15 bg-white/5 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-white font-bold">{resource.title}</p>
                          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-200 text-xs uppercase tracking-[0.2em]">Optional</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-3">{resource.description}</p>
                        <ul className="space-y-2 mt-4">
                          {(resource.includedItems || []).map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                              <span className="w-2 h-2 rounded-full bg-amber-300 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>

        <section>
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.35em] text-primary-300">Course Benefits</p>
            <h3 className="text-4xl font-black text-white mt-4">Why this experience is different</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {course.benefits.map((benefit) => (
              <div key={benefit.title} className={`rounded-[2rem] border bg-gradient-to-br p-7 ${toneClasses[benefit.tone]}`}>
                <p className="text-3xl mb-4">{benefit.icon}</p>
                <h4 className="text-xl font-black text-white">{benefit.title}</h4>
                <p className="text-sm mt-3 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-[2rem] bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-blue-300" size={24} />
              <h3 className="text-2xl font-black text-white">Teaching Staff</h3>
            </div>
            <div className="space-y-4">
              {course.staff.map((member) => (
                <div key={member.id} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-lg font-black text-white">{member.name}</p>
                      <p className="text-primary-300 font-semibold mt-1">{member.role}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/10 text-xs uppercase tracking-[0.2em] text-slate-300">{member.experience}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-3">{member.bio}</p>
                  <p className="text-sm text-slate-400 mt-3">Focus: {member.focus}</p>
                  <p className="text-xs text-slate-500 mt-3">Languages: {member.languages.join(', ')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-8">
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className="text-emerald-300" size={24} />
              <h3 className="text-2xl font-black text-white">Materials and Support</h3>
            </div>
            <div className="space-y-4">
              {course.resourceHighlights.map((resource) => (
                <div key={resource.title} className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-white font-bold">{resource.title}</p>
                    <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-200 text-xs uppercase tracking-[0.2em]">{resource.type}</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-3">{resource.description}</p>
                </div>
              ))}
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Clock className="text-orange-300 mb-2" size={18} />
                    <p className="text-white font-bold">Format</p>
                    <p className="text-slate-400 mt-1">{course.metadata.classFormat.duration}</p>
                  </div>
                  <div>
                    <BarChart3 className="text-green-300 mb-2" size={18} />
                    <p className="text-white font-bold">Assessment</p>
                    <p className="text-slate-400 mt-1">Lesson quizzes and tracked progress</p>
                  </div>
                  <div>
                    <Award className="text-violet-300 mb-2" size={18} />
                    <p className="text-white font-bold">Milestones</p>
                    <p className="text-slate-400 mt-1">{course.milestoneBadges.length} achievement checkpoints</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] bg-gradient-to-r from-primary-600 to-accent-600 p-10 text-center">
          <h3 className="text-3xl font-black text-white">Ready to start this course?</h3>
          <p className="text-white/90 text-lg mt-4 max-w-2xl mx-auto">
            Enroll to access the dedicated student player, section quizzes, lesson materials, and staff-guided learning path.
          </p>
          <button
            onClick={handleEnroll}
            disabled={checkingAccess || (course.metadata.priceType === 'paid' && !!user && !hasAccess)}
            className="mt-8 px-8 py-4 rounded-2xl bg-white text-primary-700 font-black text-lg hover:bg-slate-100 transition shadow-xl"
          >
            {ctaLabel}
          </button>
        </section>
      </div>
    </div>
  );
};

export default CourseModuleLandingPage;