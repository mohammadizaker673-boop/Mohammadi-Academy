import digitalBasics from './digital-basics-online-safety.json';
import { AutomatedCourse, AutomatedLesson } from '../../types/automated-course.types';
import {
  ensureAutomatedCourseCompleteness,
  ensureAutomatedLessonsCompleteness
} from '../../utils/automatedCourseCompleteness';

export type PrebuiltLesson = {
  title: string;
  explanation: string;
  keyPoints: string[];
  examples: string[];
  exercise: string;
  quiz: { q: string; options: string[]; answer: number }[];
  recap: string;
  nextStep: string;
};

export type PrebuiltCourseContent = {
  course: {
    title: string;
    description: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  };
  lessons: PrebuiltLesson[];
};

type PrebuiltCourseMeta = {
  category: string;
  ageGroup: string;
  ageRange: string;
  language: string;
  accessDurationDays: number;
  priceType: 'free' | 'paid';
  price: number;
  targetAudience: string;
};

const PREBUILT_META: Record<string, PrebuiltCourseMeta> = {
  'digital-basics-online-safety': {
    category: 'digital-skills',
    ageGroup: 'youth',
    ageRange: '10-18 years',
    language: 'english',
    accessDurationDays: 60,
    priceType: 'paid',
    price: 20,
    targetAudience: 'Beginners who want to learn digital basics and stay safe online.'
  }
};

export const prebuiltAutomatedCourses: Record<string, PrebuiltCourseContent> = {
  'digital-basics-online-safety': digitalBasics as PrebuiltCourseContent
};

export const prebuiltCourseKeys = Object.keys(prebuiltAutomatedCourses);

export const getPrebuiltCourseContent = (key: string) => prebuiltAutomatedCourses[key];
export const getPrebuiltCourseMeta = (key: string) => PREBUILT_META[key];

export const buildAutomatedCourseFromPrebuilt = (key: string): AutomatedCourse | null => {
  const content = getPrebuiltCourseContent(key);
  const meta = getPrebuiltCourseMeta(key);
  if (!content || !meta) return null;

  return ensureAutomatedCourseCompleteness({
    id: key,
    title: content.course.title,
    description: content.course.description,
    category: meta.category,
    level: content.course.level,
    ageGroup: meta.ageGroup,
    ageRange: meta.ageRange,
    language: meta.language,
    price: meta.price,
    priceType: meta.priceType,
    accessDurationDays: meta.accessDurationDays,
    status: 'published',
    isActive: true
  });
};

export const buildAutomatedLessonsFromPrebuilt = (key: string): AutomatedLesson[] => {
  const content = getPrebuiltCourseContent(key);
  if (!content) return [];

  const lessons = content.lessons.map((lesson, index) => {
    const quiz = lesson.quiz[0] || { q: 'Choose the best answer.', options: ['A', 'B', 'C', 'D'], answer: 0 };
    return {
      id: `lesson-${index + 1}`,
      title: lesson.title,
      order: index + 1,
      content: {
        summary: lesson.recap,
        explanation: `${lesson.explanation}\n\nKey points:\n- ${lesson.keyPoints.join('\n- ')}`,
        examples: lesson.examples,
        exercise: lesson.exercise,
        quiz: {
          question: quiz.q,
          options: quiz.options,
          correctIndex: quiz.answer
        }
      },
      materials: [
        'Lesson guide',
        'Practice worksheet',
        'Review checklist'
      ]
    };
  });

  return ensureAutomatedLessonsCompleteness(lessons);
};
