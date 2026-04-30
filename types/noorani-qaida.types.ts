// Noorani Qaida & Prayer Course System Types

export type CourseLevel = 'beginner' | 'intermediate' | 'advanced';
export type LessonType = 'video' | 'interactive' | 'reading' | 'practice' | 'prayer-guide';
export type QuestionType = 'mcq' | 'trueFalse' | 'matching' | 'recording' | 'fillBlank';
export type UserLanguage = 'en' | 'ur' | 'ar';

export interface CourseSection {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
  icon: string;
}

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  description: string;
  order: number;
  type: LessonType;
  estimatedTime: number;
  videoUrl?: string;
  audioUrl?: string;
  pdfUrl?: string;
  content: LessonContent;
  exercises: Exercise[];
  quiz: Quiz;
  isUnlocked: boolean;
  thumbnail?: string;
}

export interface LessonContent {
  introduction: string;
  mainContent: ContentBlock[];
  keyPoints: string[];
  learningObjectives: string[];
  transliteration?: string;
  translation?: {
    en: string;
    ur: string;
    ar: string;
  };
}

export interface ContentBlock {
  type: 'text' | 'image' | 'audio' | 'video' | 'table';
  content: string;
  arabicText?: string;
  transliteration?: string;
  audioUrl?: string;
  imageUrl?: string;
  caption?: string;
}

export interface Exercise {
  id: string;
  type: 'dragDrop' | 'tapToHear' | 'matching' | 'recording' | 'tracing';
  title: string;
  instruction: string;
  items?: ExerciseItem[];
  audioUrl?: string;
  imageUrl?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ExerciseItem {
  id: string;
  arabicText: string;
  transliteration?: string;
  audioUrl?: string;
  imageUrl?: string;
  options?: string[];
  correctAnswer?: string;
}

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  passingScore: number;
  timeLimit?: number;
  questions: QuizQuestion[];
  allowRetake: boolean;
  maxAttempts?: number;
}

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  arabicQuestion?: string;
  options?: QuizOption[];
  correctAnswer?: string | string[];
  explanation?: string;
  audioUrl?: string;
  imageUrl?: string;
  points: number;
  order: number;
}

export interface QuizOption {
  id: string;
  text: string;
  arabicText?: string;
  transliteration?: string;
  isCorrect?: boolean;
  audioUrl?: string;
}

export interface QuizAttempt {
  id: string;
  studentId: string;
  quizId: string;
  lessonId: string;
  startedAt: Date;
  completedAt?: Date;
  score?: number;
  percentage?: number;
  passed: boolean;
  answers: QuizAnswer[];
  timeSpent?: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string | string[];
  recordingUrl?: string;
  isCorrect: boolean;
  pointsEarned: number;
}

export interface StudentProgress {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  completedAt?: Date;
  currentLessonId: string;
  currentSectionId: string;
  completedLessons: string[];
  completedQuizzes: string[];
  overallProgress: number;
  totalTimeSpent: number;
  streakDays: number;
  lastActivityDate: Date;
  badges: Badge[];
  certificateIssued: boolean;
  certificateUrl?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: Date;
  type: 'streak' | 'achievement' | 'milestone' | 'skill';
}

export interface DailyLearningPlan {
  id: string;
  studentId: string;
  date: Date;
  plannedLessons: string[];
  completedLessons: string[];
  estimatedTime: number;
  status: 'pending' | 'in-progress' | 'completed';
}

export interface Certificate {
  id: string;
  studentId: string;
  courseId: string;
  studentName: string;
  issuedAt: Date;
  certificateNumber: string;
  pdfUrl: string;
  totalTimeSpent: number;
}

export interface CourseEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: Date;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  progress: StudentProgress;
}

export interface NooraniQaidaCourse {
  id: string;
  title: string;
  description: string;
  level: CourseLevel;
  language: UserLanguage;
  thumbnail: string;
  sections: CourseSection[];
  totalLessons: number;
  estimatedDuration: number;
  instructor: {
    name: string;
    bio: string;
    image: string;
  };
  isPublished: boolean;
}
