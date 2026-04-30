// Course Management System Types

export interface CourseManagement {
  id: string;
  title: string;
  description: string;
  category:
    | 'quran'
    | 'arabic'
    | 'islamic-studies'
    | 'general-knowledge'
    | 'life-skills'
    | 'digital-skills'
    | 'language-learning'
    | 'science'
    | 'information-technology'
    | 'other';
  type: 'online' | 'offline' | 'both';
  price: number;
  teacherId?: string;
  status: 'draft' | 'published' | 'archived';
  thumbnailUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  content: string;
  orderIndex: number;
  videoUrl?: string;
  pdfUrl?: string;
  duration?: number;
  homework?: string;
  status: 'draft' | 'published';
  createdAt: Date;
}

export interface MediaFile {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: 'image' | 'video' | 'pdf' | 'document';
  fileSize: number;
  uploadedBy: string;
  createdAt: Date;
}

export interface CourseEnrollment {
  id: string;
  courseId: string;
  studentId: string;
  enrolledAt: Date;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
  completedLessons: string[];
}
