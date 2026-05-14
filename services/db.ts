/**
 * services/db.ts
 * Unified Supabase data layer – replaces all Firebase Firestore usage.
 * Handles snake_case ↔ camelCase mapping so TypeScript interfaces stay unchanged.
 */
import { supabase } from './supabase';
import type { Student } from '../types/student.types';
import type { Teacher } from '../types/teacher.types';
import type { AttendanceRecord } from '../types/attendance.types';
import type { FeeRecord } from '../types/fee.types';
import type { Announcement } from '../types/communication.types';

// ─── helpers ────────────────────────────────────────────────────────────────

function throwOnError<T>(data: T | null, error: unknown, context: string): T {
  if (error) throw new Error(`[db/${context}] ${(error as any).message}`);
  return data as T;
}

// snake → camel mappers
const mapStudent = (r: any): Student & { id: string } => ({
  id: r.id,
  userId: r.user_id,
  fullName: r.full_name,
  email: r.email,
  phone: r.phone ?? '',
  dateOfBirth: r.date_of_birth ?? '',
  age: r.age ?? 0,
  gender: r.gender ?? 'male',
  nationality: r.nationality ?? '',
  photo: r.photo,
  parentName: r.parent_name ?? '',
  parentPhone: r.parent_phone ?? '',
  parentEmail: r.parent_email ?? '',
  studentType: r.student_type ?? 'online',
  currentCourse: r.current_course ?? 'Quran Memorization',
  level: r.level ?? 'beginner',
  assignedTeacherId: r.assigned_teacher_id ?? null,
  schedule: r.schedule ?? { days: [], timeSlot: '' },
  progress: r.progress ?? { currentSurah: '', currentAyah: 0, memorizedSurahs: [], completionPercentage: 0 },
  feePackage: r.fee_package ?? 'monthly',
  monthlyFee: r.monthly_fee ?? 0,
  enrollmentDate: r.enrollment_date ?? new Date().toISOString(),
  status: r.status ?? 'active',
  createdAt: r.created_at ?? new Date().toISOString(),
  updatedAt: r.updated_at ?? new Date().toISOString(),
});

const mapTeacher = (r: any): Teacher & { id: string } => ({
  id: r.id,
  userId: r.user_id,
  fullName: r.full_name,
  email: r.email,
  phone: r.phone ?? '',
  dateOfBirth: r.date_of_birth ?? '',
  age: r.age ?? 0,
  gender: r.gender ?? 'male',
  nationality: r.nationality ?? '',
  photo: r.photo,
  qualification: r.qualification ?? [],
  specializations: r.specializations ?? [],
  experienceYears: r.experience_years ?? 0,
  joiningDate: r.joining_date ?? new Date().toISOString(),
  maxStudents: r.max_students ?? 10,
  currentStudents: r.current_students ?? 0,
  assignedStudentIds: r.assigned_student_ids ?? [],
  availability: r.availability ?? { days: [], timeSlots: [] },
  salaryType: r.salary_type ?? 'monthly',
  salaryAmount: r.salary_amount ?? 0,
  status: r.status ?? 'active',
  createdAt: r.created_at ?? new Date().toISOString(),
  updatedAt: r.updated_at ?? new Date().toISOString(),
});

const mapAttendance = (r: any): AttendanceRecord & { id: string } => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name ?? '',
  teacherId: r.teacher_id,
  teacherName: r.teacher_name ?? '',
  date: typeof r.date === 'string' ? r.date : new Date(r.date).toISOString().split('T')[0],
  status: r.status ?? 'absent',
  lessonTopic: r.lesson_topic ?? '',
  notes: r.notes ?? '',
  createdAt: r.created_at ?? new Date().toISOString(),
  updatedAt: r.updated_at ?? new Date().toISOString(),
});

const mapFee = (r: any): FeeRecord & { id: string } => ({
  id: r.id,
  studentId: r.student_id,
  studentName: r.student_name ?? '',
  month: r.month,
  amount: r.amount ?? 0,
  amountPaid: r.amount_paid ?? 0,
  status: r.status ?? 'pending',
  dueDate: r.due_date ?? '',
  paidDate: r.paid_date ?? undefined,
  paymentMethod: r.payment_method ?? undefined,
  receiptNumber: r.receipt_number ?? undefined,
  notes: r.notes ?? undefined,
  createdAt: r.created_at ?? new Date().toISOString(),
  updatedAt: r.updated_at ?? new Date().toISOString(),
});

const mapAnnouncement = (r: any): Announcement & { id: string } => ({
  id: r.id,
  title: r.title,
  content: r.content,
  targetAudience: r.target_audience ?? 'all',
  priority: r.priority ?? 'medium',
  status: r.status ?? 'published',
  createdBy: r.created_by ?? '',
  publishedAt: r.published_at ? new Date(r.published_at) : new Date(),
  expiresAt: r.expires_at ? new Date(r.expires_at) : undefined,
});

// camel → snake mappers
const toStudentRow = (s: Partial<Student>) => ({
  user_id: s.userId ?? null,
  full_name: s.fullName,
  email: s.email,
  phone: s.phone ?? '',
  date_of_birth: s.dateOfBirth ?? '',
  age: s.age ?? 0,
  gender: s.gender ?? 'male',
  nationality: s.nationality ?? '',
  photo: s.photo,
  parent_name: s.parentName ?? '',
  parent_phone: s.parentPhone ?? '',
  parent_email: s.parentEmail ?? '',
  student_type: s.studentType ?? 'online',
  current_course: s.currentCourse ?? 'Quran Memorization',
  level: s.level ?? 'beginner',
  assigned_teacher_id: s.assignedTeacherId ?? null,
  schedule: s.schedule ?? { days: [], timeSlot: '' },
  progress: s.progress ?? { currentSurah: '', currentAyah: 0, memorizedSurahs: [], completionPercentage: 0 },
  fee_package: s.feePackage ?? 'monthly',
  monthly_fee: s.monthlyFee ?? 0,
  status: s.status ?? 'active',
  updated_at: new Date().toISOString(),
});

const toTeacherRow = (t: Partial<Teacher>) => ({
  user_id: t.userId ?? null,
  full_name: t.fullName,
  email: t.email,
  phone: t.phone ?? '',
  date_of_birth: t.dateOfBirth ?? '',
  age: t.age ?? 0,
  gender: t.gender ?? 'male',
  nationality: t.nationality ?? '',
  photo: t.photo,
  qualification: t.qualification ?? [],
  specializations: t.specializations ?? [],
  experience_years: t.experienceYears ?? 0,
  max_students: t.maxStudents ?? 10,
  current_students: t.currentStudents ?? 0,
  assigned_student_ids: t.assignedStudentIds ?? [],
  availability: t.availability ?? { days: [], timeSlots: [] },
  salary_type: t.salaryType ?? 'monthly',
  salary_amount: t.salaryAmount ?? 0,
  status: t.status ?? 'active',
  updated_at: new Date().toISOString(),
});

// ─── STUDENTS ────────────────────────────────────────────────────────────────

export const getStudents = async (): Promise<(Student & { id: string })[]> => {
  const { data, error } = await supabase.from('students').select('*').order('created_at', { ascending: false });
  throwOnError(data, error, 'getStudents');
  return (data ?? []).map(mapStudent);
};

export const getStudentByUserId = async (userId: string): Promise<(Student & { id: string }) | null> => {
  const { data, error } = await supabase.from('students').select('*').eq('user_id', userId).maybeSingle();
  throwOnError(data, error, 'getStudentByUserId');
  return data ? mapStudent(data) : null;
};

