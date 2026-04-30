import { CourseAgeGroup, CourseCategory } from '../types/course.types';
import { generateAIJson, hasOpenRouterApiKey } from '../services/aiService';

type AutomatedCourseInput = {
  title: string;
  category: CourseCategory;
  level: 'beginner' | 'intermediate' | 'advanced' | 'all';
  ageGroup: CourseAgeGroup;
  primaryLanguage: string;
  lessonCount: number;
};

type GeneratedLessonOutline = {
  id: string;
  title: string;
  hasVideo?: boolean;
  hasText?: boolean;
  hasQuiz?: boolean;
};

type GeneratedLessonContent = {
  id: string;
  title: string;
  order: number;
  content: {
    summary: string;
    explanation: string;
    examples: string[];
    exercise: string;
    quiz: {
      question: string;
      options: string[];
      correctIndex: number;
    };
  };
};

type GeneratedCourseContent = {
  description: string;
  targetAudience: string;
  ageRange: string;
  duration: string;
  requirements: string[];
  classFormat: {
    duration: string;
    mode: string[];
    materials: string[];
  };
  lessonOutline: GeneratedLessonOutline[];
};

type GeneratedCoursePackage = {
  source: 'ai' | 'fallback';
  courseContent: GeneratedCourseContent;
  lessons: GeneratedLessonContent[];
};

type AIGeneratedCoursePayload = {
  description?: string;
  targetAudience?: string;
  ageRange?: string;
  duration?: string;
  requirements?: string[];
  classFormat?: {
    duration?: string;
    mode?: string[];
    materials?: string[];
  };
  lessonOutline?: Array<{
    title?: string;
    hasVideo?: boolean;
    hasText?: boolean;
    hasQuiz?: boolean;
  }>;
  lessons?: Array<{
    title?: string;
    content?: {
      summary?: string;
      explanation?: string;
      examples?: string[];
      exercise?: string;
      quiz?: {
        question?: string;
        options?: string[];
        correctIndex?: number;
      };
    };
  }>;
};

const CATEGORY_TOPICS: Record<string, string[]> = {
  'english-language': [
    'Sound and rhythm of English',
    'Everyday greetings and introductions',
    'Common verbs and sentence patterns',
    'Questions and short answers',
    'Numbers, time, and dates',
    'Daily routines and hobbies',
    'Describing people and places',
    'Practical listening practice',
    'Reading short passages',
    'Writing simple paragraphs',
    'Speaking practice and role play',
    'Review and proficiency check'
  ],
  'quran': [
    'Introduction to Tajweed and its importance',
    'Arabic letters and articulation points (Makharij)',
    'Noon Sakinah and Tanween rules (Izhar, Idgham, Iqlab, Ikhfa)',
    'Meem Sakinah rules',
    'Rules of Madd (elongation)',
    'Qalqalah letters and practice',
    'Rules of Raa and Laam',
    'Stopping (Waqf) and starting (Ibtida)',
    'Common Tajweed mistakes and corrections',
    'Tajweed practice with short Surahs',
    'Recitation flow and rhythm',
    'Final review and assessment'
  ],
  'islamic-studies': [
    'Foundations of Islamic belief (Aqeedah)',
    'Pillars of Islam and daily practice',
    'Purification and prayer essentials',
    'Quran overview and key themes',
    'Seerah: life of the Prophet (PBUH)',
    'Islamic manners and character',
    'Halal and Haram basics',
    'Duas and daily remembrance',
    'Family and community responsibilities',
    'Review and assessment'
  ],
  'arabic': [
    'Arabic alphabet and pronunciation',
    'Reading short words and phrases',
    'Basic vocabulary and greetings',
    'Simple grammar and sentence order',
    'Listening practice with short dialogues',
    'Reading practice with short texts',
    'Common phrases for daily use',
    'Writing practice and spelling',
    'Conversation drills',
    'Review and assessment'
  ],
  'arabic-learning': [
    'Arabic script basics',
    'Reading practice and fluency',
    'Common vocabulary and phrases',
    'Grammar essentials',
    'Listening comprehension',
    'Speaking practice',
    'Writing practice',
    'Daily conversation patterns',
    'Reading short passages',
    'Review and assessment'
  ],
  'persian-language': [
    'Persian script and pronunciation',
    'Everyday greetings and phrases',
    'Basic grammar and sentence patterns',
    'Common vocabulary',
    'Listening practice',
    'Reading short texts',
    'Writing practice',
    'Speaking drills',
    'Review and assessment'
  ],
  'pashto-language': [
    'Pashto script and sounds',
    'Basic greetings and phrases',
    'Core vocabulary',
    'Grammar fundamentals',
    'Listening practice',
    'Reading short texts',
    'Writing practice',
    'Speaking drills',
    'Review and assessment'
  ],
  'language-learning': [
    'Alphabet and pronunciation',
    'Greetings and introductions',
    'Vocabulary for daily life',
    'Grammar fundamentals',
    'Listening practice',
    'Reading short texts',
    'Writing practice',
    'Conversation drills',
    'Review and assessment'
  ],
  'information-technology': [
    'Computer basics and digital safety',
    'Files, folders, and productivity tools',
    'Internet and email essentials',
    'Spreadsheets and documents',
    'Online collaboration tools',
    'Basic troubleshooting',
    'Privacy and security',
    'Practical projects and review'
  ],
  'artificial-intelligence': [
    'What is AI and how it works',
    'Data basics and datasets',
    'Machine learning concepts',
    'Neural networks overview',
    'Practical AI tools',
    'Prompt engineering essentials',
    'Ethics and safety in AI',
    'Mini projects and review'
  ],
  'science': [
    'Scientific thinking and experiments',
    'Matter and materials',
    'Energy and motion',
    'Life science basics',
    'Earth and space',
    'Everyday science applications',
    'Review and assessment'
  ]
};

