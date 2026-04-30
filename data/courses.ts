import { Course } from '../types/course.types';

export const courses: Course[] = [
  {
    id: 'quran-tajweed',
    title: 'Quran with Tajweed',
    titleArabic: 'القرآن الكريم مع التجويد',
    category: 'quran',
    level: 'all',
    ageGroup: 'all',
    languages: ['arabic', 'dari', 'persian', 'pashto', 'english', 'urdu'],
    targetAudience: 'Students who can read Arabic and want to perfect their Quranic recitation',
    ageRange: '7+ years',
    duration: '10 weeks (extendable)',
    description: 'Master the art of Quranic recitation with proper Tajweed rules. Learn to recite the Quran beautifully as it was revealed, with correct pronunciation, rules of elongation, and proper articulation points.',
    learningOutcomes: [
      { id: '1', description: 'Understand and apply all basic Tajweed rules during recitation' },
      { id: '2', description: 'Correctly pronounce letters from their articulation points (Makharij)' },
      { id: '3', description: 'Master Noon Sakinah and Tanween rules (Idgham, Iqlab, Ikhfa, Izhar)' },
      { id: '4', description: 'Apply Meem Sakinah rules accurately' },
      { id: '5', description: 'Recognize and correctly recite different types of Mad (elongation)' },
      { id: '6', description: 'Identify and apply rules of Qalqalah, Ghunnah, and Waqf' },
      { id: '7', description: 'Develop fluency in Quranic recitation with proper flow and rhythm' }
    ],
    syllabus: [],
    classFormat: { duration: '45-60 minutes per session', mode: ['One-on-One', 'Group Classes (max 4 students)'], materials: ['Digital Mushaf', 'Tajweed charts', 'Audio recitations', 'Practice worksheets'] },
    requirements: ['Must be able to read Arabic script', 'Basic understanding of short Surahs recommended', 'Quiet learning environment', 'Headphones/microphone for clear audio'],
    teacherInfo: { qualification: 'Certified Qari with Ijazah in Tajweed', experience: '5+ years teaching Tajweed worldwide', languages: ['Arabic', 'English', 'Urdu'], gender: 'both' },
    pricing: [
      { sessions: 2, pricePerMonth: 50, label: '2 sessions/week' },
      { sessions: 3, pricePerMonth: 70, label: '3 sessions/week' },
      { sessions: 5, pricePerMonth: 120, label: '5 sessions/week' }
    ],
    priceType: 'paid',
    lowBandwidthFriendly: true,
    lessonOutline: [
      { id: 'tajweed-1', title: 'Makharij and letter articulation', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'tajweed-2', title: 'Noon Sakinah and Tanween rules', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'tajweed-3', title: 'Mad and Qalqalah practice', hasVideo: true, hasText: true, hasQuiz: true }
    ]
  },
  {
    id: 'noorani-qaida',
    title: 'Noorani Qaida & Prayer',
    titleArabic: 'القاعدة النورانية والصلاة',
    category: 'quran',
    level: 'beginner',
    ageGroup: 'all',
    languages: ['arabic', 'dari', 'persian', 'pashto', 'english', 'urdu'],
    targetAudience: 'Complete beginners, children, reverts, and families starting Arabic reading, Tajweed, and daily prayer practice',
    ageRange: '5+ years',
    duration: '19 interactive lessons • Self-paced',
    description: 'A complete beginner-friendly Islamic foundation course covering Arabic letters, Noorani Qaida reading skills, Tajweed basics, and step-by-step Salah training with quizzes, progress tracking, and badges.',
    learningOutcomes: [
      { id: '1', description: 'Recognize and pronounce all Arabic letters' },
      { id: '2', description: 'Read Arabic words and short sentences with correct harakat' },
      { id: '3', description: 'Apply foundational Tajweed rules including Sukoon, Tanween, and Qalqalah' },
      { id: '4', description: 'Perform wudhu and Salah step-by-step with confidence' },
      { id: '5', description: 'Track progress through 19 guided lessons and quizzes' }
    ],
    syllabus: [],
    classFormat: { duration: 'Self-paced lessons (15-30 minutes recommended)', mode: ['Interactive self-study', 'Student dashboard access'], materials: ['Lesson viewer', 'Quizzes', 'Progress tracker', 'Prayer practice guides'] },
    requirements: ['No prior Arabic knowledge required', 'Student account recommended for saved progress', 'Stable internet connection'],
    teacherInfo: { qualification: 'Structured digital beginner curriculum with academy guidance', experience: 'Designed for first-step Arabic and Salah learners', languages: ['Arabic', 'English', 'Urdu', 'Dari', 'Pashto'], gender: 'both' },
    pricing: [
      { sessions: 0, pricePerMonth: 0, label: 'Free self-paced access' }
    ],
    priceType: 'free',
    lowBandwidthFriendly: true,
    lessonOutline: [
      { id: 'nq-1', title: 'Section 1: Noorani Qaida (7 lessons)', hasVideo: false, hasText: true, hasQuiz: true },
      { id: 'nq-2', title: 'Section 2: Tajweed Basics (5 lessons)', hasVideo: false, hasText: true, hasQuiz: true },
      { id: 'nq-3', title: 'Section 3: Salah Guide (7 lessons)', hasVideo: false, hasText: true, hasQuiz: true }
    ]
  },
  {
    id: 'hifz-quran',
    title: 'Hifz-ul-Quran (Memorization)',
    titleArabic: 'حفظ القرآن الكريم',
    category: 'quran',
    level: 'intermediate',
    ageGroup: 'youth',
    languages: ['arabic', 'dari', 'persian', 'pashto', 'english', 'urdu'],
    targetAudience: 'Students committed to memorizing the entire Quran or specific portions',
    ageRange: '7+ years',
    duration: 'Ongoing (2-4 years for complete Hifz)',
    description: 'Complete Qur\'an Memorization (Hifz) course: A structured, comprehensive program combining authentic Islamic principles with memory science. Covers 9 modules, 4 memorization tracks, revision systems, and spiritual development for sustainable long-term memorization.',
    learningOutcomes: [
      { id: '1', description: 'Understand the spiritual importance and virtues of Qur\'an memorization' },
      { id: '2', description: 'Master 5 proven memorization techniques (line-by-line, 3x3 system, chunking, listening-based, writing)' },
      { id: '3', description: 'Develop a personalized daily memorization schedule based on capacity' },
      { id: '4', description: 'Implement a 4-tier revision system for long-term retention' },
      { id: '5', description: 'Handle psychological challenges: motivation, forgetting, burnout, consistency' },
      { id: '6', description: 'Track progress with monthly assessments and milestone celebrations' },
      { id: '7', description: 'Memorize with proper Tajweed and understanding' },
      { id: '8', description: 'Complete entire Qur\'an (30 Juz) with fluency and confidence' }
    ],
    syllabus: [
      { id: 'module-1', title: 'Foundation of Hifz', topics: ['Importance of Niyyah (Intention)', 'Virtues of Memorizing Qur\'an', 'Correct Recitation & Tajweed', 'Choosing a Mushaf', 'Role of a Teacher'], lessons: 5 },
      { id: 'module-2', title: 'Memorization Techniques', topics: ['Line-by-Line Repetition', '3x3 System', '5-10 Ayah Chunking', 'Listening-Based Method', 'Writing Method'], lessons: 5 },
      { id: 'module-3', title: 'Daily & Weekly Plans', topics: ['Light Track (0.5 page/day)', 'Standard Track (1 page/day)', 'Intensive Track (2 pages/day)', 'Weekly Planning Framework', 'Schedule Optimization'], lessons: 5 },
      { id: 'module-4', title: 'Revision System (Muraja\'ah)', topics: ['Same-Day Revision', '7-Day Rolling Cycle', '30-Day Monthly Review', 'Juz-Based Rotation', 'Why Revision is Critical'], lessons: 5 },
      { id: 'module-5', title: 'Order of Memorization', topics: ['Backward Approach (Juz 30→1)', 'Forward Approach (Juz 1→30)', 'Hybrid Approach', 'Pros & Cons Analysis', 'Choosing Your Path'], lessons: 4 },
      { id: 'module-6', title: 'Memory & Focus Optimization', topics: ['Fixed Time Memorization', 'Fixed Place Technique', 'Reciting in Prayer', 'Understanding & Tafsir', 'Cognitive Science of Memory'], lessons: 5 },
      { id: 'module-7', title: 'Psychological Resilience', topics: ['Handling Low Motivation', 'Dealing with Forgetfulness', 'Avoiding Burnout', 'Long-Term Consistency', 'Building Qur\'an-Centered Identity'], lessons: 5 },
      { id: 'module-8', title: 'Progress Tracking', topics: ['Weekly Assessment Templates', 'Monthly Self-Evaluation', 'Teacher Evaluation Guide', 'Tracking Metrics', 'Celebration Milestones'], lessons: 4 },
      { id: 'module-9', title: 'Advanced Strategies', topics: ['After 10+ Juz Mastery', 'Connecting Similar Ayahs', 'Leading Salah from Memory', 'Teaching Others', 'Lifetime Maintenance'], lessons: 5 }
    ],
    classFormat: { duration: '60-90 minutes per session', mode: ['One-on-One (recommended)', 'Small Group (2 max)'], materials: ['Mushaf (same edition)', 'Audio Quran', 'Hifz tracker', 'Revision schedule', 'Complete course guide with 90-day plan'] },
    requirements: ['Must have completed Noorani Qaida or equivalent', 'Good Tajweed foundation', 'Strong commitment and daily practice (45 min - 3+ hours)', 'Consistent attendance (4-6 days/week)', 'Stable learning environment', 'Access to digital device for course materials'],
    teacherInfo: { qualification: 'Hafiz-e-Quran with Ijazah in Qur\'anic Science', experience: '8+ years guiding students through complete Qur\'an memorization, multiple students have achieved Hifz', languages: ['Arabic', 'English', 'Urdu', 'Dari', 'Pashto'], gender: 'both' },
    pricing: [
      { sessions: 3, pricePerMonth: 70, label: '3 sessions/week (Light Track)' },
      { sessions: 5, pricePerMonth: 120, label: '5 sessions/week (Standard Track - recommended)' },
      { sessions: 6, pricePerMonth: 150, label: '6 sessions/week (Intensive Track)' }
    ],
    priceType: 'paid',
    lowBandwidthFriendly: true,
    lessonOutline: [
      { id: 'hifz-1', title: 'Module 1: Foundation of Hifz', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'hifz-2', title: 'Module 2: 5 Memorization Techniques Compared', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'hifz-3', title: 'Module 3: Choose Your Track (Light/Standard/Intensive)', hasVideo: true, hasText: true, hasQuiz: false },
      { id: 'hifz-4', title: 'Module 4: Master the 4-Tier Revision System', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'hifz-5', title: 'Module 5: Order of Memorization', hasVideo: true, hasText: true, hasQuiz: false },
      { id: 'hifz-6', title: 'Module 6: Memory Science & Focus Techniques', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'hifz-7', title: 'Module 7: Psychological Resilience & Motivation', hasVideo: true, hasText: true, hasQuiz: false },
      { id: 'hifz-8', title: 'Module 8: Progress Tracking & Assessment', hasVideo: false, hasText: true, hasQuiz: false },
      { id: 'hifz-9', title: 'Module 9: Advanced Strategies (10+ Juz)', hasVideo: true, hasText: true, hasQuiz: false },
      { id: 'hifz-bonus-1', title: 'BONUS: 90-Day Starter Plan (Printable)', hasVideo: false, hasText: true, hasQuiz: false },
      { id: 'hifz-bonus-2', title: 'BONUS: 1-Year Hifz Roadmap', hasVideo: false, hasText: true, hasQuiz: false },
      { id: 'hifz-bonus-3', title: 'BONUS: Common Mistakes & How to Avoid Them', hasVideo: false, hasText: true, hasQuiz: false }
    ]
  },
  {
    id: 'quran-translation',
    title: 'Quran Translation & Tafsir',
    titleArabic: 'ترجمة القرآن والتفسير',
    category: 'quran',
    level: 'intermediate',
    ageGroup: 'youth',
    languages: ['arabic', 'dari', 'persian', 'pashto', 'english', 'urdu'],
    targetAudience: 'Students seeking deep understanding of Quranic meanings and context',
    ageRange: '15+ years',
    duration: 'Ongoing (specific Surahs or Juz)',
    description: 'Explore the profound meanings of the Quran through word-by-word translation and authentic Tafsir. Study the context of revelation and practical application.',
    learningOutcomes: [
      { id: '1', description: 'Understand word-by-word translation of selected Surahs' },
      { id: '2', description: 'Learn context and reasons for revelation' },
      { id: '3', description: 'Study authentic Tafsir from classical scholars' },
      { id: '4', description: 'Apply Quranic teachings to contemporary life' }
    ],
    syllabus: [],
    classFormat: { duration: '60 minutes per session', mode: ['One-on-One', 'Group Classes (max 5)'], materials: ['Mushaf with translation', 'Tafsir texts', 'Word-by-word resources', 'Supplementary readings'] },
    requirements: ['Basic Islamic knowledge recommended', 'Ability to read Quran', 'Interest in deep study', 'Note-taking skills'],
    teacherInfo: { qualification: 'Islamic scholar with degree in Quranic Studies and Tafsir', experience: '10+ years teaching Tafsir', languages: ['Arabic', 'English', 'Urdu'], gender: 'both' },
    pricing: [
      { sessions: 2, pricePerMonth: 55, label: '2 sessions/week' },
      { sessions: 3, pricePerMonth: 80, label: '3 sessions/week' },
      { sessions: 4, pricePerMonth: 125, label: '4 sessions/week' }
    ],
    priceType: 'paid',
    lowBandwidthFriendly: true
  },
  {
    id: 'arabic-language',
    title: 'AI-Powered Arabic Language Learning',
    titleArabic: 'تعلم اللغة العربية بالذكاء الاصطناعي',
    category: 'language-learning',
    level: 'all',
    ageGroup: 'all',
    languages: ['arabic', 'dari', 'persian', 'pashto', 'english', 'urdu'],
    targetAudience: 'Anyone wanting to learn Arabic from beginner to advanced level with AI-powered adaptive learning',
    ageRange: '10+ years',
    duration: 'Self-paced with AI guidance (A1 to C2 levels)',
    description: 'Experience the future of Arabic learning with our revolutionary AI-Powered Arabic Language Learning & Automation System. This comprehensive platform teaches Classical Arabic (Fusha), Modern Standard Arabic, and conversational dialects through an adaptive curriculum that automatically adjusts to your learning pace and style. From complete beginners (A1) to advanced learners (C2), master Arabic with personalized lessons, intelligent assessments, and real-time feedback.',
    learningOutcomes: [
      { id: '1', description: 'Master Arabic alphabet (28 letters) with correct Makharij and pronunciation' },
      { id: '2', description: 'Build vocabulary from basic (family, greetings) to advanced (rhetoric, classical texts) - 2000+ words' },
      { id: '3', description: 'Understand and apply Arabic grammar from basics to advanced Nahw and Sarf' },
      { id: '4', description: 'Progress through 6 CEFR levels (A1, A2, B1, B2, C1, C2) with automatic level detection' },
      { id: '5', description: 'Read, write, speak, and comprehend Arabic fluently' },
      { id: '6', description: 'Learn Modern Standard Arabic plus optional dialects (Egyptian, Levantine, Gulf, Moroccan)' },
      { id: '7', description: 'Study Classical/Quranic Arabic with morphological breakdown and root analysis' },
      { id: '8', description: 'Get instant AI feedback on pronunciation, grammar, and writing' },
      { id: '9', description: 'Track progress with detailed analytics and adaptive learning paths' }
    ],
    syllabus: [
      { 
        id: 'level-a1', 
        title: 'Level A1-A2: Beginner',
        topics: [
          'Arabic Alphabet (حروف الهجاء) - 28 letters',
          'Pronunciation & Makharij (articulation points)',
          'Short vowels (Harakat) - Fatha, Kasra, Damma',
          'Basic vocabulary (family, greetings, numbers, food) - 300 words',
          'Basic sentence structure (Nominal & Verbal sentences)',
          'Introduction to verbs (past tense)',
          'Basic conversations and everyday phrases'
        ],
        lessons: 15
      },
      {
        id: 'level-b1',
        title: 'Level B1: Elementary',
        topics: [
          'Verb conjugations (past, present, command)',
          'Gender rules and agreement',
          'Plurals (broken & sound plurals)',
          'Prepositions and their usage',
          'Adjectives and adjective agreement',
          'Simple paragraph writing',
          'Listening comprehension exercises',
          'Vocabulary expansion - 600 words'
        ],
        lessons: 20
      },
      {
        id: 'level-b2',
        title: 'Level B2: Intermediate',
        topics: [
          'Advanced grammar (Idafa, conditional sentences)',
          'Derived verb forms (Form I-X)',
          'Reading and analyzing short articles',
          'Structured conversation practice',
          'Essay writing techniques',
          'Vocabulary expansion - 1000+ words',
          'Introduction to dialects vs MSA'
        ],
        lessons: 25
      },
      {
        id: 'level-c1-c2',
        title: 'Level C1-C2: Advanced',
        topics: [
          'Rhetoric (Balagha basics)',
          'Classical Arabic texts and literature',
          'News analysis and media comprehension',
          'Advanced morphology (Sarf)',
          'Complex grammar (advanced Nahw)',
          'Debate and structured speech',
          'Academic and professional writing',
          'Root-word analysis',
          'Quranic Arabic and Tafsir vocabulary'
        ],
        lessons: 30
      }
    ],
    classFormat: { 
      duration: 'Self-paced - 15 to 60 minutes per session based on preference', 
      mode: ['AI-Powered Self-Study', 'Adaptive Learning', 'Interactive Exercises'], 
      materials: [
        'AI-powered lesson generator',
        'Interactive pronunciation trainer',
        'Automated placement tests',
        'Spaced repetition vocabulary system',
        'Writing correction AI',
        'Progress tracking dashboard',
        'Dialect comparison modules',
        'Classical Arabic module',
        'Audio pronunciation guides'
      ] 
    },
    requirements: [
      'No prior Arabic knowledge required',
      'Web browser or mobile device',
      'Microphone for pronunciation practice (optional)',
      'Commitment to consistent daily practice'
    ],
    teacherInfo: { 
      qualification: 'AI-Powered Adaptive Learning System + Human Expert Review', 
      experience: 'Advanced AI trained on thousands of Arabic learning sessions', 
      languages: ['Arabic (native)', 'English', 'Urdu', 'Persian', 'Dari', 'Pashto'], 
      gender: 'AI System' 
    },
    pricing: [
      { sessions: 0, pricePerMonth: 0, label: 'Free - Basic course access' },
      { sessions: 0, pricePerMonth: 15, label: 'Premium - Full features + AI feedback' },
      { sessions: 0, pricePerMonth: 30, label: 'Pro - Premium + Human tutor sessions' }
    ],
    priceType: 'free',
    lowBandwidthFriendly: true,
    lessonOutline: [
      { id: 'arabic-1', title: 'Placement Test & Level Assessment', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'arabic-2', title: 'Arabic Alphabet Mastery', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'arabic-3', title: 'Pronunciation & Makharij Training', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'arabic-4', title: 'Essential Vocabulary Builder', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'arabic-5', title: 'Grammar Foundations', hasVideo: true, hasText: true, hasQuiz: true },
      { id: 'arabic-6', title: 'Conversation Practice', hasVideo: true, hasText: true, hasQuiz: true }
    ]
  },
  {
    id: 'islamic-studies',
    title: 'Islamic Studies & Fiqh',
    titleArabic: 'الدراسات الإسلامية والفقه',
    category: 'islamic-studies',
    level: 'all',
    ageGroup: 'youth',
    languages: ['arabic', 'dari', 'persian', 'pashto', 'english', 'urdu'],
    targetAudience: 'Muslims seeking comprehensive knowledge of Islamic beliefs and practices',
    ageRange: '13+ years',
    duration: '16 weeks (can be extended)',
    description: 'Complete Islamic education covering Aqeedah (beliefs), Fiqh (jurisprudence), Seerah (Prophet\'s biography), and Hadith sciences. Build a strong foundation in Islamic knowledge.',
    learningOutcomes: [
      { id: '1', description: 'Understand the six pillars of Iman in depth' },
      { id: '2', description: 'Learn authentic Islamic practices (Fiqh of worship)' },
      { id: '3', description: 'Study the life of Prophet Muhammad ﷺ comprehensively' },
      { id: '4', description: 'Apply Islamic ethics in daily life' }
    ],
    syllabus: [],
    classFormat: { duration: '60 minutes per session', mode: ['One-on-One', 'Group Classes (max 8)', 'Family Sessions'], materials: ['Selected Islamic texts', 'Hadith collections', 'Seerah books', 'Presentation slides'] },
    requirements: ['Basic knowledge of Islam helpful but not required', 'Open mind and willingness to learn', 'Ability to read and take notes'],
    teacherInfo: { qualification: 'Islamic scholar with degree from recognized Islamic university', experience: '9+ years teaching Islamic studies', languages: ['Arabic', 'English', 'Urdu'], gender: 'both' },
    pricing: [
      { sessions: 2, pricePerMonth: 45, label: '2 sessions/week' },
      { sessions: 3, pricePerMonth: 65, label: '3 sessions/week' },
      { sessions: 4, pricePerMonth: 110, label: '4 sessions/week' }
    ],
    priceType: 'paid',
    lowBandwidthFriendly: true
  },
  {
    id: 'kids-general-knowledge',
    title: 'General Knowledge for Kids',
    category: 'general-knowledge',
    level: 'beginner',
    ageGroup: 'children',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Children who want to learn about the world with simple stories and visuals',
    ageRange: '5-9 years',
    duration: '6 weeks',
    description: 'A fun introduction to countries, animals, planets, and Afghanistan geography using pictures and short audio explanations.',
    learningOutcomes: [
      { id: '1', description: 'Name key provinces and rivers of Afghanistan' },
      { id: '2', description: 'Identify common animals and their habitats' },
      { id: '3', description: 'Recognize basic world facts and flags' }
    ],
    syllabus: [],
    classFormat: { duration: '20-30 minutes per session', mode: ['Self-paced', 'Small Group'], materials: ['Picture cards', 'Short audio clips', 'Printable worksheets'] },
    requirements: ['Parent support recommended for younger learners'],
    teacherInfo: { qualification: 'Primary education teacher', experience: '4+ years teaching children', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true,
    lessonOutline: [
      { id: 'gk-1', title: 'Afghanistan map and provinces', hasVideo: false, hasText: true, hasQuiz: true },
      { id: 'gk-2', title: 'Animals and nature', hasVideo: false, hasText: true, hasQuiz: true },
      { id: 'gk-3', title: 'Planets and sky', hasVideo: false, hasText: true, hasQuiz: true }
    ]
  },
  {
    id: 'kids-manners-character',
    title: 'Manners & Character (Kids)',
    category: 'life-skills',
    level: 'beginner',
    ageGroup: 'children',
    languages: ['dari', 'persian', 'pashto'],
    targetAudience: 'Children learning respect, honesty, and cleanliness at home and school',
    ageRange: '5-9 years',
    duration: '6 weeks',
    description: 'Build good habits through simple stories, role-play, and daily practice challenges.',
    learningOutcomes: [
      { id: '1', description: 'Practice honesty and respect in daily life' },
      { id: '2', description: 'Keep personal and shared spaces clean' },
      { id: '3', description: 'Use polite greetings and kind words' }
    ],
    syllabus: [],
    classFormat: { duration: '20-30 minutes per session', mode: ['Self-paced', 'Family learning'], materials: ['Story cards', 'Daily habit checklist'] },
    requirements: ['Parent supervision recommended'],
    teacherInfo: { qualification: 'Primary education teacher', experience: '5+ years teaching manners', languages: ['Dari', 'Pashto'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'preteens-math-for-life',
    title: 'Math for Life',
    category: 'life-skills',
    level: 'beginner',
    ageGroup: 'preteens',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Pre-teens who want practical math for daily use',
    ageRange: '10-14 years',
    duration: '8 weeks',
    description: 'Learn percentages, time planning, and simple budgeting using real-life examples.',
    learningOutcomes: [
      { id: '1', description: 'Calculate discounts and percentages' },
      { id: '2', description: 'Plan time and schedules' },
      { id: '3', description: 'Create a simple weekly budget' }
    ],
    syllabus: [],
    classFormat: { duration: '30-40 minutes per session', mode: ['Self-paced', 'Group'], materials: ['Practice sheets', 'Worked examples'] },
    requirements: ['Basic addition and subtraction'],
    teacherInfo: { qualification: 'Math teacher', experience: '3+ years teaching practical math', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'preteens-digital-basics',
    title: 'Digital Basics & Online Safety',
    category: 'digital-skills',
    level: 'beginner',
    ageGroup: 'preteens',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Pre-teens learning safe and useful internet basics',
    ageRange: '10-14 years',
    duration: '6 weeks',
    description: 'Understand the internet, safe browsing, and respectful online behavior in simple language.',
    learningOutcomes: [
      { id: '1', description: 'Explain what the internet is and how it works' },
      { id: '2', description: 'Use strong passwords and safe browsing habits' },
      { id: '3', description: 'Recognize scams and unsafe content' }
    ],
    syllabus: [],
    classFormat: { duration: '25-35 minutes per session', mode: ['Self-paced', 'Group'], materials: ['Illustrated guides', 'Short quizzes'] },
    requirements: ['Access to a basic smartphone'],
    teacherInfo: { qualification: 'Digital literacy trainer', experience: '3+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'youth-career-awareness',
    title: 'Career Awareness & CV Basics',
    category: 'life-skills',
    level: 'beginner',
    ageGroup: 'youth',
    languages: ['dari', 'pashto', 'english'],
    targetAudience: 'Youth preparing for work and future studies',
    ageRange: '15-20 years',
    duration: '6 weeks',
    description: 'Explore job paths, required skills, and learn how to create a simple CV.',
    learningOutcomes: [
      { id: '1', description: 'Identify local job roles and skills needed' },
      { id: '2', description: 'Draft a simple CV in one page' },
      { id: '3', description: 'Practice basic interview communication' }
    ],
    syllabus: [],
    classFormat: { duration: '35-45 minutes per session', mode: ['Self-paced', 'Group'], materials: ['CV templates', 'Role-play guides'] },
    requirements: ['Basic literacy'],
    teacherInfo: { qualification: 'Career coach', experience: '4+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'youth-financial-literacy',
    title: 'Financial Literacy (Halal Income)',
    category: 'life-skills',
    level: 'beginner',
    ageGroup: 'youth',
    languages: ['dari', 'persian', 'pashto'],
    targetAudience: 'Youth learning saving, budgeting, and halal income',
    ageRange: '15-20 years',
    duration: '8 weeks',
    description: 'Learn how to save, plan expenses, and understand halal income in daily life.',
    learningOutcomes: [
      { id: '1', description: 'Create a simple monthly budget' },
      { id: '2', description: 'Explain halal income and honest trade' },
      { id: '3', description: 'Build a saving habit' }
    ],
    syllabus: [],
    classFormat: { duration: '35-45 minutes per session', mode: ['Self-paced', 'Group'], materials: ['Budget worksheet', 'Case studies'] },
    requirements: ['Basic numeracy'],
    teacherInfo: { qualification: 'Community trainer', experience: '5+ years', languages: ['Dari', 'Pashto'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'adult-small-business',
    title: 'Small Business Basics',
    category: 'life-skills',
    level: 'beginner',
    ageGroup: 'adults',
    languages: ['dari', 'persian', 'pashto'],
    targetAudience: 'Adults starting or improving small businesses',
    ageRange: '21+ years',
    duration: '8 weeks',
    description: 'Learn buying and selling basics, customer service, and simple bookkeeping.',
    learningOutcomes: [
      { id: '1', description: 'Keep basic sales and expense records' },
      { id: '2', description: 'Improve customer service and communication' },
      { id: '3', description: 'Choose small business ideas that fit local needs' }
    ],
    syllabus: [],
    classFormat: { duration: '40-50 minutes per session', mode: ['Self-paced', 'Group'], materials: ['Ledger templates', 'Local market case studies'] },
    requirements: ['Basic literacy'],
    teacherInfo: { qualification: 'Business trainer', experience: '6+ years', languages: ['Dari', 'Pashto'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'adult-agriculture-basics',
    title: 'Agriculture & Livestock Basics',
    category: 'life-skills',
    level: 'beginner',
    ageGroup: 'adults',
    languages: ['dari', 'persian', 'pashto'],
    targetAudience: 'Adults working with farming and livestock',
    ageRange: '21+ years',
    duration: '6 weeks',
    description: 'Practical tips for soil care, irrigation, and livestock health for small farms.',
    learningOutcomes: [
      { id: '1', description: 'Plan simple seasonal farming tasks' },
      { id: '2', description: 'Improve animal health and feeding practices' },
      { id: '3', description: 'Reduce waste and improve yields' }
    ],
    syllabus: [],
    classFormat: { duration: '30-40 minutes per session', mode: ['Self-paced'], materials: ['Printable guides', 'Photo examples'] },
    requirements: ['None'],
    teacherInfo: { qualification: 'Agriculture trainer', experience: '5+ years', languages: ['Dari', 'Pashto'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'adult-family-health',
    title: 'Family Health & First Aid',
    category: 'life-skills',
    level: 'beginner',
    ageGroup: 'adults',
    languages: ['dari', 'persian', 'pashto'],
    targetAudience: 'Adults focused on family health and safety',
    ageRange: '21+ years',
    duration: '6 weeks',
    description: 'Learn hygiene, nutrition basics, and simple first aid steps for families.',
    learningOutcomes: [
      { id: '1', description: 'Apply everyday hygiene and safe water practices' },
      { id: '2', description: 'Plan simple balanced meals' },
      { id: '3', description: 'Provide basic first aid in common situations' }
    ],
    syllabus: [],
    classFormat: { duration: '30-40 minutes per session', mode: ['Self-paced', 'Group'], materials: ['Checklists', 'Illustrated guides'] },
    requirements: ['None'],
    teacherInfo: { qualification: 'Community health educator', experience: '5+ years', languages: ['Dari', 'Pashto'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'kids-science-explorers',
    title: 'Science Explorers (Kids)',
    category: 'science',
    level: 'beginner',
    ageGroup: 'children',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Children curious about nature, space, and simple experiments',
    ageRange: '6-10 years',
    duration: '6 weeks',
    description: 'Fun science with safe home activities. Explore plants, water, magnets, and the sky with simple, guided tasks.',
    learningOutcomes: [
      { id: '1', description: 'Observe and describe basic science facts' },
      { id: '2', description: 'Complete simple experiments with adult help' },
      { id: '3', description: 'Explain everyday science in simple words' }
    ],
    syllabus: [],
    classFormat: { duration: '25-30 minutes per session', mode: ['Self-paced', 'Small Group'], materials: ['Picture guides', 'Household items list'] },
    requirements: ['Adult supervision for hands-on activities'],
    teacherInfo: { qualification: 'Primary science teacher', experience: '4+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'preteens-science-lab',
    title: 'Science Lab Basics',
    category: 'science',
    level: 'beginner',
    ageGroup: 'preteens',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Pre-teens ready for structured science activities',
    ageRange: '10-14 years',
    duration: '8 weeks',
    description: 'Build a strong foundation in biology, physics, and chemistry using easy experiments and clear explanations.',
    learningOutcomes: [
      { id: '1', description: 'Describe basic forces, energy, and motion' },
      { id: '2', description: 'Identify cells, organs, and simple body systems' },
      { id: '3', description: 'Use safe methods for basic experiments' }
    ],
    syllabus: [],
    classFormat: { duration: '30-40 minutes per session', mode: ['Self-paced', 'Group'], materials: ['Activity sheets', 'Experiment checklist'] },
    requirements: ['Basic reading skills'],
    teacherInfo: { qualification: 'Science educator', experience: '5+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'youth-stem-lab',
    title: 'STEM Lab Foundations',
    category: 'science',
    level: 'intermediate',
    ageGroup: 'youth',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Youth exploring STEM pathways and problem-solving',
    ageRange: '15-20 years',
    duration: '10 weeks',
    description: 'Hands-on STEM topics: scientific method, data, simple engineering design, and real-world problem solving.',
    learningOutcomes: [
      { id: '1', description: 'Use the scientific method to test ideas' },
      { id: '2', description: 'Collect and interpret simple data' },
      { id: '3', description: 'Build and present a small STEM project' }
    ],
    syllabus: [],
    classFormat: { duration: '45-60 minutes per session', mode: ['Group', 'Project-based'], materials: ['Project briefs', 'Data templates'] },
    requirements: ['Basic math and reading'],
    teacherInfo: { qualification: 'STEM instructor', experience: '5+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'adult-environmental-science',
    title: 'Environmental Science for Everyday Life',
    category: 'science',
    level: 'beginner',
    ageGroup: 'adults',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Adults interested in health, water, and environmental awareness',
    ageRange: '21+ years',
    duration: '6 weeks',
    description: 'Learn practical science about clean water, air quality, waste, and community health.',
    learningOutcomes: [
      { id: '1', description: 'Explain safe water and hygiene basics' },
      { id: '2', description: 'Reduce household waste with simple steps' },
      { id: '3', description: 'Identify everyday environmental risks' }
    ],
    syllabus: [],
    classFormat: { duration: '30-40 minutes per session', mode: ['Self-paced', 'Group'], materials: ['Guides', 'Local case studies'] },
    requirements: ['None'],
    teacherInfo: { qualification: 'Community science educator', experience: '4+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'kids-it-basics',
    title: 'Computers & Safe Tech (Kids)',
    category: 'information-technology',
    level: 'beginner',
    ageGroup: 'children',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Children learning basic device skills and safe use',
    ageRange: '7-11 years',
    duration: '6 weeks',
    description: 'Learn the parts of a computer, typing basics, and safe online behavior with simple exercises.',
    learningOutcomes: [
      { id: '1', description: 'Identify basic computer parts and functions' },
      { id: '2', description: 'Practice safe browsing and passwords' },
      { id: '3', description: 'Use simple apps for learning' }
    ],
    syllabus: [],
    classFormat: { duration: '25-35 minutes per session', mode: ['Self-paced', 'Small Group'], materials: ['Typing sheets', 'Safety cards'] },
    requirements: ['Access to a computer or tablet'],
    teacherInfo: { qualification: 'Digital literacy trainer', experience: '3+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'preteens-coding-scratch',
    title: 'Creative Coding with Scratch',
    category: 'information-technology',
    level: 'beginner',
    ageGroup: 'preteens',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Pre-teens interested in games and simple coding logic',
    ageRange: '10-14 years',
    duration: '8 weeks',
    description: 'Create animations and games while learning logic, loops, and problem-solving.',
    learningOutcomes: [
      { id: '1', description: 'Build simple animations with blocks' },
      { id: '2', description: 'Use loops and conditions in projects' },
      { id: '3', description: 'Present a short interactive project' }
    ],
    syllabus: [],
    classFormat: { duration: '35-45 minutes per session', mode: ['Group', 'Project-based'], materials: ['Scratch guides', 'Project templates'] },
    requirements: ['Access to a computer with internet'],
    teacherInfo: { qualification: 'Coding instructor', experience: '4+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: false
  },
  {
    id: 'youth-it-foundations',
    title: 'IT Foundations',
    category: 'information-technology',
    level: 'intermediate',
    ageGroup: 'youth',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Youth building core IT and career-ready skills',
    ageRange: '15-20 years',
    duration: '10 weeks',
    description: 'Understand hardware, software, file management, and basic troubleshooting with hands-on practice.',
    learningOutcomes: [
      { id: '1', description: 'Use common productivity tools effectively' },
      { id: '2', description: 'Manage files and folders confidently' },
      { id: '3', description: 'Perform basic device troubleshooting' }
    ],
    syllabus: [],
    classFormat: { duration: '45-60 minutes per session', mode: ['Group', 'Guided practice'], materials: ['Lab tasks', 'Practice files'] },
    requirements: ['Basic computer access'],
    teacherInfo: { qualification: 'IT trainer', experience: '5+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: false
  },
  {
    id: 'adult-digital-productivity',
    title: 'Digital Productivity for Adults',
    category: 'information-technology',
    level: 'beginner',
    ageGroup: 'adults',
    languages: ['dari', 'persian', 'pashto', 'english'],
    targetAudience: 'Adults using digital tools for work and family tasks',
    ageRange: '21+ years',
    duration: '6 weeks',
    description: 'Learn email, documents, spreadsheets, and safe file sharing to boost everyday productivity.',
    learningOutcomes: [
      { id: '1', description: 'Send emails with attachments safely' },
      { id: '2', description: 'Create simple documents and tables' },
      { id: '3', description: 'Organize files and folders for daily use' }
    ],
    syllabus: [],
    classFormat: { duration: '35-45 minutes per session', mode: ['Self-paced', 'Guided practice'], materials: ['Step-by-step guides', 'Practice templates'] },
    requirements: ['Access to a computer or smartphone'],
    teacherInfo: { qualification: 'Digital skills coach', experience: '4+ years', languages: ['Dari', 'Pashto', 'English'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'ai-foundations',
    title: 'Artificial Intelligence Foundations',
    category: 'artificial-intelligence',
    level: 'beginner',
    ageGroup: 'youth',
    languages: ['english', 'dari', 'persian', 'pashto'],
    targetAudience: 'Students curious about AI and modern technology',
    ageRange: '14+ years',
    duration: '8 weeks',
    description: 'Understand what AI is, how it is used, and the basics of machine learning with practical examples.',
    learningOutcomes: [
      { id: '1', description: 'Explain how AI works in everyday life' },
      { id: '2', description: 'Identify core machine learning concepts' },
      { id: '3', description: 'Explore ethical use of AI tools' }
    ],
    syllabus: [],
    classFormat: { duration: '45-60 minutes per session', mode: ['Group', 'Interactive projects'], materials: ['Slides', 'Hands-on demos'] },
    requirements: ['Basic computer skills'],
    teacherInfo: { qualification: 'AI educator', experience: '3+ years', languages: ['English', 'Dari'], gender: 'both' },
    pricing: [
      { sessions: 2, pricePerMonth: 30, label: '2 sessions/week' },
      { sessions: 3, pricePerMonth: 45, label: '3 sessions/week' }
    ],
    priceType: 'paid',
    lowBandwidthFriendly: false
  },
  {
    id: 'science-discovery',
    title: 'Science Discovery Lab',
    category: 'science',
    level: 'beginner',
    ageGroup: 'preteens',
    languages: ['english', 'dari', 'persian'],
    targetAudience: 'Pre-teens exploring science through experiments',
    ageRange: '10-14 years',
    duration: '6 weeks',
    description: 'Hands-on science lessons covering energy, earth, and simple physics experiments at home.',
    learningOutcomes: [
      { id: '1', description: 'Describe basic energy and motion concepts' },
      { id: '2', description: 'Complete simple home experiments safely' },
      { id: '3', description: 'Build curiosity through observation' }
    ],
    syllabus: [],
    classFormat: { duration: '30-40 minutes per session', mode: ['Group', 'Guided experiments'], materials: ['Household materials list', 'Worksheets'] },
    requirements: ['Parent supervision recommended'],
    teacherInfo: { qualification: 'Science instructor', experience: '4+ years', languages: ['English', 'Dari'], gender: 'both' },
    pricing: [{ sessions: 1, pricePerMonth: 0, label: 'Free access' }],
    priceType: 'free',
    lowBandwidthFriendly: true
  },
  {
    id: 'english-language',
    title: 'English Language',
    category: 'language-learning',
    level: 'all',
    ageGroup: 'all',
    languages: ['english', 'dari', 'persian', 'pashto'],
    targetAudience: 'Learners who want to build confidence in English',
    ageRange: '8+ years',
    duration: '12 weeks',
    description: 'Learn speaking, reading, and writing with structured lessons and conversation practice.',
    learningOutcomes: [
      { id: '1', description: 'Build everyday vocabulary' },
      { id: '2', description: 'Speak in short, clear sentences' },
      { id: '3', description: 'Read simple texts with understanding' }
    ],
    syllabus: [],
    classFormat: { duration: '45-60 minutes per session', mode: ['One-on-One', 'Group'], materials: ['Workbooks', 'Conversation prompts'] },
    requirements: ['Notebook and pen'],
    teacherInfo: { qualification: 'English teacher', experience: '6+ years', languages: ['English', 'Dari', 'Pashto'], gender: 'both' },
    pricing: [
      { sessions: 2, pricePerMonth: 35, label: '2 sessions/week' },
      { sessions: 3, pricePerMonth: 50, label: '3 sessions/week' }
    ],
    priceType: 'paid',
    lowBandwidthFriendly: true
  },
  {
    id: 'persian-language',
    title: 'Persian Language (Dari)',
    category: 'language-learning',
    level: 'all',
    ageGroup: 'all',
    languages: ['dari', 'english', 'pashto'],
    targetAudience: 'Students building strong Persian communication',
    ageRange: '8+ years',
    duration: '10 weeks',
    description: 'Improve speaking, reading, and writing skills with structured Persian lessons.',
    learningOutcomes: [
      { id: '1', description: 'Read short texts confidently' },
      { id: '2', description: 'Speak in daily conversations' },
      { id: '3', description: 'Write simple paragraphs' }
    ],
    syllabus: [],
    classFormat: { duration: '45 minutes per session', mode: ['Group', 'One-on-One'], materials: ['Reading sheets', 'Vocabulary lists'] },
    requirements: ['Notebook and pen'],
    teacherInfo: { qualification: 'Language instructor', experience: '5+ years', languages: ['Dari', 'English', 'Pashto'], gender: 'both' },
    pricing: [
      { sessions: 2, pricePerMonth: 30, label: '2 sessions/week' },
      { sessions: 3, pricePerMonth: 45, label: '3 sessions/week' }
    ],
    priceType: 'paid',
    lowBandwidthFriendly: true
  },
  {
    id: 'pashto-language',
    title: 'Pashto Language',
    category: 'language-learning',
    level: 'all',
    ageGroup: 'all',
    languages: ['pashto', 'english', 'dari'],
    targetAudience: 'Learners who want to strengthen Pashto communication',
    ageRange: '8+ years',
    duration: '10 weeks',
    description: 'Build spoken fluency and reading skills through guided lessons and practice.',
    learningOutcomes: [
      { id: '1', description: 'Use common Pashto phrases' },
      { id: '2', description: 'Read short passages' },
      { id: '3', description: 'Write simple sentences' }
    ],
    syllabus: [],
    classFormat: { duration: '45 minutes per session', mode: ['Group', 'One-on-One'], materials: ['Reading cards', 'Practice sheets'] },
    requirements: ['Notebook and pen'],
    teacherInfo: { qualification: 'Pashto teacher', experience: '5+ years', languages: ['Pashto', 'English', 'Dari'], gender: 'both' },
    pricing: [
      { sessions: 2, pricePerMonth: 30, label: '2 sessions/week' },
      { sessions: 3, pricePerMonth: 45, label: '3 sessions/week' }
    ],
    priceType: 'paid',
    lowBandwidthFriendly: true
  }
];
