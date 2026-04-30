export type TeacherStatus = 'active' | 'inactive' | 'on-leave';

export interface Teacher {
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
  
  // Professional Info
  qualification: string[];
  specializations: string[];
  experienceYears: number;
  joiningDate: string;
  
  // Teaching Info
  maxStudents: number;
  currentStudents: number;
  assignedStudentIds: string[];
  availability: {
    days: string[];
    timeSlots: string[];
  };
  
  // Compensation
  salaryType: 'monthly' | 'per-student' | 'hourly';
  salaryAmount: number;
  
  // Status
  status: TeacherStatus;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}

export interface TeacherFormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female';
  nationality: string;
  qualification: string[];
  specializations: string[];
  experienceYears: number;
  maxStudents: number;
  salaryType: 'monthly' | 'per-student' | 'hourly';
  salaryAmount: number;
}