const CATEGORY_REQUIREMENTS: Record<string, string[]> = {
  'quran': ['Ability to read Arabic letters', 'Quiet environment for recitation practice', 'Commitment to daily recitation'],
  'islamic-studies': ['Notebook for notes', 'Willingness to practice daily routines', 'Curiosity and respect for Islamic learning'],
  'information-technology': ['Basic computer access', 'Internet connection', 'Willingness to practice weekly'],
  'artificial-intelligence': ['Basic computer skills', 'Internet connection', 'Curiosity about technology'],
  'english-language': ['Willingness to practice daily', 'Notebook or digital notes', 'Listening practice time'],
  'arabic': ['Commitment to practice', 'Notebook or digital notes', 'Headphones for listening'],
  'arabic-learning': ['Commitment to practice', 'Notebook or digital notes', 'Headphones for listening'],
  'persian-language': ['Commitment to practice', 'Notebook or digital notes', 'Headphones for listening'],
  'pashto-language': ['Commitment to practice', 'Notebook or digital notes', 'Headphones for listening']
};

const AGE_RANGES: Record<CourseAgeGroup, string> = {
  children: '7-12 years',
  preteens: '10-14 years',
  youth: '14-18 years',
  adults: '18+ years',
  all: '7+ years'
};

const normalizeText = (value: unknown, fallback: string): string => {
  return typeof value === 'string' && value.trim() ? value.trim() : fallback;
};

const normalizeTextArray = (value: unknown, fallback: string[], minimumLength = 1): string[] => {
  if (!Array.isArray(value)) {
    return fallback;
  }

  const normalized = value
    .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    .map((item) => item.trim());

  return normalized.length >= minimumLength ? normalized : fallback;
};

const normalizeBoolean = (value: unknown, fallback: boolean): boolean => {
  return typeof value === 'boolean' ? value : fallback;
};

const buildFallbackCoursePackage = (input: AutomatedCourseInput): GeneratedCoursePackage => ({
  source: 'fallback',
  courseContent: generateAutomatedCourseContent(input),
  lessons: generateAutomatedLessons(input),
});

