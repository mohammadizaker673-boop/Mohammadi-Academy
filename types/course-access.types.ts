import { UserRole } from './auth.types';

export type CourseAccessSourceType = 'catalog' | 'automated';

export interface CourseAccessRecord {
  id: string;
  courseKey: string;
  courseId: string;
  sourceType: CourseAccessSourceType;
  courseTitle: string;
  allowAllStudents: boolean;
  allowAllTeachers: boolean;
  studentIds: string[];
  teacherIds: string[];
  updatedAt?: Date;
  updatedBy?: string;
}

export interface RestrictedCourseAccessParams {
  userId: string;
  role: UserRole;
  courseId: string;
  sourceType: CourseAccessSourceType;
  isPremiumCourse: boolean;
}

export interface AccessiblePremiumCourseCard {
  courseId: string;
  sourceType: CourseAccessSourceType;
  title: string;
  description: string;
  category: string;
  accessLabel: string;
  accessSource: 'assignment' | 'subscription';
  openPath: string;
}