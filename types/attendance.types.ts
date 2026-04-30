export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  date: string;
  status: AttendanceStatus;
  lessonTopic?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceFormData {
  studentId: string;
  date: string;
  status: AttendanceStatus;
  lessonTopic?: string;
  notes?: string;
}
