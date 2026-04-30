export type StudentType = 'online' | 'offline';
export type StudentStatus = 'active' | 'inactive' | 'suspended' | 'graduated';
export type StudentLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Student {
  id: string;
  userId: string | null;
  
  // Personal Info
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  age: number;
  gender: 'male' | 'female';
  nationality: string;
  photo?: string;
  
  // Parent/Guardian Info
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  
  // Student Type
  studentType: StudentType;
  
  // Academic Info
  enrollmentDate: string;
  currentCourse: string;
  level: StudentLevel;
  assignedTeacherId: string | null;
  schedule: {
    days: string[];
    timeSlot: string;
    meetingLink?: string;
  };
  
  // Progress Tracking
  progress: {
    currentSurah: string;
    currentAyah: number;
    memorizedSurahs: string[];
    completionPercentage: number;
  };
  
  // Fee Information
  feePackage: 'monthly' | 'quarterly' | 'yearly';
  monthlyFee: number;
  
  // Status
  status: StudentStatus;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface StudentFormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  nationality: string;
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  studentType: StudentType;
  currentCourse: string;
  level: StudentLevel;
  feePackage: 'monthly' | 'quarterly' | 'yearly';
  monthlyFee: number;
}
