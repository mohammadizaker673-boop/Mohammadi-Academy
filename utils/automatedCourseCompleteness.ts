import { AutomatedCourse, AutomatedLesson, AutomatedLessonResource } from '../types/automated-course.types';

const toId = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const defaultQuiz = {
  question: 'Which statement best reflects this lesson? ',
  options: ['Option A', 'Option B', 'Option C', 'Option D'],
  correctIndex: 0,
};

const createRequiredResources = (lesson: AutomatedLesson): AutomatedLessonResource[] => {
  const materials = lesson.materials?.length
    ? lesson.materials
    : ['Lesson guide', 'Practice worksheet', 'Review checklist'];

  return materials.slice(0, 4).map((title, index) => ({
    id: `${lesson.id}-required-${index + 1}`,
    title,
    type: 'Lesson Material',
    description: `Required support material for ${lesson.title}.`,
    includedItems: [
      `Core recap for ${lesson.title}`,
      'Step-by-step practice prompts',
      'Quick review points for retention',
    ],
  }));
};

const createOptionalResources = (lesson: AutomatedLesson): AutomatedLessonResource[] => [
  {
    id: `${lesson.id}-optional-home-practice`,
    title: 'Optional Home Practice',
    type: 'Home Practice',
    description: `Optional extension activity for ${lesson.title}.`,
    includedItems: [
      'One independent practice task',
      'One reflection checkpoint',
      'One follow-up discussion prompt',
    ],
    isOptional: true,
  },
  {
    id: `${lesson.id}-optional-revision-card`,
    title: 'Optional Revision Card',
    type: 'Revision Card',
    description: `Optional quick revision support for ${lesson.title}.`,
    includedItems: [
      'Core definition reminder',
      'Key do-and-dont list',
      'Self-check confidence prompt',
    ],
    isOptional: true,
  },
];

export const ensureAutomatedCourseCompleteness = (course: AutomatedCourse): AutomatedCourse => ({
  ...course,
  description: course.description || `Complete guided learning path for ${course.title}.`,
  category: course.category || 'general',
  level: course.level || 'beginner',
  ageGroup: course.ageGroup || 'all',
  ageRange: course.ageRange || 'All ages',
  language: course.language || 'english',
  accessDurationDays: course.accessDurationDays || 30,
  priceType: course.priceType || 'free',
  price: course.price ?? 0,
  status: course.status || 'published',
  isActive: typeof course.isActive === 'boolean' ? course.isActive : true,
});

export const ensureAutomatedLessonCompleteness = (lesson: AutomatedLesson, index: number): AutomatedLesson => {
  const safeTitle = lesson.title || `Lesson ${index + 1}`;
  const summary = lesson.content?.summary || `Core summary for ${safeTitle}.`;

  const completed: AutomatedLesson = {
    ...lesson,
    id: lesson.id || `lesson-${index + 1}`,
    title: safeTitle,
    order: lesson.order || index + 1,
    content: {
      summary,
      explanation: lesson.content?.explanation || `Detailed explanation for ${safeTitle}.`,
      examples: lesson.content?.examples?.length ? lesson.content.examples : [
        `${safeTitle} example 1`,
        `${safeTitle} example 2`,
      ],
      exercise: lesson.content?.exercise || `Complete a short practice task for ${safeTitle}.`,
      quiz: {
        question: lesson.content?.quiz?.question || `${safeTitle}: choose the best answer.`,
        options: lesson.content?.quiz?.options?.length ? lesson.content.quiz.options : defaultQuiz.options,
        correctIndex: typeof lesson.content?.quiz?.correctIndex === 'number' ? lesson.content.quiz.correctIndex : 0,
      },
    },
    materials: lesson.materials?.length ? lesson.materials : ['Lesson guide', 'Practice worksheet', 'Review checklist'],
    resources: lesson.resources?.length
      ? lesson.resources.map((resource) => ({ ...resource, id: resource.id || toId(resource.title) }))
      : createRequiredResources({ ...lesson, title: safeTitle, id: lesson.id || `lesson-${index + 1}` }),
    optionalResources: lesson.optionalResources?.length
      ? lesson.optionalResources.map((resource) => ({ ...resource, id: resource.id || toId(resource.title), isOptional: true }))
      : createOptionalResources({ ...lesson, title: safeTitle, id: lesson.id || `lesson-${index + 1}` }),
  };

  return completed;
};

export const ensureAutomatedLessonsCompleteness = (lessons: AutomatedLesson[]): AutomatedLesson[] =>
  lessons.map((lesson, index) => ensureAutomatedLessonCompleteness(lesson, index));
