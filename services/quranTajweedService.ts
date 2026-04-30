/**
 * Quran Tajweed Service
 * Handles all Quran Tajweed course operations, progress tracking, and teacher interaction
 */

import {
  TajweedLesson,
  TajweedRule,
  Makhraj,
  TajweedPracticeExercise,
  TajweedAssessment,
  TajweedStudentProgress,
  TeacherNote,
  ChatMessage,
  QuranTajweedCourse,
  TajweedStudentEnrollment
} from '../types/quran-tajweed.types';

// Initialize Tajweed Rules Database
export const TAJWEED_RULES: TajweedRule[] = [
  {
    id: 'noon-sakinah',
    name: 'Noon Sakinah Rules',
    nameArabic: 'أحكام النون الساكنة',
    description: 'Rules for the letter Noon (ن) when it is silent',
    definition: 'When Noon has no vowel on it, and it is followed by other letters',
    examples: [
      {
        ayah: 'بسم اللّه الرّحمن الرّحيم',
        ayahTranslation: 'In the name of Allah, ar-Rahman, ar-Rahim',
        explanation: 'The "n" at the end follows these rules based on the next letter'
      }
    ],
    difficulty: 'beginner',
    category: 'noon-rules'
  },
  {
    id: 'meem-sakinah',
    name: 'Meem Sakinah Rules',
    nameArabic: 'أحكام الميم الساكنة',
    description: 'Rules for the letter Meem (م) when it has no vowel',
    definition: 'When Meem has no vowel and is followed by another letter',
    examples: [
      {
        ayah: 'منهم من تقصّ',
        ayahTranslation: 'Among them is one whose story you relate',
        explanation: 'Meem rules apply based on what follows'
      }
    ],
    difficulty: 'beginner',
    category: 'meem-rules'
  },
  {
    id: 'alif-lam',
    name: 'Alif Lam (Definite Article)',
    nameArabic: 'أحكام اللام الشمسية والقمرية',
    description: 'Rules for the letter Alif Lam (ال) - the definite article',
    definition: 'The letter Lam in "AL" (the) has different pronunciations',
    examples: [
      {
        ayah: 'الحمد لله',
        ayahTranslation: 'All praise is due to Allah',
        explanation: 'The Lam is solar (Shamsiyya) - hidden, the letter assimilates'
      }
    ],
    difficulty: 'intermediate',
    category: 'other'
  },
  {
    id: 'hamza-rules',
    name: 'Hamza (Glottal Stop) Rules',
    nameArabic: 'أحكام الهمزة',
    description: 'Rules for proper pronunciation of Hamza',
    definition: 'The glottal stop and how to handle it between letters',
    examples: [
      {
        ayah: 'الآية',
        ayahTranslation: 'The verse',
        explanation: 'Hamza elongation with Alif (Madd)'
      }
    ],
    difficulty: 'intermediate',
    category: 'hamza'
  },
  {
    id: 'madd-rules',
    name: 'Madd (Elongation) Rules',
    nameArabic: 'أحكام المد',
    description: 'Rules for elongating vowels in specific situations',
    definition: 'When to elongate vowels and for how many counts',
    examples: [
      {
        ayah: 'قال، باب، سيقول',
        ayahTranslation: 'He said, door, he will say',
        explanation: 'Natural Madd lasts 2 counts, Necessary Madd lasts 4-6 counts'
      }
    ],
    difficulty: 'intermediate',
    category: 'madd'
  },
  {
    id: 'idgham',
    name: 'Idgham (Assimilation)',
    nameArabic: 'الإدغام',
    description: 'When a letter merges with another letter that follows',
    definition: 'Combining two letters into one with double emphasis',
    examples: [
      {
        ayah: 'يسّ والقرآن الحكيم',
        ayahTranslation: 'Ya Seen, by the wise Quran',
        explanation: 'The two Seen letters merge into one elongated sound'
      }
    ],
    difficulty: 'advanced',
    category: 'other'
  }
];

