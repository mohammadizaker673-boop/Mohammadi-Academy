import { ArabicLesson, PronunciationGuide, GrammarRule, ArabicWord } from '../types/arabic-learning.types';

// Pronunciation Guide - Arabic Alphabet
export const arabicAlphabet: PronunciationGuide[] = [
  {
    letter: 'ا',
    name: 'Alif',
    transliteration: 'ā',
    articulationPoint: 'Throat',
    examples: ['أب (ab) - father', 'أم (umm) - mother'],
    similarLetters: []
  },
  {
    letter: 'ب',
    name: 'Baa',
    transliteration: 'b',
    articulationPoint: 'Lips',
    examples: ['بيت (bayt) - house', 'باب (bāb) - door'],
    similarLetters: ['ت', 'ث']
  },
  {
    letter: 'ت',
    name: 'Taa',
    transliteration: 't',
    articulationPoint: 'Tip of tongue against upper teeth',
    examples: ['تفاح (tuffāḥ) - apple', 'تمر (tamr) - dates'],
    similarLetters: ['ب', 'ث']
  },
  {
    letter: 'ث',
    name: 'Thaa',
    transliteration: 'th',
    articulationPoint: 'Tongue between teeth',
    examples: ['ثلج (thalj) - ice', 'ثوم (thūm) - garlic'],
    similarLetters: ['ب', 'ت']
  },
  {
    letter: 'ج',
    name: 'Jeem',
    transliteration: 'j',
    articulationPoint: 'Middle of tongue',
    examples: ['جمل (jamal) - camel', 'جبل (jabal) - mountain'],
    similarLetters: ['ح', 'خ']
  },
  {
    letter: 'ح',
    name: 'Haa',
    transliteration: 'ḥ',
    articulationPoint: 'Throat (heavy)',
    examples: ['حليب (ḥalīb) - milk', 'حب (ḥubb) - love'],
    similarLetters: ['ج', 'خ', 'ه']
  },
  {
    letter: 'خ',
    name: 'Khaa',
    transliteration: 'kh',
    articulationPoint: 'Back of throat',
    examples: ['خبز (khubz) - bread', 'خير (khayr) - good'],
    similarLetters: ['ج', 'ح']
  },
  {
    letter: 'د',
    name: 'Daal',
    transliteration: 'd',
    articulationPoint: 'Tip of tongue',
    examples: ['دجاج (dajāj) - chicken', 'درس (dars) - lesson'],
    similarLetters: ['ذ', 'ض']
  },
  {
    letter: 'ذ',
    name: 'Dhaal',
    transliteration: 'dh',
    articulationPoint: 'Tongue between teeth',
    examples: ['ذهب (dhahab) - gold', 'ذئب (dhiʾb) - wolf'],
    similarLetters: ['د', 'ظ']
  },
  {
    letter: 'ر',
    name: 'Raa',
    transliteration: 'r',
    articulationPoint: 'Tip of tongue (rolled)',
    examples: ['رز (ruzz) - rice', 'رجل (rajul) - man'],
    similarLetters: ['ز']
  },
  {
    letter: 'ز',
    name: 'Zay',
    transliteration: 'z',
    articulationPoint: 'Tip of tongue',
    examples: ['زيت (zayt) - oil', 'زهرة (zahra) - flower'],
    similarLetters: ['ر', 'س']
  },
  {
    letter: 'س',
    name: 'Seen',
    transliteration: 's',
    articulationPoint: 'Tip of tongue',
    examples: ['سمك (samak) - fish', 'سماء (samāʾ) - sky'],
    similarLetters: ['ص', 'ز', 'ش']
  },
  {
    letter: 'ش',
    name: 'Sheen',
    transliteration: 'sh',
    articulationPoint: 'Tip of tongue',
    examples: ['شمس (shams) - sun', 'شجرة (shajara) - tree'],
    similarLetters: ['س']
  },
  {
    letter: 'ص',
    name: 'Saad',
    transliteration: 'ṣ',
    articulationPoint: 'Tip of tongue (emphatic)',
    examples: ['صباح (ṣabāḥ) - morning', 'صديق (ṣadīq) - friend'],
    similarLetters: ['س', 'ض']
  },
  {
    letter: 'ض',
    name: 'Daad',
    transliteration: 'ḍ',
    articulationPoint: 'Side of tongue (emphatic)',
    examples: ['ضوء (ḍawʾ) - light', 'أرض (arḍ) - land'],
    similarLetters: ['د', 'ص']
  },
  {
    letter: 'ط',
    name: 'Taa',
    transliteration: 'ṭ',
    articulationPoint: 'Tip of tongue (emphatic)',
    examples: ['طعام (ṭaʿām) - food', 'طيور (ṭuyūr) - birds'],
    similarLetters: ['ت', 'ظ']
  },
  {
    letter: 'ظ',
    name: 'Dhaa',
    transliteration: 'ẓ',
    articulationPoint: 'Tongue between teeth (emphatic)',
    examples: ['ظل (ẓill) - shadow', 'نظيف (naẓīf) - clean'],
    similarLetters: ['ذ', 'ط']
  },
  {
    letter: 'ع',
    name: 'Ayn',
    transliteration: 'ʿ',
    articulationPoint: 'Deep throat',
    examples: ['عين (ʿayn) - eye', 'علم (ʿilm) - knowledge'],
    similarLetters: ['غ']
  },
  {
    letter: 'غ',
    name: 'Ghayn',
    transliteration: 'gh',
    articulationPoint: 'Back of throat',
    examples: ['غرفة (ghurfa) - room', 'غداء (ghadāʾ) - lunch'],
    similarLetters: ['ع', 'خ']
  },
  {
    letter: 'ف',
    name: 'Faa',
    transliteration: 'f',
    articulationPoint: 'Lower lip and upper teeth',
    examples: ['فم (fam) - mouth', 'فيل (fīl) - elephant'],
    similarLetters: ['ق']
  },
  {
    letter: 'ق',
    name: 'Qaaf',
    transliteration: 'q',
    articulationPoint: 'Back of tongue',
    examples: ['قلم (qalam) - pen', 'قلب (qalb) - heart'],
    similarLetters: ['ك', 'ف']
  },
  {
    letter: 'ك',
    name: 'Kaaf',
    transliteration: 'k',
    articulationPoint: 'Back of tongue',
    examples: ['كتاب (kitāb) - book', 'كلب (kalb) - dog'],
    similarLetters: ['ق']
  },
  {
    letter: 'ل',
    name: 'Laam',
    transliteration: 'l',
    articulationPoint: 'Tip of tongue',
    examples: ['ليمون (laymūn) - lemon', 'ليل (layl) - night'],
    similarLetters: []
  },
  {
    letter: 'م',
    name: 'Meem',
    transliteration: 'm',
    articulationPoint: 'Lips',
    examples: ['ماء (māʾ) - water', 'مدرسة (madrasa) - school'],
    similarLetters: []
  },
  {
    letter: 'ن',
    name: 'Noon',
    transliteration: 'n',
    articulationPoint: 'Tip of tongue',
    examples: ['نار (nār) - fire', 'نجم (najm) - star'],
    similarLetters: []
  },
  {
    letter: 'ه',
    name: 'Haa',
    transliteration: 'h',
    articulationPoint: 'Throat (light)',
    examples: ['هواء (hawāʾ) - air', 'هدية (hadiyya) - gift'],
    similarLetters: ['ح']
  },
  {
    letter: 'و',
    name: 'Waaw',
    transliteration: 'w/ū',
    articulationPoint: 'Lips (rounded)',
    examples: ['ورد (ward) - roses', 'وجه (wajh) - face'],
    similarLetters: []
  },
  {
    letter: 'ي',
    name: 'Yaa',
    transliteration: 'y/ī',
    articulationPoint: 'Middle of tongue',
    examples: ['يد (yad) - hand', 'يوم (yawm) - day'],
    similarLetters: []
  }
];

