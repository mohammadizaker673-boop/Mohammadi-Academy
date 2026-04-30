import { CourseModuleLesson } from '../types/dedicated-course.types';
import { Lesson as NooraniLesson } from '../types/noorani-qaida.types';

export interface LessonReference {
  id: string;
  sourceType: 'Quran' | 'Hadith';
  citation: string;
  excerpt: string;
  connection: string;
}

export interface LessonDiscussionPost {
  id: string;
  authorName: string;
  authorRole: 'student' | 'teacher' | 'admin';
  message: string;
  kind: 'discussion' | 'question' | 'reflection';
  createdAt: string;
}

export interface LessonRecitationTarget {
  arabicText?: string;
  transliteration?: string;
}

export interface LessonRecitationEvaluation {
  score: number;
  transcript: string;
  targetText: string;
  matchedTokens: string[];
  missingTokens: string[];
  extraTokens: string[];
}

export interface LessonRecitationMetrics {
  attempts: number;
  bestScore: number;
  lastScore: number;
  lastTranscript: string;
  lastAttemptAt: string | null;
}

export interface LessonSpiritualState {
  reminderSeenAt: string | null;
  completedPracticeIds: string[];
}

export interface LessonStudyAnalytics {
  viewCount: number;
  completionCount: number;
  quizAttempts: number;
  bestQuizScore: number;
  totalMinutesSpent: number;
  lastVisitedAt: string | null;
  recitation: LessonRecitationMetrics;
}

export interface LessonStudyRecord {
  notes: string;
  highlights: string[];
  reflectionResponses: Record<string, string>;
  discussion: LessonDiscussionPost[];
  analytics: LessonStudyAnalytics;
  spiritualState: LessonSpiritualState;
}

export interface LessonStudyStore {
  lessons: Record<string, LessonStudyRecord>;
}

export interface LessonInsight {
  understandingScore: number;
  status: 'on-track' | 'needs-support' | 'high-risk';
  reasons: string[];
  nextStep: string;
}

export interface WeakLessonInsight {
  lessonId: string;
  title: string;
  understandingScore: number;
  status: LessonInsight['status'];
}

export interface LessonPracticeChecklistItem {
  id: string;
  label: string;
}

export interface LessonSpiritualGuidance {
  reminder: string;
  reminderSource: string;
  duaArabic: string;
  duaTransliteration: string;
  duaTranslation: string;
  checklist: LessonPracticeChecklistItem[];
}

export interface LessonProgressPrediction {
  pathMode: 'revision' | 'steady' | 'advanced';
  paceLabel: string;
  estimatedSessionsRemaining: number;
  projectedCompletionText: string;
  nextMilestone: string;
  summary: string;
}

export interface LessonPathRecommendation {
  mode: 'revision' | 'steady' | 'advanced';
  headline: string;
  summary: string;
  steps: string[];
}

const defaultStore: LessonStudyStore = { lessons: {} };

const createEmptyRecitationMetrics = (): LessonRecitationMetrics => ({
  attempts: 0,
  bestScore: 0,
  lastScore: 0,
  lastTranscript: '',
  lastAttemptAt: null
});

const createEmptySpiritualState = (): LessonSpiritualState => ({
  reminderSeenAt: null,
  completedPracticeIds: []
});

const toNonNegativeNumber = (value: unknown): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
};

const normalizeStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean);
};

const normalizeReflectionResponses = (value: unknown): Record<string, string> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }

  return Object.entries(value as Record<string, unknown>).reduce<Record<string, string>>((result, [key, item]) => {
    if (typeof item === 'string') {
      result[key] = item;
    }
    return result;
  }, {});
};

const normalizeDiscussion = (value: unknown): LessonDiscussionPost[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<LessonDiscussionPost[]>((posts, item) => {
    if (!item || typeof item !== 'object') {
      return posts;
    }

    const candidate = item as Partial<LessonDiscussionPost>;
    if (!candidate.id || !candidate.authorName || !candidate.authorRole || !candidate.message || !candidate.kind || !candidate.createdAt) {
      return posts;
    }

    posts.push({
      id: candidate.id,
      authorName: candidate.authorName,
      authorRole: candidate.authorRole,
      message: candidate.message,
      kind: candidate.kind,
      createdAt: candidate.createdAt
    });

    return posts;
  }, []);
};

const normalizeRecitationMetrics = (value: unknown): LessonRecitationMetrics => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return createEmptyRecitationMetrics();
  }

  const candidate = value as Partial<LessonRecitationMetrics>;

  return {
    attempts: toNonNegativeNumber(candidate.attempts),
    bestScore: Math.min(100, toNonNegativeNumber(candidate.bestScore)),
    lastScore: Math.min(100, toNonNegativeNumber(candidate.lastScore)),
    lastTranscript: typeof candidate.lastTranscript === 'string' ? candidate.lastTranscript : '',
    lastAttemptAt: typeof candidate.lastAttemptAt === 'string' ? candidate.lastAttemptAt : null
  };
};