// Initialize Makhraj (Articulation Points) Database
export const MAKHARAJ_LESSONS: Makhraj[] = [
  {
    id: 'throat',
    name: 'Throat Letters (Pharyngeal)',
    nameArabic: 'الحلقية',
    description: 'Letters pronounced from the throat',
    letters: ['ء', 'ه', 'ع', 'ح', 'غ', 'خ'],
    pronunciation: 'Deepest part of the throat',
    difficulty: 'beginner'
  },
  {
    id: 'tongue-back',
    name: 'Back of Tongue',
    nameArabic: 'اللسانية الغلقية',
    description: 'Letters pronounced from the back of the tongue',
    letters: ['ق', 'ك'],
    pronunciation: 'Back of tongue touches soft palate',
    difficulty: 'beginner'
  },
  {
    id: 'tongue-middle',
    name: 'Middle of Tongue',
    nameArabic: 'اللسانية الوسطية',
    description: 'Letters pronounced from the middle of the tongue',
    letters: ['ج', 'ش', 'ي'],
    pronunciation: 'Middle of tongue toward hard palate',
    difficulty: 'beginner'
  },
  {
    id: 'tongue-front',
    name: 'Front of Tongue',
    nameArabic: 'اللسانية الطرفية',
    description: 'Letters pronounced from the front/tip of the tongue',
    letters: ['د', 'ت', 'ط', 'ل', 'ن'],
    pronunciation: 'Front area under hard palate',
    difficulty: 'intermediate'
  },
  {
    id: 'lips-teeth',
    name: 'Lips and Teeth',
    nameArabic: 'الشفوية والأسنانية',
    description: 'Letters pronounced with lips and teeth',
    letters: ['ف', 'ب', 'م'],
    pronunciation: 'Upper teeth and lower lip',
    difficulty: 'beginner'
  },
  {
    id: 'nasal',
    name: 'Nasal Letters',
    nameArabic: 'الأنفية',
    description: 'Letters pronounced with nasal resonance',
    letters: ['ن', 'م'],
    pronunciation: 'Through the nose',
    difficulty: 'intermediate'
  }
];

// Service Functions
export class QuranTajweedService {
  /**
   * Get all Tajweed rules
   */
  static getTajweedRules(level?: 'beginner' | 'intermediate' | 'advanced'): TajweedRule[] {
    if (level) {
      return TAJWEED_RULES.filter(rule => rule.difficulty === level);
    }
    return TAJWEED_RULES;
  }

  /**
   * Get specific Tajweed rule by ID
   */
  static getTajweedRuleById(ruleId: string): TajweedRule | undefined {
    return TAJWEED_RULES.find(rule => rule.id === ruleId);
  }

  /**
   * Get all Makhraj lessons
   */
  static getMakharajLessons(level?: 'beginner' | 'intermediate' | 'advanced'): Makhraj[] {
    if (level) {
      return MAKHARAJ_LESSONS.filter(m => m.difficulty === level);
    }
    return MAKHARAJ_LESSONS;
  }

  /**
   * Get specific Makhraj by ID
   */
  static getMakhrajById(makhrajId: string): Makhraj | undefined {
    return MAKHARAJ_LESSONS.find(m => m.id === makhrajId);
  }

  /**
   * Initialize student progress
   */
  static initializeStudentProgress(studentId: string): TajweedStudentProgress {
    return {
      studentId,
      currentLevel: 'beginner',
      lessonsCompleted: 0,
      totalLessons: 12, // 4 beginner + 4 intermediate + 4 advanced
      rulesLearned: [],
      makhrajsMastered: [],
      exercisesCompleted: 0,
      assessmentScores: [],
      overallProgress: 0,
      strengths: [],
      areasToImprove: [],
      lastAccessedDate: new Date(),
      estimatedCompletionDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };
  }

  /**
   * Update student progress after completing lesson
   */
  static updateProgressAfterLesson(
    progress: TajweedStudentProgress,
    lessonsCompletedNow: number,
    rulesLearned: string[]
  ): TajweedStudentProgress {
    return {
      ...progress,
      lessonsCompleted: lessonsCompletedNow,
      rulesLearned: [...new Set([...progress.rulesLearned, ...rulesLearned])],
      overallProgress: Math.min(100, Math.round((lessonsCompletedNow / progress.totalLessons) * 100)),
      lastAccessedDate: new Date()
    };
  }

  /**
   * Evaluate pronunciation exercise
   * Simplified - in real app would use Web Speech API
   */
  static evaluatePronunciation(
    studentRecording: string,
    targetAyah: string,
    focusPoints: string[]
  ): {
    score: number;
    feedback: string;
    focusAreas: string[];
    suggestions: string[];
  } {
    // In real implementation, this would compare student's audio with reference
    // Using Web Speech API results
    const score = Math.random() * 100; // Placeholder

    let feedback = '';
    const focusAreas = [];
    const suggestions = [];

    if (score >= 80) {
      feedback = 'Excellent! Your pronunciation is very close to the correct way.';
      suggestions.push('Continue to the next ayah');
    } else if (score >= 60) {
      feedback = 'Good effort! There are a few areas to improve.';
      focusAreas.push(...focusPoints);
      suggestions.push('Pay attention to the emphasized areas');
      suggestions.push('Listen to the slow audio example again');
    } else {
      feedback = 'Let\'s practice this more carefully.';
      focusAreas.push(...focusPoints);
      suggestions.push('Listen to the reference pronunciation');
      suggestions.push('Practice slowly, word by word');
      suggestions.push('Record again when ready');
    }

    return { score: Math.round(score), feedback, focusAreas, suggestions };
  }

