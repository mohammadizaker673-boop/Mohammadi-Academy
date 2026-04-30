/**
 * Quran Tajweed Learning Types
 * Complete course structure for Quran with Tajweed
 */

// TAJ WEED RULES
export interface TajweedRule {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  definition: string;
  examples: {
    ayah: string;
    ayahTranslation: string;
    explanation: string;
  }[];
  makhrajPoints?: string[]; // Articulation points
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: 'noon-rules' | 'meem-rules' | 'hamza' | 'madd' | 'other';
}

// MAKHRAJ (ARTICULATION POINTS)
export interface Makhraj {
  id: string;
  name: string;
  nameArabic: string;
  description: string;
  letters: string[];
  pronunciation: string;
  videoUrl?: string;
  audioProof?: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// LESSON STRUCTURE
export interface TajweedLesson {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  order: number;
  duration: number; // minutes
  content: {
    introduction: string;
    mainContent: string;
    keyPoints: string[];
    relatedRules: string[]; // TajweedRule IDs
    relatedMakhraj?: string[]; // Makhraj IDs
  };
  learningObjectives: string[];
  audioUrl?: string;
  videoUrl?: string;
  pdfUrl?: string;
  ayahsIncluded?: string[]; // Quranic verses
  completed: boolean;
  progress: number; // 0-100
}

// PRACTICE EXERCISE
export interface TajweedPracticeExercise {
  id: string;
  lessonId: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  type: 'identify-rule' | 'apply-rule' | 'audio-recognition' | 'makhraj-drill' | 'ayah-recitation';
  difficulty: number; // 1-5
  questions: TajweedQuestion[];
  totalQuestionsToPass: number;
  timeLimit?: number; // minutes
  completed: boolean;
  score?: number;
}

export interface TajweedQuestion {
  id: string;
  type: 'multiple-choice' | 'audio-recognition' | 'makhraj-practice' | 'short-answer' | 'ayah-analyze';
  question: string;
  questionArabic?: string;
  ayah?: string; // Quranic verse
  audioUrl?: string;
  imageUrl?: string;
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  correctAnswer?: string;
  answerExplanation: string;
  relatedRule?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

// JAP PRONUNCIATION PRACTICE
export interface TajweedPronunciationLesson {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  makhrajId: string;
  // Articulation points for this lesson
  articulation: {
    place: string; // مخرج
    manner: string; // صفة
    letterExamples: string[];
  };
  audioProof: string;
  practiceAyahs: string[];
  recordingExercises: PronunciationExercise[];
  isFeedbackEnabled: boolean;
  completed: boolean;
}

export interface PronunciationExercise {
  id: string;
  ayah: string;
  ayahTranslation: string;
  audioProof: string;
  focusPoints: string[]; // What to focus on
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// ASSESSMENT
export interface TajweedAssessment {
  id: string;
  type: 'practice-test' | 'placement-test' | 'final-exam';
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  totalQuestions: number;
  passingScore: number; // percentage
  questions: TajweedQuestion[];
  completed: boolean;
  score?: number;
  feedback?: string;
  dateCompleted?: Date;
}

// STUDENT PROGRESS
export interface TajweedStudentProgress {
  studentId: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced';
  lessonsCompleted: number;
  totalLessons: number;
  rulesLearned: string[]; // TajweedRule IDs
  makhrajsMastered: string[]; // Makhraj IDs
  exercisesCompleted: number;
  assessmentScores: {
    assessmentId: string;
    score: number;
    date: Date;
  }[];
  overallProgress: number; // 0-100
  strengths: string[];
  areasToImprove: string[];
  lastAccessedDate: Date;
  estimatedCompletionDate: Date;
}

// TEACHER NOTES FOR STUDENT
export interface TeacherNote {
  id: string;
  studentId: string;
  teacherId: string;
  type: 'feedback' | 'guidance' | 'correction' | 'encouragement';
  topic: string;
  content: string;
  relatedLesson?: string;
  relatedExercise?: string;
  isActionable: boolean;
  date: Date;
  read: boolean;
}

// AI/TEACHER CHAT MESSAGE
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string; // teacher ID or 'ai-tutor'
  recipientId: string; // student ID
  type: 'question' | 'answer' | 'feedback' | 'suggestion' | 'encouragement';
  message: string;
  relatedContent?: {
    type: 'lesson' | 'rule' | 'exercise' | 'ayah';
    id: string;
    title: string;
  };
  audioUrl?: string; // For pronunciation feedback
  videoUrl?: string;
  timestamp: Date;
  read: boolean;
}

// OVERALL COURSE DATA
export interface QuranTajweedCourse {
  id: string;
  title: string;
  titleArabic: string;
  description: string;
  instructor: {
    name: string;
    email: string;
    expertise: string;
    bio: string;
    photoUrl?: string;
  };
  sections: {
    beginnerLessons: TajweedLesson[];
    intermediateLessons: TajweedLesson[];
    advancedLessons: TajweedLesson[];
  };
  tajweedRules: TajweedRule[];
  makharijLessons: TajweedPronunciationLesson[];
  practiceExercises: TajweedPracticeExercise[];
  assessments: TajweedAssessment[];
  totalDuration: number; // hours
  learningOutcomes: string[];
  prerequisites: string[];
  certificateAvailable: boolean;
  isActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

// STUDENT ENROLLMENT
export interface TajweedStudentEnrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: Date;
  progress: TajweedStudentProgress;
  teacherAssigned?: string; // Teacher ID
  notes: TeacherNote[];
  conversations: string[]; // Chat conversation IDs
  certificateEarned?: {
    id: string;
    earnedDate: Date;
    certificateLevel: 'beginner' | 'intermediate' | 'advanced' | 'complete';
  };
}

// SAMPLE QURAN TAJWEED DATA
export const QURAN_TAJWEED_COURSE_DATA: QuranTajweedCourse = {
  id: 'quran-tajweed',
  title: 'Quran with Tajweed - Complete Learning System',
  titleArabic: 'القرآن الكريم بالتجويد',
  description: 'Master the rules of proper Quranic recitation with comprehensive lessons from beginner to advanced levels',
  instructor: {
    name: 'Qari Master',
    email: 'qari@academy.com',
    expertise: 'Quran Recitation & Tajweed Rules',
    bio: 'Expert in Tajweed with 20+ years of experience'
  },
  sections: {
    beginnerLessons: [],
    intermediateLessons: [],
    advancedLessons: []
  },
  tajweedRules: [],
  makharijLessons: [],
  practiceExercises: [],
  assessments: [],
  totalDuration: 120, // 120 hours
  learningOutcomes: [
    'Understand the fundamentals of Tajweed',
    'Master proper articulation points (Makhraj)',
    'Apply Tajweed rules correctly',
    'Recite Quran with proper rules',
    'Develop consistent practice habits'
  ],
  prerequisites: ['Basic Arabic reading'],
  certificateAvailable: true,
  isActive: true,
  createdDate: new Date(),
  updatedDate: new Date()
};