const normalizeSpiritualState = (value: unknown): LessonSpiritualState => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return createEmptySpiritualState();
  }

  const candidate = value as Partial<LessonSpiritualState>;

  return {
    reminderSeenAt: typeof candidate.reminderSeenAt === 'string' ? candidate.reminderSeenAt : null,
    completedPracticeIds: normalizeStringArray(candidate.completedPracticeIds)
  };
};

const normalizeLessonAnalytics = (value: unknown): LessonStudyAnalytics => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      viewCount: 0,
      completionCount: 0,
      quizAttempts: 0,
      bestQuizScore: 0,
      totalMinutesSpent: 0,
      lastVisitedAt: null,
      recitation: createEmptyRecitationMetrics()
    };
  }

  const candidate = value as Partial<LessonStudyAnalytics>;

  return {
    viewCount: toNonNegativeNumber(candidate.viewCount),
    completionCount: toNonNegativeNumber(candidate.completionCount),
    quizAttempts: toNonNegativeNumber(candidate.quizAttempts),
    bestQuizScore: Math.min(100, toNonNegativeNumber(candidate.bestQuizScore)),
    totalMinutesSpent: toNonNegativeNumber(candidate.totalMinutesSpent),
    lastVisitedAt: typeof candidate.lastVisitedAt === 'string' ? candidate.lastVisitedAt : null,
    recitation: normalizeRecitationMetrics(candidate.recitation)
  };
};

const normalizeLessonStudyRecord = (value: unknown): LessonStudyRecord => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {
      notes: '',
      highlights: [],
      reflectionResponses: {},
      discussion: [],
      analytics: normalizeLessonAnalytics(undefined),
      spiritualState: createEmptySpiritualState()
    };
  }

  const candidate = value as Partial<LessonStudyRecord>;

  return {
    notes: typeof candidate.notes === 'string' ? candidate.notes : '',
    highlights: normalizeStringArray(candidate.highlights),
    reflectionResponses: normalizeReflectionResponses(candidate.reflectionResponses),
    discussion: normalizeDiscussion(candidate.discussion),
    analytics: normalizeLessonAnalytics(candidate.analytics),
    spiritualState: normalizeSpiritualState(candidate.spiritualState)
  };
};

const normalizeLessonStudyStore = (value: unknown): LessonStudyStore => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return defaultStore;
  }

  const lessons = (value as Partial<LessonStudyStore>).lessons;
  if (!lessons || typeof lessons !== 'object' || Array.isArray(lessons)) {
    return defaultStore;
  }

  return {
    lessons: Object.entries(lessons as Record<string, unknown>).reduce<Record<string, LessonStudyRecord>>((result, [lessonId, record]) => {
      result[lessonId] = normalizeLessonStudyRecord(record);
      return result;
    }, {})
  };
};

const createReference = (
  id: string,
  sourceType: LessonReference['sourceType'],
  citation: string,
  excerpt: string,
  connection: string
): LessonReference => ({ id, sourceType, citation, excerpt, connection });

const createFallbackReflectionQuestions = (
  title: string,
  objectives: string[],
  takeaways: string[]
): string[] => {
  const firstObjective = objectives[0] || 'understand the main lesson idea';
  const firstTakeaway = takeaways[0] || 'the most important lesson point';

  return [
    `Which part of ${title} most challenged or strengthened you today?`,
    `How would you explain "${firstTakeaway}" to a younger student or a family member?`,
    `What one action will you take this week to practice ${firstObjective.toLowerCase()}?`
  ];
};

const genericQuranStudyReferences = [
  createReference(
    'quran-study-1',
    'Quran',
    'Quran 38:29',
    'Allah describes the Quran as a blessed Book revealed so people may reflect deeply on its verses.',
    'This anchors lesson study in tadabbur, not passive reading.'
  ),
  createReference(
    'quran-study-2',
    'Hadith',
    'Sahih al-Bukhari 5027',
    'The Prophet taught that the best people are those who learn the Quran and teach it.',
    'This keeps the lesson tied to learning, practice, and teaching responsibility.'
  )
];

