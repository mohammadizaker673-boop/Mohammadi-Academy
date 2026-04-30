import { Lesson } from '../types/noorani-qaida.types';

export interface NooraniLessonResource {
  id: string;
  title: string;
  type: string;
  description: string;
  includedItems: string[];
  isOptional?: boolean;
}

export const resolveNooraniLessonResources = (lesson: Lesson): NooraniLessonResource[] => {
  const resources: NooraniLessonResource[] = [
    {
      id: `${lesson.id}-lesson-guide`,
      title: 'Lesson Guide',
      type: 'Core Lesson',
      description: `A complete lesson guide for ${lesson.title} with the main explanation, learning objectives, and key revision points built into the course experience.`,
      includedItems: [
        lesson.content.introduction,
        lesson.content.learningObjectives[0] || 'Guided lesson objective review',
        lesson.content.keyPoints[0] || 'Core lesson recap point'
      ]
    }
  ];

  if (lesson.exercises.length > 0) {
    resources.push({
      id: `${lesson.id}-interactive-practice`,
      title: 'Interactive Practice Set',
      type: 'Practice',
      description: `A guided exercise set for ${lesson.title} so learners can practice the lesson actively instead of only reading through the material.`,
      includedItems: lesson.exercises.slice(0, 3).map((exercise) => `${exercise.title}: ${exercise.instruction}`)
    });
  }

  if (lesson.quiz) {
    resources.push({
      id: `${lesson.id}-quiz-pack`,
      title: 'Lesson Quiz Pack',
      type: 'Assessment',
      description: `A built-in quiz resource for ${lesson.title} that checks understanding and gives the learner a measurable review point.`,
      includedItems: [
        lesson.quiz.title,
        `Passing score: ${lesson.quiz.passingScore}%`,
        lesson.quiz.questions.length > 0 ? `${lesson.quiz.questions.length} question checks` : 'Quiz shell ready for future question expansion'
      ]
    });
  }

  if (lesson.videoUrl || lesson.content.mainContent.some((block) => block.type === 'video')) {
    resources.push({
      id: `${lesson.id}-video-demo`,
      title: 'Video Demonstration',
      type: 'Video',
      description: `A lesson-linked demonstration resource for ${lesson.title} to support visual explanation and guided imitation.`,
      includedItems: [
        'Visual demonstration of the lesson topic',
        'Review support for repeated watching',
        'Ideal for learner recap after the main lesson'
      ]
    });
  }

  if (lesson.audioUrl || lesson.content.mainContent.some((block) => block.audioUrl)) {
    resources.push({
      id: `${lesson.id}-audio-practice`,
      title: 'Audio Practice Support',
      type: 'Audio',
      description: `An audio support resource for ${lesson.title} so students can repeat, listen closely, and reinforce correct pronunciation or recitation.`,
      includedItems: [
        'Repeat-after-listening practice',
        'Pronunciation or recitation reinforcement',
        'Independent listening support outside live instruction'
      ]
    });
  }

  if (lesson.pdfUrl) {
    resources.push({
      id: `${lesson.id}-pdf-pack`,
      title: 'Downloadable PDF Pack',
      type: 'PDF',
      description: `A printable review resource for ${lesson.title} that students can use offline for reading, memorization, or revision.`,
      includedItems: [
        'Printable recap and study support',
        'Offline review format',
        'Useful for home revision or teacher follow-up'
      ]
    });
  }

  return resources;
};

export const resolveOptionalNooraniExtensions = (lesson: Lesson): NooraniLessonResource[] => [
  {
    id: `${lesson.id}-optional-home-review`,
    title: 'Optional Home Review',
    type: 'Optional',
    description: `An optional home review path for ${lesson.title} that learners can choose when they want extra repetition without making it a required checkpoint.`,
    includedItems: [
      'Short home recap after the main lesson',
      'One repeat-practice target for the week',
      'Flexible extra practice with no progress penalty'
    ],
    isOptional: true
  },
  {
    id: `${lesson.id}-optional-family-practice`,
    title: 'Optional Family Practice',
    type: 'Optional',
    description: `An optional support path for ${lesson.title} that lets a learner revisit the lesson with a parent, sibling, or teacher helper.`,
    includedItems: [
      'Simple oral review with a study partner',
      'Confidence-building repetition outside class time',
      'Optional reinforcement for deeper retention'
    ],
    isOptional: true
  }
];