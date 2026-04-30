import { Feature } from '../types';

export const SAMPLE_FEATURES: Feature[] = [
  {
    id: '1',
    title: 'How to Learn Tajweed Correctly',
    description: 'In this comprehensive video, our master instructor explains the fundamental rules of Tajweed (proper Quranic recitation). Learn about proper letter pronunciation, elongation rules, and nasal sounds.',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    publishDate: new Date('2026-02-03'),
    createdAt: new Date('2026-02-03'),
    updatedAt: new Date('2026-02-03'),
  },
  {
    id: '2',
    title: 'The Beauty of Quranic Verses',
    description: 'A beautiful collection of high-quality images featuring verses from the Holy Quran with artistic Islamic calligraphy. Each image represents a different theme from divine guidance and mercy.',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?w=800&q=80',
    publishDate: new Date('2026-02-02'),
    createdAt: new Date('2026-02-02'),
    updatedAt: new Date('2026-02-02'),
  },
  {
    id: '3',
    title: 'Understanding the Quran: Surah Al-Fatiha',
    description: 'The Opening Chapter (Al-Fatiha) is the most important chapter of the Quran, recited in every prayer. This article breaks down its meaning, context, and spiritual significance for Muslims worldwide.',
    type: 'text',
    content: 'Al-Fatiha is the first chapter of the Quran and consists of 7 verses. It is recited in every unit of prayer...',
    publishDate: new Date('2026-02-01'),
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-01'),
  },
  {
    id: '4',
    title: 'Memorizing the Quran - Tips & Strategies',
    description: 'Learn proven strategies from our experienced Hafiz teachers on how to effectively memorize the Quran. This video covers daily routines, memory techniques, and revision methods used by successful students.',
    type: 'video',
    mediaUrl: 'https://www.youtube.com/watch?v=V-_O7gl7-Ts',
    publishDate: new Date('2026-01-31'),
    createdAt: new Date('2026-01-31'),
    updatedAt: new Date('2026-01-31'),
  },
  {
    id: '5',
    title: 'Our Students Success Stories',
    description: 'Meet some of our amazing students who have successfully completed their Quranic education journey with us. Their testimonies and certificates showcase the quality of education we provide.',
    type: 'image',
    mediaUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80',
    publishDate: new Date('2026-01-30'),
    createdAt: new Date('2026-01-30'),
    updatedAt: new Date('2026-01-30'),
  },
  {
    id: '6',
    title: 'Introduction to Islamic Ethics',
    description: 'An introductory guide to Islamic ethics (Akhlaq) based on Quranic principles. Learn about virtues like honesty, compassion, and justice, and how to apply them in your daily life for a fulfilling spiritual journey.',
    type: 'text',
    content: 'Islamic ethics, known as Akhlaq, form the foundation of Muslim character and conduct. These principles are derived from the Quran and the teachings of Prophet Muhammad...',
    publishDate: new Date('2026-01-29'),
    createdAt: new Date('2026-01-29'),
    updatedAt: new Date('2026-01-29'),
  },
];

/**
 * Initialize sample features in localStorage if they don't exist
 * This function should be called once on app startup
 */
export function initializeSampleFeatures(): void {
  try {
    const existing = localStorage.getItem('academy_features');
    if (!existing) {
      localStorage.setItem('academy_features', JSON.stringify(SAMPLE_FEATURES));
      console.log('Sample features initialized');
    }
  } catch (error) {
    console.error('Error initializing sample features:', error);
  }
}

/**
 * Reset features to sample data (useful for testing/demo)
 */
export function resetToSampleFeatures(): void {
  try {
    localStorage.setItem('academy_features', JSON.stringify(SAMPLE_FEATURES));
    console.log('Features reset to sample data');
  } catch (error) {
    console.error('Error resetting features:', error);
  }
}

/**
 * Clear all features from localStorage
 */
export function clearAllFeatures(): void {
  try {
    localStorage.removeItem('academy_features');
    console.log('All features cleared');
  } catch (error) {
    console.error('Error clearing features:', error);
  }
}

/**
 * Get sample feature by ID
 */
export function getSampleFeatureById(id: string): Feature | undefined {
  return SAMPLE_FEATURES.find(f => f.id === id);
}
