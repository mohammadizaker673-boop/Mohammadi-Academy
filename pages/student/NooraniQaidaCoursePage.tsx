import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, BarChart3, Award, CheckCircle, Lock } from 'lucide-react';
import { nooraniQaidaCourseData } from '../../data/nooraniQaidaCourseData';
import { useAuth } from '../../contexts/AuthContext';
import { resolveNooraniLessonResources, resolveOptionalNooraniExtensions } from '../../utils/nooraniLessonResources';

const NooraniQaidaCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const previewRef = useRef<HTMLDivElement | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const allLessons = useMemo(() => nooraniQaidaCourseData.sections.flatMap((section) => section.lessons), []);
  const [selectedLessonId, setSelectedLessonId] = useState(allLessons[0]?.id ?? '');

  const selectedLesson = useMemo(
    () => allLessons.find((lesson) => lesson.id === selectedLessonId) || allLessons[0] || null,
    [allLessons, selectedLessonId]
  );
  const selectedSection = useMemo(
    () => nooraniQaidaCourseData.sections.find((section) => section.lessons.some((lesson) => lesson.id === selectedLesson?.id)) || null,
    [selectedLesson]
  );
  const selectedResources = useMemo(
    () => selectedLesson ? resolveNooraniLessonResources(selectedLesson) : [],
    [selectedLesson]
  );
  const selectedOptionalResources = useMemo(
    () => selectedLesson ? resolveOptionalNooraniExtensions(selectedLesson) : [],
    [selectedLesson]
  );

  useEffect(() => {
    if (!selectedLessonId && allLessons[0]?.id) {
      setSelectedLessonId(allLessons[0].id);
    }
  }, [allLessons, selectedLessonId]);

  const handleLessonPreviewSelect = (lessonId: string) => {
    setSelectedLessonId(lessonId);
    window.requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleEnroll = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/student/noorani-qaida-player' } } });
      return;
    }
    setEnrolled(true);
    localStorage.setItem(`enrolled-${user.uid}-nq`, 'true');
    navigate('/student/noorani-qaida-player');
  };

  const features = [
    {
      icon: '🔤',
      title: 'Arabic Alphabet Mastery',
      description: 'Learn all 28 Arabic letters with proper pronunciation'
    },
    {
      icon: '🎙️',
      title: 'Tajweed Rules',
      description: 'Master Quranic recitation rules from certified instructors'
    },
    {
      icon: '🧎',
      title: 'Complete Prayer Guide',
      description: 'Step-by-step Salah training with video demonstrations'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Track your learning progress with detailed analytics'
    },
    {
      icon: '🏆',
      title: 'Certificates',
      description: 'Earn certificate upon successful completion'
    },
    {
      icon: '⚡',
      title: 'Interactive Exercises',
      description: 'Practice with quizzes, recording, and instant feedback'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-black text-white">Muhammadi Online Academy</h1>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 text-slate-300 hover:text-white transition"
          >
            ← Back
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <span className="inline-block px-4 py-2 bg-primary-500/20 text-primary-300 rounded-full text-sm font-bold mb-4">
              📚 New Course
            </span>
            <h1 className="text-5xl font-black text-white mb-4 leading-tight">
              Noorani Qaida & Prayer Course
            </h1>
            <p className="text-xl text-slate-200 mb-6">
              Master Arabic reading, Quranic recitation, and daily prayers step-by-step with our comprehensive Islamic learning program.
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-black text-primary-400">{nooraniQaidaCourseData.totalLessons}</div>
                <p className="text-sm text-slate-300">Total Lessons</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-black text-accent-400">{nooraniQaidaCourseData.estimatedDuration}h</div>
                <p className="text-sm text-slate-300">Total Duration</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <div className="text-2xl font-black text-green-400">100%</div>
                <p className="text-sm text-slate-300">Completion Rate</p>
              </div>
            </div>

            <button
              onClick={handleEnroll}
              className="px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black rounded-xl text-lg hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg"
            >
              {enrolled ? '✓ Enrolled - Start Learning' : 'Enroll Now - Free'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-accent-500/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-3xl p-12 text-center">
              <div className="text-9xl mb-6">📖</div>
              <h2 className="text-2xl font-black text-white mb-4">Start Your Journey</h2>
              <p className="text-slate-300 mb-6">
                Learn Islamic fundamentals at your own pace with interactive lessons and expert guidance.
              </p>
              <div className="space-y-2 text-left">
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle className="text-green-400" size={20} />
                  <span>Beginner-friendly lessons</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle className="text-green-400" size={20} />
                  <span>Progressive difficulty</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <CheckCircle className="text-green-400" size={20} />
                  <span>Complete with quizzes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-4xl font-black text-white text-center mb-12">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-6 hover:border-primary-500/50 transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-black text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Course Structure */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-3xl p-12 mb-16">
          <h2 className="text-3xl font-black text-white mb-8">3-Section Course Structure</h2>
          <p className="text-sm text-slate-400 mb-8">Click any lesson card to jump straight to that lesson’s preview, materials, and optional practice path.</p>
          <div className="space-y-6">
            {nooraniQaidaCourseData.sections.map((section) => (
              <div key={section.id} className="flex gap-6 items-start">
                <div className="text-5xl">{section.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-black text-white mb-2">{section.title}</h3>
                  <p className="text-slate-300 mb-3">{section.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {section.lessons.map((lesson) => {
                      const active = lesson.id === selectedLesson?.id;
                      return (
                        <button
                          key={lesson.id}
                          type="button"
                          onClick={() => handleLessonPreviewSelect(lesson.id)}
                          className={`px-4 py-3 rounded-2xl border text-left transition ${
                            active
                              ? 'border-primary-400 bg-primary-500/10 text-white'
                              : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10 cursor-pointer'
                          }`}
                        >
                          <p className="text-sm font-black">{lesson.title}</p>
                          <p className="text-xs text-slate-400 mt-2">{lesson.estimatedTime} min • {resolveNooraniLessonResources(lesson).length} materials</p>
                          <p className="text-[11px] text-primary-300 mt-3 uppercase tracking-[0.2em]">Open Lesson Preview</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-2xl font-black text-primary-400">{section.lessons.length}</p>
                  <p className="text-sm text-slate-400">lessons</p>
                </div>
              </div>
            ))}
          </div>

          {selectedLesson && (
            <div ref={previewRef} className="mt-10 grid grid-cols-1 xl:grid-cols-[1.05fr,0.95fr] gap-6">
              <div className="rounded-3xl bg-white/5 border border-white/10 p-8 space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-primary-300 font-black">Lesson Preview</p>
                    <h3 className="text-3xl font-black text-white mt-3">{selectedLesson.title}</h3>
                    <p className="text-sm text-slate-400 mt-2">{selectedSection?.title} • Lesson {selectedLesson.order}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleEnroll}
                    className="px-5 py-3 rounded-xl bg-white/10 text-slate-100 hover:bg-white/15 transition"
                  >
                    Open In Full Course
                  </button>
                </div>

                <p className="text-slate-200 leading-relaxed">{selectedLesson.description}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Duration</p>
                    <p className="text-lg font-black text-white mt-2">{selectedLesson.estimatedTime} min</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Objectives</p>
                    <p className="text-lg font-black text-white mt-2">{selectedLesson.content.learningObjectives.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Core Materials</p>
                    <p className="text-lg font-black text-white mt-2">{selectedResources.length}</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Optional Extensions</p>
                    <p className="text-lg font-black text-white mt-2">{selectedOptionalResources.length}</p>
                  </div>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary-300 mb-3">Lesson Objectives</h4>
                  <ul className="space-y-2">
                    {selectedLesson.content.learningObjectives.map((objective) => (
                      <li key={objective} className="flex items-start gap-2 text-slate-200 text-sm">
                        <span className="w-2 h-2 rounded-full bg-primary-400 mt-1.5" />
                        <span>{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl bg-white/5 border border-white/10 p-5">
                  <h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent-300 mb-3">Key Lesson Points</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedLesson.content.keyPoints.map((point) => (
                      <div key={point} className="rounded-xl bg-slate-950/30 border border-white/5 p-4 text-sm text-slate-200">
                        {point}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <BookOpen className="text-emerald-300" size={22} />
                    <h4 className="text-2xl font-black text-white">Lesson Materials</h4>
                  </div>
                  <div className="space-y-4">
                    {selectedResources.map((resource) => (
                      <div key={resource.id} className="rounded-2xl border border-white/10 bg-slate-950/30 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-white font-bold">{resource.title}</p>
                          <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-200 text-xs uppercase tracking-[0.2em]">{resource.type}</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-3">{resource.description}</p>
                        <ul className="space-y-2 mt-4">
                          {resource.includedItems.map((item) => (
                            <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                              <span className="w-2 h-2 rounded-full bg-emerald-300 mt-1.5" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
                  <div className="flex items-center gap-3 mb-5">
                    <Clock className="text-orange-300" size={22} />
                    <h4 className="text-2xl font-black text-white">Optional Extension Path</h4>
                  </div>
                  <div className="space-y-4">
                    {selectedOptionalResources.map((resource) => (
                      <div key={resource.id} className="rounded-2xl border border-dashed border-white/15 bg-slate-950/30 p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-white font-bold">{resource.title}</p>
                          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-200 text-xs uppercase tracking-[0.2em]">Optional</span>
                        </div>
                        <p className="text-sm text-slate-300 mt-3">{resource.description}</p>
                        <ul className="space-y-2 mt-4">
                          {resource.includedItems.map((item) => (
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
          )}
        </div>

        {/* Key Benefits */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-8">
            <Users className="text-blue-300 mb-4" size={32} />
            <h3 className="text-xl font-black text-white mb-2">Learn at Your Pace</h3>
            <p className="text-slate-200">
              Complete lessons whenever you're ready. No time pressure, perfect for busy students.
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-8">
            <BarChart3 className="text-green-300 mb-4" size={32} />
            <h3 className="text-xl font-black text-white mb-2">Track Progress</h3>
            <p className="text-slate-200">
              Monitor your learning with detailed analytics, scores, and achievement milestones.
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-2xl p-8">
            <Award className="text-purple-300 mb-4" size={32} />
            <h3 className="text-xl font-black text-white mb-2">Earn Certificates</h3>
            <p className="text-slate-200">
              Get recognized for completing the course with a shareable certificate.
            </p>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-2xl p-8">
            <Clock className="text-orange-300 mb-4" size={32} />
            <h3 className="text-xl font-black text-white mb-2">Flexible Schedule</h3>
            <p className="text-slate-200">
              Access the course 24/7 from any device. Study whenever works for you.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-3xl p-12 text-center mb-16">
          <h2 className="text-3xl font-black text-white mb-4">Ready to Begin Your Learning Journey?</h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of students already learning Arabic, Tajweed, and Prayer fundamentals with Muhammadi Online Academy.
          </p>
          <button
            onClick={handleEnroll}
            className="px-8 py-4 bg-white text-primary-600 font-black rounded-xl text-lg hover:bg-slate-100 transition-all shadow-lg"
          >
            Enroll Now - Free Course
          </button>
        </div>
      </div>
    </div>
  );
};

export default NooraniQaidaCoursePage;
