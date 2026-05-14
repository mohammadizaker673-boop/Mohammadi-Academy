/**
 * Adaptive Learning Engine
 * Analyzes student performance and recommends optimal learning paths
 */

import { PronunciationScore } from '../utils/pronunciationScoring';

export interface WeakArea {
  letter: string;
  failureCount: number;
  lastFailedAt: string;
  accuracyAverage: number; // 0-100
  daysOfPractice: number;
  recommendedAction: 'daily-drill' | 'live-correction' | 'repeat-lesson' | 'move-on';
}

export interface StudentPerformanceData {
  studentId: string;
  lessonId: string;
  pronunciationScores: PronunciationScore[];
  quizScore?: number; // 0-100
  quizAttempts: number;
  timeSpentSeconds: number;
  completedAt?: string;
}

export interface AdaptiveLearningRecommendation {
  studentId: string;
  currentLessonId: string;
  weakAreas: WeakArea[];
  nextRecommendedLesson?: string;
  reviewExercises: string[];
  estimatedReadinessPercent: number; // 0-100 ready to move forward
  insights: string[];
}

/**
 * Detect weak areas based on pronunciation scores
 */
export const detectWeakAreas = (
  letterScores: PronunciationScore[],
  previousFailures: Record<string, number> = {}
): WeakArea[] => {
  const weakAreas: WeakArea[] = [];

  letterScores.forEach(score => {
    const failureCount = previousFailures[score.letter] || 0;
    
    // Flag as weak if accuracy < 75% OR if it's been attempted multiple times with low accuracy
    if (score.accuracy < 75 || (failureCount > 0 && score.accuracy < 85)) {
      weakAreas.push({
        letter: score.letter,
        failureCount: failureCount + 1,
        lastFailedAt: new Date().toISOString(),
        accuracyAverage: score.accuracy,
        daysOfPractice: Math.max(1, Math.ceil(failureCount / 3)),
        recommendedAction: determineRecommendedAction(score.accuracy, failureCount),
      });
    }
  });

  return weakAreas;
};

/**
 * Determine what action the student should take for a weak letter
 */
const determineRecommendedAction = (
  accuracy: number,
  failureCount: number
): 'daily-drill' | 'live-correction' | 'repeat-lesson' | 'move-on' => {
  if (accuracy < 60 && failureCount > 2) {
    return 'live-correction'; // Need teacher help
  }
  if (accuracy < 70 && failureCount > 1) {
    return 'repeat-lesson'; // Revisit lesson
  }
  if (accuracy < 80) {
    return 'daily-drill'; // Daily practice
  }
  return 'move-on'; // Ready to progress
};

/**
 * Analyze student performance and generate adaptive recommendations
 */
export const analyzeStudentPerformance = (
  performanceData: StudentPerformanceData,
  previousWeakAreas: WeakArea[] = []
): AdaptiveLearningRecommendation => {
  const { studentId, lessonId, pronunciationScores, quizScore, quizAttempts, timeSpentSeconds } = performanceData;

  // Detect weak areas from current pronunciation scores
  const previousFailures: Record<string, number> = {};
  previousWeakAreas.forEach(area => {
    previousFailures[area.letter] = area.failureCount;
  });

  const currentWeakAreas = detectWeakAreas(pronunciationScores, previousFailures);

  // Calculate overall readiness to move forward
  const avgPronunciationAccuracy = pronunciationScores.length > 0
    ? pronunciationScores.reduce((sum, s) => sum + s.accuracy, 0) / pronunciationScores.length
    : 0;

  const quizReadiness = quizScore ? (quizScore >= 75 ? 100 : quizScore) : 50;
  
  // If quiz was attempted multiple times, reduce readiness
  const quizAttemptPenalty = Math.max(0, (quizAttempts - 1) * 15);
  const adjustedQuizReadiness = Math.max(0, quizReadiness - quizAttemptPenalty);

  // Time-based feedback: too quick = may not be thorough
  const recommendedTimeSeconds = 20 * 60; // 20 minutes recommended per lesson
  const timeReadiness = timeSpentSeconds < recommendedTimeSeconds ? 60 : 100;

  const estimatedReadinessPercent = Math.round(
    (avgPronunciationAccuracy * 0.4 + adjustedQuizReadiness * 0.4 + timeReadiness * 0.2) / 100 * 100
  );

  // Generate review exercises for weak areas
  const reviewExercises = generateReviewExercises(currentWeakAreas);

  // Generate insights
  const insights = generateInsights({
    avgPronunciationAccuracy,
    quizScore,
    quizAttempts,
    timeSpentSeconds,
    weakAreaCount: currentWeakAreas.length,
    estimatedReadinessPercent,
  });

  return {
    studentId,
    currentLessonId: lessonId,
    weakAreas: currentWeakAreas,
    nextRecommendedLesson: determineNextLesson(lessonId, estimatedReadinessPercent),
    reviewExercises,
    estimatedReadinessPercent,
    insights,
  };
};