const dedicatedReferenceRules: Array<{
  test: RegExp;
  references: LessonReference[];
}> = [
  {
    test: /(iman|faith)/i,
    references: [
      createReference(
        'iman-1',
        'Quran',
        'Quran 2:285',
        'The believers affirm Allah, His angels, His books, and His messengers.',
        'This verse gives a compact framework for the pillars of belief.'
      ),
      createReference(
        'iman-2',
        'Hadith',
        'Sahih Muslim 8',
        'In the Hadith of Jibril, the Prophet listed belief in Allah, His angels, His books, His messengers, the Last Day, and decree.',
        'This is the central Prophetic reference for the six pillars of Iman.'
      )
    ]
  },
  {
    test: /(tawhid|sincerity|intention)/i,
    references: [
      createReference(
        'ikhlas-1',
        'Quran',
        'Quran 98:5',
        'People were commanded to worship Allah with sincere devotion.',
        'This verse ties worship directly to ikhlas and purified intention.'
      ),
      createReference(
        'ikhlas-2',
        'Hadith',
        'Sahih al-Bukhari 1',
        'The Prophet taught that actions are judged by intentions.',
        'This hadith keeps intention at the center of visible and hidden worship.'
      )
    ]
  },
  {
    test: /(quran|sunnah|guidance|tafsir|translation|study)/i,
    references: [
      createReference(
        'guidance-1',
        'Quran',
        'Quran 16:44',
        'Allah states that the Messenger was sent to clarify what was revealed to people.',
        'This supports why revelation is studied through explanation and Prophetic teaching.'
      ),
      createReference(
        'guidance-2',
        'Hadith',
        'Sunan Abi Dawud 4604',
        'The Prophet said he was given the Quran and guidance alongside it.',
        'This lesson connects the Quran with Prophetic explanation rather than isolated reading.'
      )
    ]
  },
  {
    test: /(purity|taharah|wudu)/i,
    references: [
      createReference(
        'taharah-1',
        'Quran',
        'Quran 5:6',
        'Allah teaches believers how to prepare for prayer through wudu and purification.',
        'This is the main textual anchor for ritual purity before worship.'
      ),
      createReference(
        'taharah-2',
        'Hadith',
        'Sahih Muslim 223',
        'The Prophet described purification as half of faith.',
        'This shows that cleanliness is spiritual discipline, not just routine hygiene.'
      )
    ]
  },
  {
    test: /(salah|prayer|adhan)/i,
    references: [
      createReference(
        'salah-1',
        'Quran',
        'Quran 20:14',
        'Allah commands prayer to keep His remembrance established.',
        'This grounds the lesson in the purpose of Salah.'
      ),
      createReference(
        'salah-2',
        'Hadith',
        'Sahih al-Bukhari 631',
        'The Prophet instructed the Ummah to pray as they saw him pray.',
        'This is the practical basis for learning prayer step by step.'
      )
    ]
  },
  {
    test: /(fatihah)/i,
    references: [
      createReference(
        'fatihah-1',
        'Quran',
        'Quran 15:87',
        'Allah refers to the seven oft-repeated verses and the magnificent Quran.',
        'This verse highlights the special standing of Al-Fatihah.'
      ),
      createReference(
        'fatihah-2',
        'Hadith',
        'Sahih al-Bukhari 4474',
        'The Prophet described Al-Fatihah as Umm al-Kitab and the seven oft-repeated verses.',
        'This ties the Surah to worship, identity, and the heart of Quran recitation.'
      )
    ]
  }
];

const nooraniReferenceRules: Array<{
  test: RegExp;
  references: LessonReference[];
}> = [
  {
    test: /(alphabet|letters|harakat|joining|sukoon|madd|tanween)/i,
    references: [
      createReference(
        'noorani-letters-1',
        'Quran',
        'Quran 96:1-5',
        'The first revealed verses begin with reading and learning by the permission of Allah.',
        'This gives sacred purpose to beginning reading lessons and disciplined study.'
      ),
      createReference(
        'noorani-letters-2',
        'Hadith',
        'Sahih Muslim 798',
        'The Prophet praised the one who recites the Quran with skill and encouraged the struggling learner with double reward.',
        'This keeps early reading practice hopeful and perseverance-focused.'
      )
    ]
  },
  {
    test: /(tajweed|recitation|pronunciation)/i,
    references: [
      createReference(
        'tajweed-1',
        'Quran',
        'Quran 73:4',
        'Allah commands the Quran to be recited with measured, careful recitation.',
        'This is the core Quranic basis for Tajweed discipline and pacing.'
      ),
      createReference(
        'tajweed-2',
        'Hadith',
        'Sahih Muslim 798',
        'The skilled reciter is elevated, and the struggling reciter is still rewarded for effort.',
        'This encourages both precision and patience during recitation training.'
      )
    ]
  },
  {
    test: /(wudu|purity|adhan|iqamah|prayer|salah)/i,
    references: [
      createReference(
        'noorani-salah-1',
        'Quran',
        'Quran 5:6',
        'Allah teaches purification before prayer as part of worship readiness.',
        'This grounds practical worship lessons in direct revelation.'
      ),
      createReference(
        'noorani-salah-2',
        'Hadith',
        'Sahih al-Bukhari 631',
        'The Prophet said to pray as you have seen me pray.',
        'This makes step-by-step Salah instruction a direct Prophetic method.'
      )
    ]
  }
];

export const createEmptyLessonStudyRecord = (): LessonStudyRecord => ({
  notes: '',
  highlights: [],
  reflectionResponses: {},
  discussion: [],
  analytics: {
    viewCount: 0,
    completionCount: 0,
    quizAttempts: 0,
    bestQuizScore: 0,
    totalMinutesSpent: 0,
    lastVisitedAt: null,
    recitation: createEmptyRecitationMetrics()
  },
  spiritualState: createEmptySpiritualState()
});

export const getLessonStudyStorageKey = (courseId: string, userId?: string | null): string | null => {
  if (!userId) {
    return null;
  }

  return `${courseId}-lesson-experience-${userId}`;
};

export const loadLessonStudyStore = (courseId: string, userId?: string | null): LessonStudyStore => {
  const storageKey = getLessonStudyStorageKey(courseId, userId);
  if (!storageKey) {
    return defaultStore;
  }

  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return defaultStore;
    }

    const parsed = JSON.parse(raw) as LessonStudyStore;
    return normalizeLessonStudyStore(parsed);
  } catch (error) {
    console.error('Failed to load lesson experience store:', error);
    return defaultStore;
  }
};

export const saveLessonStudyStore = (courseId: string, userId: string | null | undefined, store: LessonStudyStore) => {
  const storageKey = getLessonStudyStorageKey(courseId, userId);
  if (!storageKey) {
    return;
  }

  localStorage.setItem(storageKey, JSON.stringify(store));
};

export const updateLessonRecord = (
  store: LessonStudyStore,
  lessonId: string,
  updater: (record: LessonStudyRecord) => LessonStudyRecord
): LessonStudyStore => {
  const currentRecord = normalizeLessonStudyRecord(store.lessons[lessonId]);
  const nextRecord = updater(currentRecord);

  if (nextRecord === currentRecord) {
    return store;
  }

  return {
    ...store,
    lessons: {
      ...store.lessons,
      [lessonId]: nextRecord
    }
  };
};

export const markLessonViewed = (record: LessonStudyRecord): LessonStudyRecord => ({
  ...record,
  analytics: {
    ...record.analytics,
    viewCount: record.analytics.viewCount + 1,
    lastVisitedAt: new Date().toISOString()
  }
});

export const finalizeLessonSession = (
  record: LessonStudyRecord,
  sessionStartedAt: number,
  estimatedMinutes?: number
): LessonStudyRecord => {
  const elapsedMinutes = Math.max(1, Math.round((Date.now() - sessionStartedAt) / 60000));
  const boundedMinutes = estimatedMinutes ? Math.min(elapsedMinutes, Math.max(estimatedMinutes * 2, estimatedMinutes + 5)) : elapsedMinutes;

  return {
    ...record,
    analytics: {
      ...record.analytics,
      totalMinutesSpent: record.analytics.totalMinutesSpent + boundedMinutes
    }
  };
};

export const syncRecitationMetrics = (
  record: LessonStudyRecord,
  evaluation: Pick<LessonRecitationEvaluation, 'score' | 'transcript'>
): LessonStudyRecord => {
  const transcript = evaluation.transcript.trim();
  const nextRecitation = {
    attempts: record.analytics.recitation.attempts + 1,
    bestScore: Math.max(record.analytics.recitation.bestScore, evaluation.score),
    lastScore: evaluation.score,
    lastTranscript: transcript,
    lastAttemptAt: new Date().toISOString()
  };

  return {
    ...record,
    analytics: {
      ...record.analytics,
      recitation: nextRecitation
    }
  };
};

export const markSpiritualReminderSeen = (record: LessonStudyRecord): LessonStudyRecord => ({
  ...record,
  spiritualState: {
    ...record.spiritualState,
    reminderSeenAt: new Date().toISOString()
  }
});

export const syncPracticeChecklistItem = (
  record: LessonStudyRecord,
  practiceId: string,
  completed: boolean
): LessonStudyRecord => {
  const nextCompletedIds = completed
    ? Array.from(new Set([...record.spiritualState.completedPracticeIds, practiceId]))
    : record.spiritualState.completedPracticeIds.filter((id) => id !== practiceId);

  if (nextCompletedIds.length === record.spiritualState.completedPracticeIds.length &&
      nextCompletedIds.every((id, index) => id === record.spiritualState.completedPracticeIds[index])) {
    return record;
  }

  return {
    ...record,
    spiritualState: {
      ...record.spiritualState,
      completedPracticeIds: nextCompletedIds
    }
  };
};

export const syncLessonAchievementMetrics = (
  record: LessonStudyRecord,
  completed: boolean,
  quizAttempts: number,
  bestQuizScore: number
): LessonStudyRecord => {
  const nextCompletionCount = completed ? Math.max(record.analytics.completionCount, 1) : record.analytics.completionCount;
  const nextQuizAttempts = Math.max(record.analytics.quizAttempts, quizAttempts);
  const nextBestScore = Math.max(record.analytics.bestQuizScore, bestQuizScore);

  if (
    nextCompletionCount === record.analytics.completionCount &&
    nextQuizAttempts === record.analytics.quizAttempts &&
    nextBestScore === record.analytics.bestQuizScore
  ) {
    return record;
  }

  return {
    ...record,
    analytics: {
      ...record.analytics,
      completionCount: nextCompletionCount,
      quizAttempts: nextQuizAttempts,
      bestQuizScore: nextBestScore
    }
  };
};

export const buildLessonInsight = (
  record: LessonStudyRecord,
  options: {
    completed: boolean;
    reflectionQuestionCount: number;
    extensionAvailable?: boolean;
  }
): LessonInsight => {
  const answeredReflections = Object.values(record.reflectionResponses).filter((value) => value.trim().length > 0).length;
  const quizComponent = record.analytics.bestQuizScore > 0 ? record.analytics.bestQuizScore * 0.38 : 20;
  const recitationComponent = record.analytics.recitation.attempts > 0 ? record.analytics.recitation.bestScore * 0.22 : 0;
  const notesComponent = record.notes.trim().length > 0 ? 10 : 0;
  const highlightComponent = Math.min(record.highlights.length * 5, 15);
  const reflectionComponent = Math.min(answeredReflections * 6, options.reflectionQuestionCount > 0 ? 18 : 0);
  const completionComponent = options.completed ? 12 : 0;
  const practiceComponent = Math.min(record.spiritualState.completedPracticeIds.length * 4, 12);
  const understandingScore = Math.min(100, Math.round(quizComponent + recitationComponent + notesComponent + highlightComponent + reflectionComponent + completionComponent + practiceComponent));

  const reasons: string[] = [];
  if (record.analytics.viewCount >= 4) {
    reasons.push('You have revisited this lesson several times, which suggests the topic needs reinforcement.');
  }
  if (record.analytics.quizAttempts >= 2 && record.analytics.bestQuizScore < 75) {
    reasons.push('Quiz attempts are increasing without a strong score jump yet.');
  }
  if (record.analytics.recitation.attempts > 0 && record.analytics.recitation.bestScore < 70) {
    reasons.push('Your recitation accuracy still needs a slower, more deliberate repetition pass.');
  }
  if (!record.notes.trim() && answeredReflections === 0) {
    reasons.push('Writing one note or reflection will improve retention after the lesson.');
  }
  if (record.spiritualState.completedPracticeIds.length === 0) {
    reasons.push('Finishing one practice action will help convert this lesson into a lived habit.');
  }

  let status: LessonInsight['status'] = 'on-track';
  if (understandingScore < 55) {
    status = 'high-risk';
  } else if (understandingScore < 75) {
    status = 'needs-support';
  }

  let nextStep = options.extensionAvailable
    ? 'You are ready to move into the optional extension path after a quick review.'
    : 'Keep your momentum by moving to the next lesson after a short recap.';

  if (status === 'needs-support') {
    nextStep = 'Review your key takeaways, complete one practice action, and use the learning path guidance before moving on.';
  }

  if (status === 'high-risk') {
    nextStep = 'Pause progression, revisit the lesson blocks, repeat the recitation slowly, and ask a teacher or the AI tutor for clarification before retrying.';
  }

  return {
    understandingScore,
    status,
    reasons,
    nextStep
  };
};

export const buildWeakLessonBreakdown = (
  lessons: Array<{ id: string; title: string }>,
  store: LessonStudyStore
): WeakLessonInsight[] => {
  return lessons
    .map((lesson) => {
      const record = normalizeLessonStudyRecord(store.lessons[lesson.id]);
      const insight = buildLessonInsight(record, {
        completed: record.analytics.completionCount > 0,
        reflectionQuestionCount: Math.max(Object.keys(record.reflectionResponses).length, 3)
      });

      return {
        lessonId: lesson.id,
        title: lesson.title,
        understandingScore: insight.understandingScore,
        status: insight.status,
      };
    })
    .filter((lesson) => {
      const record = store.lessons[lesson.lessonId];
      return Boolean(
        record && (
          record.analytics.viewCount > 0 ||
          record.analytics.quizAttempts > 0 ||
          record.analytics.recitation.attempts > 0 ||
          record.notes.trim() ||
          record.highlights.length > 0 ||
          record.spiritualState.completedPracticeIds.length > 0
        )
      );
    })
    .sort((left, right) => left.understandingScore - right.understandingScore);
};

const simpleLessonKeywordText = (title: string, keyTakeaways: string[] = []): string => `${title} ${keyTakeaways.join(' ')}`.toLowerCase();

const lessonSpiritualRules = [
  {
    test: /(salah|prayer|adhan|iqamah)/i,
    reminder: 'Let this lesson reach your next prayer so the knowledge becomes worship instead of remaining theory.',
    reminderSource: 'Quran 20:14',
    duaArabic: 'اللهم أعني على ذكرك وشكرك وحسن عبادتك',
    duaTransliteration: 'Allahumma ainni ala dhikrika wa shukrika wa husni ibadatik.',
    duaTranslation: 'O Allah, help me remember You, thank You, and worship You beautifully.'
  },
  {
    test: /(quran|tajweed|recitation|fatihah|translation)/i,
    reminder: 'Recite with calm attention today so the Quran shapes the heart before it reaches the tongue.',
    reminderSource: 'Quran 73:4',
    duaArabic: 'اللهم ارحمني بالقرآن واجعله لي إماما ونورا وهدى ورحمة',
    duaTransliteration: 'Allahummarhamni bil-Qurani wajalhu li imaman wa nuran wa hudan wa rahmah.',
    duaTranslation: 'O Allah, have mercy on me through the Quran and make it for me a guide, a light, and a mercy.'
  },
  {
    test: /(purity|taharah|wudu)/i,
    reminder: 'Link outward cleanliness to inward sincerity so preparation for worship stays purposeful.',
    reminderSource: 'Quran 5:6',
    duaArabic: 'اللهم طهر قلبي وحصن فرجي واغفر لي ذنبي',
    duaTransliteration: 'Allahumma tahhir qalbi wa hassin farji waghfir li dhanbi.',
    duaTranslation: 'O Allah, purify my heart, guard me, and forgive my sin.'
  },
  {
    test: /.*/,
    reminder: 'Turn one lesson point into one action today so beneficial knowledge reaches the heart and the limbs.',
    reminderSource: 'Quran 38:29',
    duaArabic: 'اللهم انفعني بما علمتني وعلمني ما ينفعني وزدني علما',
    duaTransliteration: 'Allahumma anfani bima allamtani wa allimni ma yanfauni wa zidni ilman.',
    duaTranslation: 'O Allah, benefit me by what You taught me, teach me what benefits me, and increase me in knowledge.'
  }
];

const buildPracticeChecklist = (title: string, keyTakeaways: string[]): LessonPracticeChecklistItem[] => {
  const takeawayItems = keyTakeaways.slice(0, 2).map((takeaway, index) => ({
    id: `practice-${index + 1}`,
    label: `Review and apply: ${takeaway}`
  }));

  const titleText = title.toLowerCase();
  const practiceAction = /(quran|tajweed|recitation|fatihah)/i.test(titleText)
    ? 'practice-3::Recite the featured passage slowly three times with focus on accuracy.'
    : /(salah|prayer)/i.test(titleText)
      ? 'practice-3::Carry one lesson point into your next prayer.'
      : 'practice-3::Write one action step you will carry out before your next study session.';

  const [practiceId, practiceLabel] = practiceAction.split('::');

  return [
    ...takeawayItems,
    {
      id: practiceId,
      label: practiceLabel
    }
  ];
};

export const buildLessonSpiritualGuidance = (title: string, keyTakeaways: string[]): LessonSpiritualGuidance => {
  const keywordText = simpleLessonKeywordText(title, keyTakeaways);
  const matchedRule = lessonSpiritualRules.find((rule) => rule.test.test(keywordText)) || lessonSpiritualRules[lessonSpiritualRules.length - 1];

  return {
    reminder: matchedRule.reminder,
    reminderSource: matchedRule.reminderSource,
    duaArabic: matchedRule.duaArabic,
    duaTransliteration: matchedRule.duaTransliteration,
    duaTranslation: matchedRule.duaTranslation,
    checklist: buildPracticeChecklist(title, keyTakeaways)
  };
};

const resolveNextMilestone = (overallProgress: number): string => {
  const nextThreshold = [25, 50, 75, 100].find((threshold) => threshold > overallProgress);
  return nextThreshold ? `${nextThreshold}% milestone` : 'Course completion';
};

