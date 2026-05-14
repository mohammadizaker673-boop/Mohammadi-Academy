import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Circle,
  Clock3,
  ChevronLeft,
  ChevronRight,
  Headphones,
  LayoutGrid,
  Mic,
  Play,
  Radio,
  RotateCcw,
  Star,
  Video,
  Volume2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  CourseModuleContentBlock,
  CourseModuleEarnedMilestone,
  CourseModuleLesson,
  CourseModuleProgress,
  DedicatedCourseModule,
} from '../../types/dedicated-course.types';
import VoiceRecordingWidget from './VoiceRecordingWidget';
import AIPronunciationFeedback from './AIPronunciationFeedback';
import { PronunciationAnalysisResult } from '../../services/aiPronunciationService';

/* ─────────────────── types ─────────────────── */
type LessonStep = 'intro' | 'learn' | 'practice' | 'quiz' | 'complete';
type NooraniWorkspaceTab = 'lesson' | 'live-classes' | 'practice-room' | 'homework' | 'ai-tutor' | 'revision-center' | 'class-recordings' | 'tajweed-lab' | 'pronunciation-studio';

interface LetterCardProps {
  letter: string;
  name: string;
  transliteration: string;
  makhraj: string;
  onPlay: (rate?: number) => void;
  confirmed: boolean;
  onConfirm: () => void;
}

interface NooraniLessonPlayerProps {
  course: DedicatedCourseModule;
}

/* ─────────────────── helpers ─────────────────── */
const speakArabic = (text: string, rate = 0.9) => {
  if (!('speechSynthesis' in window) || !text) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'ar-SA';
  utt.rate = rate;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utt);
};

const stepLabel: Record<LessonStep, string> = {
  intro: 'Introduction',
  learn: 'Learn',
  practice: 'Practice',
  quiz: 'Quiz',
  complete: 'Complete',
};

const STEPS: LessonStep[] = ['intro', 'learn', 'practice', 'quiz', 'complete'];

const WORKSPACE_TABS: Array<{ id: NooraniWorkspaceTab; label: string }> = [
  { id: 'lesson', label: 'Lesson' },
  { id: 'live-classes', label: 'Live Classes' },
  { id: 'practice-room', label: 'Practice Room' },
  { id: 'homework', label: 'Homework' },
  { id: 'ai-tutor', label: 'AI Tutor' },
  { id: 'revision-center', label: 'Revision Center' },
  { id: 'class-recordings', label: 'Class Recordings' },
  { id: 'tajweed-lab', label: 'Tajweed Lab' },
  { id: 'pronunciation-studio', label: 'Pronunciation Studio' },
];

