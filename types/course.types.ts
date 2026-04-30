export interface CourseOutcome {
  id: string;
  description: string;
}

export type CourseAgeGroup = 'children' | 'preteens' | 'youth' | 'adults' | 'all';

export type CourseCategory =
  | 'quran'
  | 'islamic-studies'
  | 'general-knowledge'
  | 'life-skills'
  | 'digital-skills'
  | 'language-learning'
  | 'science'
  | 'information-technology'
  | 'artificial-intelligence';

export type CourseLanguage = 'dari' | 'pashto' | 'english' | 'arabic' | 'persian' | 'urdu';

export interface LessonOutline {
  id: string;
  title: string;
  hasVideo?: boolean;
  hasText?: boolean;
  hasQuiz?: boolean;
}

export interface WeekPlan {
  week: number;
  title: string;
  topics: string[];
}

export interface TeacherInfo {
  qualification: string;
  experience: string;
  languages: string[];
  gender?: 'male' | 'female' | 'both';
}

export interface PricingTier {
  sessions: number;
  pricePerMonth: number;
  label: string;
}

export interface Course {
  id: string;
  title: string;
  titleArabic?: string;
  category: CourseCategory;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  ageGroup?: CourseAgeGroup;
  languages?: CourseLanguage[];
  targetAudience: string;
  ageRange: string;
  duration: string;
  description: string;
  learningOutcomes: CourseOutcome[];
  syllabus: WeekPlan[];
  classFormat: {
    duration: string;
    mode: string[];
    materials: string[];
  };
  requirements: string[];
  teacherInfo: TeacherInfo;
  pricing: PricingTier[];
  priceType?: 'free' | 'paid';
  lowBandwidthFriendly?: boolean;
  lessonOutline?: LessonOutline[];
  thumbnail?: string;
  demoVideo?: string;
}