export const generateAutomatedCourseContent = (input: AutomatedCourseInput): GeneratedCourseContent => {
  const topics = CATEGORY_TOPICS[input.category] || CATEGORY_TOPICS['language-learning'];
  const normalizedCount = Math.max(4, Math.min(input.lessonCount, 24));
  const selectedTopics = topics.slice(0, normalizedCount);

  const lessonOutline: GeneratedLessonOutline[] = selectedTopics.map((topic, index) => ({
    id: `lesson-${index + 1}`,
    title: `Lesson ${index + 1}: ${topic}`,
    hasVideo: false,
    hasText: true,
    hasQuiz: true
  }));

  const levelLabel = input.level === 'all' ? 'all levels' : input.level;
  const requirements = CATEGORY_REQUIREMENTS[input.category] || ['Internet connection', 'Notebook for practice', 'Motivation to learn'];

  return {
    description: `An automated, self-paced ${input.title} course for ${levelLabel} learners. Learn through guided lessons, interactive practice, and short quizzes. All content is generated and updated automatically for premium learning quality.`,
    targetAudience: `Learners interested in ${input.title} using ${input.primaryLanguage} as a learning language.`,
    ageRange: AGE_RANGES[input.ageGroup],
    duration: `${normalizedCount} lessons, self-paced`,
    requirements,
    classFormat: {
      duration: 'Self-paced (on-demand)',
      mode: ['On-demand', 'Automated lessons'],
      materials: ['Interactive lessons', 'Practice quizzes', 'Downloadable notes']
    },
    lessonOutline
  };
};

export const generateAutomatedLessons = (input: AutomatedCourseInput): GeneratedLessonContent[] => {
  const topics = CATEGORY_TOPICS[input.category] || CATEGORY_TOPICS['language-learning'];
  const normalizedCount = Math.max(4, Math.min(input.lessonCount, 24));
  const selectedTopics = topics.slice(0, normalizedCount);
  const titlePrefix = input.title.trim();

  return selectedTopics.map((topic, index) => {
    const order = index + 1;
    return {
      id: `lesson-${order}`,
      title: `Lesson ${order}: ${topic}`,
      order,
      content: {
        summary: `In this lesson, you will learn ${topic.toLowerCase()} in the context of ${titlePrefix}.`,
        explanation: `This lesson introduces ${topic.toLowerCase()} with clear steps, guided examples, and a short practice activity designed for ${input.level} learners.`,
        examples: [
          `Example 1: Key idea in ${topic.toLowerCase()} applied to a real situation.`,
          `Example 2: Practice using ${topic.toLowerCase()} with a short task.`
        ],
        exercise: `Complete a short exercise that applies ${topic.toLowerCase()} to daily use.`,
        quiz: {
          question: `Which statement best matches ${topic.toLowerCase()}?`,
          options: [
            `A correct explanation of ${topic.toLowerCase()}.`,
            `A statement unrelated to ${topic.toLowerCase()}.`,
            `A random guess that does not fit.`,
            `An incorrect definition.`
          ],
          correctIndex: 0
        }
      }
    };
  });
};

