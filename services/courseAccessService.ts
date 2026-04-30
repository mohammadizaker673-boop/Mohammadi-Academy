import { collection, doc, getDoc, getDocs, setDoc, Timestamp } from 'firebase/firestore';
import { courses } from '../data/courses';
import { fetchAutomatedCourses } from './automatedCourseService';
import { db } from './firebase';
import { listUserSubscriptions } from './subscriptionService';
import {
  AccessiblePremiumCourseCard,
  CourseAccessRecord,
  CourseAccessSourceType,
  RestrictedCourseAccessParams
} from '../types/course-access.types';
import { getCourseDetailPath, getCoursePlayerPath, getDashboardCoursePath } from '../utils/courseRouting';

const COURSE_ACCESS_COLLECTION = 'course_access';

export const getCourseAccessKey = (sourceType: CourseAccessSourceType, courseId: string) => `${sourceType}__${courseId}`;

export const createDefaultCourseAccessRecord = (params: {
  courseId: string;
  sourceType: CourseAccessSourceType;
  courseTitle: string;
}): CourseAccessRecord => ({
  id: getCourseAccessKey(params.sourceType, params.courseId),
  courseKey: getCourseAccessKey(params.sourceType, params.courseId),
  courseId: params.courseId,
  sourceType: params.sourceType,
  courseTitle: params.courseTitle,
  allowAllStudents: false,
  allowAllTeachers: false,
  studentIds: [],
  teacherIds: []
});

const mapDocToCourseAccessRecord = (courseKey: string, data: Record<string, unknown>): CourseAccessRecord => ({
  id: courseKey,
  courseKey,
  courseId: String(data.courseId || ''),
  sourceType: (data.sourceType as CourseAccessSourceType) || 'catalog',
  courseTitle: String(data.courseTitle || ''),
  allowAllStudents: Boolean(data.allowAllStudents),
  allowAllTeachers: Boolean(data.allowAllTeachers),
  studentIds: Array.isArray(data.studentIds) ? data.studentIds.map(String) : [],
  teacherIds: Array.isArray(data.teacherIds) ? data.teacherIds.map(String) : [],
  updatedAt: data.updatedAt && typeof (data.updatedAt as Timestamp).toDate === 'function'
    ? (data.updatedAt as Timestamp).toDate()
    : undefined,
  updatedBy: data.updatedBy ? String(data.updatedBy) : undefined
});

export const getCourseAccessRecord = async (params: {
  courseId: string;
  sourceType: CourseAccessSourceType;
  courseTitle: string;
}): Promise<CourseAccessRecord> => {
  const courseKey = getCourseAccessKey(params.sourceType, params.courseId);
  const snapshot = await getDoc(doc(db, COURSE_ACCESS_COLLECTION, courseKey));
  if (!snapshot.exists()) {
    return createDefaultCourseAccessRecord(params);
  }

  return mapDocToCourseAccessRecord(courseKey, snapshot.data() as Record<string, unknown>);
};

export const listCourseAccessRecords = async (): Promise<CourseAccessRecord[]> => {
  const snapshot = await getDocs(collection(db, COURSE_ACCESS_COLLECTION));
  return snapshot.docs.map((docSnap) => mapDocToCourseAccessRecord(docSnap.id, docSnap.data() as Record<string, unknown>));
};

export const saveCourseAccessRecord = async (record: Omit<CourseAccessRecord, 'id' | 'courseKey' | 'updatedAt'> & { updatedBy?: string }) => {
  const courseKey = getCourseAccessKey(record.sourceType, record.courseId);
  await setDoc(doc(db, COURSE_ACCESS_COLLECTION, courseKey), {
    courseId: record.courseId,
    sourceType: record.sourceType,
    courseTitle: record.courseTitle,
    allowAllStudents: record.allowAllStudents,
    allowAllTeachers: record.allowAllTeachers,
    studentIds: record.studentIds,
    teacherIds: record.teacherIds,
    updatedAt: Timestamp.fromDate(new Date()),
    updatedBy: record.updatedBy || null
  }, { merge: true });
};

