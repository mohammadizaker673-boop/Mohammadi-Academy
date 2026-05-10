const dedicatedCoursePaths: Record<string, string> = {
  'noorani-qaida': '/courses/noorani-qaida',
  'quran-translation': '/quran-translation',
  'islamic-studies': '/islamic-studies'
};

const dedicatedStudentCoursePaths: Record<string, string> = {
  'noorani-qaida': '/student/noorani-qaida-player',
  'quran-translation': '/student/quran-translation-player',
  'islamic-studies': '/student/islamic-studies-player'
};

const dedicatedTeacherCoursePaths: Record<string, string> = {
  'noorani-qaida': '/teacher/noorani-qaida-player',
  'quran-translation': '/teacher/quran-translation-player',
  'islamic-studies': '/teacher/islamic-studies-player'
};

const dedicatedAdminCoursePaths: Record<string, string> = {
  'noorani-qaida': '/admin/noorani-qaida-player',
  'quran-translation': '/admin/quran-translation-player',
  'islamic-studies': '/admin/islamic-studies-player'
};

export const getCourseDetailPath = (courseId: string) => {
  const dedicatedPath = dedicatedCoursePaths[courseId];
  if (dedicatedPath) {
    return dedicatedPath;
  }

  return `/courses/${courseId}`;
};

export const isDedicatedCourse = (courseId: string) => courseId in dedicatedCoursePaths;

export const getCoursePlayerPath = (courseId: string, role: 'student' | 'teacher' | 'admin') => {
  if (role === 'admin') {
    const dedicatedAdminPath = dedicatedAdminCoursePaths[courseId];
    if (dedicatedAdminPath) {
      return dedicatedAdminPath;
    }
    return `/admin/courses/player/${courseId}`;
  }

  if (role === 'teacher') {
    const dedicatedTeacherPath = dedicatedTeacherCoursePaths[courseId];
    if (dedicatedTeacherPath) {
      return dedicatedTeacherPath;
    }
    return `/teacher/courses/${courseId}`;
  }

  const dedicatedStudentPath = dedicatedStudentCoursePaths[courseId];
  if (dedicatedStudentPath) {
    return dedicatedStudentPath;
  }

  return `/student/courses/${courseId}`;
};

export const getDashboardCoursePath = (courseId: string, role: 'student' | 'teacher') => {
  if (isDedicatedCourse(courseId)) {
    return getCoursePlayerPath(courseId, role);
  }

  return getCourseDetailPath(courseId);
};