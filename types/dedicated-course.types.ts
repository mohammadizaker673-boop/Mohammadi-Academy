import { Course } from './course.types';

export type CourseModuleTone = 'emerald' | 'blue' | 'amber' | 'rose' | 'violet' | 'cyan';
export type CourseModuleBlockType = 'text' | 'callout' | 'list' | 'reflection' | 'case-study';

export interface CourseModuleFeature {
  icon: string;
  title: string;
  description: string;
}

export interface CourseModuleBenefit {
  icon: string;
  title: string;
  description: string;
  tone: CourseModuleTone;
}

export interface CourseModuleStaffMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  qualification: string;
  experience: string;
  languages: string[];
  focus: string;
}

export interface CourseModuleResourceHighlight {
  title: string;
  description: string;
  type: string;
}

export interface CourseModuleContentBlock {
  type: CourseModuleBlockType;
  title?: string;
  content?: string;
  items?: string[];
  arabicText?: string;
  transliteration?: string;
  caption?: string;
}

export interface CourseModuleQuizOption {
  id: string;
  text: string;
}

export interface CourseModuleQuizQuestion {
  id: string;
  question: string;
  options: CourseModuleQuizOption[];
  correctOptionId: string;
  explanation: string;
}

export interface CourseModuleQuiz {
  title: string;
  description: string;
  passingScore: number;
  allowRetake: boolean;
  questions: CourseModuleQuizQuestion[];
}

export interface CourseModuleLessonResource {
  id: string;
  title: string;
  description: string;
  type: string;
  includedItems?: string[];
  isOptional?: boolean;
  isExternal?: boolean;
  url?: string;
}

export interface CourseModuleLesson {
  id: string;
  sectionId: string;
  order: number;
  title: string;
  description: string;
  estimatedMinutes: number;
  objectives: string[];
  blocks: CourseModuleContentBlock[];
  keyPoints: string[];
  materials: string[];
  resources?: CourseModuleLessonResource[];
  optionalResources?: CourseModuleLessonResource[];
  staffNote?: string;
  quiz?: CourseModuleQuiz;
}

export interface CourseModuleSection {
  id: string;
  title: string;
  description: string;
  icon: string;
  lessons: CourseModuleLesson[];
}

export interface CourseModuleMilestone {
  threshold: number;
  name: string;
  description: string;
  icon: string;
}

export interface CourseModuleEarnedMilestone extends CourseModuleMilestone {
  earnedAt: string;
}

export interface CourseModuleAdminStats {
  totalEnrollments: number;
  activeStudents: number;
  completionRate: number;
  averageScore: number;
}

export interface CourseModuleLessonMetric {
  lessonId: string;
  studentCount: number;
  completionRate: number;
  averageScore: number;
  updatedLabel: string;
}

export interface CourseModuleProgress {
  studentId: string;
  courseId: string;
  currentLessonId: string;
  completedLessons: string[];
  overallProgress: number;
  streakCount: number;
  earnedMilestones: CourseModuleEarnedMilestone[];
}

export interface DedicatedCourseModule {
  metadata: Course;
  publicRoute: string;
  studentRoute: string;
  adminRoute: string;
  heroBadge: string;
  heroHeadline: string;
  heroSummary: string;
  estimatedHours: number;
  sections: CourseModuleSection[];
  features: CourseModuleFeature[];
  benefits: CourseModuleBenefit[];
  staff: CourseModuleStaffMember[];
  resourceHighlights: CourseModuleResourceHighlight[];
  milestoneBadges: CourseModuleMilestone[];
  adminStats: CourseModuleAdminStats;
  lessonMetrics: CourseModuleLessonMetric[];
  enrollmentCta: string;
}