export const hasRestrictedCourseAccess = async (params: RestrictedCourseAccessParams): Promise<boolean> => {
  if (params.role === 'admin') {
    return true;
  }

  if (!params.isPremiumCourse) {
    return true;
  }

  const record = await getCourseAccessRecord({
    courseId: params.courseId,
    sourceType: params.sourceType,
    courseTitle: params.courseId
  });

  if (params.role === 'student') {
    if (record.allowAllStudents || record.studentIds.includes(params.userId)) {
      return true;
    }

    const subscriptions = await listUserSubscriptions(params.userId);
    const now = new Date();
    return subscriptions.some((subscription) => (
      subscription.courseId === params.courseId &&
      subscription.status === 'active' &&
      subscription.endAt &&
      subscription.endAt > now
    ));
  }

  if (params.role === 'teacher') {
    return record.allowAllTeachers || record.teacherIds.includes(params.userId);
  }

  return false;
};

export const listAccessiblePremiumCoursesForUser = async (params: {
  userId: string;
  role: 'student' | 'teacher';
}): Promise<AccessiblePremiumCourseCard[]> => {
  const [records, automatedCourses, subscriptions] = await Promise.all([
    listCourseAccessRecords(),
    fetchAutomatedCourses().catch(() => []),
    params.role === 'student' ? listUserSubscriptions(params.userId) : Promise.resolve([])
  ]);

  const recordMap = new Map(records.map((record) => [record.courseKey, record]));
  const activeSubscriptionIds = new Set(
    subscriptions
      .filter((subscription) => subscription.status === 'active' && subscription.endAt && subscription.endAt > new Date())
      .map((subscription) => subscription.courseId)
  );

  const catalogPremium = courses
    .filter((course) => course.priceType === 'paid')
    .flatMap((course): AccessiblePremiumCourseCard[] => {
      const record = recordMap.get(getCourseAccessKey('catalog', course.id));
      const explicitAccess = params.role === 'student'
        ? Boolean(record?.allowAllStudents || record?.studentIds.includes(params.userId))
        : Boolean(record?.allowAllTeachers || record?.teacherIds.includes(params.userId));

      if (!explicitAccess) {
        return [];
      }

      return [{
        courseId: course.id,
        sourceType: 'catalog',
        title: course.title,
        description: course.description,
        category: course.category,
        accessLabel: params.role === 'teacher' ? 'Assigned for teaching access' : 'Assigned premium access',
        accessSource: 'assignment',
        openPath: getDashboardCoursePath(course.id, params.role)
      }];
    });

  const automatedPremium = automatedCourses
    .filter((course) => course.priceType === 'paid' && course.isActive && course.status === 'published')
    .flatMap((course): AccessiblePremiumCourseCard[] => {
      const record = recordMap.get(getCourseAccessKey('automated', course.id));
      const explicitAccess = params.role === 'student'
        ? Boolean(record?.allowAllStudents || record?.studentIds.includes(params.userId))
        : Boolean(record?.allowAllTeachers || record?.teacherIds.includes(params.userId));
      const hasSubscription = params.role === 'student' && activeSubscriptionIds.has(course.id);

      if (!explicitAccess && !hasSubscription) {
        return [];
      }

      return [{
        courseId: course.id,
        sourceType: 'automated',
        title: course.title,
        description: course.description,
        category: course.category,
        accessLabel: hasSubscription ? `Subscription active • ${course.accessDurationDays} days` : 'Assigned premium access',
        accessSource: hasSubscription ? 'subscription' : 'assignment',
        openPath: params.role === 'teacher' ? `/teacher/courses/${course.id}` : `/student/courses/${course.id}`
      }];
    });

  const cards = [...catalogPremium, ...automatedPremium];
  return cards.sort((left, right) => left.title.localeCompare(right.title));
};

export const getPremiumCoursePublicPath = (courseId: string, sourceType: CourseAccessSourceType) => {
  if (sourceType === 'catalog') {
    return getCourseDetailPath(courseId);
  }

  return `/automated/${courseId}`;
};