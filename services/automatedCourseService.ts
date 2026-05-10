import { collection, doc, getDoc, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from './firebase';
import { AutomatedCourse, AutomatedLesson } from '../types/automated-course.types';
import {
  ensureAutomatedCourseCompleteness,
  ensureAutomatedLessonsCompleteness
} from '../utils/automatedCourseCompleteness';

export const fetchAutomatedCourses = async (): Promise<AutomatedCourse[]> => {
  const snapshot = await getDocs(collection(db, 'automated_courses'));
  return snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return ensureAutomatedCourseCompleteness({
      id: docSnap.id,
      title: data.title,
      description: data.description,
      category: data.category,
      level: data.level,
      ageGroup: data.ageGroup,
      ageRange: data.ageRange,
      language: data.language,
      price: data.price ?? 0,
      priceType: data.priceType ?? 'free',
      accessDurationDays: data.accessDurationDays ?? 30,
      status: data.status ?? 'draft',
      isActive: data.isActive ?? true,
      createdAt: data.createdAt?.toDate?.(),
      updatedAt: data.updatedAt?.toDate?.()
    } as AutomatedCourse);
  });
};

export const fetchAutomatedCourse = async (courseId: string): Promise<AutomatedCourse | null> => {
  const courseRef = doc(db, 'automated_courses', courseId);
  const snap = await getDoc(courseRef);
  if (!snap.exists()) return null;
  const data = snap.data();
  return ensureAutomatedCourseCompleteness({
    id: snap.id,
    title: data.title,
    description: data.description,
    category: data.category,
    level: data.level,
    ageGroup: data.ageGroup,
    ageRange: data.ageRange,
    language: data.language,
    price: data.price ?? 0,
    priceType: data.priceType ?? 'free',
    accessDurationDays: data.accessDurationDays ?? 30,
    status: data.status ?? 'draft',
    isActive: data.isActive ?? true,
    createdAt: data.createdAt?.toDate?.(),
    updatedAt: data.updatedAt?.toDate?.()
  } as AutomatedCourse);
};

export const fetchAutomatedLessons = async (courseId: string): Promise<AutomatedLesson[]> => {
  const lessonsRef = collection(db, 'automated_courses', courseId, 'lessons');
  const lessonsQuery = query(lessonsRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(lessonsQuery);
  const lessons = snapshot.docs.map((docSnap) => {
    const data = docSnap.data();
    return {
      id: docSnap.id,
      title: data.title,
      order: data.order,
      content: data.content,
      materials: data.materials,
      resources: data.resources,
      optionalResources: data.optionalResources
    } as AutomatedLesson;
  });

  return ensureAutomatedLessonsCompleteness(lessons);
};
