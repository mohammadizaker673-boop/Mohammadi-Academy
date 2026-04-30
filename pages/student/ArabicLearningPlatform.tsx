import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  BookOpen, 
  Brain, 
  Trophy, 
  TrendingUp, 
  Volume2, 
  Edit3, 
  MessageCircle, 
  Target,
  Award,
  Clock,
  CheckCircle,
  Lock
} from 'lucide-react';
import { StudentProgress, ArabicLevel, LearningGoal, LearningSpeed, DialectType, LessonResult, Exercise } from '../../types/arabic-learning.types';
import { arabicLessonsIndex, LessonMetadata } from '../../data/arabicLessonsIndex';

// Import assessment questions for practice
const assessmentQuestions: Exercise[] = [
  {
    id: 'q1',
    type: 'multiple-choice',
    question: 'What is the Arabic word for "water"?',
    questionArabic: 'ما كلمة "water" بالعربية؟',
    options: ['طعام', 'ماء', 'كتاب', 'باب'],
    correctAnswer: 'ماء',
    explanation: 'ماء (māʾ) means "water". طعام means "food", كتاب means "book", باب means "door".',
    difficulty: 'easy',
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    question: 'How do you say "hello" in Arabic?',
    options: ['شكرا', 'مرحبا', 'وداعا', 'معك'],
    correctAnswer: 'مرحبا',
    explanation: 'مرحبا (Marḥaban) means "hello". It is one of the most common greetings.',
    difficulty: 'easy',
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    question: 'What is the feminine form of the Arabic word "teacher"?',
    questionArabic: 'ما صيغة المؤنث من كلمة "معلم" (muʿallim)?',
    options: ['معلم', 'معلمة', 'معلمي', 'معلمهم'],
    correctAnswer: 'معلمة',
    explanation: 'معلمة (muʿallima) is the feminine form. In Arabic, we usually add ة (taa marbuta) to make masculine words feminine.',
    difficulty: 'medium',
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    question: 'Read the sentence: "البيت كبير" - What does this mean?',
    options: ['The house is small', 'The house is big', 'The house is white', 'The house is old'],
    correctAnswer: 'The house is big',
    explanation: 'البيت (al-bayt) = the house, كبير (kabīr) = big. So "البيت كبير" means "The house is big".',
    difficulty: 'medium',
  },
];

// Lazy load heavy components
const LessonViewer = lazy(() => import('../../components/arabic/LessonViewer'));
const PlacementTest = lazy(() => import('../../components/arabic/PlacementTest'));
const PracticeExercises = lazy(() => import('../../components/arabic/PracticeExercises'));
const PronunciationPractice = lazy(() => import('../../components/arabic/PronunciationPractice'));
const AssessmentCenter = lazy(() => import('../../components/arabic/AssessmentCenter'));
const AILanguageTutor = lazy(() => import('../../components/arabic/AILanguageTutor'));

// Component to load lesson content on-demand
const LazyLessonLoader: React.FC<{
  lessonId: string;
  onComplete: (result: LessonResult) => void;
  onExit: () => void;
}> = ({ lessonId, onComplete, onExit }) => {
  const [lesson, setLesson] = useState<any>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const loadLessonContent = async () => {
      try {
        const { arabicLessons } = await import('../../data/arabicCurriculum');
        const foundLesson = arabicLessons.find(l => l.id === lessonId);
        
        if (mounted) {
          if (foundLesson) {
            setLesson(foundLesson);
          } else {
            setLoadError('Lesson not found');
          }
        }
      } catch (error) {
        console.error('Error loading lesson content:', error);
        if (mounted) {
          setLoadError('Failed to load lesson content');
        }
      }
    };

    loadLessonContent();
    
    return () => {
      mounted = false;
    };
  }, [lessonId]);

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{loadError}</p>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Lessons
          </button>
        </div>
      </div>
    );
  }

  if (!lesson) {
    return <LoadingScreen message="Loading lesson content..." />;
  }

  return (
    <Suspense fallback={<LoadingScreen message="Initializing lesson..." />}>
      <LessonViewer lesson={lesson} onComplete={onComplete} onExit={onExit} />
    </Suspense>
  );
};