/**
 * Generate specific review exercises for weak areas
 */
const generateReviewExercises = (weakAreas: WeakArea[]): string[] => {
  const exercises: string[] = [];

  weakAreas.forEach(area => {
    if (area.failureCount >= 3) {
      exercises.push(`30-minute drill on letter ${area.letter}`);
    } else if (area.failureCount >= 2) {
      exercises.push(`15-minute practice: letter ${area.letter}`);
    } else {
      exercises.push(`5-minute repetition: letter ${area.letter}`);
    }
  });

  // Limit to top 3-5 exercises
  return exercises.slice(0, 5);
};

/**
 * Determine the next recommended lesson based on readiness
 * For now, just indicate whether to stay or move forward
 */
const determineNextLesson = (currentLessonId: string, readiness: number): string | undefined => {
  if (readiness < 50) {
    return undefined; // Repeat current lesson
  }
  if (readiness < 75) {
    return `${currentLessonId}-review`; // Add review section
  }
  // Otherwise, next lesson will be determined by course structure
  return undefined;
};

/**
 * Generate human-readable insights for the student/teacher
 */
const generateInsights = (metrics: {
  avgPronunciationAccuracy: number;
  quizScore?: number;
  quizAttempts: number;
  timeSpentSeconds: number;
  weakAreaCount: number;
  estimatedReadinessPercent: number;
}): string[] => {
  const insights: string[] = [];

  if (metrics.avgPronunciationAccuracy >= 90) {
    insights.push('Excellent pronunciation! You are nailing the articulation points.');
  } else if (metrics.avgPronunciationAccuracy >= 75) {
    insights.push('Good pronunciation with some refinement needed. Keep practicing!');
  } else {
    insights.push('Focus on pronunciation accuracy. Try slowing down and listening carefully.');
  }

  if (metrics.quizScore && metrics.quizScore >= 90) {
    insights.push('Outstanding quiz performance! You understand the concepts very well.');
  } else if (metrics.quizScore && metrics.quizScore < 70) {
    insights.push('Quiz needs improvement. Review the lesson content before retaking.');
  }

  if (metrics.quizAttempts > 2) {
    insights.push(`You took ${metrics.quizAttempts} attempts. Remember: quality over speed.`);
  }

  if (metrics.timeSpentSeconds < 10 * 60) {
    insights.push('You finished very quickly. Make sure to practice thoroughly!');
  }

  if (metrics.weakAreaCount > 3) {
    insights.push('Several areas need work. Consider daily practice for this lesson.');
  }

  if (metrics.estimatedReadinessPercent >= 80) {
    insights.push('You are ready to move to the next lesson!');
  } else if (metrics.estimatedReadinessPercent >= 60) {
    insights.push('Almost there! A bit more practice will get you ready for the next level.');
  }

  return insights;
};

/**
 * Check if student should unlock next lesson based on performance
 */
export const canProgressToNextLesson = (recommendation: AdaptiveLearningRecommendation): boolean => {
  return recommendation.estimatedReadinessPercent >= 70;
};

/**
 * Calculate a streak: consecutive days of practice
 */
export const calculateStreak = (completionHistory: string[]): number => {
  // Sort dates in descending order
  const dates = completionHistory
    .map(d => new Date(d).getTime())
    .sort((a, b) => b - a);

  if (dates.length === 0) return 0;

  let streak = 1;
  const oneDayMs = 24 * 60 * 60 * 1000;

  for (let i = 1; i < dates.length; i++) {
    const daysDiff = (dates[i - 1] - dates[i]) / oneDayMs;
    if (daysDiff >= 1 && daysDiff <= 2) {
      // 1-2 days apart = consecutive (accounting for timezones)
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
