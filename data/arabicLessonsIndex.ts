// Lightweight lesson index - loads instantly
// Full lesson content is loaded on-demand

import { ArabicLevel } from '../types/arabic-learning.types';

export interface LessonMetadata {
  id: string;
  level: ArabicLevel;
  title: string;
  description: string;
  order: number;
  topics: string[];
  minimumScore: number;
  vocabularyCount: number;
  exerciseCount: number;
}

// Minimal lesson data for quick loading
export const arabicLessonsIndex: LessonMetadata[] = [
  {
    id: 'lesson-a1-1',
    level: 'A1',
    title: 'Arabic Alphabet - Part 1 (Letters أ to ح)',
    description: 'Learn the first 7 letters of the Arabic alphabet, their pronunciation, and how to write them',
    order: 1,
    topics: ['Alphabet', 'Pronunciation', 'Writing'],
    minimumScore: 70,
    vocabularyCount: 0,
    exerciseCount: 2
  },
  {
    id: 'lesson-a1-2',
    level: 'A1',
    title: 'Arabic Alphabet - Part 2 (Letters خ to ص)',
    description: 'Continue learning Arabic letters and practice connecting them',
    order: 2,
    topics: ['Alphabet', 'Letter Forms', 'Connection'],
    minimumScore: 70,
    vocabularyCount: 0,
    exerciseCount: 1
  },
  {
    id: 'lesson-a1-3',
    level: 'A1',
    title: 'Greetings and Basic Phrases',
    description: 'Learn essential greetings and polite expressions',
    order: 3,
    topics: ['Greetings', 'Courtesy', 'Daily Expressions'],
    minimumScore: 70,
    vocabularyCount: 10,
    exerciseCount: 2
  },
  {
    id: 'lesson-a1-4',
    level: 'A1',
    title: 'Family Vocabulary',
    description: 'Learn words for family members and how to talk about your family',
    order: 4,
    topics: ['Family', 'Relationships', 'Possessive'],
    minimumScore: 70,
    vocabularyCount: 5,
    exerciseCount: 1
  },
  {
    id: 'lesson-a1-5',
    level: 'A1',
    title: 'Numbers 1-10',
    description: 'Learn Arabic numbers and how to count',
    order: 5,
    topics: ['Numbers', 'Counting', 'Quantities'],
    minimumScore: 70,
    vocabularyCount: 5,
    exerciseCount: 1
  },
  {
    id: 'lesson-a1-6',
    level: 'A1',
    title: 'Nominal Sentences',
    description: 'Learn how to form simple sentences without verbs',
    order: 6,
    topics: ['Grammar', 'Sentence Structure', 'Descriptions'],
    minimumScore: 70,
    vocabularyCount: 0,
    exerciseCount: 1
  }
];

// Function to get lesson count by level
export const getLessonCountByLevel = (level: ArabicLevel): number => {
  return arabicLessonsIndex.filter(l => l.level === level).length;
};

// Function to get all levels with lessons
export const getAvailableLevels = (): ArabicLevel[] => {
  return Array.from(new Set(arabicLessonsIndex.map(l => l.level)));
};