type ViewMode = 'dashboard' | 'lessons' | 'practice' | 'pronunciation' | 'assessment' | 'tutor';

const ArabicLearningPlatform: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showPlacementTest, setShowPlacementTest] = useState(false);
  const [progress, setProgress] = useState<StudentProgress | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lessonsMetadata] = useState<LessonMetadata[]>(arabicLessonsIndex); // Fast, lightweight
  const [showAlphabet, setShowAlphabet] = useState(false);
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  
  // Onboarding state
  const [learningGoal, setLearningGoal] = useState<LearningGoal>('conversation');
  const [preferredDialect, setPreferredDialect] = useState<DialectType>('MSA');
  const [learningSpeed, setLearningSpeed] = useState<LearningSpeed>('normal');

  useEffect(() => {
    if (!authLoading) {
      loadUserProgress();
    }
  }, [user, authLoading]);

  const loadUserProgress = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    // Admins and teachers get instant access with a default progress (no onboarding)
    if (user.role === 'admin' || user.role === 'teacher') {
      const savedProgress = localStorage.getItem(`arabic-progress-${user.uid}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      } else {
        const defaultProgress: StudentProgress = {
          userId: user.uid,
          currentLevel: 'A1',
          completedLessons: [],
          vocabularyMastered: [],
          weakAreas: [],
          scores: [],
          overallProgress: 0,
          lastStudied: new Date(),
          preferences: { goal: 'conversation', dialect: 'MSA', speed: 'normal' }
        };
        setProgress(defaultProgress);
      }
      setIsLoading(false);
      return;
    }
    
    try {
      // Load from localStorage or Firebase
      const savedProgress = localStorage.getItem(`arabic-progress-${user.uid}`);
      if (savedProgress) {
        setProgress(JSON.parse(savedProgress));
      } else {
        setShowOnboarding(true);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startLearning = async () => {
    if (!user) return;
    
    const newProgress: StudentProgress = {
      userId: user.uid,
      currentLevel: 'A1',
      completedLessons: [],
      vocabularyMastered: [],
      weakAreas: [],
      scores: [],
      overallProgress: 0,
      lastStudied: new Date(),
      preferences: {
        goal: learningGoal,
        dialect: preferredDialect,
        speed: learningSpeed
      }
    };
    
    setProgress(newProgress);
    localStorage.setItem(`arabic-progress-${user.uid}`, JSON.stringify(newProgress));
    setShowOnboarding(false);
    setShowPlacementTest(true);
  };

  const handlePlacementTestComplete = (level: ArabicLevel) => {
    if (!progress || !user) return;
    
    const updatedProgress = {
      ...progress,
      currentLevel: level
    };
    
    setProgress(updatedProgress);
    localStorage.setItem(`arabic-progress-${user.uid}`, JSON.stringify(updatedProgress));
    setShowPlacementTest(false);
  };

  const handleLessonComplete = async (result: LessonResult) => {
    if (!progress || !user) return;
    
    const updatedProgress = {
      ...progress,
      completedLessons: [...progress.completedLessons, result.lessonId],
      scores: [...progress.scores, {
        lessonId: result.lessonId,
        score: result.score,
        date: new Date()
      }],
      weakAreas: [...new Set([...progress.weakAreas, ...result.weakTopics])],
      lastStudied: new Date(),
      overallProgress: progress.overallProgress + (100 / lessonsMetadata.length)
    };
    
    setProgress(updatedProgress);
    localStorage.setItem(`arabic-progress-${user.uid}`, JSON.stringify(updatedProgress));
    setSelectedLesson(null);
    
    // Show success message
    alert(`Lesson completed! Score: ${Math.round(result.score)}%`);
  };

  const getLevelLessons = (level: ArabicLevel) => {
    return lessonsMetadata.filter(lesson => lesson.level === level);
  };

  const isLessonUnlocked = (lessonOrder: number, level: ArabicLevel) => {
    if (!progress) return false;
    if (lessonOrder === 1) return true; // First lesson always unlocked
    
    const levelLessons = getLevelLessons(level);
    const previousLesson = levelLessons.find(l => l.order === lessonOrder - 1);
    
    return previousLesson ? progress.completedLessons.includes(previousLesson.id) : false;
  };

  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black text-white mb-4">
                🌙 Welcome to Arabic Learning
              </h1>
              <p className="text-xl text-slate-300">
                Let's personalize your learning journey
              </p>
            </div>

            {/* Learning Goal */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-white mb-4">
                What's your goal for learning Arabic?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { value: 'travel', label: 'Travel', icon: '✈️' },
                  { value: 'academic', label: 'Academic', icon: '🎓' },
                  { value: 'quran', label: 'Quran', icon: '📖' },
                  { value: 'conversation', label: 'Conversation', icon: '💬' },
                  { value: 'professional', label: 'Professional', icon: '💼' }
                ].map(goal => (
                  <button
                    key={goal.value}
                    onClick={() => setLearningGoal(goal.value as LearningGoal)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      learningGoal === goal.value
                        ? 'border-primary-400 bg-primary-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-slate-300 hover:border-primary-400/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{goal.icon}</div>
                    <div className="font-bold">{goal.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dialect Preference */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-white mb-4">
                Which dialect would you like to learn?
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  { value: 'MSA', label: 'Modern Standard Arabic' },
                  { value: 'Egyptian', label: 'Egyptian' },
                  { value: 'Levantine', label: 'Levantine' },
                  { value: 'Gulf', label: 'Gulf' },
                  { value: 'Moroccan', label: 'Moroccan' }
                ].map(dialect => (
                  <button
                    key={dialect.value}
                    onClick={() => setPreferredDialect(dialect.value as DialectType)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      preferredDialect === dialect.value
                        ? 'border-primary-400 bg-primary-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-slate-300 hover:border-primary-400/50'
                    }`}
                  >
                    <div className="font-bold text-sm">{dialect.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Learning Speed */}
            <div className="mb-8">
              <label className="block text-lg font-bold text-white mb-4">
                What's your preferred learning pace?
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'slow', label: 'Slow & Steady', desc: '15 min/day' },
                  { value: 'normal', label: 'Normal', desc: '30 min/day' },
                  { value: 'intensive', label: 'Intensive', desc: '60+ min/day' }
                ].map(speed => (
                  <button
                    key={speed.value}
                    onClick={() => setLearningSpeed(speed.value as LearningSpeed)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      learningSpeed === speed.value
                        ? 'border-primary-400 bg-primary-500/20 text-white'
                        : 'border-white/20 bg-white/5 text-slate-300 hover:border-primary-400/50'
                    }`}
                  >
                    <div className="font-bold mb-1">{speed.label}</div>
                    <div className="text-xs text-slate-400">{speed.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startLearning}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-blue-500 text-white font-black text-lg rounded-xl hover:from-primary-600 hover:to-blue-600 transition-all"
            >
              Start Learning Arabic
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showPlacementTest) {
    return (
      <Suspense fallback={<LoadingScreen message="Loading placement test..." />}>
        <PlacementTest
          onComplete={handlePlacementTestComplete}
          onSkip={() => {
            setShowPlacementTest(false);
          }}
        />
      </Suspense>
    );
  }

  if (selectedLesson) {
    // Lazy load full lesson content only when needed
    return (
      <Suspense fallback={<LoadingScreen message="Loading lesson content..." />}>
        <LazyLessonLoader lessonId={selectedLesson} onComplete={handleLessonComplete} onExit={() => setSelectedLesson(null)} />
      </Suspense>
    );
  }

  if (authLoading || isLoading) {
    return <LoadingScreen message="Initializing Arabic Learning Platform..." />;
  }

  // Require login (only for unauthenticated visitors on the public website)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 max-w-md text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-4">Login Required</h2>
          <p className="text-slate-300 mb-6">Please log in as a student to access the Arabic Learning Platform</p>
          <a
            href="/login"
            className="inline-block px-8 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    );
  }

  // If not loading and there is still no progress, something went wrong
  if (!progress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center px-6">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-black text-white mb-4">Unable to Load</h2>
          <p className="text-slate-300 mb-6">There was an error loading your progress. Please try refreshing the page.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  const currentProgress = progress;
  const currentLevelLessons = getLevelLessons(currentProgress.currentLevel);
  const completionRate = currentLevelLessons.length > 0 
    ? (currentProgress.completedLessons.length / currentLevelLessons.length) * 100 
    : 0;

  // Render specific view content
  const renderViewContent = () => {
    if (currentView === 'lessons') {
      return (
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white">
              Level {currentProgress.currentLevel} - Lessons
            </h2>
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors text-sm font-bold"
            >
              ← Back to Dashboard
            </button>
          </div>
          <div className="text-sm font-bold text-slate-300 mb-6">
            {currentProgress.completedLessons.length} / {currentLevelLessons.length} completed
          </div>
          <div className="space-y-4">
            {currentLevelLessons.map((lesson) => {
              const isCompleted = currentProgress.completedLessons.includes(lesson.id);
              const isUnlocked = isLessonUnlocked(lesson.order, currentProgress.currentLevel);
              
              return (
                <div
                  key={lesson.id}
                  className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                    isCompleted
                      ? 'border-green-400 bg-green-500/10'
                      : isUnlocked
                      ? 'border-primary-400 bg-primary-500/10 hover:bg-primary-500/20'
                      : 'border-white/10 bg-white/5 opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => isUnlocked && setSelectedLesson(lesson.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-black text-primary-400">
                          Lesson {lesson.order}
                        </span>
                        {isCompleted && <CheckCircle className="text-green-400" size={20} />}
                        {!isUnlocked && <Lock className="text-slate-400" size={20} />}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{lesson.title}</h3>
                      <p className="text-sm text-slate-300 mb-3">{lesson.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {lesson.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-slate-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isUnlocked && !isCompleted && (
                      <button className="ml-4 px-6 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors">
                        Start
                      </button>
                    )}
                    {isCompleted && (
                      <button className="ml-4 px-6 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors">
                        Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    if (currentView === 'practice') {
      return (
        <Suspense fallback={<LoadingScreen message="Loading practice exercises..." />}>
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              ← Back to Dashboard
            </button>
            <PracticeExercises 
              exercises={assessmentQuestions} 
              onComplete={(score, total) => {
                const newScore = (score / 100) * total;
                alert(`Practice completed! Score: ${Math.round(score)}%`);
                setCurrentView('dashboard');
              }}
            />
          </div>
        </Suspense>
      );
    }

    if (currentView === 'pronunciation') {
      return (
        <Suspense fallback={<LoadingScreen message="Loading pronunciation trainer..." />}>
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold mb-4"
            >
              ← Back to Dashboard
            </button>
            <PronunciationPractice />
          </div>
        </Suspense>
      );
    }

    if (currentView === 'assessment') {
      return (
        <Suspense fallback={<LoadingScreen message="Loading assessment center..." />}>
          <div className="space-y-4">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold mb-4"
            >
              ← Back to Dashboard
            </button>
            <AssessmentCenter />
          </div>
        </Suspense>
      );
    }

    if (currentView === 'tutor') {
      return (
        <Suspense fallback={<LoadingScreen message="Loading AI Language Tutor..." />}>
          <div className="absolute inset-0 z-50">
            <button
              onClick={() => setCurrentView('dashboard')}
              className="absolute top-4 left-4 z-50 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold"
            >
              ← Back to Dashboard
            </button>
            <AILanguageTutor />
          </div>
        </Suspense>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-black text-white mb-4">
            🌙 Arabic Learning Platform
          </h1>
          <p className="text-xl text-slate-300">
            Your AI-Powered Journey to Arabic Mastery
          </p>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="text-primary-400" size={24} />
              <span className="text-2xl font-black text-white">{currentProgress.currentLevel}</span>
            </div>
            <p className="text-sm text-slate-300">Current Level</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="text-green-400" size={24} />
              <span className="text-2xl font-black text-white">{currentProgress.completedLessons.length}</span>
            </div>
            <p className="text-sm text-slate-300">Lessons Completed</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="text-blue-400" size={24} />
              <span className="text-2xl font-black text-white">{currentProgress.vocabularyMastered.length}</span>
            </div>
            <p className="text-sm text-slate-300">Words Mastered</p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="text-yellow-400" size={24} />
              <span className="text-2xl font-black text-white">{Math.round(completionRate)}%</span>
            </div>
            <p className="text-sm text-slate-300">Level Progress</p>
          </div>
        </div>

        {/* Learning Modules */}
        {currentView === 'dashboard' ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <button
                onClick={() => setCurrentView('lessons')}
                className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-left hover:scale-105 transition-transform"
              >
                <BookOpen className="text-white mb-3" size={32} />
                <h3 className="text-xl font-black text-white mb-2">Lessons</h3>
                <p className="text-sm text-blue-100">Structured learning path</p>
                <div className="mt-4 text-xs text-blue-200 font-bold">→ Click to view all lessons</div>
              </button>

              <button
                onClick={() => setCurrentView('practice')}
                className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 text-left hover:scale-105 transition-transform"
              >
                <Brain className="text-white mb-3" size={32} />
                <h3 className="text-xl font-black text-white mb-2">Practice</h3>
                <p className="text-sm text-purple-100">Interactive exercises</p>
                <div className="mt-4 text-xs text-purple-200 font-bold">→ Click to start practicing</div>
              </button>

              <button
                onClick={() => setCurrentView('pronunciation')}
                className="bg-gradient-to-br from-green-500 to-green-700 rounded-2xl p-6 text-left hover:scale-105 transition-transform"
              >
                <Volume2 className="text-white mb-3" size={32} />
                <h3 className="text-xl font-black text-white mb-2">Pronunciation</h3>
                <p className="text-sm text-green-100">Master Arabic sounds</p>
                <div className="mt-4 text-xs text-green-200 font-bold">→ Click to practice pronunciation</div>
              </button>

              <button
                onClick={() => setCurrentView('assessment')}
                className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-6 text-left hover:scale-105 transition-transform"
              >
                <Target className="text-white mb-3" size={32} />
                <h3 className="text-xl font-black text-white mb-2">Assessment</h3>
                <p className="text-sm text-orange-100">Test your knowledge</p>
                <div className="mt-4 text-xs text-orange-200 font-bold">→ Click to take tests</div>
              </button>

              <button
                onClick={() => setCurrentView('tutor')}
                className="bg-gradient-to-br from-pink-500 to-pink-700 rounded-2xl p-6 text-left hover:scale-105 transition-transform md:col-span-1 lg:col-span-1"
              >
                <MessageCircle className="text-white mb-3" size={32} />
                <h3 className="text-xl font-black text-white mb-2">AI Tutor</h3>
                <p className="text-sm text-pink-100">Learn from AI assistant</p>
                <div className="mt-4 text-xs text-pink-200 font-bold">→ Start chatting now</div>
              </button>
            </div>

            {/* Quick Lessons Preview on Dashboard */}
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white">
              Level {currentProgress.currentLevel} - Quick Start
            </h2>
            <button
              onClick={() => setCurrentView('lessons')}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-bold"
            >
              View All Lessons →
            </button>
          </div>
          <div className="text-sm font-bold text-slate-300 mb-6">
            {currentProgress.completedLessons.length} / {currentLevelLessons.length} lessons completed
          </div>

          <div className="space-y-4">
            {currentLevelLessons.slice(0, 3).map((lesson) => {
              const isCompleted = currentProgress.completedLessons.includes(lesson.id);
              const isUnlocked = isLessonUnlocked(lesson.order, lesson.level);
              
              return (
                <div
                  key={lesson.id}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    isCompleted
                      ? 'border-green-400 bg-green-500/10'
                      : isUnlocked
                      ? 'border-primary-400 bg-primary-500/10 cursor-pointer hover:bg-primary-500/20'
                      : 'border-white/10 bg-white/5 opacity-50'
                  }`}
                  onClick={() => isUnlocked && setSelectedLesson(lesson.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-black text-primary-400">
                          Lesson {lesson.order}
                        </span>
                        {isCompleted && <CheckCircle className="text-green-400" size={20} />}
                        {!isUnlocked && <Lock className="text-slate-400" size={20} />}
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">{lesson.title}</h3>
                      <p className="text-sm text-slate-300 mb-3">{lesson.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {lesson.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-white/10 rounded-full text-xs font-bold text-slate-300"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isUnlocked && !isCompleted && (
                      <button className="ml-4 px-6 py-2 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-colors">
                        Start
                      </button>
                    )}
                    {isCompleted && (
                      <button className="ml-4 px-6 py-2 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-colors">
                        Review
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {currentLevelLessons.length > 3 && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setCurrentView('lessons')}
                  className="px-8 py-3 bg-primary-500/20 text-primary-300 rounded-lg hover:bg-primary-500/30 transition-colors font-bold"
                >
                  View All {currentLevelLessons.length} Lessons →
                </button>
              </div>
            )}
          </div>
        </div>
          
          {/* Alphabet Reference - Lazy Load (Only on dashboard) */}
          <div className="mt-12 bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-white">Arabic Alphabet Reference</h2>
              <button
                onClick={() => setShowAlphabet(!showAlphabet)}
                className="px-4 py-2 bg-primary-500/20 text-primary-300 rounded-lg hover:bg-primary-500/30 transition-colors text-sm font-bold"
              >
                {showAlphabet ? 'Hide' : 'Show'} Alphabet
              </button>
            </div>
            {showAlphabet && <AlphabetGrid />}
          </div>
          </>
        ) : (
          renderViewContent()
        )}
      </div>
    </div>
  );
};

