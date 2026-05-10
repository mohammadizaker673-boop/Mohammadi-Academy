import {
  CourseModuleContentBlock,
  CourseModuleLesson,
  CourseModuleLessonResource,
  DedicatedCourseModule,
} from '../types/dedicated-course.types';

const slugify = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const createFallbackBlocks = (lesson: CourseModuleLesson): CourseModuleContentBlock[] => [
  {
    type: 'text',
    title: `${lesson.title} Overview`,
    content: lesson.description,
  },
  {
    type: 'list',
    title: 'Lesson Objectives',
    items: lesson.objectives.length ? lesson.objectives : ['Review this lesson with your teacher and complete guided practice.'],
  },
  {
    type: 'reflection',
    title: 'Reflection Prompt',
    content: `Write one action point from ${lesson.title} that you will apply this week.`,
  },
];

const createRequiredResources = (lesson: CourseModuleLesson): CourseModuleLessonResource[] => {
  const materials = lesson.materials.length
    ? lesson.materials
    : ['Lesson guide', 'Practice worksheet', 'Review checklist'];

  return materials.slice(0, 4).map((title, index) => ({
    id: `${lesson.id}-required-${index + 1}`,
    title,
    type: 'Lesson Material',
    description: `Required study material for ${lesson.title}.`,
    includedItems: [
      `Core guidance for ${lesson.title}`,
      `Practice support linked to: ${lesson.objectives[0] || lesson.title}`,
      lesson.keyPoints[0] || 'Quick recap and review prompts',
    ],
    isOptional: false,
  }));
};

const createOptionalResources = (lesson: CourseModuleLesson): CourseModuleLessonResource[] => [
  {
    id: `${lesson.id}-optional-home-practice`,
    title: 'Optional Home Practice',
    type: 'Home Practice',
    description: `Optional independent practice extension for ${lesson.title}.`,
    includedItems: [
      'Short independent recap activity',
      'One reflection or action checkpoint',
      'Parent or study partner follow-up prompt',
    ],
    isOptional: true,
  },
  {
    id: `${lesson.id}-optional-discussion`,
    title: 'Optional Discussion Prompts',
    type: 'Discussion Guide',
    description: `Optional discussion prompts to reinforce ${lesson.title}.`,
    includedItems: [
      'Two family discussion prompts',
      'One teacher check-in question',
      'A weekly accountability prompt',
    ],
    isOptional: true,
  },
];

const ensureLessonCompleteness = (lesson: CourseModuleLesson, courseTitle: string): CourseModuleLesson => {
  const materials = lesson.materials.length
    ? lesson.materials
    : ['Lesson guide', 'Practice worksheet', 'Review checklist'];

  const keyPoints = lesson.keyPoints.length
    ? lesson.keyPoints
    : lesson.objectives.slice(0, 3).map((objective) => `${objective}.`);

  const blocks = lesson.blocks.length ? lesson.blocks : createFallbackBlocks(lesson);

  return {
    ...lesson,
    materials,
    keyPoints,
    blocks,
    resources: lesson.resources?.length ? lesson.resources : createRequiredResources({ ...lesson, materials, keyPoints, blocks }),
    optionalResources: lesson.optionalResources?.length
      ? lesson.optionalResources
      : createOptionalResources({ ...lesson, materials, keyPoints, blocks }),
    staffNote: lesson.staffNote || `Guided by the ${courseTitle} teaching team with structured lesson follow-up.`,
  };
};

export const applyCourseModuleCompleteness = (course: DedicatedCourseModule): DedicatedCourseModule => {
  return {
    ...course,
    sections: course.sections.map((section) => ({
      ...section,
      lessons: section.lessons.map((lesson) => {
        const updated = ensureLessonCompleteness(lesson, course.metadata.title);
        return {
          ...updated,
          resources: updated.resources?.map((resource) => ({
            ...resource,
            id: resource.id || slugify(resource.title),
          })),
          optionalResources: updated.optionalResources?.map((resource) => ({
            ...resource,
            id: resource.id || slugify(resource.title),
            isOptional: true,
          })),
        };
      }),
    })),
  };
};