export const buildLessonProgressPrediction = (options: {
  insight: LessonInsight;
  overallProgress: number;
  currentLessonIndex: number;
  totalLessons: number;
}): LessonProgressPrediction => {
  const { insight, overallProgress, currentLessonIndex, totalLessons } = options;
  const pathMode: LessonProgressPrediction['pathMode'] = insight.status === 'high-risk'
    ? 'revision'
    : insight.status === 'needs-support'
      ? 'steady'
      : insight.understandingScore >= 85
        ? 'advanced'
        : 'steady';

  const completedLessonsEstimate = totalLessons > 0
    ? Math.max(0, Math.min(totalLessons, Math.round((overallProgress / 100) * totalLessons)))
    : 0;
  const currentPosition = Math.max(completedLessonsEstimate, currentLessonIndex + 1);
  const remainingLessons = Math.max(totalLessons - currentPosition, 0);
  const paceMultiplier = pathMode === 'revision' ? 1.7 : pathMode === 'steady' ? 1.2 : 0.85;
  const estimatedSessionsRemaining = remainingLessons === 0 ? 0 : Math.max(1, Math.round(remainingLessons * paceMultiplier));
  const nextMilestone = resolveNextMilestone(overallProgress);
  const paceLabel = pathMode === 'revision' ? 'Recovery pace' : pathMode === 'steady' ? 'Steady pace' : 'Acceleration pace';

  let summary = 'Keep the current rhythm and continue building stable lesson habits.';
  if (pathMode === 'revision') {
    summary = 'A short review cycle now will reduce struggle later and protect course momentum.';
  } else if (pathMode === 'advanced') {
    summary = 'You are in a strong position to keep progressing and use extension material without losing depth.';
  }

  const projectedCompletionText = remainingLessons === 0
    ? 'You are at the final stretch of this course.'
    : nextMilestone === 'Course completion'
      ? `${estimatedSessionsRemaining} focused study sessions are likely enough to finish the course at your current pace.`
      : `${estimatedSessionsRemaining} focused study sessions are likely enough to reach the ${nextMilestone}.`;

  return {
    pathMode,
    paceLabel,
    estimatedSessionsRemaining,
    projectedCompletionText,
    nextMilestone,
    summary
  };
};

export const buildPersonalizedLearningPath = (options: {
  insight: LessonInsight;
  weakLessons: WeakLessonInsight[];
  lessonTitle: string;
  extensionAvailable?: boolean;
}): LessonPathRecommendation => {
  const { insight, weakLessons, lessonTitle, extensionAvailable } = options;
  const weakestLesson = weakLessons[0]?.title;
  const mode: LessonPathRecommendation['mode'] = insight.status === 'high-risk'
    ? 'revision'
    : insight.status === 'needs-support'
      ? 'steady'
      : extensionAvailable || insight.understandingScore >= 85
        ? 'advanced'
        : 'steady';

  if (mode === 'revision') {
    return {
      mode,
      headline: 'Revision Path',
      summary: 'Slow down on new content and stabilize this lesson before adding more load.',
      steps: [
        `Revisit ${lessonTitle} and rewrite the lesson in your own words.`,
        weakestLesson ? `Review ${weakestLesson} alongside this lesson because both areas need reinforcement.` : 'Repeat the weakest section of the lesson before your next quiz attempt.',
        'Complete the practice checklist and ask one clear question if anything still feels uncertain.'
      ]
    };
  }

  if (mode === 'advanced') {
    return {
      mode,
      headline: 'Advanced Path',
      summary: 'You can keep moving while adding one deeper exercise so progress stays meaningful.',
      steps: [
        `Finish ${lessonTitle} with one short teach-back summary from memory.`,
        extensionAvailable ? 'Use one optional extension resource before the next lesson.' : 'Add one extra self-test question before moving forward.',
        'Keep your recitation or practice sharp so speed does not outrun quality.'
      ]
    };
  }

  return {
    mode,
    headline: 'Steady Path',
    summary: 'Continue forward, but keep a short revision loop so understanding stays consistent.',
    steps: [
      `Complete ${lessonTitle} with notes, one reflection, and one practice action.`,
      weakestLesson ? `Revisit ${weakestLesson} for five focused minutes before your next new lesson.` : 'Take a short recap pass before your next new lesson.',
      'Use the AI tutor or discussion thread for one clarification instead of carrying confusion forward.'
    ]
  };
};

const stripArabicDiacritics = (value: string): string => value
  .normalize('NFKD')
  .replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '')
  .replace(/ـ/g, '');

