/**
 * Gamification Service
 * Manages XP, streaks, badges, and student engagement metrics
 */

export interface XPTransaction {
  id: string;
  studentId: string;
  actionType: 'lesson-complete' | 'quiz-pass' | 'quiz-perfect' | 'streak-bonus' | 'weak-area-passed' | 'recording-submitted';
  xpAwarded: number;
  lessonId: string;
  createdAt: string;
}

export interface StudentBadge {
  id: string;
  badgeId: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: string;
  lessonThreshold: number;
}

export interface GamificationStatus {
  studentId: string;
  totalXP: number;
  level: number;
  currentLevelProgress: number; // 0-100
  streak: number;
  badges: StudentBadge[];
  nextBadgeThreshold?: number;
}

// XP reward amounts
const XP_REWARDS = {
  LESSON_COMPLETE: 10,
  QUIZ_PASS_70_79: 5,
  QUIZ_PASS_80_89: 10,
  QUIZ_PASS_90_PLUS: 20,
  PERFECT_FIRST_ATTEMPT: 15,
  STREAK_BONUS_PER_DAY: 1, // Max 20 on day 7
  WEAK_AREA_PASSED: 25,
  RECORDING_SUBMITTED: 3,
};

// XP needed per level (exponential growth)
const XP_PER_LEVEL = (level: number): number => {
  return 100 * level * level; // Level 1: 100, Level 2: 400, Level 3: 900, etc.
};

// Badge definitions
const BADGES: Record<string, StudentBadge> = {
  'first-lesson': {
    id: 'first-lesson',
    badgeId: 'first-lesson',
    title: 'Getting Started',
    description: 'Completed your first Noorani lesson',
    icon: '🚀',
    earnedAt: '',
    lessonThreshold: 1,
  },
  'haafiz-helper': {
    id: 'haafiz-helper',
    badgeId: 'haafiz-helper',
    title: 'Hifz Helper',
    description: 'Completed 5 lessons on pronunciation',
    icon: '🎯',
    earnedAt: '',
    lessonThreshold: 5,
  },
  'consistency-champion': {
    id: 'consistency-champion',
    badgeId: 'consistency-champion',
    title: 'Consistency Champion',
    description: 'Maintained a 7-day practice streak',
    icon: '🔥',
    earnedAt: '',
    lessonThreshold: 7,
  },
  'perfect-score': {
    id: 'perfect-score',
    badgeId: 'perfect-score',
    title: 'Perfect Score',
    description: 'Scored 100% on a lesson quiz on first attempt',
    icon: '⭐',
    earnedAt: '',
    lessonThreshold: 1,
  },
  'quiz-master': {
    id: 'quiz-master',
    badgeId: 'quiz-master',
    title: 'Quiz Master',
    description: 'Passed 10 quizzes with 90% or higher',
    icon: '🏆',
    earnedAt: '',
    lessonThreshold: 10,
  },
  'fast-learner': {
    id: 'fast-learner',
    badgeId: 'fast-learner',
    title: 'Fast Learner',
    description: 'Completed first 5 lessons in under 2 weeks',
    icon: '⚡',
    earnedAt: '',
    lessonThreshold: 5,
  },
  'voice-practitioner': {
    id: 'voice-practitioner',
    badgeId: 'voice-practitioner',
    title: 'Voice Practitioner',
    description: 'Submitted 20 voice recordings',
    icon: '🎤',
    earnedAt: '',
    lessonThreshold: 20,
  },
  'phase-1-graduate': {
    id: 'phase-1-graduate',
    badgeId: 'phase-1-graduate',
    title: 'Phase 1 Graduate',
    description: 'Completed all Phase 1 (Foundations) lessons',
    icon: '🎓',
    earnedAt: '',
    lessonThreshold: 6,
  },
};

/**
 * Calculate XP for a lesson completion
 */
export const calculateLessonXP = (
  quizScore?: number,
  firstAttempt: boolean = true,
  wasWeakArea: boolean = false
): number => {
  let xp = XP_REWARDS.LESSON_COMPLETE;

  if (quizScore !== undefined) {
    if (quizScore >= 90) {
      xp += XP_REWARDS.QUIZ_PASS_90_PLUS;
      if (firstAttempt) {
        xp += XP_REWARDS.PERFECT_FIRST_ATTEMPT;
      }
    } else if (quizScore >= 80) {
      xp += XP_REWARDS.QUIZ_PASS_80_89;
    } else if (quizScore >= 70) {
      xp += XP_REWARDS.QUIZ_PASS_70_79;
    }
  }

  if (wasWeakArea) {
    xp += XP_REWARDS.WEAK_AREA_PASSED;
  }

  return xp;
};