export const generateAICoursePackage = async (input: AutomatedCourseInput): Promise<GeneratedCoursePackage> => {
  const fallbackPackage = buildFallbackCoursePackage(input);

  if (!hasOpenRouterApiKey()) {
    return fallbackPackage;
  }

  const topics = CATEGORY_TOPICS[input.category] || CATEGORY_TOPICS['language-learning'];
  const normalizedCount = Math.max(4, Math.min(input.lessonCount, 24));
  const suggestedTopics = topics.slice(0, normalizedCount);

  try {
    const payload = await generateAIJson<AIGeneratedCoursePayload>({
      temperature: 0.5,
      maxTokens: 3200,
      messages: [
        {
          role: 'system',
          content: [
            'You design rigorous, age-appropriate course content for Muhammadi Academy.',
            'Keep the tone respectful, practical, and suitable for an Islamic learning environment where relevant.',
            'Do not mention that the material was AI-generated.',
            'Return only the requested JSON object.',
          ].join(' '),
        },
        {
          role: 'user',
          content: [
            `Course title: ${input.title}`,
            `Category: ${input.category}`,
            `Level: ${input.level}`,
            `Age group: ${input.ageGroup}`,
            `Primary language: ${input.primaryLanguage}`,
            `Required lesson count: ${normalizedCount}`,
            `Suggested topic spine: ${suggestedTopics.join(' | ')}`,
            'Return JSON with keys: description, targetAudience, ageRange, duration, requirements, classFormat, lessonOutline, lessons.',
            'classFormat must include: duration, mode, materials.',
            'lessonOutline must contain exactly one item per lesson with: title, hasVideo, hasText, hasQuiz.',
            'lessons must contain exactly one item per lesson with: title and content.',
            'Each content object must contain: summary, explanation, examples, exercise, quiz.',
            'Each quiz must contain: question, options (exactly 4 items), correctIndex (0-3).',
            'Keep lesson summaries concise and specific.',
          ].join('\n\n'),
        },
      ],
    });

    const lessonOutline = fallbackPackage.courseContent.lessonOutline.map((fallbackLesson, index) => {
      const aiLesson = payload.lessonOutline?.[index];

      return {
        id: `lesson-${index + 1}`,
        title: normalizeText(aiLesson?.title, fallbackLesson.title),
        hasVideo: normalizeBoolean(aiLesson?.hasVideo, fallbackLesson.hasVideo ?? false),
        hasText: normalizeBoolean(aiLesson?.hasText, fallbackLesson.hasText ?? true),
        hasQuiz: normalizeBoolean(aiLesson?.hasQuiz, fallbackLesson.hasQuiz ?? true),
      };
    });

    const lessons = fallbackPackage.lessons.map((fallbackLesson, index) => {
      const aiLesson = payload.lessons?.[index];
      const aiContent = aiLesson?.content;
      const fallbackQuiz = fallbackLesson.content.quiz;
      const quizOptions = normalizeTextArray(aiContent?.quiz?.options, fallbackQuiz.options, 4).slice(0, 4);
      const rawCorrectIndex = aiContent?.quiz?.correctIndex;
      const correctIndex = typeof rawCorrectIndex === 'number' && rawCorrectIndex >= 0 && rawCorrectIndex < quizOptions.length
        ? rawCorrectIndex
        : Math.min(fallbackQuiz.correctIndex, quizOptions.length - 1);

      return {
        id: `lesson-${index + 1}`,
        title: normalizeText(aiLesson?.title, lessonOutline[index]?.title || fallbackLesson.title),
        order: index + 1,
        content: {
          summary: normalizeText(aiContent?.summary, fallbackLesson.content.summary),
          explanation: normalizeText(aiContent?.explanation, fallbackLesson.content.explanation),
          examples: normalizeTextArray(aiContent?.examples, fallbackLesson.content.examples, 2),
          exercise: normalizeText(aiContent?.exercise, fallbackLesson.content.exercise),
          quiz: {
            question: normalizeText(aiContent?.quiz?.question, fallbackQuiz.question),
            options: quizOptions,
            correctIndex,
          },
        },
      };
    });

    return {
      source: 'ai',
      courseContent: {
        description: normalizeText(payload.description, fallbackPackage.courseContent.description),
        targetAudience: normalizeText(payload.targetAudience, fallbackPackage.courseContent.targetAudience),
        ageRange: normalizeText(payload.ageRange, fallbackPackage.courseContent.ageRange),
        duration: normalizeText(payload.duration, fallbackPackage.courseContent.duration),
        requirements: normalizeTextArray(payload.requirements, fallbackPackage.courseContent.requirements, 1),
        classFormat: {
          duration: normalizeText(payload.classFormat?.duration, fallbackPackage.courseContent.classFormat.duration),
          mode: normalizeTextArray(payload.classFormat?.mode, fallbackPackage.courseContent.classFormat.mode, 1),
          materials: normalizeTextArray(payload.classFormat?.materials, fallbackPackage.courseContent.classFormat.materials, 1),
        },
        lessonOutline,
      },
      lessons,
    };
  } catch (error) {
    console.error('AI course generation failed:', error);
    return fallbackPackage;
  }
};
