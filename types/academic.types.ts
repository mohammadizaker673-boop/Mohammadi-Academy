// Academic System Types

export interface Homework {
  id: string;
  courseId: string;
  lessonId?: string;
  title: string;
  description: string;
  dueDate: Date;
  assignedTo: string[]; // student IDs
  status: 'active' | 'expired';
  createdBy: string; // teacher ID
  createdAt: Date;
}

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  submissionText?: string;
  fileUrl?: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
  status: 'pending' | 'graded';
}

export interface Exam {
  id: string;
  courseId: string;
  title: string;
  description: string;
  examDate: Date;
  duration: number; // minutes
  totalMarks: number;
  passingMarks: number;
  questions: ExamQuestion[];
  status: 'draft' | 'published' | 'completed';
  createdBy: string;
  createdAt: Date;
}

export interface ExamQuestion {
  id: string;
  questionText: string;
  questionType: 'mcq' | 'short-answer' | 'long-answer';
  options?: string[]; // for MCQ
  correctAnswer?: string;
  marks: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  studentId: string;
  answers: ExamAnswer[];
  totalScore: number;
  percentage: number;
  status: 'pass' | 'fail';
  submittedAt: Date;
  gradedAt?: Date;
}

export interface ExamAnswer {
  questionId: string;
  answer: string;
  marksObtained?: number;
}

export interface Result {
  id: string;
  studentId: string;
  courseId: string;
  examId?: string;
  homeworkId?: string;
  score: number;
  totalMarks: number;
  percentage: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  remarks?: string;
  publishedAt: Date;
}