// A1 Level Vocabulary
export const a1Vocabulary: ArabicWord[] = [
  // Greetings
  { id: 'v001', arabic: 'السلام عليكم', transliteration: 'As-salāmu ʿalaykum', english: 'Peace be upon you (Hello)', exampleSentence: 'السلام عليكم يا أصدقاء', level: 'A1', category: 'greetings' },
  { id: 'v002', arabic: 'مرحبا', transliteration: 'Marḥaban', english: 'Hello/Welcome', exampleSentence: 'مرحبا، كيف حالك؟', level: 'A1', category: 'greetings' },
  { id: 'v003', arabic: 'صباح الخير', transliteration: 'Ṣabāḥ al-khayr', english: 'Good morning', exampleSentence: 'صباح الخير يا معلم', level: 'A1', category: 'greetings' },
  { id: 'v004', arabic: 'مساء الخير', transliteration: 'Masāʾ al-khayr', english: 'Good evening', exampleSentence: 'مساء الخير يا أمي', level: 'A1', category: 'greetings' },
  { id: 'v005', arabic: 'مع السلامة', transliteration: 'Maʿa s-salāma', english: 'Goodbye', exampleSentence: 'مع السلامة، إلى اللقاء', level: 'A1', category: 'greetings' },
  
  // Family
  { id: 'v006', arabic: 'أب', transliteration: 'Ab', english: 'Father', exampleSentence: 'أبي طبيب', level: 'A1', category: 'family' },
  { id: 'v007', arabic: 'أم', transliteration: 'Umm', english: 'Mother', exampleSentence: 'أمي معلمة', level: 'A1', category: 'family' },
  { id: 'v008', arabic: 'أخ', transliteration: 'Akh', english: 'Brother', exampleSentence: 'لي أخ واحد', level: 'A1', category: 'family' },
  { id: 'v009', arabic: 'أخت', transliteration: 'Ukht', english: 'Sister', exampleSentence: 'لي أختان', level: 'A1', category: 'family' },
  { id: 'v010', arabic: 'عائلة', transliteration: 'ʿĀʾila', english: 'Family', exampleSentence: 'عائلتي كبيرة', level: 'A1', category: 'family' },
  
  // Numbers
  { id: 'v011', arabic: 'واحد', transliteration: 'Wāḥid', english: 'One', exampleSentence: 'لدي كتاب واحد', level: 'A1', category: 'numbers' },
  { id: 'v012', arabic: 'اثنان', transliteration: 'Ithnān', english: 'Two', exampleSentence: 'لدي قلمان', level: 'A1', category: 'numbers' },
  { id: 'v013', arabic: 'ثلاثة', transliteration: 'Thalātha', english: 'Three', exampleSentence: 'عندي ثلاثة إخوة', level: 'A1', category: 'numbers' },
  { id: 'v014', arabic: 'أربعة', transliteration: 'Arbaʿa', english: 'Four', exampleSentence: 'في الغرفة أربعة كراسي', level: 'A1', category: 'numbers' },
  { id: 'v015', arabic: 'خمسة', transliteration: 'Khamsa', english: 'Five', exampleSentence: 'لدي خمسة أصابع', level: 'A1', category: 'numbers' },
  
  // Basic Words
  { id: 'v016', arabic: 'نعم', transliteration: 'Naʿam', english: 'Yes', exampleSentence: 'نعم، أنا طالب', level: 'A1', category: 'basic' },
  { id: 'v017', arabic: 'لا', transliteration: 'Lā', english: 'No', exampleSentence: 'لا، أنا لست معلم', level: 'A1', category: 'basic' },
  { id: 'v018', arabic: 'شكرا', transliteration: 'Shukran', english: 'Thank you', exampleSentence: 'شكرا جزيلا', level: 'A1', category: 'basic' },
  { id: 'v019', arabic: 'من فضلك', transliteration: 'Min faḍlik', english: 'Please', exampleSentence: 'من فضلك، ساعدني', level: 'A1', category: 'basic' },
  { id: 'v020', arabic: 'آسف', transliteration: 'Āsif', english: 'Sorry', exampleSentence: 'أنا آسف جدا', level: 'A1', category: 'basic' },
];

