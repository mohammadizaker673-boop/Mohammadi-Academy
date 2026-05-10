import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Lock,
  Sparkles
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  CourseModuleEarnedMilestone,
  CourseModuleLesson,
  CourseModuleProgress,
  DedicatedCourseModule
} from '../../types/dedicated-course.types';
import { hasRestrictedCourseAccess } from '../../services/courseAccessService';
import { getCourseDetailPath } from '../../utils/courseRouting';
import { resolveLessonResources, resolveOptionalLessonResources } from '../../utils/courseModuleResources';
import LessonExperiencePanel from '../learning/LessonExperiencePanel';
import {
  buildDedicatedLessonContext,
  resolveDedicatedRecitationTarget,
  resolveDedicatedLessonReferences,
  resolveDedicatedReflectionQuestions,
} from '../../utils/lessonExperience';

interface CourseModulePlayerProps {
  course: DedicatedCourseModule;
}

const QuizPanel: React.FC<{
  lesson: CourseModuleLesson;
  onClose: () => void;
  onResult: (score: number, passed: boolean) => void;
}> = ({ lesson, onClose, onResult }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  if (!lesson.quiz) {
    return null;
  }

  const totalQuestions = lesson.quiz.questions.length;

  const handleSubmit = () => {
    const correctAnswers = lesson.quiz?.questions.filter(
      (question) => answers[question.id] === question.correctOptionId
    ).length ?? 0;
    const score = totalQuestions === 0 ? 0 : Math.round((correctAnswers / totalQuestions) * 100);
    const passed = score >= lesson.quiz.passingScore;
    setResult({ score, passed });
    onResult(score, passed);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-black text-white">{lesson.quiz.title}</h3>
          <p className="text-sm text-slate-300 mt-1">{lesson.quiz.description}</p>
        </div>
        <button
          onClick={onClose}
          className="px-3 py-2 rounded-lg bg-white/10 text-slate-200 hover:bg-white/15 transition"
        >
          Close Quiz
        </button>
      </div>

      <div className="space-y-5">
        {lesson.quiz.questions.map((question, index) => (
          <div key={question.id} className="bg-slate-950/30 border border-white/5 rounded-xl p-4">
            <p className="text-sm uppercase tracking-[0.2em] text-primary-300 font-black mb-2">
              Question {index + 1}
            </p>
            <p className="text-white font-semibold mb-4">{question.question}</p>
            <div className="space-y-2">
              {question.options.map((option) => {
                const isSelected = answers[question.id] === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setAnswers((prev) => ({ ...prev, [question.id]: option.id }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition ${
                      isSelected
                        ? 'border-primary-400 bg-primary-500/15 text-white'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
            {result && (
              <p className="text-xs text-slate-400 mt-3">{question.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {result ? (
        <div className={`rounded-2xl border p-4 ${result.passed ? 'border-green-500/40 bg-green-500/10' : 'border-yellow-500/40 bg-yellow-500/10'}`}>
          <p className="text-white font-black text-lg">Quiz Score: {result.score}%</p>
          <p className="text-sm text-slate-200 mt-1">
            {result.passed
              ? 'You passed this check-in and can continue with confidence.'
              : `You need ${lesson.quiz.passingScore}% to pass. Review the lesson highlights and try again.`}
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3 justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:from-primary-400 hover:to-accent-400 transition"
        >
          Submit Quiz
        </button>
      </div>
    </div>
  );
};

const CourseModulePlayer: React.FC<CourseModulePlayerProps> = ({ course }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const lessons = useMemo(() => course.sections.flatMap((section) => section.lessons), [course.sections]);
  const firstLessonId = lessons[0]?.id ?? '';
  const [currentLessonId, setCurrentLessonId] = useState(firstLessonId);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [earnedMilestones, setEarnedMilestones] = useState<CourseModuleEarnedMilestone[]>([]);
  const [quizStatsByLesson, setQuizStatsByLesson] = useState<Record<string, { attempts: number; bestScore: number }>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [loadedProgress, setLoadedProgress] = useState(false);
  const [accessLoading, setAccessLoading] = useState(course.metadata.priceType === 'paid');
  const [blocked, setBlocked] = useState(false);

  const storageKey = user?.uid ? `${course.metadata.id}-progress-${user.uid}` : null;
  const quizStatsStorageKey = user?.uid ? `${course.metadata.id}-quiz-stats-${user.uid}` : null;

  const currentLesson = lessons.find((lesson) => lesson.id === currentLessonId);
  const currentSection = course.sections.find((section) =>
    section.lessons.some((lesson) => lesson.id === currentLessonId)
  );
  const currentLessonIndex = lessons.findIndex((lesson) => lesson.id === currentLessonId);
  const previousLesson = currentLessonIndex > 0 ? lessons[currentLessonIndex - 1] : null;
  const nextLesson = currentLessonIndex >= 0 ? lessons[currentLessonIndex + 1] : null;
  const overallProgress = lessons.length === 0 ? 0 : Math.round((completedLessons.length / lessons.length) * 100);
  const streakCount = completedLessons.length === 0 ? 0 : Math.ceil(completedLessons.length / 3);
  const lessonResources = currentLesson ? resolveLessonResources(currentLesson) : [];
  const optionalLessonResources = currentLesson ? resolveOptionalLessonResources(currentLesson) : [];
  const reflectionQuestions = currentLesson ? resolveDedicatedReflectionQuestions(currentLesson) : [];
  const lessonReferences = currentLesson ? resolveDedicatedLessonReferences(course.metadata.id, currentLesson) : [];
  const lessonContext = currentLesson ? buildDedicatedLessonContext(currentLesson) : '';
  const recitationTarget = currentLesson ? resolveDedicatedRecitationTarget(currentLesson) : null;
  const currentLessonQuizStats = currentLesson ? quizStatsByLesson[currentLesson.id] || { attempts: 0, bestScore: 0 } : { attempts: 0, bestScore: 0 };
  const courseLessonOverview = useMemo(() => lessons.map((lesson) => ({ id: lesson.id, title: lesson.title })), [lessons]);

  const speakArabic = (text: string, rate = 0.9) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ar-SA';
    utterance.rate = rate;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!user) {
      navigate('/login', { state: { from: { pathname: course.studentRoute } } });
      return;
    }

    if (user.role === 'admin') {
      setBlocked(false);
      setAccessLoading(false);
      return;
    }

    if (course.metadata.priceType !== 'paid') {
      setBlocked(false);
      setAccessLoading(false);
      return;
    }

    let active = true;

    const loadAccess = async () => {
      setAccessLoading(true);
      try {
        const allowed = await hasRestrictedCourseAccess({
          userId: user.uid,
          role: user.role,
          courseId: course.metadata.id,
          sourceType: 'catalog',
          isPremiumCourse: true
        });
        if (active) {
          setBlocked(!allowed);
        }
      } catch (error) {
        console.error(`Failed to verify ${course.metadata.id} course access`, error);
        if (active) {
          setBlocked(true);
        }
      } finally {
        if (active) {
          setAccessLoading(false);
        }
      }
    };

    loadAccess();

    return () => {
      active = false;
    };
  }, [authLoading, course.metadata.id, course.metadata.priceType, course.studentRoute, navigate, user]);

  useEffect(() => {
    setCurrentLessonId(firstLessonId);
  }, [firstLessonId]);

  useEffect(() => {
    if (!storageKey || blocked || accessLoading) {
      setCompletedLessons([]);
      setEarnedMilestones([]);
      setLoadedProgress(true);
      return;
    }

    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as CourseModuleProgress;
        setCurrentLessonId(parsed.currentLessonId || firstLessonId);
        setCompletedLessons(parsed.completedLessons || []);
        setEarnedMilestones(parsed.earnedMilestones || []);
      } else {
        setCurrentLessonId(firstLessonId);
        setCompletedLessons([]);
        setEarnedMilestones([]);
      }
    } catch (error) {
      console.error(`Failed to load ${course.metadata.id} progress`, error);
      setCurrentLessonId(firstLessonId);
      setCompletedLessons([]);
      setEarnedMilestones([]);
    } finally {
      setLoadedProgress(true);
    }
  }, [course.metadata.id, firstLessonId, storageKey]);

  useEffect(() => {
    if (!quizStatsStorageKey || blocked || accessLoading) {
      setQuizStatsByLesson({});
      return;
    }

    try {
      const saved = localStorage.getItem(quizStatsStorageKey);
      if (saved) {
        setQuizStatsByLesson(JSON.parse(saved) as Record<string, { attempts: number; bestScore: number }>);
      } else {
        setQuizStatsByLesson({});
      }
    } catch (error) {
      console.error(`Failed to load ${course.metadata.id} quiz stats`, error);
      setQuizStatsByLesson({});
    }
  }, [accessLoading, blocked, course.metadata.id, quizStatsStorageKey]);

  useEffect(() => {
    if (!loadedProgress || !storageKey || !user?.uid) {
      return;
    }

    const progress: CourseModuleProgress = {
      studentId: user.uid,
      courseId: course.metadata.id,
      currentLessonId,
      completedLessons,
      overallProgress,
      streakCount,
      earnedMilestones
    };

    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [completedLessons, course.metadata.id, currentLessonId, earnedMilestones, loadedProgress, overallProgress, storageKey, streakCount, user?.uid]);

  useEffect(() => {
    if (!quizStatsStorageKey || !user?.uid) {
      return;
    }

    localStorage.setItem(quizStatsStorageKey, JSON.stringify(quizStatsByLesson));
  }, [quizStatsByLesson, quizStatsStorageKey, user?.uid]);

  useEffect(() => {
    setShowQuiz(false);
  }, [currentLessonId]);

  const awardMilestones = (newCompletedLessons: string[]) => {
    const existingThresholds = new Set(earnedMilestones.map((milestone) => milestone.threshold));
    const newlyEarned = course.milestoneBadges
      .filter((milestone) => newCompletedLessons.length >= milestone.threshold && !existingThresholds.has(milestone.threshold))
      .map((milestone) => ({
        ...milestone,
        earnedAt: new Date().toISOString()
      }));

    if (newlyEarned.length > 0) {
      setEarnedMilestones((prev) => [...prev, ...newlyEarned]);
    }
  };

  const isLessonAccessible = (lesson: CourseModuleLesson) => {
    return Boolean(lesson);
  };

  const handleCompleteLesson = () => {
    if (!currentLesson) {
      return;
    }

    const newCompletedLessons = completedLessons.includes(currentLesson.id)
      ? completedLessons
      : [...completedLessons, currentLesson.id];

    setCompletedLessons(newCompletedLessons);
    awardMilestones(newCompletedLessons);

    if (nextLesson && isLessonAccessible(nextLesson)) {
      setCurrentLessonId(nextLesson.id);
    }
  };

  const handleLessonSelect = (lessonId: string) => {
    const lesson = lessons.find((item) => item.id === lessonId);
    if (!lesson || !isLessonAccessible(lesson)) {
      return;
    }

    setCurrentLessonId(lessonId);
  };

  const handleQuizResult = (score: number) => {
    if (!currentLesson) {
      return;
    }

    setQuizStatsByLesson((current) => {
      const existing = current[currentLesson.id] || { attempts: 0, bestScore: 0 };
      return {
        ...current,
        [currentLesson.id]: {
          attempts: existing.attempts + 1,
          bestScore: Math.max(existing.bestScore, score)
        }
      };
    });
  };

  if (accessLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (blocked) {
    const dashboardPath = user?.role === 'teacher' ? '/teacher' : '/student';

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="max-w-lg text-center rounded-3xl border border-white/10 bg-slate-900/80 p-10">
          <Lock className="mx-auto text-yellow-400 mb-4" size={42} />
          <h2 className="text-2xl font-black text-white">Premium Access Required</h2>
          <p className="text-slate-300 mt-3">
            This dedicated course is only available to students and teachers assigned by academy administration.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to={dashboardPath} className="px-5 py-3 rounded-xl bg-primary-500/20 text-primary-200 hover:bg-primary-500/30 transition">
              Return to Dashboard
            </Link>
            <Link to={getCourseDetailPath(course.metadata.id)} className="px-5 py-3 rounded-xl bg-white/10 text-slate-200 hover:bg-white/15 transition">
              View Course Details
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-6 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto text-yellow-400 mb-3" size={44} />
          <p className="text-white text-lg font-semibold">Course lessons are not available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      <header className="bg-gradient-to-r from-slate-900/95 to-slate-800/95 border-b border-white/10 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-primary-300 font-black">{course.heroBadge}</p>
              <h1 className="text-2xl font-black text-white mt-1">{course.metadata.title}</h1>
              <p className="text-sm text-slate-400 mt-1">{currentSection?.title}</p>
            </div>
            <div className="text-left lg:text-right">
              <p className="text-3xl font-black text-primary-400">{overallProgress}%</p>
              <p className="text-sm text-slate-400">{completedLessons.length} of {lessons.length} lessons completed</p>
            </div>
          </div>
          <div className="w-full bg-slate-700/70 rounded-full h-2 mt-4">
            <div className="h-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all" style={{ width: `${overallProgress}%` }} />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-3xl p-8 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-accent-300 font-black">Lesson {currentLesson.order}</p>
                <h2 className="text-3xl font-black text-white mt-2">{currentLesson.title}</h2>
                <p className="text-slate-300 mt-3 max-w-3xl">{currentLesson.description}</p>
              </div>
              <div className="text-5xl">{currentSection?.icon ?? '📘'}</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Duration</p>
                <p className="text-white font-bold mt-2">{currentLesson.estimatedMinutes} minutes</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Materials</p>
                <p className="text-white font-bold mt-2">{lessonResources.length} study assets</p>
              </div>
              <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Momentum</p>
                <p className="text-white font-bold mt-2">{streakCount} learning streak</p>
              </div>
            </div>

            <div className="rounded-2xl bg-white/5 p-5 border border-white/5">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-300 mb-3">Lesson Objectives</h3>
              <ul className="space-y-2">
                {currentLesson.objectives.map((objective) => (
                  <li key={objective} className="flex items-start gap-2 text-slate-200 text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary-400 mt-1.5" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              {currentLesson.blocks.map((block, index) => (
                <div key={`${currentLesson.id}-block-${index}`} className="rounded-2xl bg-white/5 border border-white/5 p-5">
                  {block.title ? <h3 className="text-lg font-bold text-white mb-3">{block.title}</h3> : null}
                  {block.content ? <p className="text-slate-200 leading-relaxed">{block.content}</p> : null}
                  {block.arabicText ? (
                    <div className="bg-slate-950/30 rounded-xl p-4 my-4">
                      <p className="text-right text-white text-2xl font-arabic">{block.arabicText}</p>
                      {block.transliteration ? <p className="text-sm italic text-slate-400 mt-2">{block.transliteration}</p> : null}
                    </div>
                  ) : null}
                  {block.items?.length ? (
                    <ul className="space-y-2 mt-4">
                      {block.items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-slate-200 text-sm">
                          <span className="w-2 h-2 rounded-full bg-accent-400 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {block.caption ? <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mt-4">{block.caption}</p> : null}

                  {block.type === 'audio-letter' && block.letters?.length ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                      {block.letters.map((letterItem) => (
                        <div key={`${currentLesson.id}-${index}-${letterItem.letter}`} className="rounded-xl bg-slate-950/40 border border-white/5 p-3">
                          <p className="text-2xl text-right font-arabic text-white">{letterItem.letter}</p>
                          <p className="text-sm text-slate-200 font-semibold mt-1">{letterItem.name}</p>
                          <p className="text-xs text-slate-400 italic">{letterItem.transliteration}</p>
                          <p className="text-xs text-slate-500 mt-1">{letterItem.makhraj}</p>
                          <div className="flex gap-2 mt-3">
                            <button
                              type="button"
                              onClick={() => speakArabic(letterItem.letter, 0.9)}
                              className="px-2 py-1 rounded bg-primary-500/20 text-primary-200 text-xs hover:bg-primary-500/30 transition"
                            >
                              Play
                            </button>
                            {block.speedToggle ? (
                              <button
                                type="button"
                                onClick={() => speakArabic(letterItem.letter, 0.65)}
                                className="px-2 py-1 rounded bg-accent-500/20 text-accent-200 text-xs hover:bg-accent-500/30 transition"
                              >
                                Slow
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {(block.type === 'letter-practice' || block.type === 'join-animation') && block.practiceItems?.length ? (
                    <div className="grid sm:grid-cols-2 gap-3 mt-4">
                      {block.practiceItems.map((item, itemIndex) => (
                        <div key={`${currentLesson.id}-${index}-practice-${itemIndex}`} className="rounded-xl bg-slate-950/30 border border-white/5 p-3">
                          <p className="text-right text-xl text-white font-arabic">{item.arabic}</p>
                          <p className="text-sm text-slate-300 italic mt-1">{item.transliteration}</p>
                          {item.meaning ? <p className="text-xs text-slate-500 mt-1">{item.meaning}</p> : null}
                          <button
                            type="button"
                            onClick={() => speakArabic(item.arabic, 0.75)}
                            className="mt-2 px-2 py-1 rounded bg-primary-500/20 text-primary-200 text-xs hover:bg-primary-500/30 transition"
                          >
                            Hear
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {block.type === 'pronunciation-guide' && block.articulationZones?.length ? (
                    <div className="space-y-2 mt-4">
                      {block.articulationZones.map((zone) => (
                        <div key={`${currentLesson.id}-${index}-${zone.zone}`} className="rounded-xl bg-slate-950/30 border border-white/5 p-3">
                          <p className="text-sm font-bold text-white">{zone.zone}</p>
                          <p className="text-sm text-primary-200 font-arabic mt-1">{zone.letters}</p>
                          <p className="text-xs text-slate-400 mt-1">{zone.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-300 mb-3">Key Takeaways</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentLesson.keyPoints.map((point) => (
                  <div key={point} className="rounded-xl bg-white/5 p-3 text-sm text-slate-200 border border-white/5">
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-green-300 mb-3">Lesson Materials</h3>
              <div className="space-y-3">
                {lessonResources.map((resource) => (
                  <div key={resource.id} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-white font-bold">{resource.title}</p>
                      <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-200 text-xs uppercase tracking-[0.2em]">{resource.type}</span>
                    </div>
                    <p className="text-sm text-slate-300 mt-3">{resource.description}</p>
                    <ul className="space-y-2 mt-4">
                      {(resource.includedItems || []).map((item) => (
                        <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                          <span className="w-2 h-2 rounded-full bg-green-300 mt-1.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              {currentLesson.staffNote ? <p className="text-sm text-slate-400 mt-4">{currentLesson.staffNote}</p> : null}
            </div>

            {optionalLessonResources.length > 0 ? (
              <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-amber-300 mb-3">Optional Extension Resources</h3>
                <div className="space-y-3">
                  {optionalLessonResources.map((resource) => (
                    <div key={resource.id} className="rounded-2xl bg-white/5 border border-dashed border-white/15 p-4">
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
            ) : null}

            <LessonExperiencePanel
              courseId={course.metadata.id}
              lessonId={currentLesson.id}
              lessonTitle={currentLesson.title}
              lessonContext={lessonContext}
              estimatedMinutes={currentLesson.estimatedMinutes}
              keyTakeaways={currentLesson.keyPoints}
              reflectionQuestions={reflectionQuestions}
              references={lessonReferences}
              userId={user?.uid}
              userName={user?.displayName}
              userRole={user?.role}
              completed={completedLessons.includes(currentLesson.id)}
              quizAttempts={currentLessonQuizStats.attempts}
              bestQuizScore={currentLessonQuizStats.bestScore}
              extensionAvailable={optionalLessonResources.length > 0}
              courseLessons={courseLessonOverview}
              overallProgress={overallProgress}
              currentLessonIndex={currentLessonIndex}
              totalLessons={lessons.length}
              recitationTarget={recitationTarget}
            />

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCompleteLesson}
                className="flex-1 min-w-[220px] px-6 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black hover:from-primary-400 hover:to-accent-400 transition flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={18} />
                {completedLessons.includes(currentLesson.id) ? 'Lesson Completed' : 'Mark Complete & Continue'}
              </button>
              {currentLesson.quiz ? (
                <button
                  onClick={() => setShowQuiz((prev) => !prev)}
                  className="flex-1 min-w-[220px] px-6 py-4 rounded-2xl bg-white/10 text-white font-black hover:bg-white/15 transition"
                >
                  {showQuiz ? 'Hide Quiz' : 'Open Lesson Quiz'}
                </button>
              ) : null}
            </div>

            {showQuiz && currentLesson.quiz ? <QuizPanel lesson={currentLesson} onClose={() => setShowQuiz(false)} onResult={handleQuizResult} /> : null}

            <div className="flex items-center justify-between gap-4 text-sm">
              <button
                onClick={() => previousLesson && handleLessonSelect(previousLesson.id)}
                disabled={!previousLesson}
                className="px-4 py-3 rounded-xl bg-white/10 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/15 transition flex items-center gap-2"
              >
                <ChevronLeft size={16} /> Previous Lesson
              </button>
              <button
                onClick={() => nextLesson && handleLessonSelect(nextLesson.id)}
                disabled={!nextLesson || !isLessonAccessible(nextLesson)}
                className="px-4 py-3 rounded-xl bg-white/10 text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/15 transition flex items-center gap-2"
              >
                Next Lesson <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Award className="text-yellow-400" size={20} />
              <h3 className="text-lg font-black text-white">Milestones</h3>
            </div>
            <div className="space-y-3">
              {course.milestoneBadges.map((milestone) => {
                const earned = earnedMilestones.find((item) => item.threshold === milestone.threshold);
                return (
                  <div key={milestone.threshold} className={`rounded-2xl border p-4 ${earned ? 'border-green-500/40 bg-green-500/10' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{milestone.icon}</div>
                      <div>
                        <p className="text-white font-bold">{milestone.name}</p>
                        <p className="text-sm text-slate-300 mt-1">{milestone.description}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          Unlock at lesson {milestone.threshold}
                          {earned ? ` • earned ${new Date(earned.earnedAt).toLocaleDateString()}` : ''}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-3xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="text-primary-300" size={20} />
              <h3 className="text-lg font-black text-white">Course Roadmap</h3>
            </div>
            <div className="space-y-4">
              {course.sections.map((section) => (
                <div key={section.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{section.icon}</span>
                    <div>
                      <p className="text-white font-bold">{section.title}</p>
                      <p className="text-xs text-slate-400">{section.lessons.length} lessons</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {section.lessons.map((lesson) => {
                      const accessible = isLessonAccessible(lesson);
                      const completed = completedLessons.includes(lesson.id);
                      const active = lesson.id === currentLessonId;
                      return (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonSelect(lesson.id)}
                          className={`w-full flex items-start gap-3 px-4 py-3 rounded-2xl border text-left transition ${
                            active
                              ? 'border-primary-400 bg-primary-500/15'
                              : accessible
                                ? 'border-white/10 bg-white/5 hover:bg-white/10'
                                : 'border-white/5 bg-white/[0.03] opacity-70 cursor-not-allowed'
                          }`}
                        >
                          <div className="mt-0.5">
                            {completed ? <CheckCircle2 className="text-green-400" size={18} /> : accessible ? <Sparkles className="text-primary-300" size={18} /> : <Lock className="text-slate-500" size={18} />}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">{lesson.title}</p>
                            <p className="text-xs text-slate-400 mt-1">{lesson.estimatedMinutes} min</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-black text-white mb-4">Course Faculty</h3>
            <div className="space-y-3">
              {course.staff.map((member) => (
                <div key={member.id} className="rounded-2xl bg-white/5 border border-white/5 p-4">
                  <p className="text-white font-bold">{member.name}</p>
                  <p className="text-sm text-primary-300 mt-1">{member.role}</p>
                  <p className="text-sm text-slate-300 mt-2">{member.focus}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseModulePlayer;