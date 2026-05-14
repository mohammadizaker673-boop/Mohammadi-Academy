import { supabase } from './supabase';
import { getHifzStudent, upsertHifzStudent } from './db';
import * as HifzTypes from '../types/hifz.types';

class HifzDataService {
  async createStudentProfile(userId: string, profile: Omit<HifzTypes.StudentProfile, 'userId'>): Promise<void> {
    await upsertHifzStudent(userId, { ...profile, userId });
  }

  async getStudentProfile(userId: string): Promise<HifzTypes.StudentProfile | null> {
    return getHifzStudent(userId) as Promise<HifzTypes.StudentProfile | null>;
  }

  async updateStudentProgress(userId: string, updates: Partial<HifzTypes.StudentProfile>): Promise<void> {
    const existing = await this.getStudentProfile(userId);
    await upsertHifzStudent(userId, { ...(existing ?? {}), ...updates, userId });
  }

  async recordMemorization(record: Omit<HifzTypes.MemorizationRecord, 'id'>): Promise<string> {
    const { data: student } = await supabase
      .from('hifz_students')
      .select('id')
      .eq('user_id', (record as any).studentId)
      .maybeSingle();

    if (!student) {
      throw new Error('Hifz student profile not found');
    }

    const { data, error } = await supabase
      .from('hifz_memorization_records')
      .insert({
        student_id: student.id,
        surah_number: (record as any).surahNumber,
        ayah_start: (record as any).ayahStart,
        ayah_end: (record as any).ayahEnd,
        page_number: (record as any).pageNumber,
        juz_number: (record as any).juzNumber,
        quality_score: (record as any).qualityScore,
        revision_count: (record as any).revisionCount ?? 0,
        timestamp: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }

  async getStudentMemorizations(userId: string, limit: number = 50): Promise<HifzTypes.MemorizationRecord[]> {
    const { data: student } = await supabase
      .from('hifz_students')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (!student) return [];

    const { data, error } = await supabase
      .from('hifz_memorization_records')
      .select('*')
      .eq('student_id', student.id)
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data ?? []).map((r: any) => ({
      id: r.id,
      studentId: userId,
      surahNumber: r.surah_number,
      ayahStart: r.ayah_start,
      ayahEnd: r.ayah_end,
      pageNumber: r.page_number,
      juzNumber: r.juz_number,
      qualityScore: r.quality_score,
      revisionCount: r.revision_count,
      timestamp: new Date(r.timestamp),
    } as unknown as HifzTypes.MemorizationRecord));
  }

  async logRevision(_log: Omit<HifzTypes.RevisionLog, 'id'>): Promise<string> {
    return crypto.randomUUID();
  }

  async getRevisionSchedule(_userId: string): Promise<HifzTypes.RevisionSchedule | null> {
    return null;
  }

  async createWeakPageRecord(_record: Omit<HifzTypes.WeakPage, 'id'>): Promise<string> {
    return crypto.randomUUID();
  }

  async getWeakPages(_userId: string): Promise<HifzTypes.WeakPage[]> {
    return [];
  }

  async resolveWeakPage(_weakPageId: string): Promise<void> {}

  async createTestSession(_session: Omit<HifzTypes.TestSession, 'id'>): Promise<string> {
    return crypto.randomUUID();
  }

  async updateTestResult(_testId: string, _result: Partial<HifzTypes.TestResult>): Promise<void> {}

  async getStudentTestResults(_userId: string): Promise<HifzTypes.TestSession[]> {
    return [];
  }

  async createProgressSnapshot(_snapshot: Omit<HifzTypes.ProgressSnapshot, 'id'>): Promise<string> {
    return crypto.randomUUID();
  }

  async getProgressSnapshots(_userId: string, _days: number = 30): Promise<HifzTypes.ProgressSnapshot[]> {
    return [];
  }

  async awardBadge(_userId: string, _badge: Omit<HifzTypes.Badge, 'id'>): Promise<string> {
    return crypto.randomUUID();
  }

  async getUserBadges(_userId: string): Promise<HifzTypes.Badge[]> {
    return [];
  }

  async updateLeaderboardEntry(_userId: string, _entry: Partial<HifzTypes.Leaderboard>): Promise<void> {}

  async getLeaderboard(_limit: number = 100): Promise<HifzTypes.Leaderboard[]> {
    return [];
  }

  async migrateLocalDataToFirebase(
    _userId: string,
    memorizations: HifzTypes.MemorizationRecord[],
    revisions: HifzTypes.RevisionLog[],
    weakPages: HifzTypes.WeakPage[]
  ): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    for (const memo of memorizations) {
      try {
        await this.recordMemorization(memo);
        success++;
      } catch {
        failed++;
      }
    }

    for (const rev of revisions) {
      try {
        await this.logRevision(rev);
        success++;
      } catch {
        failed++;
      }
    }

    for (const wp of weakPages) {
      try {
        await this.createWeakPageRecord(wp);
        success++;
      } catch {
        failed++;
      }
    }

    return { success, failed };
  }

  async getTeacherStudents(teacherId: string): Promise<HifzTypes.StudentProfile[]> {
    const { data, error } = await supabase
      .from('hifz_students')
      .select('*')
      .eq('assigned_teacher', teacherId);

    if (error) throw error;

    return (data ?? []).map((r: any) => ({
      id: r.id,
      userId: r.user_id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      parentEmail: r.parent_email,
      enrollmentDate: new Date(r.enrollment_date),
      currentJuz: r.current_juz,
      currentPage: r.current_page,
      totalPagesMemoized: r.total_pages_memorized,
      hifzStage: r.hifz_stage,
      hifzPath: r.hifz_path,
      retentionScore: r.retention_score,
      streakDays: r.streak_days,
      lastActiveDate: new Date(r.last_active_date),
      assignedTeacher: r.assigned_teacher,
      preferredReciter: r.preferred_reciter,
      dailyNewPageTarget: r.daily_new_page_target,
      notes: r.notes,
      createdAt: new Date(r.created_at),
      updatedAt: new Date(r.updated_at),
    } as HifzTypes.StudentProfile));
  }

  async getAcademyStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    totalPagesMemoized: number;
    averageRetention: number;
  }> {
    const { data, error } = await supabase.from('hifz_students').select('*');
    if (error) throw error;

    const students = data ?? [];
    const totalStudents = students.length;
    const activeStudents = students.filter((s: any) => {
      const daysSinceActive = (Date.now() - new Date(s.last_active_date).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive < 7;
    }).length;

    const totalPagesMemoized = students.reduce((sum: number, s: any) => sum + (s.total_pages_memorized || 0), 0);
    const averageRetention = totalStudents
      ? Math.round(students.reduce((sum: number, s: any) => sum + (s.retention_score || 0), 0) / totalStudents)
      : 0;

    return { totalStudents, activeStudents, totalPagesMemoized, averageRetention };
  }

  async getAtRiskStudents(): Promise<HifzTypes.StudentProfile[]> {
    const students = await this.getTeacherStudents('');
    return students.filter((student: any) => {
      const daysSinceActive = (Date.now() - new Date(student.lastActiveDate).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceActive > 7 || (student.streakDays || 0) < 2 || (student.retentionScore || 100) < 60;
    });
  }
}

export default new HifzDataService();