// Grammar Rules
export const grammarRules: GrammarRule[] = [
  {
    id: 'g001',
    title: 'Nominal Sentence (الجملة الاسمية)',
    explanation: 'A nominal sentence in Arabic begins with a noun (المبتدأ - subject) followed by information about it (الخبر - predicate). No verb "to be" is needed in present tense.',
    examples: [
      { arabic: 'البيت كبير', transliteration: 'Al-baytu kabīr', english: 'The house is big' },
      { arabic: 'الطالب مجتهد', transliteration: 'Aṭ-ṭālibu mujtahid', english: 'The student is hardworking' },
      { arabic: 'الكتاب جديد', transliteration: 'Al-kitābu jadīd', english: 'The book is new' }
    ],
    level: 'A1'
  },
  {
    id: 'g002',
    title: 'Verbal Sentence (الجملة الفعلية)',
    explanation: 'A verbal sentence begins with a verb, followed by the subject (الفاعل), and often an object (المفعول به). Standard word order is VSO (Verb-Subject-Object).',
    examples: [
      { arabic: 'كتب الطالب الدرس', transliteration: 'Kataba ṭ-ṭālibu d-dars', english: 'The student wrote the lesson' },
      { arabic: 'ذهب محمد إلى المدرسة', transliteration: 'Dhahaba Muḥammad ilā l-madrasa', english: 'Muhammad went to school' },
      { arabic: 'أكلت فاطمة التفاحة', transliteration: 'Akalat Fāṭima t-tuffāḥa', english: 'Fatima ate the apple' }
    ],
    level: 'A1'
  },
  {
    id: 'g003',
    title: 'Definite Article (ال)',
    explanation: 'The definite article "ال" (al-) is attached to nouns to make them definite (like "the" in English). It changes pronunciation with sun and moon letters.',
    examples: [
      { arabic: 'الكتاب', transliteration: 'Al-kitāb', english: 'The book' },
      { arabic: 'الشمس', transliteration: 'Ash-shams', english: 'The sun (sun letter)' },
      { arabic: 'القمر', transliteration: 'Al-qamar', english: 'The moon (moon letter)' }
    ],
    level: 'A1'
  },
  {
    id: 'g004',
    title: 'Gender Agreement',
    explanation: 'Arabic nouns are either masculine or feminine. Adjectives must agree with the noun they describe in gender, number, and definiteness.',
    examples: [
      { arabic: 'طالب جديد', transliteration: 'Ṭālibun jadīd', english: 'A new student (masculine)' },
      { arabic: 'طالبة جديدة', transliteration: 'Ṭālibatun jadīda', english: 'A new student (feminine)' },
      { arabic: 'البيت الكبير', transliteration: 'Al-baytu l-kabīr', english: 'The big house' }
    ],
    level: 'A2'
  },
  {
    id: 'g005',
    title: 'Present Tense Conjugation',
    explanation: 'Arabic verbs conjugate based on person, number, and gender. The present tense is formed by adding prefixes and sometimes suffixes to the verb root.',
    examples: [
      { arabic: 'أكتب', transliteration: 'Aktubu', english: 'I write' },
      { arabic: 'تكتب', transliteration: 'Taktubu', english: 'You (m) write' },
      { arabic: 'يكتب', transliteration: 'Yaktubu', english: 'He writes' },
      { arabic: 'تكتب', transliteration: 'Taktubu', english: 'She writes' }
    ],
    level: 'B1'
  }
];

