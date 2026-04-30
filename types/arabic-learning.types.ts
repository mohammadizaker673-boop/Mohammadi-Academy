// Arabic Language Learning System Types

export type ArabicLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type DialectType = 'MSA' | 'Egyptian' | 'Levantine' | 'Gulf' | 'Moroccan';

export type LearningGoal = 'travel' | 'academic' | 'quran' | 'conversation' | 'professional';

export type LearningSpeed = 'slow' | 'normal' | 'intensive';

export type ExerciseType = 
  | 'multiple-choice'
  | 'fill-blank'
  | 'sentence-building'
  | 'translation'
  | 'listening'
  | 'speaking'
  | 'writing';

export interface ArabicWord {
  id: string;
  arabic: string;
  transliteration: string;
  english: string;
  exampleSentence: string;
  level: ArabicLevel;
  category?: string;
}

export interface ArabicLesson {
  id: string;
  level: ArabicLevel;
  title: string;
  description: string;
  order: number;
  topics: string[];
  vocabulary: ArabicWord[];
  grammarRules: GrammarRule[];
  exercises: Exercise[];
  minimumScore: number;
}

export interface GrammarRule {
  id: string;
  title: string;
  explanation: string;
  examples: {
    arabic: string;
    transliteration: string;
    english: string;
  }[];
  level: ArabicLevel;
}

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  questionArabic?: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface StudentProgress {
  userId: string;
  currentLevel: ArabicLevel;
  completedLessons: string[];
  vocabularyMastered: string[];
  weakAreas: string[];
  scores: {
    lessonId: string;
    score: number;
    date: Date;
  }[];
  overallProgress: number;
  lastStudied: Date;
  preferences: {
    goal: LearningGoal;
    dialect?: DialectType;
    speed: LearningSpeed;
  };
}

export interface PlacementTestQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  level: ArabicLevel;
  category: 'grammar' | 'vocabulary' | 'reading';
}

export interface LessonResult {
  lessonId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  weakTopics: string[];
  timeSpent: number;
  date: Date;
}

export interface PronunciationGuide {
  letter: string;
  name: string;
  transliteration: string;
  articulationPoint: string;
  examples: string[];
  audioUrl?: string;
  similarLetters?: string[];
}

export interface DialectLesson {
  id: string;
  dialect: DialectType;
  msaWord: string;
  dialectWord: string;
  explanation: string;
  examples: string[];
}

export interface ClassicalArabicLesson {
  id: string;
  title: string;
  quranicVerse?: string;
  rootWord: string;
  morphology: string;
  explanation: string;
  usage: string[];
}