/**
 * Calculate XP for voice recording submission
 */
export const calculateRecordingXP = (): number => {
  return XP_REWARDS.RECORDING_SUBMITTED;
};

/**
 * Calculate streak bonus XP (max 20 on day 7)
 */
export const calculateStreakBonusXP = (streakDays: number): number => {
  return Math.min(streakDays * XP_REWARDS.STREAK_BONUS_PER_DAY, 20);
};

/**
 * Calculate level and progress from total XP
 */
export const calculateLevelFromXP = (totalXP: number): { level: number; currentLevelProgress: number } => {
  let xpRemaining = totalXP;
  let level = 1;

  while (xpRemaining >= XP_PER_LEVEL(level + 1)) {
    xpRemaining -= XP_PER_LEVEL(level);
    level++;
  }

  const xpForCurrentLevel = XP_PER_LEVEL(level);
  const currentLevelProgress = Math.round((xpRemaining / xpForCurrentLevel) * 100);

  return {
    level,
    currentLevelProgress: Math.min(currentLevelProgress, 100),
  };
};

/**
 * Determine which badges should be earned
 */
export const determineBadgesToEarn = (
  lessonsCompleted: number,
  streak: number,
  perfectScores: number,
  totalQuizzesOver90: number,
  recordingsSubmitted: number,
  daysSinceStart: number
): string[] => {
  const earnedBadgeIds: string[] = [];

  if (lessonsCompleted >= 1) earnedBadgeIds.push('first-lesson');
  if (lessonsCompleted >= 5) earnedBadgeIds.push('haafiz-helper');
  if (streak >= 7) earnedBadgeIds.push('consistency-champion');
  if (perfectScores >= 1) earnedBadgeIds.push('perfect-score');
  if (totalQuizzesOver90 >= 10) earnedBadgeIds.push('quiz-master');
  if (lessonsCompleted >= 5 && daysSinceStart <= 14) earnedBadgeIds.push('fast-learner');
  if (recordingsSubmitted >= 20) earnedBadgeIds.push('voice-practitioner');
  if (lessonsCompleted >= 6) earnedBadgeIds.push('phase-1-graduate'); // Phase 1 has 6 lessons

  return earnedBadgeIds;
};

/**
 * Calculate current gamification status
 */
export const calculateGamificationStatus = (
  studentId: string,
  totalXP: number,
  lessonsCompleted: number,
  streak: number,
  earnedBadgeIds: string[]
): GamificationStatus => {
  const { level, currentLevelProgress } = calculateLevelFromXP(totalXP);
  const xpForNextLevel = XP_PER_LEVEL(level + 1);

  const badges: StudentBadge[] = earnedBadgeIds
    .map(id => BADGES[id])
    .filter(Boolean) as StudentBadge[];

  // Determine next badge threshold
  let nextBadgeThreshold: number | undefined;
  if (lessonsCompleted < 5) {
    nextBadgeThreshold = 5; // Haafiz Helper badge
  } else if (streak < 7) {
    nextBadgeThreshold = 7; // Consistency Champion badge
  }

  return {
    studentId,
    totalXP,
    level,
    currentLevelProgress,
    streak,
    badges,
    nextBadgeThreshold,
  };
};

/**
 * Format XP amount with unit
 */
export const formatXP = (xp: number): string => {
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}k XP`;
  }
  return `${xp} XP`;
};

/**
 * Get level name/title
 */
export const getLevelTitle = (level: number): string => {
  const titles = [
    'Beginner',
    'Learner',
    'Practitioner',
    'Proficient',
    'Advanced',
    'Master',
    'Expert',
    'Scholar',
    'Grand Master',
  ];

  return titles[Math.max(0, Math.min(level - 1, titles.length - 1))];
};

/**
 * Calculate next XP milestone
 */
export const getNextXPMilestone = (totalXP: number, level: number): number => {
  return XP_PER_LEVEL(level + 1) - totalXP;
};
