-- ============================================================
-- Mohammadi Academy – Supabase Schema
-- Run this in Supabase SQL Editor (once)
-- ============================================================

-- 1. TEACHERS (created before students so FK works)
CREATE TABLE IF NOT EXISTS public.teachers (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id          uuid REFERENCES auth.users(id),
  full_name        text NOT NULL,
  email            text NOT NULL,
  phone            text DEFAULT '',
  date_of_birth    text DEFAULT '',
  age              integer DEFAULT 0,
  gender           text DEFAULT 'male',
  nationality      text DEFAULT '',
  photo            text,
  qualification    text[] DEFAULT '{}',
  specializations  text[] DEFAULT '{}',
  experience_years integer DEFAULT 0,
  joining_date     timestamptz DEFAULT now(),
  max_students     integer DEFAULT 10,
  current_students integer DEFAULT 0,
  assigned_student_ids uuid[] DEFAULT '{}',
  availability     jsonb DEFAULT '{"days":[],"timeSlots":[]}',
  salary_type      text DEFAULT 'monthly',
  salary_amount    numeric DEFAULT 0,
  status           text DEFAULT 'active',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- 2. STUDENTS
CREATE TABLE IF NOT EXISTS public.students (
  id                  uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id             uuid REFERENCES auth.users(id),
  full_name           text NOT NULL,
  email               text NOT NULL,
  phone               text DEFAULT '',
  date_of_birth       text DEFAULT '',
  age                 integer DEFAULT 0,
  gender              text DEFAULT 'male',
  nationality         text DEFAULT '',
  photo               text,
  parent_name         text DEFAULT '',
  parent_phone        text DEFAULT '',
  parent_email        text DEFAULT '',
  student_type        text DEFAULT 'online',
  current_course      text DEFAULT 'Quran Memorization',
  level               text DEFAULT 'beginner',
  assigned_teacher_id uuid REFERENCES public.teachers(id),
  schedule            jsonb DEFAULT '{"days":[],"timeSlot":""}',
  progress            jsonb DEFAULT '{"currentSurah":"","currentAyah":0,"memorizedSurahs":[],"completionPercentage":0}',
  fee_package         text DEFAULT 'monthly',
  monthly_fee         numeric DEFAULT 0,
  enrollment_date     timestamptz DEFAULT now(),
  status              text DEFAULT 'active',
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- 3. ATTENDANCE (individual row per student per session)
CREATE TABLE IF NOT EXISTS public.attendance (
  id           uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id   uuid REFERENCES public.students(id),
  student_name text DEFAULT '',
  teacher_id   uuid REFERENCES public.teachers(id),
  teacher_name text DEFAULT '',
  date         date NOT NULL,
  status       text DEFAULT 'absent',
  lesson_topic text DEFAULT '',
  notes        text DEFAULT '',
  course_id    text DEFAULT '',
  course_name  text DEFAULT '',
  class_type   text DEFAULT 'online',
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now()
);

-- 4. FEES
CREATE TABLE IF NOT EXISTS public.fees (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id     uuid REFERENCES public.students(id),
  student_name   text DEFAULT '',
  month          text NOT NULL,
  amount         numeric DEFAULT 0,
  amount_paid    numeric DEFAULT 0,
  status         text DEFAULT 'pending',
  due_date       date,
  paid_date      date,
  payment_method text,
  receipt_number text,
  notes          text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

-- 5. ANNOUNCEMENTS
CREATE TABLE IF NOT EXISTS public.announcements (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title           text NOT NULL,
  content         text NOT NULL,
  target_audience text DEFAULT 'all',
  priority        text DEFAULT 'medium',
  status          text DEFAULT 'published',
  created_by      uuid REFERENCES auth.users(id),
  published_at    timestamptz DEFAULT now(),
  expires_at      timestamptz,
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- 6. MESSAGES
CREATE TABLE IF NOT EXISTS public.messages (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id   uuid REFERENCES auth.users(id),
  receiver_id uuid REFERENCES auth.users(id),
  subject     text DEFAULT '',
  content     text NOT NULL,
  attachments text[] DEFAULT '{}',
  is_read     boolean DEFAULT false,
  sent_at     timestamptz DEFAULT now(),
  read_at     timestamptz,
  created_at  timestamptz DEFAULT now()
);

-- 7. ADMISSION REQUESTS
CREATE TABLE IF NOT EXISTS public.admission_requests (
  id            uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name     text NOT NULL,
  email         text NOT NULL,
  phone         text DEFAULT '',
  date_of_birth text DEFAULT '',
  gender        text DEFAULT 'male',
  nationality   text DEFAULT '',
  parent_name   text DEFAULT '',
  parent_phone  text DEFAULT '',
  parent_email  text DEFAULT '',
  student_type  text DEFAULT 'online',
  course_interest text DEFAULT '',
  message       text DEFAULT '',
  status        text DEFAULT 'pending',
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now()
);

-- 8. HIFZ STUDENTS
CREATE TABLE IF NOT EXISTS public.hifz_students (
  id                    uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id               uuid REFERENCES auth.users(id) UNIQUE,
  name                  text NOT NULL,
  email                 text DEFAULT '',
  phone                 text DEFAULT '',
  parent_email          text DEFAULT '',
  enrollment_date       timestamptz DEFAULT now(),
  current_juz           integer DEFAULT 1,
  current_page          integer DEFAULT 1,
  total_pages_memorized integer DEFAULT 0,
  hifz_stage            text DEFAULT 'foundation',
  hifz_path             text DEFAULT 'complete-quran',
  retention_score       numeric DEFAULT 0,
  streak_days           integer DEFAULT 0,
  last_active_date      timestamptz DEFAULT now(),
  assigned_teacher      text DEFAULT '',
  preferred_reciter     text DEFAULT 'mishary-rashid-alafasy',
  daily_new_page_target numeric DEFAULT 1,
  notes                 text DEFAULT '',
  created_at            timestamptz DEFAULT now(),
  updated_at            timestamptz DEFAULT now()
);

-- 9. HIFZ MEMORIZATION RECORDS
CREATE TABLE IF NOT EXISTS public.hifz_memorization_records (
  id             uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id     uuid REFERENCES public.hifz_students(id),
  surah_number   integer,
  ayah_start     integer,
  ayah_end       integer,
  page_number    integer,
  juz_number     integer,
  quality_score  numeric,
  revision_count integer DEFAULT 0,
  timestamp      timestamptz DEFAULT now()
);

-- 10. LIVE CLASS SESSIONS (teacher-scheduled lesson calls)
CREATE TABLE IF NOT EXISTS public.live_class_sessions (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id      uuid REFERENCES public.teachers(id) ON DELETE CASCADE,
  teacher_user_id uuid REFERENCES auth.users(id),
  lesson_id       text NOT NULL,
  lesson_title    text NOT NULL,
  course_name     text DEFAULT '',
  starts_at       timestamptz NOT NULL,
  ends_at         timestamptz NOT NULL,
  room_id         text NOT NULL,
  status          text DEFAULT 'scheduled',
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now(),
  CONSTRAINT live_class_sessions_unique_schedule UNIQUE (teacher_id, lesson_id, starts_at)
);

CREATE INDEX IF NOT EXISTS idx_live_class_sessions_teacher_id ON public.live_class_sessions (teacher_id);
CREATE INDEX IF NOT EXISTS idx_live_class_sessions_starts_at ON public.live_class_sessions (starts_at);
CREATE INDEX IF NOT EXISTS idx_live_class_sessions_status ON public.live_class_sessions (status);

-- ============================================================
-- ROW LEVEL SECURITY
-- Authenticated users have full access (app enforces roles)
-- ============================================================
ALTER TABLE public.students              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fees                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admission_requests    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hifz_students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hifz_memorization_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_class_sessions   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auth_access" ON public.students              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.teachers              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.attendance            FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.fees                  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.announcements         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.messages              FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.admission_requests    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.hifz_students         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.hifz_memorization_records FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_access" ON public.live_class_sessions   FOR ALL TO authenticated USING (true) WITH CHECK (true);
