import { NooraniQaidaCourse, CourseSection, Lesson, Quiz, Exercise } from '../types/noorani-qaida.types';

// NOORANI QAIDA LESSONS (Section 1)
const nooraniQaidaLessons: Lesson[] = [
  {
    id: 'nq-l1',
    sectionId: 'nq-s1',
    title: 'Arabic Alphabet (Single Letters)',
    description: 'Learn the 28 Arabic letters and their basic sounds',
    order: 1,
    type: 'interactive',
    estimatedTime: 15,
    thumbnail: '🔤',
    isUnlocked: true,
    content: {
      introduction: 'Arabic alphabet consists of 28 letters. Each letter has a unique sound and shape.',
      mainContent: [
        {
          type: 'text',
          content: 'Welcome to Noorani Qaida! We start by learning the alphabet.',
          arabicText: 'مرحبا بك في نوراني القاعدة',
          transliteration: 'Marhaba bika fi Noorani al-Qaida'
        },
        {
          type: 'table',
          content: 'Arabic alphabet with transliteration',
          arabicText: 'الحروف العربية'
        }
      ],
      keyPoints: [
        'Arabic has 28 letters',
        'Letters connect to each other',
        'Shape changes based on position',
        'Each letter has a unique sound'
      ],
      learningObjectives: [
        'Recognize all 28 Arabic letters',
        'Pronounce each letter correctly',
        'Understand letter positions'
      ]
    },
    exercises: [
      {
        id: 'ex-nq1-1',
        type: 'tapToHear',
        title: 'Letter Pronunciation',
        instruction: 'Tap each letter to hear its correct pronunciation',
        difficulty: 'easy'
      },
      {
        id: 'ex-nq1-2',
        type: 'matching',
        title: 'Letter Matching',
        instruction: 'Match the letter name with its Arabic form',
        difficulty: 'medium'
      }
    ],
    quiz: {
      id: 'quiz-nq1',
      lessonId: 'nq-l1',
      title: 'Alphabet Quiz',
      description: 'Test your knowledge of Arabic letters',
      passingScore: 70,
      allowRetake: true,
      questions: [
        {
          id: 'q1',
          type: 'mcq',
          question: 'Which of these is the Arabic letter Alef?',
          arabicQuestion: 'أي من هذه هو حرف الألف؟',
          options: [
            { id: 'o1', text: 'ب', arabicText: 'ب' },
            { id: 'o2', text: 'ا', arabicText: 'ا', isCorrect: true },
            { id: 'o3', text: 'ت', arabicText: 'ت' }
          ],
          correctAnswer: 'o2',
          explanation: 'Alef (ا) is the first letter of the Arabic alphabet.',
          points: 10,
          order: 1
        },
        {
          id: 'q2',
          type: 'mcq',
          question: 'What sound does the letter "ب" make?',
          options: [
            { id: 'o1', text: 'A (as in "bat")', isCorrect: true },
            { id: 'o2', text: 'E (as in "bet")' },
            { id: 'o3', text: 'I (as in "bit")' }
          ],
          correctAnswer: 'o1',
          explanation: 'Ba (ب) has a sound similar to "b" in English.',
          points: 10,
          order: 2
        }
      ]
    }
  },
  {
    id: 'nq-l2',
    sectionId: 'nq-s1',
    title: 'Harakat (Vowel Marks)',
    description: 'Learn Fatha, Kasra, and Damma vowel marks',
    order: 2,
    type: 'interactive',
    estimatedTime: 12,
    thumbnail: '◌',
    isUnlocked: false,
    content: {
      introduction: 'Harakat are small marks placed above or below letters to indicate vowel sounds.',
      mainContent: [
        {
          type: 'text',
          content: 'There are 3 main vowel marks in Arabic',
          arabicText: 'هناك ثلاثة حركات رئيسية'
        }
      ],
      keyPoints: [
        'Fatha (َ) - sounds like "a" in "cat"',
        'Kasra (ِ) - sounds like "i" in "sit"',
        'Damma (ُ) - sounds like "u" in "put"'
      ],
      learningObjectives: [
        'Identify harakat marks',
        'Pronounce vowels correctly',
        'Apply harakat to letters'
      ]
    },
    exercises: [],
    quiz: {
      id: 'quiz-nq2',
      lessonId: 'nq-l2',
      title: 'Harakat Quiz',
      description: 'Test your knowledge of vowel marks',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'nq-l3',
    sectionId: 'nq-s1',
    title: 'Joining Letters',
    description: 'Learn how to connect letters when writing',
    order: 3,
    type: 'interactive',
    estimatedTime: 15,
    thumbnail: '→',
    isUnlocked: false,
    content: {
      introduction: 'Arabic letters change shape based on their position in a word.',
      mainContent: [],
      keyPoints: [
        'Beginning position (Bidayah)',
        'Middle position (Wasita)',
        'End position (Nihayah)',
        'Standalone position (Mouqafa)'
      ],
      learningObjectives: [
        'Understand letter positions',
        'Read connected letters',
        'Write words correctly'
      ]
    },
    exercises: [],
    quiz: {
      id: 'quiz-nq3',
      lessonId: 'nq-l3',
      title: 'Letter Joining Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'nq-l4',
    sectionId: 'nq-s1',
    title: 'Sukoon and Madd',
    description: 'Learn about no-vowel mark and elongation rules',
    order: 4,
    type: 'interactive',
    estimatedTime: 14,
    thumbnail: '○',
    isUnlocked: false,
    content: {
      introduction: 'Sukoon (ْ) and Madd (ـــ) are important rules in Arabic reading.',
      mainContent: [],
      keyPoints: [
        'Sukoon means no vowel',
        'Madd extends vowel sounds',
        'Natural Madd (2 harakat)',
        'Extended Madd (4-6 harakat)'
      ],
      learningObjectives: ['Apply Sukoon correctly', 'Recognize Madd rules', 'Read words with Madd']
    },
    exercises: [],
    quiz: {
      id: 'quiz-nq4',
      lessonId: 'nq-l4',
      title: 'Sukoon & Madd Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'nq-l5',
    sectionId: 'nq-s1',
    title: 'Tanween (Double Vowels)',
    description: 'Learn about double vowel marks',
    order: 5,
    type: 'interactive',
    estimatedTime: 13,
    thumbnail: '◆',
    isUnlocked: false,
    content: {
      introduction: 'Tanween adds an "n" sound to vowels.',
      mainContent: [],
      keyPoints: [
        'Fathatan (ً) - an',
        'Kasratan (ٍ) - in',
        'Dammatan (ٌ) - un'
      ],
      learningObjectives: ['Identify tanween marks', 'Pronounce tanween correctly']
    },
    exercises: [],
    quiz: {
      id: 'quiz-nq5',
      lessonId: 'nq-l5',
      title: 'Tanween Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'nq-l6',
    sectionId: 'nq-s1',
    title: 'Basic Word Formation',
    description: 'Combine letters into simple words',
    order: 6,
    type: 'interactive',
    estimatedTime: 16,
    thumbnail: '📝',
    isUnlocked: false,
    content: {
      introduction: 'Now combine letters and harakat to form simple Arabic words.',
      mainContent: [],
      keyPoints: ['Form 2-letter words', 'Form 3-letter words', 'Form 4-letter words'],
      learningObjectives: ['Read simple words', 'Understand word structure']
    },
    exercises: [],
    quiz: {
      id: 'quiz-nq6',
      lessonId: 'nq-l6',
      title: 'Word Formation Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'nq-l7',
    sectionId: 'nq-s1',
    title: 'Short Sentences Reading',
    description: 'Read complete short sentences',
    order: 7,
    type: 'reading',
    estimatedTime: 20,
    thumbnail: '📖',
    isUnlocked: false,
    content: {
      introduction: 'Practice reading short, meaningful sentences in Arabic.',
      mainContent: [],
      keyPoints: ['Read with proper pronunciation', 'Understand sentence meaning', 'Build reading confidence'],
      learningObjectives: [
        'Read complete sentences',
        'Maintain proper pacing',
        'Understand context'
      ]
    },
    exercises: [],
    quiz: {
      id: 'quiz-nq7',
      lessonId: 'nq-l7',
      title: 'Sentence Reading Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  }
];

// TAJWEED LESSONS (Section 2)
const tajweedLessons: Lesson[] = [
  {
    id: 'tj-l1',
    sectionId: 'nq-s2',
    title: 'Makharij (Articulation Points)',
    description: 'Learn where each letter is pronounced from',
    order: 1,
    type: 'interactive',
    estimatedTime: 18,
    thumbnail: '🗣️',
    isUnlocked: false,
    content: {
      introduction: 'Makharij refers to the specific locations in the mouth where letters are articulated.',
      mainContent: [],
      keyPoints: [
        'Throat articulation',
        'Palate articulation',
        'Teeth articulation',
        'Lips articulation',
        'Nasal articulation'
      ],
      learningObjectives: [
        'Understand articulation points',
        'Pronounce letters from correct position',
        'Avoid common pronunciation errors'
      ]
    },
    exercises: [],
    quiz: {
      id: 'quiz-tj1',
      lessonId: 'tj-l1',
      title: 'Makharij Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'tj-l2',
    sectionId: 'nq-s2',
    title: 'Noon Saakin & Tanween Rules',
    description: 'Master the 4 rules of Noon Saakin and Tanween',
    order: 2,
    type: 'interactive',
    estimatedTime: 20,
    thumbnail: '◐',
    isUnlocked: false,
    content: {
      introduction: 'These rules govern how we pronounce Noon when it has no vowel mark.',
      mainContent: [],
      keyPoints: [
        'Izhar (clarity) - letter is pronounced clearly',
        'Idgham (merging) - Noon blends with next letter',
        'Iqlab (concealment) - Noon becomes "m"',
        'Ikhfa (hiding) - Noon is hidden slightly'
      ],
      learningObjectives: [
        'Apply all 4 rules correctly',
        'Recognize when each rule applies',
        'Recite with proper Tajweed'
      ]
    },
    exercises: [],
    quiz: {
      id: 'quiz-tj2',
      lessonId: 'tj-l2',
      title: 'Noon Rules Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'tj-l3',
    sectionId: 'nq-s2',
    title: 'Meem Saakin Rules',
    description: 'Learn the 3 rules for Meem with no vowel',
    order: 3,
    type: 'interactive',
    estimatedTime: 15,
    thumbnail: 'ْم',
    isUnlocked: false,
    content: {
      introduction: 'Meem Saakin has 3 important rules to follow.',
      mainContent: [],
      keyPoints: [
        'Ikhfa (concealment) - with Ba',
        'Idgham (merging) - with Meem',
        'Izhar (clarity) - with other letters'
      ],
      learningObjectives: ['Apply Meem rules correctly', 'Recognize rule triggers']
    },
    exercises: [],
    quiz: {
      id: 'quiz-tj3',
      lessonId: 'tj-l3',
      title: 'Meem Rules Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'tj-l4',
    sectionId: 'nq-s2',
    title: 'Qalqalah (Echoing Letters)',
    description: 'Learn the 5 letters that echo when stopped',
    order: 4,
    type: 'interactive',
    estimatedTime: 12,
    thumbnail: '🔊',
    isUnlocked: false,
    content: {
      introduction: 'Qalqalah is the echo sound in 5 specific letters.',
      mainContent: [],
      keyPoints: [
        'Qaf (ق)',
        'Kaf (ك)',
        'Ba (ب)',
        'Jim (ج)',
        'Dal (د)'
      ],
      learningObjectives: ['Pronounce Qalqalah letters correctly', 'Apply in recitation']
    },
    exercises: [],
    quiz: {
      id: 'quiz-tj4',
      lessonId: 'tj-l4',
      title: 'Qalqalah Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'tj-l5',
    sectionId: 'nq-s2',
    title: 'Basic Recitation Practice',
    description: 'Apply Tajweed rules while reciting',
    order: 5,
    type: 'practice',
    estimatedTime: 25,
    thumbnail: '🎙️',
    isUnlocked: false,
    content: {
      introduction: 'Now practice all Tajweed rules together in actual Quran recitation.',
      mainContent: [],
      keyPoints: ['Apply all rules', 'Record and compare', 'Improve progressively'],
      learningObjectives: ['Recite with proper Tajweed', 'Self-evaluate pronunciation']
    },
    exercises: [],
    quiz: {
      id: 'quiz-tj5',
      lessonId: 'tj-l5',
      title: 'Recitation Practice',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  }
];

// SALAH (PRAYER) LESSONS (Section 3)
const salahLessons: Lesson[] = [
  {
    id: 'sl-l1',
    sectionId: 'nq-s3',
    title: 'Importance of Salah',
    description: 'Understand why prayer is central to Islam',
    order: 1,
    type: 'video',
    estimatedTime: 10,
    thumbnail: '⛪',
    isUnlocked: false,
    content: {
      introduction: 'Salah (Prayer) is one of the 5 pillars of Islam.',
      mainContent: [],
      keyPoints: [
        'Salah connects us to Allah',
        'Practice 5 times daily',
        'Sets schedule for the day',
        'Brings peace and mindfulness'
      ],
      learningObjectives: ['Understand importance of prayer', 'Commit to prayer routine']
    },
    exercises: [],
    quiz: {
      id: 'quiz-sl1',
      lessonId: 'sl-l1',
      title: 'Salah Importance Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'sl-l2',
    sectionId: 'nq-s3',
    title: 'Wudu (Ablution)',
    description: 'Step-by-step process of ritual purification',
    order: 2,
    type: 'prayer-guide',
    estimatedTime: 15,
    thumbnail: '💧',
    isUnlocked: false,
    content: {
      introduction: 'Wudu is the ritual washing before prayer.',
      mainContent: [],
      keyPoints: [
        'Intention (Niyyah)',
        'Wash hands 3 times',
        'Rinse mouth 3 times',
        'Rinse nose 3 times',
        'Wash face 3 times',
        'Wash arms to elbows 3 times',
        'Wipe head once',
        'Wash feet 3 times'
      ],
      learningObjectives: ['Perform Wudu correctly', 'Maintain purity']
    },
    exercises: [],
    quiz: {
      id: 'quiz-sl2',
      lessonId: 'sl-l2',
      title: 'Wudu Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'sl-l3',
    sectionId: 'nq-s3',
    title: 'Adhan & Iqamah (Call to Prayer)',
    description: 'Learn the prayer calls and their meaning',
    order: 3,
    type: 'video',
    estimatedTime: 12,
    thumbnail: '📢',
    isUnlocked: false,
    content: {
      introduction: 'Adhan is the call to prayer, Iqamah is said before prayer begins.',
      mainContent: [],
      keyPoints: ['Adhan components', 'Iqamah components', 'Responses to Adhan'],
      learningObjectives: ['Understand Adhan meaning', 'Respond appropriately']
    },
    exercises: [],
    quiz: {
      id: 'quiz-sl3',
      lessonId: 'sl-l3',
      title: 'Adhan & Iqamah Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'sl-l4',
    sectionId: 'nq-s3',
    title: '2 Rak\'ah Prayer (Fajr)',
    description: 'Learn the 2-unit morning prayer',
    order: 4,
    type: 'prayer-guide',
    estimatedTime: 20,
    thumbnail: '🧎',
    isUnlocked: false,
    content: {
      introduction: 'Fajr prayer has 2 obligatory units (Rak\'ah).',
      mainContent: [],
      keyPoints: [
        'Stand (Qiyam)',
        'Recite Surah Al-Fatiha',
        'Recite another Surah',
        'Bow (Ruku)',
        'Stand (Qiyam)',
        'Prostrate (Sujud)',
        'Sit (Jalsah)',
        'Prostrate (Sujud)',
        'Complete 2nd Rak\'ah',
        'Testification (Tashahhud)',
        'Salutation (Salam)'
      ],
      learningObjectives: ['Complete 2 Rak\'ah prayer', 'Understand each position']
    },
    exercises: [],
    quiz: {
      id: 'quiz-sl4',
      lessonId: 'sl-l4',
      title: '2 Rak\'ah Prayer Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'sl-l5',
    sectionId: 'nq-s3',
    title: '4 Rak\'ah Prayer (Zuhr, Asr)',
    description: 'Learn the 4-unit midday and afternoon prayers',
    order: 5,
    type: 'prayer-guide',
    estimatedTime: 25,
    thumbnail: '🧎‍♂️',
    isUnlocked: false,
    content: {
      introduction: 'Zuhr and Asr prayers each have 4 obligatory units.',
      mainContent: [],
      keyPoints: [
        'Complete same positions as 2 Rak\'ah',
        'Repeat for 3rd Rak\'ah (quiet recitation)',
        'Repeat for 4th Rak\'ah (quiet recitation)',
        'Testification (Tashahhud)',
        'Salutation (Salam)'
      ],
      learningObjectives: ['Complete 4 Rak\'ah prayer', 'Manage 4 units smoothly']
    },
    exercises: [],
    quiz: {
      id: 'quiz-sl5',
      lessonId: 'sl-l5',
      title: '4 Rak\'ah Prayer Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'sl-l6',
    sectionId: 'nq-s3',
    title: 'Complete Salah with Translation',
    description: 'Full prayer with Arabic, transliteration and English meaning',
    order: 6,
    type: 'prayer-guide',
    estimatedTime: 30,
    thumbnail: '📕',
    isUnlocked: false,
    content: {
      introduction: 'Here is a complete prayer with full translations and meanings.',
      mainContent: [],
      keyPoints: [
        'Understand every word',
        'Grasp spiritual meaning',
        'Internalize the message',
        'Build connection with Allah'
      ],
      learningObjectives: ['Pray with full understanding', 'Connect spiritually']
    },
    exercises: [],
    quiz: {
      id: 'quiz-sl6',
      lessonId: 'sl-l6',
      title: 'Complete Salah Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  },
  {
    id: 'sl-l7',
    sectionId: 'nq-s3',
    title: 'Common Prayer Mistakes',
    description: 'Learn what to avoid in prayer',
    order: 7,
    type: 'video',
    estimatedTime: 15,
    thumbnail: '⚠️',
    isUnlocked: false,
    content: {
      introduction: 'Understanding common mistakes helps you pray correctly.',
      mainContent: [],
      keyPoints: [
        'Improper intentions',
        'Incorrect postures',
        'Rushing through prayer',
        'Lack of focus',
        'Pronunciation mistakes'
      ],
      learningObjectives: ['Avoid common errors', 'Pray with proper form']
    },
    exercises: [],
    quiz: {
      id: 'quiz-sl7',
      lessonId: 'sl-l7',
      title: 'Mistakes Quiz',
      description: '',
      passingScore: 70,
      allowRetake: true,
      questions: []
    }
  }
];

// COURSE SECTIONS
const courseSections: CourseSection[] = [
  {
    id: 'nq-s1',
    title: 'Section 1: Noorani Qaida (Arabic Basics)',
    description: 'Master the fundamentals of Arabic reading',
    order: 1,
    icon: '🔤',
    lessons: nooraniQaidaLessons
  },
  {
    id: 'nq-s2',
    title: 'Section 2: Tajweed Basics',
    description: 'Learn correct Quranic recitation rules',
    order: 2,
    icon: '🎙️',
    lessons: tajweedLessons
  },
  {
    id: 'nq-s3',
    title: 'Section 3: Salah (Daily Prayers)',
    description: 'Master the 5 daily prayers step-by-step',
    order: 3,
    icon: '🧎',
    lessons: salahLessons
  }
];

// MAIN COURSE
export const nooraniQaidaCourseData: NooraniQaidaCourse = {
  id: 'nq-course-001',
  title: 'Noorani Qaida & Prayer (Salah) Course',
  description: 'A comprehensive beginner-friendly course teaching Arabic reading, Tajweed basics, and daily prayers with understanding.',
  level: 'beginner',
  language: 'en',
  thumbnail: '📖',
  sections: courseSections,
  totalLessons: nooraniQaidaLessons.length + tajweedLessons.length + salahLessons.length,
  estimatedDuration: 30,
  instructor: {
    name: 'Muhammadi Academy',
    bio: 'Islamic education specialists focused on foundational Islamic learning.',
    image: '👨‍🏫'
  },
  isPublished: true
};