export const getStudentById = async (id: string): Promise<(Student & { id: string }) | null> => {
  const { data, error } = await supabase.from('students').select('*').eq('id', id).maybeSingle();
  throwOnError(data, error, 'getStudentById');
  return data ? mapStudent(data) : null;
};

export const createStudent = async (student: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const { data, error } = await supabase.from('students').insert({
    ...toStudentRow(student),
    enrollment_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select('id').single();
  throwOnError(data, error, 'createStudent');
  return data!.id;
};

export const updateStudent = async (id: string, updates: Partial<Student>): Promise<void> => {
  const { error } = await supabase.from('students').update(toStudentRow(updates)).eq('id', id);
  throwOnError(null, error, 'updateStudent');
};

export const deleteStudent = async (id: string): Promise<void> => {
  const { error } = await supabase.from('students').delete().eq('id', id);
  throwOnError(null, error, 'deleteStudent');
};

export const linkStudentAccount = async (studentId: string, userId: string): Promise<void> => {
  const { error } = await supabase.from('students').update({ user_id: userId, updated_at: new Date().toISOString() }).eq('id', studentId);
  throwOnError(null, error, 'linkStudentAccount');
};

// ─── TEACHERS ────────────────────────────────────────────────────────────────

export const getTeachers = async (): Promise<(Teacher & { id: string })[]> => {
  const { data, error } = await supabase.from('teachers').select('*').order('created_at', { ascending: false });
  throwOnError(data, error, 'getTeachers');
  return (data ?? []).map(mapTeacher);
};

export const getTeacherByUserId = async (userId: string): Promise<(Teacher & { id: string }) | null> => {
  const { data, error } = await supabase.from('teachers').select('*').eq('user_id', userId).maybeSingle();
  throwOnError(data, error, 'getTeacherByUserId');
  return data ? mapTeacher(data) : null;
};

export const getTeacherById = async (id: string): Promise<(Teacher & { id: string }) | null> => {
  const { data, error } = await supabase.from('teachers').select('*').eq('id', id).maybeSingle();
  throwOnError(data, error, 'getTeacherById');
  return data ? mapTeacher(data) : null;
};

export const createTeacher = async (teacher: Omit<Teacher, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const { data, error } = await supabase.from('teachers').insert({
    ...toTeacherRow(teacher),
    joining_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
  }).select('id').single();
  throwOnError(data, error, 'createTeacher');
  return data!.id;
};

export const updateTeacher = async (id: string, updates: Partial<Teacher>): Promise<void> => {
  const { error } = await supabase.from('teachers').update(toTeacherRow(updates)).eq('id', id);
  throwOnError(null, error, 'updateTeacher');
};

export const deleteTeacher = async (id: string): Promise<void> => {
  const { error } = await supabase.from('teachers').delete().eq('id', id);
  throwOnError(null, error, 'deleteTeacher');
};

export const linkTeacherAccount = async (teacherId: string, userId: string): Promise<void> => {
  const { error } = await supabase.from('teachers').update({ user_id: userId, updated_at: new Date().toISOString() }).eq('id', teacherId);
  throwOnError(null, error, 'linkTeacherAccount');
};

// ─── ATTENDANCE ──────────────────────────────────────────────────────────────

export const getAttendanceByStudentId = async (studentId: string): Promise<(AttendanceRecord & { id: string })[]> => {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .order('date', { ascending: false });
  throwOnError(data, error, 'getAttendanceByStudentId');
  return (data ?? []).map(mapAttendance);
};

export const getAllAttendance = async (): Promise<(AttendanceRecord & { id: string })[]> => {
  const { data, error } = await supabase.from('attendance').select('*').order('date', { ascending: false });
  throwOnError(data, error, 'getAllAttendance');
  return (data ?? []).map(mapAttendance);
};

export const createAttendanceRecords = async (
  records: Array<{
    studentId: string;
    studentName: string;
    teacherId?: string;
    teacherName?: string;
    date: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'leave';
    lessonTopic?: string;
    notes?: string;
    courseId?: string;
    courseName?: string;
    classType?: string;
  }>
): Promise<void> => {
  const rows = records.map(r => ({
    student_id: r.studentId,
    student_name: r.studentName,
    teacher_id: r.teacherId ?? null,
    teacher_name: r.teacherName ?? '',
    date: r.date,
    status: r.status,
    lesson_topic: r.lessonTopic ?? '',
    notes: r.notes ?? '',
    course_id: r.courseId ?? '',
    course_name: r.courseName ?? '',
    class_type: r.classType ?? 'online',
  }));
  const { error } = await supabase.from('attendance').insert(rows);
  throwOnError(null, error, 'createAttendanceRecords');
};

// ─── FEES ────────────────────────────────────────────────────────────────────

export const getFeesByStudentId = async (studentId: string): Promise<(FeeRecord & { id: string })[]> => {
  const { data, error } = await supabase
    .from('fees')
    .select('*')
    .eq('student_id', studentId)
    .order('month', { ascending: false });
  throwOnError(data, error, 'getFeesByStudentId');
  return (data ?? []).map(mapFee);
};

export const getAllFees = async (): Promise<(FeeRecord & { id: string })[]> => {
  const { data, error } = await supabase.from('fees').select('*').order('created_at', { ascending: false });
  throwOnError(data, error, 'getAllFees');
  return (data ?? []).map(mapFee);
};

export const createFee = async (fee: Omit<FeeRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const { data, error } = await supabase.from('fees').insert({
    student_id: fee.studentId,
    student_name: fee.studentName,
    month: fee.month,
    amount: fee.amount,
    amount_paid: fee.amountPaid,
    status: fee.status,
    due_date: fee.dueDate || null,
    paid_date: fee.paidDate || null,
    payment_method: fee.paymentMethod,
    receipt_number: fee.receiptNumber,
    notes: fee.notes,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select('id').single();
  throwOnError(data, error, 'createFee');
  return data!.id;
};

export const updateFee = async (id: string, updates: Partial<FeeRecord>): Promise<void> => {
  const row: any = { updated_at: new Date().toISOString() };
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.amountPaid !== undefined) row.amount_paid = updates.amountPaid;
  if (updates.paidDate !== undefined) row.paid_date = updates.paidDate;
  if (updates.paymentMethod !== undefined) row.payment_method = updates.paymentMethod;
  if (updates.receiptNumber !== undefined) row.receipt_number = updates.receiptNumber;
  if (updates.notes !== undefined) row.notes = updates.notes;
  const { error } = await supabase.from('fees').update(row).eq('id', id);
  throwOnError(null, error, 'updateFee');
};

// ─── ANNOUNCEMENTS ───────────────────────────────────────────────────────────

export const getAnnouncements = async (audience?: string): Promise<(Announcement & { id: string })[]> => {
  let q = supabase.from('announcements').select('*').eq('status', 'published').order('published_at', { ascending: false });
  if (audience && audience !== 'all') {
    q = supabase.from('announcements').select('*').eq('status', 'published').in('target_audience', ['all', audience]).order('published_at', { ascending: false });
  }
  const { data, error } = await q;
  throwOnError(data, error, 'getAnnouncements');
  return (data ?? []).map(mapAnnouncement);
};

export const getAllAnnouncements = async (): Promise<(Announcement & { id: string })[]> => {
  const { data, error } = await supabase.from('announcements').select('*').order('published_at', { ascending: false });
  throwOnError(data, error, 'getAllAnnouncements');
  return (data ?? []).map(mapAnnouncement);
};

export const createAnnouncement = async (
  a: { title: string; content: string; targetAudience: string; priority: string },
  createdBy: string
): Promise<void> => {
  const { error } = await supabase.from('announcements').insert({
    title: a.title,
    content: a.content,
    target_audience: a.targetAudience,
    priority: a.priority,
    status: 'published',
    created_by: createdBy,
    published_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  throwOnError(null, error, 'createAnnouncement');
};

export const deleteAnnouncement = async (id: string): Promise<void> => {
  const { error } = await supabase.from('announcements').delete().eq('id', id);
  throwOnError(null, error, 'deleteAnnouncement');
};

// ─── ADMISSION REQUESTS ──────────────────────────────────────────────────────

export const getAdmissionRequests = async () => {
  const { data, error } = await supabase.from('admission_requests').select('*').order('created_at', { ascending: false });
  throwOnError(data, error, 'getAdmissionRequests');
  return (data ?? []).map((r: any) => ({
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    dateOfBirth: r.date_of_birth,
    gender: r.gender,
    nationality: r.nationality,
    parentName: r.parent_name,
    parentPhone: r.parent_phone,
    parentEmail: r.parent_email,
    studentType: r.student_type,
    courseInterest: r.course_interest,
    message: r.message,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
};

export const updateAdmissionStatus = async (id: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
  const { error } = await supabase.from('admission_requests').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
  throwOnError(null, error, 'updateAdmissionStatus');
};

// ─── HIFZ ────────────────────────────────────────────────────────────────────

export const getHifzStudent = async (userId: string) => {
  const { data, error } = await supabase.from('hifz_students').select('*').eq('user_id', userId).maybeSingle();
  throwOnError(data, error, 'getHifzStudent');
  if (!data) return null;
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    parentEmail: data.parent_email,
    enrollmentDate: data.enrollment_date ? new Date(data.enrollment_date) : new Date(),
    currentJuz: data.current_juz,
    currentPage: data.current_page,
    totalPagesMemoized: data.total_pages_memorized,
    hifzStage: data.hifz_stage,
    hifzPath: data.hifz_path,
    retentionScore: data.retention_score,
    streakDays: data.streak_days,
    lastActiveDate: data.last_active_date ? new Date(data.last_active_date) : new Date(),
    assignedTeacher: data.assigned_teacher,
    preferredReciter: data.preferred_reciter,
    dailyNewPageTarget: data.daily_new_page_target,
    notes: data.notes,
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date(),
  };
};

export const upsertHifzStudent = async (userId: string, profile: any): Promise<void> => {
  const { error } = await supabase.from('hifz_students').upsert({
    user_id: userId,
    name: profile.name,
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    parent_email: profile.parentEmail ?? '',
    current_juz: profile.currentJuz ?? 1,
    current_page: profile.currentPage ?? 1,
    total_pages_memorized: profile.totalPagesMemoized ?? 0,
    hifz_stage: profile.hifzStage ?? 'foundation',
    hifz_path: profile.hifzPath ?? 'complete-quran',
    retention_score: profile.retentionScore ?? 0,
    streak_days: profile.streakDays ?? 0,
    last_active_date: profile.lastActiveDate ?? new Date().toISOString(),
    assigned_teacher: profile.assignedTeacher ?? '',
    preferred_reciter: profile.preferredReciter ?? 'mishary-rashid-alafasy',
    daily_new_page_target: profile.dailyNewPageTarget ?? 1,
    notes: profile.notes ?? '',
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  throwOnError(null, error, 'upsertHifzStudent');
};

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export const getDashboardStats = async () => {
  const [studentsRes, teachersRes] = await Promise.all([
    supabase.from('students').select('id, status, student_type'),
    supabase.from('teachers').select('id, status'),
  ]);
  const students = studentsRes.data ?? [];
  const teachers = teachersRes.data ?? [];
  return {
    totalStudents: students.length,
    activeStudents: students.filter(s => s.status === 'active').length,
    onlineStudents: students.filter(s => s.student_type === 'online').length,
    offlineStudents: students.filter(s => s.student_type === 'offline').length,
    totalTeachers: teachers.length,
    activeTeachers: teachers.filter(t => t.status === 'active').length,
  };
};
