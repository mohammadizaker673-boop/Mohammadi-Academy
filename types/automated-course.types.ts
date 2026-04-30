export type AutomatedCourseLevel = 'beginner' | 'intermediate' | 'advanced' | 'all';
export type AutomatedCourseStatus = 'draft' | 'published';

export type AutomatedLessonQuiz = {
  question: string;
  options: string[];
  correctIndex: number;
};

export type AutomatedLessonContent = {
  summary: string;
  explanation: string;
  examples: string[];
  exercise: string;
  quiz: AutomatedLessonQuiz;
};

export interface AutomatedLesson {
  id: string;
  title: string;
  order: number;
  content: AutomatedLessonContent;
}

export interface AutomatedCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  level: AutomatedCourseLevel;
  ageGroup: string;
  ageRange: string;
  language: string;
  price: number;
  priceType: 'free' | 'paid';
  accessDurationDays: number;
  status: AutomatedCourseStatus;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PrebuiltAutomatedLesson = {
  title: string;
  explanation: string;
  keyPoints: string[];
  examples: string[];
  exercise: string;
  quiz: { q: string; options: string[]; answer: number }[];
  recap: string;
  nextStep: string;
};

export type PrebuiltAutomatedCourse = {
  course: {
    title: string;
    description: string;
    level: AutomatedCourseLevel;
  };
  lessons: PrebuiltAutomatedLesson[];
};