const normalizeRecitationText = (value: string): string => stripArabicDiacritics(value)
  .toLowerCase()
  .replace(/[^\p{L}\p{N}\s]/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokenizeRecitationText = (value: string): string[] => {
  const normalized = normalizeRecitationText(value);
  return normalized ? normalized.split(' ') : [];
};

export const evaluateRecitationTranscript = (
  transcript: string,
  target: LessonRecitationTarget | null | undefined
): LessonRecitationEvaluation => {
  const cleanedTranscript = transcript.trim();
  const transcriptHasArabic = /[\u0600-\u06FF]/.test(cleanedTranscript);
  const targetText = transcriptHasArabic
    ? target?.arabicText?.trim() || target?.transliteration?.trim() || ''
    : target?.transliteration?.trim() || target?.arabicText?.trim() || '';

  const targetTokens = tokenizeRecitationText(targetText);
  const transcriptTokens = tokenizeRecitationText(cleanedTranscript);

  if (!targetTokens.length || !transcriptTokens.length) {
    return {
      score: 0,
      transcript: cleanedTranscript,
      targetText,
      matchedTokens: [],
      missingTokens: targetTokens,
      extraTokens: transcriptTokens
    };
  }

  const spokenTokenCounts = transcriptTokens.reduce<Map<string, number>>((counts, token) => {
    counts.set(token, (counts.get(token) || 0) + 1);
    return counts;
  }, new Map<string, number>());

  const matchedTokens: string[] = [];
  const missingTokens: string[] = [];

  targetTokens.forEach((token) => {
    const remaining = spokenTokenCounts.get(token) || 0;
    if (remaining > 0) {
      matchedTokens.push(token);
      spokenTokenCounts.set(token, remaining - 1);
    } else {
      missingTokens.push(token);
    }
  });

  const extraTokens = Array.from(spokenTokenCounts.entries()).flatMap(([token, count]) => Array.from({ length: count }, () => token));
  const matchedRatio = matchedTokens.length / targetTokens.length;
  const score = Math.max(0, Math.min(100, Math.round((matchedRatio * 100) - (missingTokens.length * 8) - (extraTokens.length * 4))));

  return {
    score,
    transcript: cleanedTranscript,
    targetText,
    matchedTokens,
    missingTokens,
    extraTokens
  };
};

export const resolveDedicatedReflectionQuestions = (lesson: CourseModuleLesson): string[] => {
  const blockPrompts = lesson.blocks
    .filter((block) => block.type === 'reflection')
    .map((block) => block.content || block.title || '')
    .filter((value) => value.trim().length > 0);

  if (blockPrompts.length >= 3) {
    return blockPrompts;
  }

  return [...blockPrompts, ...createFallbackReflectionQuestions(lesson.title, lesson.objectives, lesson.keyPoints)].slice(0, 3);
};

export const resolveNooraniReflectionQuestions = (lesson: NooraniLesson): string[] => {
  return createFallbackReflectionQuestions(lesson.title, lesson.content.learningObjectives, lesson.content.keyPoints);
};

const resolveReferencesFromRules = (title: string, rules: Array<{ test: RegExp; references: LessonReference[] }>) => {
  const match = rules.find((rule) => rule.test.test(title));
  return match?.references || genericQuranStudyReferences;
};

export const resolveDedicatedLessonReferences = (courseId: string, lesson: CourseModuleLesson): LessonReference[] => {
  const title = `${courseId} ${lesson.title}`;
  return resolveReferencesFromRules(title, dedicatedReferenceRules);
};

export const resolveNooraniLessonReferences = (lesson: NooraniLesson): LessonReference[] => {
  return resolveReferencesFromRules(lesson.title, nooraniReferenceRules);
};

export const resolveDedicatedRecitationTarget = (lesson: CourseModuleLesson): LessonRecitationTarget | null => {
  const block = lesson.blocks.find((candidate) => Boolean(candidate.arabicText?.trim() || candidate.transliteration?.trim()));
  if (!block) {
    return null;
  }

  return {
    arabicText: block.arabicText?.trim() || undefined,
    transliteration: block.transliteration?.trim() || undefined
  };
};

export const resolveNooraniRecitationTarget = (lesson: NooraniLesson): LessonRecitationTarget | null => {
  const block = lesson.content.mainContent.find((candidate) => Boolean(candidate.arabicText?.trim() || candidate.transliteration?.trim()));
  if (block) {
    return {
      arabicText: block.arabicText?.trim() || undefined,
      transliteration: block.transliteration?.trim() || undefined
    };
  }

  if (lesson.content.transliteration?.trim()) {
    return {
      transliteration: lesson.content.transliteration.trim()
    };
  }

  return null;
};

export const buildDedicatedLessonContext = (lesson: CourseModuleLesson): string => {
  const blocks = lesson.blocks
    .map((block) => [block.title, block.content, block.items?.join('; ')].filter(Boolean).join(': '))
    .filter(Boolean)
    .join('\n');

  return [
    `Lesson title: ${lesson.title}`,
    `Description: ${lesson.description}`,
    `Objectives: ${lesson.objectives.join('; ')}`,
    `Key takeaways: ${lesson.keyPoints.join('; ')}`,
    `Lesson blocks: ${blocks}`
  ].join('\n');
};

export const buildNooraniLessonContext = (lesson: NooraniLesson): string => {
  const blocks = lesson.content.mainContent
    .map((block) => [block.content, block.arabicText, block.transliteration].filter(Boolean).join(' | '))
    .filter(Boolean)
    .join('\n');

  return [
    `Lesson title: ${lesson.title}`,
    `Description: ${lesson.description}`,
    `Introduction: ${lesson.content.introduction}`,
    `Objectives: ${lesson.content.learningObjectives.join('; ')}`,
    `Key takeaways: ${lesson.content.keyPoints.join('; ')}`,
    `Lesson blocks: ${blocks}`
  ].join('\n');
};