// Level A1 Lessons
export const arabicLessons: ArabicLesson[] = [
  {
    id: 'lesson-a1-1',
    level: 'A1',
    title: 'Arabic Alphabet - Part 1 (Letters أ to ح)',
    description: 'Learn the first 7 letters of the Arabic alphabet, their pronunciation, and how to write them',
    order: 1,
    topics: ['Alphabet', 'Pronunciation', 'Writing'],
    vocabulary: [],
    grammarRules: [],
    exercises: [
      {
        id: 'ex001',
        type: 'multiple-choice',
        question: 'Which letter makes the "b" sound?',
        options: ['أ', 'ب', 'ت', 'ث'],
        correctAnswer: 'ب',
        explanation: 'The letter ب (Baa) makes the "b" sound, similar to "b" in "book".',
        difficulty: 'easy'
      },
      {
        id: 'ex002',
        type: 'multiple-choice',
        question: 'What is the name of this letter: ح',
        options: ['Haa', 'Khaa', 'Jeem', 'Thaa'],
        correctAnswer: 'Haa',
        explanation: 'The letter ح is called "Haa" (emphatic h sound from the throat).',
        difficulty: 'easy'
      }
    ],
    minimumScore: 70
  },
  {
    id: 'lesson-a1-2',
    level: 'A1',
    title: 'Arabic Alphabet - Part 2 (Letters خ to ص)',
    description: 'Continue learning Arabic letters and practice connecting them',
    order: 2,
    topics: ['Alphabet', 'Letter Forms', 'Connection'],
    vocabulary: [],
    grammarRules: [],
    exercises: [
      {
        id: 'ex003',
        type: 'multiple-choice',
        question: 'Which letter sounds like "sh"?',
        options: ['س', 'ش', 'ص', 'ض'],
        correctAnswer: 'ش',
        explanation: 'The letter ش (Sheen) makes the "sh" sound.',
        difficulty: 'easy'
      }
    ],
    minimumScore: 70
  },
  {
    id: 'lesson-a1-3',
    level: 'A1',
    title: 'Greetings and Basic Phrases',
    description: 'Learn essential greetings and polite expressions',
    order: 3,
    topics: ['Greetings', 'Courtesy', 'Daily Expressions'],
    vocabulary: a1Vocabulary.filter(v => v.category === 'greetings' || v.category === 'basic'),
    grammarRules: [],
    exercises: [
      {
        id: 'ex004',
        type: 'multiple-choice',
        question: 'How do you say "Good morning" in Arabic?',
        options: ['مساء الخير', 'صباح الخير', 'مرحبا', 'شكرا'],
        correctAnswer: 'صباح الخير',
        explanation: 'صباح الخير (Ṣabāḥ al-khayr) means "Good morning".',
        difficulty: 'easy'
      },
      {
        id: 'ex005',
        type: 'translation',
        question: 'Translate to Arabic: "Thank you"',
        correctAnswer: 'شكرا',
        explanation: 'شكرا (Shukran) means "Thank you". You can also say شكرا جزيلا (Shukran jazīlan) for "Thank you very much".',
        difficulty: 'easy'
      }
    ],
    minimumScore: 70
  },
  {
    id: 'lesson-a1-4',
    level: 'A1',
    title: 'Family Vocabulary',
    description: 'Learn words for family members and how to talk about your family',
    order: 4,
    topics: ['Family', 'Relationships', 'Possessive'],
    vocabulary: a1Vocabulary.filter(v => v.category === 'family'),
    grammarRules: [],
    exercises: [
      {
        id: 'ex006',
        type: 'fill-blank',
        question: 'My father is a doctor. أبي _____',
        correctAnswer: 'طبيب',
        explanation: 'طبيب (ṭabīb) means doctor.',
        difficulty: 'medium'
      }
    ],
    minimumScore: 70
  },
  {
    id: 'lesson-a1-5',
    level: 'A1',
    title: 'Numbers 1-10',
    description: 'Learn Arabic numbers and how to count',
    order: 5,
    topics: ['Numbers', 'Counting', 'Quantities'],
    vocabulary: a1Vocabulary.filter(v => v.category === 'numbers'),
    grammarRules: [],
    exercises: [
      {
        id: 'ex007',
        type: 'multiple-choice',
        question: 'What is the Arabic word for "three"?',
        options: ['واحد', 'اثنان', 'ثلاثة', 'أربعة'],
        correctAnswer: 'ثلاثة',
        explanation: 'ثلاثة (thalātha) means "three".',
        difficulty: 'easy'
      }
    ],
    minimumScore: 70
  },
  {
    id: 'lesson-a1-6',
    level: 'A1',
    title: 'Nominal Sentences',
    description: 'Learn how to form simple sentences without verbs',
    order: 6,
    topics: ['Grammar', 'Sentence Structure', 'Descriptions'],
    vocabulary: [],
    grammarRules: [grammarRules[0]],
    exercises: [
      {
        id: 'ex008',
        type: 'sentence-building',
        question: 'Form a sentence: "The house is big"',
        correctAnswer: 'البيت كبير',
        explanation: 'In Arabic, we don\'t need "is" - just subject + adjective: البيت (the house) + كبير (big).',
        difficulty: 'medium'
      }
    ],
    minimumScore: 70
  }
];
