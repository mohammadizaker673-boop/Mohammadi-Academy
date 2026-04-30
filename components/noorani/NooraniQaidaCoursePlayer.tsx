import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { nooraniQaidaCourseData } from '../../data/nooraniQaidaCourseData';
import { Lesson, StudentProgress, Badge } from '../../types/noorani-qaida.types';
import { resolveNooraniLessonResources, resolveOptionalNooraniExtensions } from '../../utils/nooraniLessonResources';
import LessonExperiencePanel from '../learning/LessonExperiencePanel';
import {
  buildNooraniLessonContext,
  resolveNooraniLessonReferences,
  resolveNooraniRecitationTarget,
  resolveNooraniReflectionQuestions,
} from '../../utils/lessonExperience';
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Clock,
  Lock,
  Play,
  AlertCircle,
  Award,
  Zap,
  BookOpen,
  Volume2,
  Download
} from 'lucide-react';

interface CoursePlayerProps {
  onComplete?: () => void;
}

const NooraniQaidaCoursePlayer: React.FC<CoursePlayerProps> = ({ onComplete }) => {
  const { user } = useAuth();
  const [currentLessonId, setCurrentLessonId] = useState<string>(nooraniQaidaCourseData.sections[0].lessons[0].id);
  const [showQuiz, setShowQuiz] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [streakDays, setStreakDays] = useState(0);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [quizStatsByLesson, setQuizStatsByLesson] = useState<Record<string, { attempts: number; bestScore: number }>>({});

  const allLessons = nooraniQaidaCourseData.sections.flatMap((section) => section.lessons);

  const currentLesson = allLessons.find((lesson) => lesson.id === currentLessonId);

  const currentSectionIndex = nooraniQaidaCourseData.sections.findIndex((s) =>
    s.lessons.some((l) => l.id === currentLessonId)
  );

  const currentSection = nooraniQaidaCourseData.sections[currentSectionIndex];
  const currentLessonIndex = allLessons.findIndex((lesson) => lesson.id === currentLessonId);
  const currentLessonResources = currentLesson ? resolveNooraniLessonResources(currentLesson) : [];
  const optionalLessonResources = currentLesson ? resolveOptionalNooraniExtensions(currentLesson) : [];
  const reflectionQuestions = currentLesson ? resolveNooraniReflectionQuestions(currentLesson) : [];
  const lessonReferences = currentLesson ? resolveNooraniLessonReferences(currentLesson) : [];
  const lessonContext = currentLesson ? buildNooraniLessonContext(currentLesson) : '';
  const recitationTarget = currentLesson ? resolveNooraniRecitationTarget(currentLesson) : null;
  const currentLessonQuizStats = currentLesson ? quizStatsByLesson[currentLesson.id] || { attempts: 0, bestScore: 0 } : { attempts: 0, bestScore: 0 };

  useEffect(() => {
    loadProgress();
  }, [user?.uid]);

  const loadProgress = async () => {
    if (!user?.uid) return;
    try {
      const saved = localStorage.getItem(`nq-progress-${user.uid}`);
      if (saved) {
        const data = JSON.parse(saved);
        setCompletedLessons(data.completedLessons || []);
        setStreakDays(data.streakDays || 0);
        setBadges(data.badges || []);
        setCurrentLessonId(data.currentLessonId || nooraniQaidaCourseData.sections[0].lessons[0].id);
        setQuizStatsByLesson(data.quizStatsByLesson || {});
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    const progressData = {
      studentId: user.uid,
      courseId: nooraniQaidaCourseData.id,
      currentLessonId,
      completedLessons,
      streakDays,
      badges,
      quizStatsByLesson,
      overallProgress: Math.round((completedLessons.length / nooraniQaidaCourseData.totalLessons) * 100)
    };

    localStorage.setItem(`nq-progress-${user.uid}`, JSON.stringify(progressData));
  }, [badges, completedLessons, currentLessonId, quizStatsByLesson, streakDays, user?.uid]);

  const saveProgress = async (newCompletedLessons: string[]) => {
    if (!user?.uid) return;
    const progressData = {
      studentId: user.uid,
      courseId: nooraniQaidaCourseData.id,
      currentLessonId,
      completedLessons: newCompletedLessons,
      streakDays: newCompletedLessons.length > 0 ? Math.ceil(newCompletedLessons.length / 3) : 0,
      badges,
      quizStatsByLesson,
      overallProgress: Math.round((newCompletedLessons.length / nooraniQaidaCourseData.totalLessons) * 100)
    };
    localStorage.setItem(`nq-progress-${user.uid}`, JSON.stringify(progressData));
  };

  const handleCompleteLesson = () => {
    if (!completedLessons.includes(currentLessonId)) {
      const newCompleted = [...completedLessons, currentLessonId];
      const nextStreak = newCompleted.length > 0 ? Math.ceil(newCompleted.length / 3) : 0;
      setCompletedLessons(newCompleted);
      setStreakDays(nextStreak);
      saveProgress(newCompleted);

      // Award badges
      if (newCompleted.length === 5) {
        const badge: Badge = {
          id: `badge-${Date.now()}`,
          name: 'Quick Learner',
          description: 'Completed 5 lessons',
          icon: '⚡',
          earnedAt: new Date(),
          type: 'milestone'
        };
        setBadges([...badges, badge]);
      }
    }

    // Move to next lesson
    const nextLesson = findNextUnlockedLesson();
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id);
      setShowQuiz(false);
    }
  };

  const findNextUnlockedLesson = (): Lesson | null => {
    for (const section of nooraniQaidaCourseData.sections) {
      for (let i = 0; i < section.lessons.length; i++) {
        if (completedLessons.includes(section.lessons[i].id)) {
          if (i + 1 < section.lessons.length) {
            return section.lessons[i + 1];
          }
        }
      }
    }
    return null;
  };

  const handleNavigateLesson = (lessonId: string) => {
    if (lessonId === currentLessonId) return;

    const lesson = nooraniQaidaCourseData.sections
      .flatMap((s) => s.lessons)
      .find((l) => l.id === lessonId);

    if (!lesson) return;

    setCurrentLessonId(lessonId);
    setShowQuiz(false);
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

  const overallProgress = Math.round((completedLessons.length / nooraniQaidaCourseData.totalLessons) * 100);

  if (!currentLesson) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto mb-4 text-yellow-400" size={48} />
          <p className="text-white text-lg">Lesson not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900">
      {/* Header */}
      <header className="bg-gradient-to-r from-slate-900 to-slate-800 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-black text-white">{nooraniQaidaCourseData.title}</h1>
              <p className="text-slate-400 text-sm">{currentSection?.title}</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-primary-400">{overallProgress}%</div>
              <p className="text-slate-400 text-sm">{completedLessons.length} of {nooraniQaidaCourseData.totalLessons} lessons</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all"
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Lesson Card */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">{currentLesson.title}</h2>
                  <p className="text-slate-300">{currentLesson.description}</p>
                </div>
                <div className="text-5xl">{currentSection?.icon}</div>
              </div>

              {/* Learning Objectives */}
              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                  <Zap className="text-yellow-400" size={16} />
                  Learning Objectives
                </h3>
                <ul className="space-y-2">
                  {currentLesson.content.learningObjectives.map((obj, i) => (
                    <li key={i} className="text-sm text-slate-200 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Main Content */}
              <div className="space-y-4 mb-6">
                <h3 className="text-lg font-bold text-white">Lesson Content</h3>
                {currentLesson.content.mainContent.map((block, i) => (
                  <div key={i} className="bg-white/5 rounded-xl p-4">
                    {block.type === 'text' && (
                      <div>
                        <p className="text-slate-200 mb-2">{block.content}</p>
                        {block.arabicText && (
                          <div className="bg-white/5 p-3 rounded-lg my-2">
                            <p className="text-right text-white font-arabic text-xl">{block.arabicText}</p>
                            {block.transliteration && (
                              <p className="text-slate-300 italic text-sm mt-1">{block.transliteration}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                    {block.audioUrl && (
                      <div className="flex items-center gap-3">
                        <button className="p-3 bg-primary-500 rounded-full hover:bg-primary-600">
                          <Play size={20} className="text-white" />
                        </button>
                        <span className="text-slate-200">Listen to audio</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <BookOpen className="text-emerald-300" size={16} />
                  Lesson Materials
                </h3>
                <div className="space-y-3">
                  {currentLessonResources.map((resource) => (
                    <div key={resource.id} className="rounded-xl bg-slate-950/30 border border-white/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-white font-bold text-sm">{resource.title}</p>
                        <span className="px-3 py-1 rounded-full bg-primary-500/15 text-primary-200 text-[10px] uppercase tracking-[0.2em]">{resource.type}</span>
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

              <div className="bg-white/5 rounded-xl p-4 mb-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <Clock className="text-orange-300" size={16} />
                  Optional Extension Resources
                </h3>
                <div className="space-y-3">
                  {optionalLessonResources.map((resource) => (
                    <div key={resource.id} className="rounded-xl bg-slate-950/30 border border-dashed border-white/15 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-white font-bold text-sm">{resource.title}</p>
                        <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-200 text-[10px] uppercase tracking-[0.2em]">Optional</span>
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

              <LessonExperiencePanel
                courseId={nooraniQaidaCourseData.id}
                lessonId={currentLesson.id}
                lessonTitle={currentLesson.title}
                lessonContext={lessonContext}
                estimatedMinutes={currentLesson.estimatedTime}
                keyTakeaways={currentLesson.content.keyPoints}
                reflectionQuestions={reflectionQuestions}
                references={lessonReferences}
                userId={user?.uid}
                userName={user?.displayName}
                userRole={user?.role}
                completed={completedLessons.includes(currentLesson.id)}
                quizAttempts={currentLessonQuizStats.attempts}
                bestQuizScore={currentLessonQuizStats.bestScore}
                extensionAvailable={optionalLessonResources.length > 0}
                courseLessons={allLessons.map((lesson) => ({ id: lesson.id, title: lesson.title }))}
                overallProgress={overallProgress}
                currentLessonIndex={currentLessonIndex}
                totalLessons={allLessons.length}
                recitationTarget={recitationTarget}
              />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCompleteLesson}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:from-primary-400 hover:to-accent-400 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={20} />
                  Mark Complete & Continue
                </button>
                {currentLesson.quiz && (
                  <button
                    onClick={() => setShowQuiz(true)}
                    className="flex-1 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
                  >
                    Take Quiz
                  </button>
                )}
              </div>
            </div>

            {/* Key Points */}
            {currentLesson.content.keyPoints.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Key Takeaways</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentLesson.content.keyPoints.map((point, i) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 p-3 rounded-lg">
                      <span className="text-primary-400 font-bold">✓</span>
                      <p className="text-slate-200 text-sm">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Badges */}
            {badges.length > 0 && (
              <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="text-yellow-400" size={20} />
                  Badges Earned
                </h3>
                <div className="space-y-3">
                  {badges.map((badge) => (
                    <div key={badge.id} className="bg-white/5 p-3 rounded-lg">
                      <div className="text-2xl mb-2">{badge.icon}</div>
                      <p className="font-bold text-white text-sm">{badge.name}</p>
                      <p className="text-slate-400 text-xs">{badge.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Streak */}
            {streakDays > 0 && (
              <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-2xl p-6 text-center">
                <div className="text-4xl mb-2">🔥</div>
                <p className="text-2xl font-black text-orange-300">{streakDays} Day Streak</p>
                <p className="text-orange-200 text-sm mt-2">Keep studying daily to maintain your streak!</p>
              </div>
            )}

            {/* Course Navigation */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-6 max-h-96 overflow-y-auto">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <BookOpen size={20} />
                All Lessons
              </h3>
              <div className="space-y-2">
                {nooraniQaidaCourseData.sections.map((section) => (
                  <div key={section.id}>
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2 mt-4 first:mt-0">
                      {section.icon} {section.title.split(':')[1]?.trim()}
                    </p>
                    <div className="space-y-1">
                      {section.lessons.map((lesson) => {
                        const isCompleted = completedLessons.includes(lesson.id);
                        const isCurrent = lesson.id === currentLessonId;

                        return (
                          <button
                            key={lesson.id}
                            onClick={() => handleNavigateLesson(lesson.id)}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              isCurrent
                                ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                                : isCompleted
                                ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                                : 'bg-white/5 text-slate-200 hover:bg-white/10'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="truncate">
                                {isCompleted && '✓'} {lesson.title}
                              </span>
                              {!isCompleted && <BookOpen size={14} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Download Resources */}
            {currentLesson.pdfUrl && (
              <button className="w-full px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 font-bold transition-all flex items-center justify-center gap-2">
                <Download size={18} />
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quiz Modal */}
      {showQuiz && currentLesson.quiz && (
        <QuizModal quiz={currentLesson.quiz} onClose={() => setShowQuiz(false)} onPass={handleCompleteLesson} onResult={handleQuizResult} />
      )}
    </div>
  );
};

// Simple Quiz Modal Component
const QuizModal: React.FC<{
  quiz: any;
  onClose: () => void;
  onPass: () => void;
  onResult: (score: number) => void;
}> = ({ quiz, onClose, onPass, onResult }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const question = quiz.questions[currentQuestion];

  const handleSelectAnswer = (optionId: string) => {
    if (optionId === question.correctAnswer) {
      setScore(score + question.points);
    }

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculatePercentage = () => Math.round((score / (quiz.questions.length * 10)) * 100);
  const passed = calculatePercentage() >= quiz.passingScore;

  useEffect(() => {
    if (showResult) {
      onResult(calculatePercentage());
    }
  }, [onResult, score, showResult]);

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">{passed ? '✅' : '❌'}</div>
          <h2 className="text-3xl font-black text-white mb-2">{passed ? 'Passed!' : 'Try Again'}</h2>
          <p className="text-slate-300 mb-6">
            Score: <span className="text-2xl font-bold text-primary-400">{calculatePercentage()}%</span>
          </p>
          <div className="space-y-3">
            {passed && (
              <button
                onClick={onPass}
                className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:from-primary-400 hover:to-accent-400 transition-all"
              >
                Continue to Next Lesson
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!question) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Question {currentQuestion + 1} of {quiz.questions.length}</h2>
            <span className="text-sm text-slate-400">Pass: {quiz.passingScore}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all"
              style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mb-6">{question.question}</h3>

        <div className="space-y-3">
          {question.options?.map((option: any, idx: number) => (
            <button
              key={idx}
              onClick={() => handleSelectAnswer(option.id)}
              className="w-full text-left px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 hover:border-primary-500/50 transition-all"
            >
              {option.text}
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full px-4 py-2 text-slate-400 hover:text-white transition-colors"
        >
          Close Quiz
        </button>
      </div>
    </div>
  );
};

export default NooraniQaidaCoursePlayer;
