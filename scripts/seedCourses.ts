import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

const PREDEFINED_COURSES = [
  {
    id: 'quran-tajweed',
    name: 'Quran Tajweed',
    category: 'quran',
    description: 'Master the art of Quranic recitation with proper pronunciation and rules of Tajweed. This comprehensive course covers all the essential Tajweed rules including Makharij (points of articulation), Sifaat (characteristics of letters), and practical application in Quranic verses.',
    level: 'intermediate' as const,
    targetAudience: 'Students who can read Arabic and want to improve their recitation quality',
    thumbnailUrl: '',
    isActive: true,
    status: 'published' as const,
    teacherId: '',
    classFormat: {
      duration: '45-60 minutes per session',
      mode: ['One-on-One', 'Group Classes'],
      materials: ['Digital Mushaf', 'Tajweed charts', 'Audio recordings']
    },
    requirements: [
      'Basic Arabic reading ability',
      'Stable internet connection',
      'Microphone for practice sessions'
    ]
  },
  {
    id: 'noorani-qaida',
    name: 'Noorani Qaida',
    category: 'quran',
    description: 'Perfect for beginners starting their Quranic journey. Learn Arabic alphabet, basic pronunciation rules, and foundational reading skills through the time-tested Noorani Qaida methodology. Build a strong foundation for Quran reading.',
    level: 'beginner' as const,
    targetAudience: 'Complete beginners, children and adults with no prior Arabic knowledge',
    thumbnailUrl: '',
    isActive: true,
    status: 'published' as const,
    teacherId: '',
    classFormat: {
      duration: '30-45 minutes per session',
      mode: ['One-on-One', 'Small Group (2-4 students)'],
      materials: ['Noorani Qaida book (PDF)', 'Practice worksheets', 'Audio lessons']
    },
    requirements: [
      'No prerequisites - absolute beginners welcome',
      'Stable internet connection',
      'Quiet learning environment'
    ]
  },
  {
    id: 'hifz-quran',
    name: 'Hifz-ul-Quran (Quran Memorization)',
    category: 'quran',
    description: 'Structured program for memorizing the Holy Quran with proper Tajweed and understanding. Expert guidance, proven memorization techniques, and regular revision schedules help students achieve their Hifz goals efficiently.',
    level: 'intermediate' as const,
    targetAudience: 'Students committed to memorizing the Quran with Tajweed accuracy',
    thumbnailUrl: '',
    isActive: true,
    status: 'published' as const,
    teacherId: '',
    classFormat: {
      duration: '60 minutes per session',
      mode: ['One-on-One', 'Small Group (2-3 students)'],
      materials: ['Digital Mushaf', 'Memorization tracker', 'Revision schedules', 'Audio recordings']
    },
    requirements: [
      'Good Tajweed foundation',
      'Ability to read Quran fluently',
      'Daily practice commitment (30-60 min)',
      'Regular attendance'
    ]
  },
  {
    id: 'quran-tafsir',
    name: 'Quran Tafsir (Interpretation)',
    category: 'islamic-studies',
    description: 'Deep dive into the meanings, context, and wisdom of Quranic verses. Study classical and contemporary Tafsir sources, understand the historical context of revelation, and discover practical applications of Quranic teachings in daily life.',
    level: 'advanced' as const,
    targetAudience: 'Muslims with basic Quranic knowledge seeking deeper understanding',
    thumbnailUrl: '',
    isActive: true,
    status: 'published' as const,
    teacherId: '',
    classFormat: {
      duration: '60-90 minutes per session',
      mode: ['Group Classes', 'Lecture Style'],
      materials: ['Tafsir Ibn Kathir', 'Tafsir al-Jalalayn', 'Supplementary articles', 'Discussion forums']
    },
    requirements: [
      'Basic understanding of Quran and Islam',
      'Ability to follow lectures in English',
      'Interest in deeper scholarly study'
    ]
  },
  {
    id: 'arabic-language',
    name: 'Arabic Language',
    category: 'arabic',
    description: 'Comprehensive Arabic language course covering reading, writing, speaking, and understanding. From alphabet basics to advanced grammar (Nahw and Sarf), build strong linguistic skills to understand Quran and Islamic texts in their original language.',
    level: 'all' as const,
    targetAudience: 'Anyone wanting to learn Arabic for Quranic studies or communication',
    thumbnailUrl: '',
    isActive: true,
    status: 'published' as const,
    teacherId: '',
    classFormat: {
      duration: '45-60 minutes per session',
      mode: ['One-on-One', 'Group Classes', 'Self-paced modules'],
      materials: ['Arabic textbooks (PDF)', 'Grammar charts', 'Vocabulary flashcards', 'Practice exercises']
    },
    requirements: [
      'No prerequisites for beginners',
      'Commitment to regular practice',
      'Microphone for speaking practice'
    ]
  },
  {
    id: 'islamic-studies',
    name: 'Islamic Studies',
    category: 'islamic-studies',
    description: 'Comprehensive study of Islamic fundamentals including Aqeedah (beliefs), Fiqh (jurisprudence), Seerah (Prophet\'s biography), and Islamic history. Build a solid foundation in Islamic knowledge with authentic sources and scholarly guidance.',
    level: 'all' as const,
    targetAudience: 'Muslims of all ages seeking to strengthen their Islamic knowledge',
    thumbnailUrl: '',
    isActive: true,
    status: 'published' as const,
    teacherId: '',
    classFormat: {
      duration: '60 minutes per session',
      mode: ['Group Classes', 'Lecture Style', 'Interactive Discussions'],
      materials: ['Islamic Studies textbooks', 'Hadith collections', 'Historical documentaries', 'Quiz assignments']
    },
    requirements: [
      'Basic understanding of Islam',
      'Interest in Islamic knowledge',
      'Regular attendance and participation'
    ]
  }
];

export async function seedPredefinedCourses() {
  try {
    console.log('Starting to seed predefined courses...');
    
    const now = Timestamp.now();
    
    for (const course of PREDEFINED_COURSES) {
      const courseRef = doc(db, 'courses', course.id);
      
      await setDoc(courseRef, {
        ...course,
        createdAt: now,
        updatedAt: now
      }, { merge: true });
      
      console.log(`✓ Seeded course: ${course.name} (${course.id})`);
    }
    
    console.log('\n✅ All courses seeded successfully!');
    console.log(`Total courses: ${PREDEFINED_COURSES.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    throw error;
  }
}