  /**
   * Grade practice exercise
   */
  static gradePracticeExercise(
    answers: { questionId: string; answer: string }[],
    correctAnswers: { questionId: string; correctAnswer: string }[]
  ): {
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    passed: boolean;
    feedback: string;
  } {
    let correct = 0;
    const total = answers.length;

    answers.forEach(answer => {
      const correctAnswer = correctAnswers.find(ca => ca.questionId === answer.questionId);
      if (correctAnswer && answer.answer.toLowerCase() === correctAnswer.correctAnswer.toLowerCase()) {
        correct++;
      }
    });

    const percentage = Math.round((correct / total) * 100);
    const passed = percentage >= 70;

    let feedback = '';
    if (percentage >= 90) {
      feedback = 'Excellent work! You have mastered this concept.';
    } else if (percentage >= 70) {
      feedback = 'Good job! Review the areas you missed and try again.';
    } else {
      feedback = 'Keep practicing. Review the lesson and try again.';
    }

    return {
      score: percentage,
      totalQuestions: total,
      correctAnswers: correct,
      passed,
      feedback
    };
  }

  /**
   * Generate teacher suggestion based on student struggles
   */
  static generateTeacherSuggestions(
    areasOfStruggle: string[],
    completedLessons: number,
    totalLessons: number
  ): TeacherNote[] {
    const suggestions: TeacherNote[] = [];

    areasOfStruggle.forEach((area, index) => {
      suggestions.push({
        id: `suggestion-${Date.now()}-${index}`,
        studentId: '', // Will be set by caller
        teacherId: 'automatic-system',
        type: 'guidance',
        topic: `Improvement needed: ${area}`,
        content: `You're making great progress! I noticed you need more practice with ${area}. Let's focus on this area. I've set up extra exercises to help strengthen this skill.`,
        isActionable: true,
        date: new Date(),
        read: false
      });
    });

    // Add encouragement
    if (completedLessons > 0) {
      const progressPercent = Math.round((completedLessons / totalLessons) * 100);
      suggestions.push({
        id: `encouragement-${Date.now()}`,
        studentId: '',
        teacherId: 'automatic-system',
        type: 'encouragement',
        topic: 'Great Progress!',
        content: `You've completed ${completedLessons} lessons (${progressPercent}% of the course). Keep up the excellent work! You're building a strong foundation in Tajweed.`,
        isActionable: false,
        date: new Date(),
        read: false
      });
    }

    return suggestions;
  }

  /**
   * Get next lesson recommendation
   */
  static getNextLessonRecommendation(
    currentLevel: 'beginner' | 'intermediate' | 'advanced',
    lessonsCompletedInLevel: number
  ): {
    recommendedLevel: 'beginner' | 'intermediate' | 'advanced';
    message: string;
    readyForAdvance: boolean;
  } {
    if (currentLevel === 'beginner' && lessonsCompletedInLevel >= 4) {
      return {
        recommendedLevel: 'intermediate',
        message: 'You\'ve completed all beginner lessons! You\'re ready for intermediate level.',
        readyForAdvance: true
      };
    } else if (currentLevel === 'intermediate' && lessonsCompletedInLevel >= 4) {
      return {
        recommendedLevel: 'advanced',
        message: 'Congratulations! You\'ve mastered intermediate lessons. Advanced level awaits!',
        readyForAdvance: true
      };
    }

    return {
      recommendedLevel: currentLevel,
      message: 'Continue with your current level lessons.',
      readyForAdvance: false
    };
  }

  /**
   * Create teacher-student communication
   */
  static createChatMessage(
    conversationId: string,
    senderId: string,
    recipientId: string,
    message: string,
    type: 'question' | 'answer' | 'feedback' | 'suggestion' | 'encouragement' = 'answer',
    relatedContent?: { type: 'lesson' | 'rule' | 'exercise' | 'ayah'; id: string; title: string }
  ): ChatMessage {
    return {
      id: `msg-${Date.now()}`,
      conversationId,
      senderId,
      recipientId,
      type,
      message,
      relatedContent,
      timestamp: new Date(),
      read: false
    };
  }

  /**
   * Suggest teacher assistance
   */
  static suggestTeacherAssistance(studentProgress: TajweedStudentProgress): boolean {
    // Suggest teacher if student struggles significantly
    return (
      studentProgress.overallProgress > 0 &&
      studentProgress.overallProgress < 30 &&
      studentProgress.lessonsCompleted > 2
    );
  }
}

// Default export
export default QuranTajweedService;
