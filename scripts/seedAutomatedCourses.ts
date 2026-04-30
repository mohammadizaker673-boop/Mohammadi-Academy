import { Timestamp, doc, writeBatch } from 'firebase/firestore';
import { db } from '../services/firebase';
import { buildAutomatedCourseFromPrebuilt, buildAutomatedLessonsFromPrebuilt, prebuiltCourseKeys } from '../data/automated-content';

const seedAutomatedCourses = async () => {
  const batch = writeBatch(db);
  const now = Timestamp.now();

  prebuiltCourseKeys.forEach((key) => {
    const course = buildAutomatedCourseFromPrebuilt(key);
    if (!course) return;

    const courseRef = doc(db, 'automated_courses', key);
    batch.set(courseRef, {
      title: course.title,
      description: course.description,
      category: course.category,
      level: course.level,
      ageGroup: course.ageGroup,
      ageRange: course.ageRange,
      language: course.language,
      price: course.price,
      priceType: course.priceType,
      accessDurationDays: course.accessDurationDays,
      status: course.status,
      isActive: course.isActive,
      deliveryType: 'automated',
      createdAt: now,
      updatedAt: now,
      lessonCount: 0
    });

    const lessons = buildAutomatedLessonsFromPrebuilt(key);
    lessons.forEach((lesson) => {
      const lessonRef = doc(courseRef, 'lessons', lesson.id);
      batch.set(lessonRef, {
        title: lesson.title,
        order: lesson.order,
        content: lesson.content,
        createdAt: now
      });
    });
  });

  await batch.commit();
  console.log('Automated courses seeded successfully.');
};

seedAutomatedCourses().catch((error) => {
  console.error('Failed to seed automated courses:', error);
});
