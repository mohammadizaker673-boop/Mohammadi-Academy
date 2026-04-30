// ============================================
// HIFZ SYSTEM SERVICE LAYER
// ============================================

import {
  StudentProfile,
  MemorizationRecord,
  RevisionLog,
  RevisionSchedule,
  WeakPage,
  TestSession,
  ProgressSnapshot,
  StreakRecord,
  RetentionLevel,
  Mistake,
} from '../types/hifz.types';

/**
 * Core Hifz Business Logic Service
 * Handles all memorization, revision, and tracking operations
 */
export class HifzService {
  /**
   * ===========================================
   * MEMORIZATION OPERATIONS
   * ===========================================
   */

  /**
   * Record new memorization session
   */
  static recordMemorization(
    studentId: string,
    pageNumber: number,
    juzNumber: number,
    duration: number,
    recordingUrl?: string
  ): MemorizationRecord {
    return {
      id: `mem-${Date.now()}`,
      studentId,
      juzNumber,
      pageNumber,
      surahName: `Surah ${juzNumber}`, // Would be fetched from QuranicPage
      ayahStart: 1,
      ayahEnd: 10, // Would be calculated
      type: 'new',
      status: 'pending',
      dateMemorized: new Date(),
      duration,
      recordingUrl,
      mistakes: [],
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Update student progress after successful memorization
   */
  static updateStudentProgress(
    student: StudentProfile,
    newPageNumber: number
  ): StudentProfile {
    return {
      ...student,
      totalPagesMemoized: student.totalPagesMemoized + 1,
      currentPage: newPageNumber,
      currentJuz: Math.ceil(newPageNumber / 20), // Approximate Juz from page
      updatedAt: new Date(),
    };
  }

  /**
   * ===========================================
   * REVISION ENGINE (3-LAYER SYSTEM)
   * ===========================================
   */

  /**
   * Generate daily revision schedule
   * Layer 1: Yesterday's memorization (same-day)
   * Layer 2: 7-day rotating cycle
   * Layer 3: Spaced repetition (older pages)
   */
  static generateDailyRevisionSchedule(
    studentId: string,
    studentProgress: StudentProfile
  ): RevisionSchedule {
    const today = new Date();

    // Layer 1: Yesterday's memorization
    const layer1Pages = [studentProgress.currentPage - 1]; // Simplified

    // Layer 2: 7-day cycle (rotating pages from last 7 days)
    const layer2Rotation = Array.from({ length: 7 }, (_, i) => ({
      day: i + 1,
      pages: [studentProgress.currentPage - (i + 1)],
      dueDate: new Date(today.getTime() + (i + 1) * 24 * 60 * 60 * 1000),
    }));

    // Layer 3: Spaced rotation (older memorized pages)
    const layer3Rotation = [
      {
        pages: Array.from(
          { length: Math.min(10, studentProgress.currentPage - 8) },
          (_, i) => studentProgress.currentPage - 8 - i
        ),
        lastReviewedDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        daysUntilNextReview: 14,
        priority: 5, // Lower priority (stronger retention)
      },
    ];

    return {
      id: `revsch-${Date.now()}`,
      studentId,
      layer1Pages,
      layer1DueDate: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      layer2Rotation,
      layer3Rotation,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Log revision session
   */
  static logRevision(
    studentId: string,
    pageNumber: number,
    layer: 1 | 2 | 3,
    mistakes: number,
    recordingUrl?: string
  ): RevisionLog {
    const performance = this.calculateRetentionLevel(mistakes);

    return {
      id: `rev-${Date.now()}`,
      studentId,
      pageNumber,
      layer,
      scheduledDate: new Date(),
      completedDate: new Date(),
      status: 'completed',
      recordingUrl,
      performance,
      mistakesFound: mistakes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Calculate retention level based on mistakes
   */
  static calculateRetentionLevel(mistakes: number): RetentionLevel {
    if (mistakes === 0) return 'excellent';
    if (mistakes <= 2) return 'good';
    if (mistakes <= 4) return 'fair';
    if (mistakes <= 6) return 'weak';
    return 'forgotten';
  }

  /**
   * ===========================================
   * WEAK PAGE DETECTION
   * ===========================================
   */

  /**
   * Check if page should be flagged as weak
   * Criteria:
   * - Failed 3 times
   * - Multiple frequent mistakes
   * - Low test scores
   */
  static shouldFlagAsWeak(
    failures: number,
    totalMistakes: number,
    testFailureRate: number
  ): boolean {
    return (
      failures >= 3 || // 3 failures
      totalMistakes >= 5 ||  // 5+ total mistakes
      testFailureRate > 0.3 // 30% of tests failed
    );
  }

  /**
   * Create weak page record
   */
  static createWeakPageRecord(
    studentId: string,
    pageNumber: number,
    juzNumber: number,
    commonMistakes: Mistake[]
  ): WeakPage {
    return {
      id: `weak-${Date.now()}`,
      studentId,
      pageNumber,
      juzNumber,
      failureCount: 3,
      lastFailureDate: new Date(),
      commonMistakes,
      difficulty: commonMistakes.length > 3 ? 'very-hard' : 'hard',
      mandatoryExtraRevisions: 3,
      isActive: true,
      interventionStartDate: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Adjust revision frequency for weak pages
   * If page is weak:
   * - Increase revision frequency to daily
   * - Temporarily reduce new memorization
   * - Add extra practice sessions
   */
  static adjustRevisionForWeakPage(
    revisionSchedule: RevisionSchedule,
    weakPageNumber: number
  ): RevisionSchedule {
    // Add weak page to Layer 3 with high priority
    return {
      ...revisionSchedule,
      layer3Rotation: [
        ...revisionSchedule.layer3Rotation,
        {
          pages: [weakPageNumber],
          lastReviewedDate: new Date(),
          daysUntilNextReview: 1, // Daily review
          priority: 1, // Highest priority
        },
      ],
      updatedAt: new Date(),
    };
  }

  /**
   * ===========================================
   * TESTING SYSTEM
   * ===========================================
   */

  /**
   * Score a test session
   */
  static scoreTestSession(
    testSession: Partial<TestSession>,
    correctAyahs: number,
    totalAyahs: number
  ): TestSession {
    const score = (correctAyahs / totalAyahs) * 100;

    return {
      id: `test-${Date.now()}`,
      studentId: testSession.studentId || '',
      type: testSession.type || 'full-page',
      testMode: testSession.testMode || 'auto',
      startTime: testSession.startTime || new Date(),
      totalAyahs,
      correctAyahs,
      missedAyahs: totalAyahs - correctAyahs,
      haltingPoints: 0, // Would be calculated from recording
      score,
      resultStatus: score >= 80 ? 'passed' : 'needs-improvement',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as TestSession;
  }

  /**
   * ===========================================
   * PROGRESS TRACKING
   * ===========================================
   */

  /**
   * Calculate overall retention score (0-100)
   * Based on:
   * - Weak pages percentage
   * - Test performance
   * - Revision completion rate
   */
  static calculateRetentionScore(
    totalPages: number,
    weakPages: number,
    averageTestScore: number,
    revisionCompletionRate: number
  ): number {
    const weakPagePenalty = (weakPages / totalPages) * 20; // 20% weight
    const testComponent = averageTestScore * 0.3; // 30% weight
    const revisionComponent = revisionCompletionRate * 0.5; // 50% weight

    return Math.max(
      0,
      Math.min(100, testComponent + revisionComponent - weakPagePenalty)
    );
  }

  /**
   * Create progress snapshot
   */
  static createProgressSnapshot(
    studentId: string,
    student: StudentProfile,
    weakPages: number[],
    strongPages: number[]
  ): ProgressSnapshot {
    return {
      id: `snap-${Date.now()}`,
      studentId,
      dateSnapshot: new Date(),
      currentJuz: student.currentJuz,
      currentPage: student.currentPage,
      totalPagesMemoized: student.totalPagesMemoized,
      juzCompletionPercentage: (student.currentJuz / 30) * 100,
      overallProgress: (student.totalPagesMemoized / 604) * 100,
      retentionScore: student.retentionScore,
      streakDays: student.streakDays,
      weakPages,
      strongPages,
      lastReviewDates: {},
      mistakeFrequency: {},
      createdAt: new Date(),
    };
  }

  /**
   * Estimate completion date
   */
  static estimateCompletionDate(
    currentPagesMemoized: number,
    dailyNewPageTarget: number,
    revisionOverhead: number = 0.3 // 30% of time spent on revision
  ): Date {
    const remainingPages = 604 - currentPagesMemoized;
    const effectiveDailyProgress = dailyNewPageTarget * (1 - revisionOverhead);
    const daysNeeded = Math.ceil(remainingPages / effectiveDailyProgress);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysNeeded);
    return completionDate;
  }

  /**
   * ===========================================
   * GAMIFICATION
   * ===========================================
   */

  /**
   * Update streak
   */
  static updateStreak(
    streak: StreakRecord,
    lastActiveDate: Date
  ): StreakRecord {
    const now = new Date();
    const daysSinceLastActive = Math.floor(
      (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let currentStreak = streak.currentStreak;

    if (daysSinceLastActive === 0) {
      // Active today, maintain streak
      currentStreak = Math.min(currentStreak + 1, streak.currentStreak + 1);
    } else if (daysSinceLastActive === 1) {
      // One day missed, reset
      currentStreak = 1;
    } else if (daysSinceLastActive > 1) {
      // Multiple days missed, reset
      currentStreak = 1;
    }

    return {
      ...streak,
      currentStreak,
      bestStreak: Math.max(currentStreak, streak.bestStreak),
      lastActivityDate: now,
      streakStartDate: daysSinceLastActive > 1 ? now : streak.streakStartDate,
      updatedAt: new Date(),
    };
  }

  /**
   * Check badge eligibility
   */
  static checkBadgeEligibility(
    totalPagesMemoized: number,
    streakDays: number,
    averageTestScore: number
  ): string[] {
    const badges: string[] = [];

    if (totalPagesMemoized >= 20) badges.push('first-5-juz'); // ~20 pages per Juz
    if (totalPagesMemoized >= 40) badges.push('first-10-juz');
    if (totalPagesMemoized >= 60) badges.push('first-15-juz');
    if (averageTestScore >= 95) badges.push('tajweed-master');
    if (streakDays >= 30) badges.push('consistency');

    return badges;
  }

  /**
   * ===========================================
   * UTILITY FUNCTIONS
   * ===========================================
   */

  /**
   * Get Juz number from page number
   */
  static getJuzFromPage(pageNumber: number): number {
    return Math.ceil(pageNumber / 20); // Approximate
  }

  /**
   * Get page range for a Juz
   */
  static getPageRangeForJuz(juzNumber: number): { start: number; end: number } {
    return {
      start: (juzNumber - 1) * 20 + 1,
      end: Math.min(juzNumber * 20, 604),
    };
  }

  /**
   * Calculate completion percentage
   */
  static calculateCompletionPercentage(
    pagesMemoized: number,
    totalPages: number = 604
  ): number {
    return Math.round((pagesMemoized / totalPages) * 100);
  }

  /**
   * Format time remaining
   */
  static formatTimeRemaining(completionDate: Date): string {
    const now = new Date();
    const daysRemaining = Math.ceil(
      (completionDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysRemaining < 0) return 'Overdue';
    if (daysRemaining === 0) return 'Today';
    if (daysRemaining === 1) return 'Tomorrow';
    if (daysRemaining <= 7) return `${daysRemaining} days`;
    const weeksRemaining = Math.ceil(daysRemaining / 7);
    return `${weeksRemaining} weeks`;
  }

  /**
   * Generate learning recommendation
   */
  static generateLearningRecommendation(
    retentionScore: number,
    weakPages: number,
    streakDays: number
  ): string {
    if (retentionScore < 60)
      return 'Focus on revision. Consider reducing daily new memorization target.';
    if (weakPages > 5)
      return 'You have several weak areas. Prioritize weak pages this week.';
    if (streakDays < 3)
      return 'Build consistency. Try to establish a daily memorization routine.';
    return 'Great progress! Continue maintaining your current pace.';
  }
}

/**
 * Analytics Service for Admin Dashboard
 */
export class HifzAnalyticsService {
  /**
   * Calculate academy-wide statistics
   */
  static calculateAcademyMetrics(students: StudentProfile[]) {
    const activeStudents = students.filter(
      (s) => new Date().getTime() - s.lastActiveDate.getTime() < 7 * 24 * 60 * 60 * 1000
    );

    const averagePages =
      students.reduce((sum, s) => sum + s.totalPagesMemoized, 0) /
      (students.length || 1);

    const averageRetention =
      students.reduce((sum, s) => sum + s.retentionScore, 0) /
      (students.length || 1);

    const completedHifz = students.filter((s) => s.totalPagesMemoized === 604)
      .length;

    return {
      totalStudents: students.length,
      activeStudents: activeStudents.length,
      completedHifz,
      averagePages: Math.round(averagePages),
      averageRetention: Math.round(averageRetention),
      completionRate: Math.round((completedHifz / (students.length || 1)) * 100),
    };
  }

  /**
   * Identify at-risk students
   */
  static identifyAtRiskStudents(students: StudentProfile[]): StudentProfile[] {
    return students.filter((s) => {
      const daysInactive = Math.floor(
        (new Date().getTime() - s.lastActiveDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysInactive > 7 || s.streakDays < 2 || s.retentionScore < 60;
    });
  }

  /**
   * Identify weak page patterns across all students
   */
  static identifyWeakPagePatterns(weakPages: WeakPage[]): Map<number, number> {
    const patterns = new Map<number, number>();

    weakPages.forEach((wp) => {
      patterns.set(wp.pageNumber, (patterns.get(wp.pageNumber) || 0) + 1);
    });

    return patterns;
  }
}

export default HifzService;