const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, seconds);
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/* ─────────────────── LetterCard ─────────────────── */
const LetterCard: React.FC<LetterCardProps> = ({
  letter, name, transliteration, makhraj, onPlay, confirmed, onConfirm,
}) => (
  <div
    className={`rounded-3xl border-2 p-6 flex flex-col items-center gap-3 transition-all ${
      confirmed
        ? 'border-green-500/60 bg-green-500/10'
        : 'border-white/10 bg-slate-800/60 hover:border-primary-500/40'
    }`}
  >
    <p className="text-6xl font-arabic text-white leading-none select-none">{letter}</p>
    <div className="text-center">
      <p className="text-white font-black text-lg">{name}</p>
      <p className="text-slate-400 text-sm italic">{transliteration}</p>
      <p className="text-slate-500 text-xs mt-1">{makhraj}</p>
    </div>
    <div className="flex gap-2 w-full">
      <button
        type="button"
        onClick={() => onPlay(0.9)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-primary-500/20 text-primary-200 text-xs font-bold hover:bg-primary-500/30 transition"
      >
        <Volume2 size={14} /> Normal
      </button>
      <button
        type="button"
        onClick={() => onPlay(0.55)}
        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-accent-500/20 text-accent-200 text-xs font-bold hover:bg-accent-500/30 transition"
      >
        <Play size={14} /> Slow
      </button>
    </div>
    <button
      type="button"
      onClick={onConfirm}
      className={`w-full py-2 rounded-xl text-sm font-black transition ${
        confirmed
          ? 'bg-green-500/30 text-green-200 cursor-default'
          : 'bg-white/10 text-slate-200 hover:bg-primary-500/20 hover:text-primary-200'
      }`}
      disabled={confirmed}
    >
      {confirmed ? '✓ Understood' : 'I understand this letter'}
    </button>
  </div>
);

/* ─────────────────── PracticeBlock ─────────────────── */
const PracticeBlock: React.FC<{ block: CourseModuleContentBlock; lessonId: string; index: number }> = ({
  block, lessonId, index,
}) => {
  const [heard, setHeard] = useState<Set<number>>(new Set());

  if (block.type === 'audio-letter' && block.letters?.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-accent-300 font-black">{block.title}</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {block.letters.map((l, i) => (
            <LetterCard
              key={`${lessonId}-${index}-${i}`}
              letter={l.letter}
              name={l.name}
              transliteration={l.transliteration}
              makhraj={l.makhraj}
              onPlay={(rate) => speakArabic(l.letter, rate)}
              confirmed={heard.has(i)}
              onConfirm={() => setHeard(prev => new Set([...prev, i]))}
            />
          ))}
        </div>
      </div>
    );
  }

  if ((block.type === 'letter-practice' || block.type === 'join-animation') && block.practiceItems?.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-accent-300 font-black">{block.title}</p>
        <div className="grid sm:grid-cols-2 gap-4">
          {block.practiceItems.map((item, i) => (
            <div
              key={`${lessonId}-${index}-practice-${i}`}
              className="rounded-2xl bg-slate-800/60 border border-white/10 p-5 flex flex-col gap-3"
            >
              <p className="text-right text-4xl font-arabic text-white">{item.arabic}</p>
              <div>
                <p className="text-slate-300 italic text-sm">{item.transliteration}</p>
                {item.meaning && <p className="text-slate-500 text-xs mt-1">{item.meaning}</p>}
              </div>
              <button
                type="button"
                onClick={() => { speakArabic(item.arabic, 0.7); setHeard(prev => new Set([...prev, i])); }}
                className="flex items-center justify-center gap-2 py-2 rounded-xl bg-primary-500/20 text-primary-200 text-sm font-bold hover:bg-primary-500/30 transition"
              >
                <Volume2 size={15} /> Hear it
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (block.type === 'pronunciation-guide' && block.articulationZones?.length) {
    return (
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.2em] text-accent-300 font-black">{block.title}</p>
        <div className="grid sm:grid-cols-2 gap-3">
          {block.articulationZones.map((zone, i) => (
            <div key={`${lessonId}-${index}-zone-${i}`} className="rounded-2xl bg-slate-800/60 border border-white/10 p-4">
              <p className="text-white font-black">{zone.zone}</p>
              <p
                className="text-2xl text-primary-200 font-arabic mt-1 cursor-pointer"
                onClick={() => speakArabic(zone.letters, 0.7)}
                title="Tap to hear"
              >
                {zone.letters}
              </p>
              <p className="text-slate-400 text-xs mt-1">{zone.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

/* ─────────────────── ContentBlock ─────────────────── */
const ContentBlock: React.FC<{ block: CourseModuleContentBlock }> = ({ block }) => {
  if (block.type === 'audio-letter' || block.type === 'letter-practice' || block.type === 'join-animation' || block.type === 'pronunciation-guide') return null;

  return (
    <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-5 space-y-3">
      {block.title && <p className="text-white font-black text-lg">{block.title}</p>}
      {block.content && <p className="text-slate-200 leading-relaxed">{block.content}</p>}
      {block.arabicText && (
        <div className="bg-slate-950/40 rounded-xl p-4 text-right">
          <p className="text-white text-3xl font-arabic">{block.arabicText}</p>
          {block.transliteration && <p className="text-slate-400 italic text-sm mt-2">{block.transliteration}</p>}
        </div>
      )}
      {block.items?.length && (
        <ul className="space-y-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
              <span className="w-2 h-2 rounded-full bg-primary-400 mt-1.5 shrink-0" />
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

/* ─────────────────── QuizPanel ─────────────────── */
const QuizPanel: React.FC<{
  lesson: CourseModuleLesson;
  onPass: (score: number) => void;
}> = ({ lesson, onPass }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);

  if (!lesson.quiz) {
    return (
      <div className="text-center py-12">
        <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4" />
        <p className="text-white font-black text-xl">No quiz for this lesson</p>
        <p className="text-slate-400 mt-2">You can mark it complete.</p>
        <button
          type="button"
          onClick={() => onPass(100)}
          className="mt-6 px-8 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black hover:from-primary-400 hover:to-accent-400 transition"
        >
          Mark Complete
        </button>
      </div>
    );
  }

  const total = lesson.quiz.questions.length;

  const handleSubmit = () => {
    const correct = lesson.quiz!.questions.filter(q => answers[q.id] === q.correctOptionId).length;
    const score = total === 0 ? 0 : Math.round((correct / total) * 100);
    const passed = score >= lesson.quiz!.passingScore;
    setResult({ score, passed });
    if (passed) onPass(score);
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-5">
        <h3 className="text-white font-black text-xl">{lesson.quiz.title}</h3>
        <p className="text-slate-300 text-sm mt-1">{lesson.quiz.description}</p>
        <p className="text-xs text-slate-500 mt-1">Pass score: {lesson.quiz.passingScore}%</p>
      </div>

      <div className="space-y-4">
        {lesson.quiz.questions.map((q, i) => (
          <div key={q.id} className="rounded-2xl bg-slate-800/60 border border-white/10 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-primary-300 font-black mb-2">Question {i + 1}</p>
            <p className="text-white font-semibold mb-4">{q.question}</p>
            <div className="space-y-2">
              {q.options.map(opt => {
                const selected = answers[q.id] === opt.id;
                const isCorrect = opt.id === q.correctOptionId;
                const showResult = result !== null;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={showResult}
                    onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.id }))}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition text-sm ${
                      showResult
                        ? isCorrect
                          ? 'border-green-500/60 bg-green-500/15 text-white'
                          : selected
                            ? 'border-red-500/60 bg-red-500/15 text-white'
                            : 'border-white/5 bg-white/5 text-slate-400'
                        : selected
                          ? 'border-primary-400 bg-primary-500/15 text-white'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    {opt.text}
                  </button>
                );
              })}
            </div>
            {result && (
              <p className="text-xs text-slate-400 mt-3 italic">{q.explanation}</p>
            )}
          </div>
        ))}
      </div>

      {result ? (
        <div className={`rounded-2xl border p-5 text-center ${result.passed ? 'border-green-500/40 bg-green-500/10' : 'border-yellow-500/40 bg-yellow-500/10'}`}>
          <p className="text-3xl font-black text-white">{result.score}%</p>
          <p className="text-sm text-slate-200 mt-2">
            {result.passed ? '🎉 Great job! You passed this lesson.' : `You need ${lesson.quiz!.passingScore}% to pass. Try again!`}
          </p>
          {!result.passed && lesson.quiz.allowRetake && (
            <button
              type="button"
              onClick={handleRetake}
              className="mt-4 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition mx-auto"
            >
              <RotateCcw size={16} /> Try Again
            </button>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < total}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black hover:from-primary-400 hover:to-accent-400 transition disabled:opacity-40"
        >
          Submit Quiz
        </button>
      )}
    </div>
  );
};

/* ─────────────────── Main Component ─────────────────── */
const NooraniLessonPlayer: React.FC<NooraniLessonPlayerProps> = ({ course }) => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const lessons = useMemo(() => course.sections.flatMap(s => s.lessons), [course]);
  const firstId = lessons[0]?.id ?? '';

  const storageKey = user?.uid ? `${course.metadata.id}-progress-${user.uid}` : null;

  const [currentLessonId, setCurrentLessonId] = useState(firstId);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [earnedMilestones, setEarnedMilestones] = useState<CourseModuleEarnedMilestone[]>([]);
  const [step, setStep] = useState<LessonStep>('intro');
  const [quizPassed, setQuizPassed] = useState(false);
  const [celebrationLesson, setCelebrationLesson] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<NooraniWorkspaceTab>('lesson');
  const [pronunciationResult, setPronunciationResult] = useState<PronunciationAnalysisResult | null>(null);
  const [selectedLetterForRecording, setSelectedLetterForRecording] = useState<string | null>(null);
  const [sessionCountdown, setSessionCountdown] = useState(32 * 60);

  const sessionRecordings = [
    { id: 'r1', title: 'Makharij: Letters from the Tongue', duration: '19 min' },
    { id: 'r2', title: 'Noon Sakinah Rules Practice', duration: '14 min' },
    { id: 'r3', title: 'Full Lesson Correction Replay', duration: '27 min' },
  ];

  const currentLesson = useMemo(() => lessons.find(l => l.id === currentLessonId), [lessons, currentLessonId]);
  const currentSection = useMemo(() => course.sections.find(s => s.lessons.some(l => l.id === currentLessonId)), [course, currentLessonId]);
  const currentIndex = useMemo(() => lessons.findIndex(l => l.id === currentLessonId), [lessons, currentLessonId]);
  const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;
  const overallProgress = lessons.length === 0 ? 0 : Math.round((completedLessons.length / lessons.length) * 100);

  const practiceBlocks = useMemo(() => currentLesson?.blocks.filter(b =>
    ['audio-letter', 'letter-practice', 'join-animation', 'pronunciation-guide'].includes(b.type)
  ) ?? [], [currentLesson]);

  const contentBlocks = useMemo(() => currentLesson?.blocks.filter(b =>
    !['audio-letter', 'letter-practice', 'join-animation', 'pronunciation-guide'].includes(b.type)
  ) ?? [], [currentLesson]);

  const hasPracticeContent = practiceBlocks.length > 0;
  const hasQuiz = Boolean(currentLesson?.quiz);

  const availableSteps: LessonStep[] = useMemo(() => {
    const s: LessonStep[] = ['intro', 'learn'];
    if (hasPracticeContent) s.push('practice');
    if (hasQuiz) s.push('quiz');
    s.push('complete');
    return s;
  }, [hasPracticeContent, hasQuiz]);

  /* auth redirect */
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login', { state: { from: { pathname: course.studentRoute } } });
    }
  }, [authLoading, user, navigate, course.studentRoute]);

  /* load progress */
  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as CourseModuleProgress;
        setCurrentLessonId(parsed.currentLessonId || firstId);
        setCompletedLessons(parsed.completedLessons || []);
        setEarnedMilestones(parsed.earnedMilestones || []);
      }
    } catch { /* ignore */ }
  }, [storageKey, firstId]);

  /* save progress */
  useEffect(() => {
    if (!storageKey || !user?.uid) return;
    const progress: CourseModuleProgress = {
      studentId: user.uid,
      courseId: course.metadata.id,
      currentLessonId,
      completedLessons,
      overallProgress,
      streakCount: Math.ceil(completedLessons.length / 3),
      earnedMilestones,
    };
    localStorage.setItem(storageKey, JSON.stringify(progress));
  }, [completedLessons, currentLessonId, earnedMilestones, overallProgress, storageKey, user?.uid, course.metadata.id]);

  /* reset step on lesson change */
  useEffect(() => {
    setStep('intro');
    setQuizPassed(false);
    setPronunciationResult(null);
    setSelectedLetterForRecording(null);
    setActiveWorkspaceTab('lesson');
  }, [currentLessonId]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSessionCountdown(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const goToStep = (s: LessonStep) => setStep(s);

  const goToNextStep = () => {
    const idx = availableSteps.indexOf(step);
    if (idx < availableSteps.length - 1) setStep(availableSteps[idx + 1]);
  };

  const goToPrevStep = () => {
    const idx = availableSteps.indexOf(step);
    if (idx > 0) setStep(availableSteps[idx - 1]);
  };

  const awardMilestones = (newCompleted: string[]) => {
    const existingThresholds = new Set(earnedMilestones.map(m => m.threshold));
    const newlyEarned = course.milestoneBadges
      .filter(m => newCompleted.length >= m.threshold && !existingThresholds.has(m.threshold))
      .map(m => ({ ...m, earnedAt: new Date().toISOString() }));
    if (newlyEarned.length > 0) setEarnedMilestones(prev => [...prev, ...newlyEarned]);
  };

  const handleCompleteLesson = () => {
    if (!currentLesson) return;
    const updated = completedLessons.includes(currentLesson.id)
      ? completedLessons
      : [...completedLessons, currentLesson.id];
    setCompletedLessons(updated);
    awardMilestones(updated);
    setCelebrationLesson(currentLesson.id);
    setStep('complete');
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      setCurrentLessonId(nextLesson.id);
      setCelebrationLesson(null);
    }
  };

  const handleLessonSelect = (id: string) => {
    setCurrentLessonId(id);
    setSidebarOpen(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (!currentLesson) return null;

  const isCompleted = completedLessons.includes(currentLesson.id);
  const canComplete = !hasQuiz || quizPassed || isCompleted;

  /* ─── step progress bar ─── */
  const stepIndex = availableSteps.indexOf(step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-primary-900/50 to-slate-900 flex flex-col">

      {/* ── top header ── */}
      <header className="sticky top-0 z-30 bg-slate-900/95 border-b border-white/10 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(prev => !prev)}
            className="lg:hidden p-2 rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
          >
            <BookOpen size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.25em] text-primary-300 font-black truncate">{course.heroBadge}</p>
            <p className="text-white font-black text-sm sm:text-base truncate">{currentLesson.title}</p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-400">{completedLessons.length}/{lessons.length} done</span>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all" style={{ width: `${overallProgress}%` }} />
            </div>
            <span className="text-xs font-black text-primary-400">{overallProgress}%</span>
          </div>
        </div>

        {/* step progress */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
            {availableSteps.map((s, i) => (
              <React.Fragment key={s}>
                <button
                  type="button"
                  onClick={() => goToStep(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-[0.15em] whitespace-nowrap transition ${
                    s === step
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                      : i < stepIndex
                        ? 'bg-green-500/20 text-green-300'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {i < stepIndex && s !== step ? '✓ ' : ''}{stepLabel[s]}
                </button>
                {i < availableSteps.length - 1 && (
                  <div className={`h-px flex-1 min-w-4 rounded transition ${i < stepIndex ? 'bg-green-500/50' : 'bg-white/10'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
            {WORKSPACE_TABS.map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveWorkspaceTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-[0.14em] whitespace-nowrap transition ${
                  activeWorkspaceTab === tab.id
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── main layout ── */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 gap-6 relative">

        {/* ── sidebar: lesson list ── */}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-72 bg-slate-900/98 border-r border-white/10 overflow-y-auto pt-20 pb-8 px-4
          transform transition-transform duration-200 lg:static lg:transform-none lg:w-72 lg:shrink-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="space-y-4">
            {course.sections.map(section => (
              <div key={section.id}>
                <div className="flex items-center gap-2 mb-2 px-2">
                  <span className="text-xl">{section.icon}</span>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 leading-tight">{section.title}</p>
                </div>
                <div className="space-y-1">
                  {section.lessons.map(lesson => {
                    const done = completedLessons.includes(lesson.id);
                    const active = lesson.id === currentLessonId;
                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleLessonSelect(lesson.id)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl transition flex items-center gap-2.5 ${
                          active
                            ? 'bg-gradient-to-r from-primary-500/25 to-accent-500/10 border border-primary-500/40 text-white'
                            : 'hover:bg-white/5 text-slate-300 border border-transparent'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 text-xs ${
                          done ? 'bg-green-500 border-green-500 text-white' : active ? 'border-primary-400 text-primary-400' : 'border-slate-600 text-slate-500'
                        }`}>
                          {done ? '✓' : lesson.order}
                        </span>
                        <span className="text-xs font-semibold leading-tight">{lesson.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* sidebar overlay for mobile */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── lesson content ── */}
        <main className="flex-1 min-w-0 space-y-6">

          <div className="xl:hidden rounded-2xl bg-slate-800/60 border border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-sky-300 font-black">Live Session Panel</p>
                <p className="text-white font-semibold mt-1">Ustadh Kareem is online now</p>
                <p className="text-xs text-slate-400 mt-1">Next class starts in {formatCountdown(sessionCountdown)}</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('live-classes')}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-primary-500 text-white text-xs font-black hover:from-sky-400 hover:to-primary-400 transition"
              >
                Join Live Class
              </button>
            </div>
          </div>

          {activeWorkspaceTab !== 'lesson' && (
            <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6 space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-primary-300 font-black">Noorani Smart Workspace</p>
                  <h3 className="text-2xl font-black text-white mt-1">{WORKSPACE_TABS.find(t => t.id === activeWorkspaceTab)?.label}</h3>
                </div>
                {activeWorkspaceTab === 'live-classes' && (
                  <button
                    type="button"
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-primary-500 text-white text-sm font-black hover:from-sky-400 hover:to-primary-400 transition flex items-center gap-2"
                  >
                    <Video size={16} /> Join Live Class
                  </button>
                )}
              </div>

              {activeWorkspaceTab === 'live-classes' && (
                <div className="grid lg:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4 lg:col-span-2">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Upcoming Scheduled Lesson</p>
                    <p className="text-white font-black text-lg mt-2">Group Tajweed: Makharij Precision</p>
                    <div className="grid sm:grid-cols-3 gap-3 mt-4">
                      <div className="rounded-xl bg-slate-900/70 border border-white/10 p-3">
                        <p className="text-slate-500 text-[11px] uppercase tracking-[0.18em]">Teacher Status</p>
                        <p className="text-emerald-300 text-sm font-bold mt-1 flex items-center gap-2"><Circle size={10} fill="currentColor" /> Online</p>
                      </div>
                      <div className="rounded-xl bg-slate-900/70 border border-white/10 p-3">
                        <p className="text-slate-500 text-[11px] uppercase tracking-[0.18em]">Countdown</p>
                        <p className="text-white text-sm font-bold mt-1 flex items-center gap-2"><Clock3 size={14} /> {formatCountdown(sessionCountdown)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-900/70 border border-white/10 p-3">
                        <p className="text-slate-500 text-[11px] uppercase tracking-[0.18em]">Class Mode</p>
                        <p className="text-sky-200 text-sm font-bold mt-1">Live + Screen Share</p>
                      </div>
                    </div>
                    <div className="mt-4 grid sm:grid-cols-2 gap-3 text-sm text-slate-200">
                      <p className="rounded-xl bg-slate-900/60 p-3 border border-white/10">Teacher highlighting and drawing tools enabled.</p>
                      <p className="rounded-xl bg-slate-900/60 p-3 border border-white/10">Student microphone monitoring and instant correction ready.</p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black mb-3">Session Recordings</p>
                    <div className="space-y-2">
                      {sessionRecordings.map(recording => (
                        <button
                          key={recording.id}
                          type="button"
                          className="w-full text-left rounded-xl bg-slate-900/70 border border-white/10 p-3 hover:bg-slate-800/80 transition"
                        >
                          <p className="text-sm text-white font-semibold leading-snug">{recording.title}</p>
                          <p className="text-xs text-slate-400 mt-1">{recording.duration}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeWorkspaceTab === 'practice-room' && (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {['10-minute guided revision', 'Voice repetition drills', 'Interactive flashcards', 'Listening tests', 'Speed challenge', 'Makharij focus cycle'].map(item => (
                    <div key={item} className="rounded-2xl bg-slate-900/70 border border-white/10 p-4 text-slate-200 text-sm">{item}</div>
                  ))}
                </div>
              )}

              {activeWorkspaceTab === 'homework' && (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-4 text-sm text-slate-200">Upload voice recording for teacher review.</div>
                  <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-4 text-sm text-slate-200">Submit reading video and written Arabic practice.</div>
                  <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-4 text-sm text-slate-200">Receive approve/reject and voice feedback.</div>
                </div>
              )}

              {['ai-tutor', 'revision-center', 'class-recordings', 'tajweed-lab', 'pronunciation-studio'].includes(activeWorkspaceTab) && (
                <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-5">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    This module is now wired into the Noorani workspace shell. Next step is connecting the real backend flow
                    for AI responses, teacher actions, recordings, and analytics in this tab.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeWorkspaceTab === 'lesson' && (
            <>

          {/* ── INTRO STEP ── */}
          {step === 'intro' && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 p-8">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.25em] text-accent-300 font-black">Lesson {currentLesson.order}</p>
                    <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">{currentLesson.title}</h2>
                    <p className="text-slate-300 mt-3 leading-relaxed max-w-2xl">{currentLesson.description}</p>
                  </div>
                  <div className="text-5xl shrink-0">{currentSection?.icon ?? '📖'}</div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-black">Duration</p>
                    <p className="text-white font-black text-lg mt-1">{currentLesson.estimatedMinutes} min</p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-black">Status</p>
                    <p className={`font-black text-lg mt-1 ${isCompleted ? 'text-green-400' : 'text-white'}`}>
                      {isCompleted ? '✓ Done' : 'Not started'}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4">
                    <p className="text-xs text-slate-500 uppercase tracking-[0.2em] font-black">Your streak</p>
                    <p className="text-white font-black text-lg mt-1">🔥 {completedLessons.length} lessons</p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary-300 mb-4">What you will learn</h3>
                <ul className="space-y-2">
                  {currentLesson.objectives.map(obj => (
                    <li key={obj} className="flex items-start gap-3 text-slate-200 text-sm">
                      <span className="w-5 h-5 rounded-full bg-primary-500/30 text-primary-300 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                      {obj}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={goToNextStep}
                  className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black text-lg hover:from-primary-400 hover:to-accent-400 transition shadow-xl shadow-primary-900/40 flex items-center justify-center gap-3"
                >
                  Start Learning <ChevronRight size={22} />
                </button>
              </div>
            </div>
          )}

          {/* ── LEARN STEP ── */}
          {step === 'learn' && (
            <div className="space-y-4">
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6">
                <h3 className="text-xl font-black text-white mb-1">{currentLesson.title}</h3>
                <p className="text-slate-400 text-sm">Read through the content below carefully.</p>
              </div>
              {contentBlocks.map((block, i) => (
                <ContentBlock key={i} block={block} />
              ))}
              {contentBlocks.length === 0 && (
                <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-8 text-center text-slate-400">
                  This lesson's content is in the Practice step.
                </div>
              )}
              <div className="flex gap-3">
                <button type="button" onClick={goToPrevStep} className="px-5 py-3 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition flex items-center gap-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <button type="button" onClick={goToNextStep} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black hover:from-primary-400 hover:to-accent-400 transition flex items-center justify-center gap-2">
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── PRACTICE STEP ── */}
          {step === 'practice' && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6">
                <h3 className="text-xl font-black text-white mb-1">Interactive Practice</h3>
                <p className="text-slate-400 text-sm flex items-center gap-2">
                  <Volume2 size={14} /> Tap each letter to hear it, then confirm you understand it.
                </p>
              </div>
              {practiceBlocks.map((block, i) => (
                <div key={i} className="rounded-3xl bg-slate-800/60 border border-white/10 p-6">
                  <PracticeBlock block={block} lessonId={currentLesson.id} index={i} />
                </div>
              ))}
              {practiceBlocks.length === 0 && (
                <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-8 text-center text-slate-400">
                  No interactive practice for this lesson.
                </div>
              )}
              
              {/* ── Voice Recording Section ── */}
              {currentLesson.blocks.some(b => b.type === 'audio-letter' || b.type === 'letter-practice' || b.type === 'join-animation') && user?.uid && (
                <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6">
                  <h4 className="text-lg font-black text-white mb-2 flex items-center gap-2">
                    <Mic size={20} className="text-accent-400" />
                    Voice Practice
                  </h4>
                  <p className="text-slate-300 text-sm mb-6">
                    Record yourself reciting the letters to get instant AI-powered pronunciation feedback.
                  </p>
                  
                  {/* Letter Selection */}
                  {!selectedLetterForRecording && !pronunciationResult && (
                    <div className="space-y-3">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-bold mb-3">Select a letter to practice</p>
                      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                        {['ا', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'ه', 'و', 'ي'].map(letter => (
                          <button
                            key={letter}
                            type="button"
                            onClick={() => setSelectedLetterForRecording(letter)}
                            className="px-3 py-2 rounded-lg bg-white/10 text-white text-lg font-arabic font-bold hover:bg-primary-500/30 transition border border-white/10 hover:border-primary-500/40"
                          >
                            {letter}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Recording Widget */}
                  {selectedLetterForRecording && (
                    <div className="space-y-4">
                      <VoiceRecordingWidget
                        letter={selectedLetterForRecording}
                        studentId={user.uid}
                        lessonId={currentLesson.id}
                        onAnalysisComplete={(result) => {
                          setPronunciationResult(result);
                        }}
                      />
                      
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedLetterForRecording(null);
                          setPronunciationResult(null);
                        }}
                        className="text-xs text-slate-400 hover:text-slate-300 transition"
                      >
                        ← Choose another letter
                      </button>
                    </div>
                  )}
                  
                  {/* Feedback Display */}
                  {pronunciationResult && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <AIPronunciationFeedback result={pronunciationResult} />
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex gap-3">
                <button type="button" onClick={goToPrevStep} className="px-5 py-3 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition flex items-center gap-2">
                  <ChevronLeft size={18} /> Back
                </button>
                <button type="button" onClick={goToNextStep} className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black hover:from-primary-400 hover:to-accent-400 transition flex items-center justify-center gap-2">
                  I'm ready for the quiz <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* ── QUIZ STEP ── */}
          {step === 'quiz' && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6">
                <h3 className="text-xl font-black text-white mb-1">Lesson Check-In</h3>
                <p className="text-slate-400 text-sm">Answer the questions below to complete this lesson.</p>
              </div>
              <QuizPanel lesson={currentLesson} onPass={(score) => { setQuizPassed(true); }} />
              {(quizPassed || !hasQuiz) && (
                <button
                  type="button"
                  onClick={handleCompleteLesson}
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-lg hover:from-green-400 hover:to-emerald-400 transition shadow-xl flex items-center justify-center gap-3"
                >
                  <CheckCircle2 size={22} /> Complete This Lesson
                </button>
              )}
              {!quizPassed && hasQuiz && (
                <button type="button" onClick={goToPrevStep} className="w-full py-3 rounded-xl bg-white/10 text-slate-200 hover:bg-white/20 transition flex items-center justify-center gap-2">
                  <ChevronLeft size={18} /> Back to Practice
                </button>
              )}
            </div>
          )}

          {/* ── COMPLETE STEP ── */}
          {step === 'complete' && (
            <div className="space-y-6">
              <div className="rounded-3xl bg-gradient-to-br from-green-500/20 to-emerald-600/10 border border-green-500/30 p-10 text-center">
                <div className="text-7xl mb-4">🎉</div>
                <h2 className="text-4xl font-black text-white">Lesson Complete!</h2>
                <p className="text-green-200 mt-3 text-lg">{currentLesson.title}</p>
                <div className="mt-6 flex items-center justify-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-3xl font-black text-white">{completedLessons.length}</p>
                    <p className="text-green-300 text-xs uppercase tracking-[0.2em]">Lessons Done</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-black text-white">{overallProgress}%</p>
                    <p className="text-green-300 text-xs uppercase tracking-[0.2em]">Course Progress</p>
                  </div>
                </div>
              </div>

              {/* earned milestones */}
              {earnedMilestones.length > 0 && (
                <div className="rounded-3xl bg-amber-500/10 border border-amber-500/20 p-6">
                  <h3 className="text-amber-300 font-black uppercase tracking-[0.2em] text-sm mb-4 flex items-center gap-2">
                    <Award size={16} /> Badges Earned
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {earnedMilestones.map(m => (
                      <div key={m.id} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30">
                        <span className="text-xl">{m.icon}</span>
                        <div>
                          <p className="text-amber-200 font-black text-sm">{m.title}</p>
                          <p className="text-amber-400 text-xs">{m.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* key takeaways */}
              <div className="rounded-3xl bg-slate-800/60 border border-white/10 p-6">
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-accent-300 mb-4">Key Takeaways</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {currentLesson.keyPoints.map(point => (
                    <div key={point} className="rounded-xl bg-white/5 p-3 text-sm text-slate-200">
                      <span className="text-accent-400 mr-2">●</span>{point}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {nextLesson ? (
                  <button
                    type="button"
                    onClick={handleNextLesson}
                    className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black text-lg hover:from-primary-400 hover:to-accent-400 transition shadow-xl flex items-center justify-center gap-3"
                  >
                    Next Lesson <ChevronRight size={22} />
                  </button>
                ) : (
                  <div className="flex-1 py-8 rounded-2xl bg-gradient-to-br from-amber-500/20 to-accent-500/10 border border-amber-500/30 text-center">
                    <Star size={32} className="text-amber-400 mx-auto mb-2" />
                    <p className="text-white font-black text-xl">Course Complete!</p>
                    <p className="text-slate-300 text-sm mt-1">You've finished all Noorani Qaida lessons. Masha'Allah!</p>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setStep('intro'); }}
                  className="px-6 py-3 rounded-2xl bg-white/10 text-slate-200 hover:bg-white/20 transition font-semibold"
                >
                  Revisit Lesson
                </button>
              </div>
            </div>
          )}

          {/* ── bottom prev/next lesson ── (only on non-complete steps) */}
          {step !== 'complete' && step !== 'intro' && (
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                disabled={!prevLesson}
                onClick={() => prevLesson && handleLessonSelect(prevLesson.id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition disabled:opacity-30 text-sm"
              >
                <ChevronLeft size={16} /> Prev Lesson
              </button>
              {isCompleted && nextLesson && (
                <button
                  type="button"
                  onClick={handleNextLesson}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500/20 text-primary-200 hover:bg-primary-500/30 transition text-sm"
                >
                  Next Lesson <ChevronRight size={16} />
                </button>
              )}
            </div>
          )}

            </>
          )}

        </main>

        <aside className="hidden xl:block w-80 shrink-0">
          <div className="sticky top-36 rounded-3xl bg-slate-800/70 border border-white/10 p-5 space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-sky-300 font-black flex items-center gap-2">
              <Radio size={14} /> Live Session Panel
            </p>
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-4">
              <p className="text-slate-500 text-[11px] uppercase tracking-[0.18em]">Teacher Online Status</p>
              <p className="text-emerald-300 text-sm font-bold mt-1 flex items-center gap-2"><Circle size={10} fill="currentColor" /> Ustadh Kareem Online</p>
              <p className="text-xs text-slate-400 mt-3">Upcoming scheduled lesson in {formatCountdown(sessionCountdown)}</p>
              <button
                type="button"
                onClick={() => setActiveWorkspaceTab('live-classes')}
                className="mt-3 w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-primary-500 text-white text-xs font-black hover:from-sky-400 hover:to-primary-400 transition"
              >
                Join Live Class
              </button>
            </div>
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-4">
              <p className="text-slate-500 text-[11px] uppercase tracking-[0.18em] mb-2">Classroom Tools</p>
              <div className="space-y-2 text-xs text-slate-300">
                <p className="flex items-center gap-2"><LayoutGrid size={14} /> Screen share Noorani pages</p>
                <p className="flex items-center gap-2"><Headphones size={14} /> Slow audio playback</p>
                <p className="flex items-center gap-2"><Mic size={14} /> Live microphone correction</p>
                <p className="flex items-center gap-2"><Calendar size={14} /> Scheduled class reminders</p>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-900/70 border border-white/10 p-4">
              <p className="text-slate-500 text-[11px] uppercase tracking-[0.18em] mb-2">Session Recording Archive</p>
              <div className="space-y-2">
                {sessionRecordings.map(recording => (
                  <button
                    key={`desktop-${recording.id}`}
                    type="button"
                    onClick={() => setActiveWorkspaceTab('class-recordings')}
                    className="w-full text-left rounded-xl bg-white/5 border border-white/10 p-2.5 hover:bg-white/10 transition"
                  >
                    <p className="text-xs text-white font-semibold">{recording.title}</p>
                    <p className="text-[11px] text-slate-400 mt-1">{recording.duration}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default NooraniLessonPlayer;
