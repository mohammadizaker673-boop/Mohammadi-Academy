import { supabase } from './supabase';

export interface LiveClassSession {
  id: string;
  teacherId: string;
  teacherUserId: string;
  lessonId: string;
  lessonTitle: string;
  courseName: string;
  startsAt: string;
  endsAt: string;
  roomId: string;
  status: 'scheduled' | 'live' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

interface UpsertSessionInput {
  teacherId: string;
  teacherUserId: string;
  lessonId: string;
  lessonTitle: string;
  courseName: string;
  startsAt: string;
  endsAt: string;
}

const STORAGE_KEY = 'live_class_sessions';

const mapRow = (row: any): LiveClassSession => ({
  id: row.id,
  teacherId: row.teacher_id,
  teacherUserId: row.teacher_user_id,
  lessonId: row.lesson_id,
  lessonTitle: row.lesson_title,
  courseName: row.course_name,
  startsAt: row.starts_at,
  endsAt: row.ends_at,
  roomId: row.room_id,
  status: row.status || 'scheduled',
  createdAt: row.created_at || new Date().toISOString(),
  updatedAt: row.updated_at || new Date().toISOString(),
});

const readLocal = (): LiveClassSession[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLocal = (items: LiveClassSession[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const withFallback = async <T>(query: Promise<{ data: any; error: any }>, fallback: () => Promise<T>): Promise<T> => {
  const { data, error } = await query;
  if (error) {
    return fallback();
  }
  return data as T;
};

const buildRoomId = (teacherId: string, lessonId: string, startsAt: string) => {
  const dateStamp = startsAt.replace(/[^0-9]/g, '').slice(0, 12);
  return `class-${teacherId.slice(0, 6)}-${lessonId.slice(0, 6)}-${dateStamp}`;
};

export const upsertLiveClassSession = async (input: UpsertSessionInput): Promise<LiveClassSession> => {
  const roomId = buildRoomId(input.teacherId, input.lessonId, input.startsAt);

  const row = {
    teacher_id: input.teacherId,
    teacher_user_id: input.teacherUserId,
    lesson_id: input.lessonId,
    lesson_title: input.lessonTitle,
    course_name: input.courseName,
    starts_at: input.startsAt,
    ends_at: input.endsAt,
    room_id: roomId,
    status: 'scheduled',
    updated_at: new Date().toISOString(),
  };

  const data = await withFallback<any[]>(
    supabase
      .from('live_class_sessions')
      .upsert(row, { onConflict: 'teacher_id,lesson_id,starts_at' })
      .select('*'),
    async () => {
      const local = readLocal();
      const existingIndex = local.findIndex(
        (item) =>
          item.teacherId === input.teacherId &&
          item.lessonId === input.lessonId &&
          item.startsAt === input.startsAt,
      );
      const next: LiveClassSession = {
        id: existingIndex >= 0 ? local[existingIndex].id : crypto.randomUUID(),
        teacherId: input.teacherId,
        teacherUserId: input.teacherUserId,
        lessonId: input.lessonId,
        lessonTitle: input.lessonTitle,
        courseName: input.courseName,
        startsAt: input.startsAt,
        endsAt: input.endsAt,
        roomId,
        status: 'scheduled',
        createdAt: existingIndex >= 0 ? local[existingIndex].createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      if (existingIndex >= 0) {
        local[existingIndex] = next;
      } else {
        local.push(next);
      }
      writeLocal(local);
      return [next];
    },
  );

  return mapRow(Array.isArray(data) ? data[0] : data);
};

export const listTeacherLiveClassSessions = async (teacherId: string): Promise<LiveClassSession[]> => {
  const data = await withFallback<any[]>(
    supabase
      .from('live_class_sessions')
      .select('*')
      .eq('teacher_id', teacherId)
      .in('status', ['scheduled', 'live'])
      .order('starts_at', { ascending: true }),
    async () => {
      return readLocal()
        .filter((item) => item.teacherId === teacherId && (item.status === 'scheduled' || item.status === 'live'))
        .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
    },
  );

  return (data || []).map(mapRow);
};

export const listStudentUpcomingLiveClasses = async (teacherId: string): Promise<LiveClassSession[]> => {
  return listTeacherLiveClassSessions(teacherId);
};

export const getLiveClassSessionById = async (id: string): Promise<LiveClassSession | null> => {
  const data = await withFallback<any>(
    supabase.from('live_class_sessions').select('*').eq('id', id).maybeSingle(),
    async () => {
      const local = readLocal();
      return local.find((item) => item.id === id) || null;
    },
  );

  if (!data) return null;
  return mapRow(data);
};

export const markLiveClassStatus = async (id: string, status: LiveClassSession['status']): Promise<void> => {
  const { error } = await supabase
    .from('live_class_sessions')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    const local = readLocal();
    const index = local.findIndex((item) => item.id === id);
    if (index >= 0) {
      local[index] = { ...local[index], status, updatedAt: new Date().toISOString() };
      writeLocal(local);
    }
  }
};

export const canJoinLiveClass = (session: LiveClassSession): boolean => {
  const now = Date.now();
  const startsAt = new Date(session.startsAt).getTime();
  const endsAt = new Date(session.endsAt).getTime();

  // Allow joining 15 minutes before class starts and until class ends.
  return now >= startsAt - 15 * 60 * 1000 && now <= endsAt;
};