// Loading Screen Component
const LoadingScreen: React.FC<{ message?: string }> = ({ message = 'Loading...' }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-400 mb-4"></div>
      <p className="text-white text-xl font-bold">{message}</p>
      <p className="text-slate-400 text-sm mt-2">Please wait...</p>
    </div>
  </div>
);

// Alphabet Grid Component (Lazy Loaded)
const AlphabetGrid: React.FC = React.memo(() => {
  const [arabicAlphabet, setArabicAlphabet] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lazy load alphabet data
    import('../../data/arabicCurriculum').then(({ arabicAlphabet: alphabet }) => {
      setArabicAlphabet(alphabet);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="text-center text-slate-400 py-8">Loading alphabet...</div>;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      {arabicAlphabet.map((letter) => (
        <div
          key={letter.letter}
          className="bg-white/5 rounded-xl p-4 text-center hover:bg-white/10 transition-colors cursor-pointer"
          title={`${letter.name} - ${letter.articulationPoint}`}
        >
          <div className="text-4xl font-bold text-white mb-2">{letter.letter}</div>
          <div className="text-sm font-bold text-slate-300">{letter.name}</div>
          <div className="text-xs text-slate-400">{letter.transliteration}</div>
        </div>
      ))}
    </div>
  );
});

export default ArabicLearningPlatform;
