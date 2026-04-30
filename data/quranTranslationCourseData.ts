import { courses } from './courses';
import {
  CourseModuleLesson,
  CourseModuleLessonMetric,
  CourseModuleQuizQuestion,
  CourseModuleSection,
  DedicatedCourseModule
} from '../types/dedicated-course.types';

const courseMetadata = courses.find((course) => course.id === 'quran-translation');

if (!courseMetadata) {
  throw new Error('quran-translation metadata is missing from data/courses.ts');
}

const question = (
  id: string,
  prompt: string,
  options: string[],
  correctOptionId: string,
  explanation: string
): CourseModuleQuizQuestion => ({
  id,
  question: prompt,
  options: options.map((option, index) => ({ id: `${id}-option-${index + 1}`, text: option })),
  correctOptionId,
  explanation
});

const lesson = (input: CourseModuleLesson) => input;

const sections: CourseModuleSection[] = [
  {
    id: 'qt-foundations',
    title: 'Foundations of Quran Understanding',
    description: 'Build the study tools, vocabulary habits, and contextual awareness needed before diving into Tafsir.',
    icon: '🧭',
    lessons: [
      lesson({
        id: 'qt-1',
        sectionId: 'qt-foundations',
        order: 1,
        title: 'Why Translation and Tafsir Matter',
        description: 'Learn the difference between literal translation and deeper Tafsir, and why both are needed for balanced Quran study.',
        estimatedMinutes: 20,
        objectives: [
          'Differentiate translation from Tafsir',
          'Recognize the limits of isolated word meanings',
          'Adopt respectful habits for studying Allah’s words'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Translation opens the door, Tafsir guides the journey',
            content: 'A translation gives a workable meaning in your own language, while Tafsir explains context, relationships between verses, key Arabic terms, and how scholars understood the passage.'
          },
          {
            type: 'list',
            title: 'Three study lenses to keep together',
            items: [
              'Meaning: what the verse is saying in plain language',
              'Context: when, why, and to whom it was first addressed',
              'Application: what change it asks from the reader today'
            ]
          },
          {
            type: 'reflection',
            title: 'Journal Prompt',
            content: 'Write one reason you want to understand the Quran beyond recitation alone, and one study habit you need to improve.'
          }
        ],
        keyPoints: [
          'Translation and Tafsir are partners, not competitors.',
          'Context protects the student from shallow conclusions.',
          'Quran study should lead to humility and action.'
        ],
        materials: ['Starter Tafsir guide', 'Study journal page', 'Lesson summary PDF'],
        staffNote: 'Led by the Quran Understanding Faculty to establish a responsible, reflective study mindset.',
        quiz: {
          title: 'Foundation Check-In',
          description: 'Confirm the core distinction between translation and Tafsir.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-1-q1',
              'What does Tafsir add beyond a plain translation?',
              ['Context, explanation, and scholarly interpretation', 'Only Arabic grammar rules', 'Only pronunciation guidance'],
              'qt-1-q1-option-1',
              'Tafsir explains how scholars understood the verse, its context, and what deeper themes are present.'
            ),
            question(
              'qt-1-q2',
              'A balanced Quran study method includes meaning, context, and what else?',
              ['Application', 'Memorization only', 'Debate'],
              'qt-1-q2-option-1',
              'The student should ask how the verse changes belief, worship, and behavior.'
            )
          ]
        }
      }),
      lesson({
        id: 'qt-2',
        sectionId: 'qt-foundations',
        order: 2,
        title: 'Word-by-Word Study Tools',
        description: 'Practice a practical method for extracting recurring roots, themes, and word meanings without getting lost in technical overload.',
        estimatedMinutes: 22,
        objectives: [
          'Use a root-word notebook effectively',
          'Identify recurring Quranic themes in translation',
          'Know when to consult a teacher or Tafsir source'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Keep your tools simple',
            content: 'Beginners do not need dozens of references. A reliable translation, one Tafsir source, a notebook for roots and themes, and a teacher-guided correction habit are enough to start well.'
          },
          {
            type: 'list',
            title: 'A weekly word-study workflow',
            items: [
              'Choose 5 important words from your lesson verses',
              'Write the translation and the larger theme attached to each word',
              'Mark whether the word affects belief, worship, or character',
              'Review the same words at the end of the week in dua or reflection'
            ]
          },
          {
            type: 'callout',
            title: 'Guardrail',
            content: 'A strong vocabulary habit helps, but it does not replace scholarly explanation. If a verse carries legal or theological complexity, always return to trusted Tafsir.'
          }
        ],
        keyPoints: [
          'Consistency beats complexity in word study.',
          'Vocabulary should serve understanding, not ego.',
          'Trusted Tafsir sources remain essential.'
        ],
        materials: ['Vocabulary tracker', 'Theme map worksheet', 'Reference-source checklist'],
        staffNote: 'Supported by the Arabic Vocabulary Mentor for root analysis and recurring word patterns.',
        quiz: {
          title: 'Word Study Quiz',
          description: 'Check your grasp of a sustainable word-by-word method.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-2-q1',
              'Which study setup is most appropriate for a beginner?',
              ['A reliable translation, one Tafsir, and a vocabulary notebook', 'Ten different translations and no teacher', 'Only memorizing root letters'],
              'qt-2-q1-option-1',
              'The course encourages a focused, manageable set of tools used consistently.'
            ),
            question(
              'qt-2-q2',
              'Why is teacher guidance still necessary during vocabulary study?',
              ['Because words can carry layered meanings in context', 'Because translation is never useful', 'Because students cannot read notes'],
              'qt-2-q2-option-1',
              'Context and jurisprudential or theological implications require guided interpretation.'
            )
          ]
        }
      }),
      lesson({
        id: 'qt-3',
        sectionId: 'qt-foundations',
        order: 3,
        title: 'Context of Revelation and Audience',
        description: 'Study why verses were revealed, how Makki and Madani settings shape tone, and why audience matters in Tafsir.',
        estimatedMinutes: 24,
        objectives: [
          'Understand the value of Asbab al-Nuzul',
          'Distinguish broad Makki and Madani patterns',
          'Avoid reading verses without audience awareness'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Context protects meaning',
            content: 'Some verses were revealed in response to a question, crisis, treaty, or moral failure. Knowing that context clarifies tone, emphasis, and how scholars derived lessons.'
          },
          {
            type: 'case-study',
            title: 'Makki and Madani emphasis',
            content: 'Makki passages often intensify belief, resurrection, and accountability. Madani passages often expand law, community guidance, social order, and public ethics.'
          },
          {
            type: 'list',
            title: 'Questions to ask before interpreting a verse',
            items: [
              'What is the surrounding passage talking about?',
              'Was the audience new to Islam or already practicing in a Muslim community?',
              'Did scholars mention a specific reason for revelation?'
            ]
          }
        ],
        keyPoints: [
          'Reasons of revelation illuminate tone and scope.',
          'Makki and Madani patterns help beginners see shifts in emphasis.',
          'Audience awareness prevents careless interpretation.'
        ],
        materials: ['Makki vs Madani chart', 'Context question card', 'Asbab al-Nuzul reading notes'],
        staffNote: 'The Reflection Facilitator uses case studies so students can connect verses to real audience needs and lived responses.',
        quiz: {
          title: 'Context and Audience Quiz',
          description: 'Check whether you can apply contextual questions before reading a verse.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-3-q1',
              'Why do scholars study reasons of revelation?',
              ['To understand when and why a passage addressed a situation', 'To replace the Quran text', 'To avoid translation entirely'],
              'qt-3-q1-option-1',
              'Asbab al-Nuzul helps clarify emphasis, audience, and circumstance.'
            ),
            question(
              'qt-3-q2',
              'What is generally more common in many Makki passages?',
              ['Themes of belief and accountability', 'Detailed inheritance laws only', 'Community tax records'],
              'qt-3-q2-option-1',
              'Makki passages often intensify matters of belief, resurrection, and moral awakening.'
            )
          ]
        }
      })
    ]
  },
  {
    id: 'qt-fatiha',
    title: 'Surah Al-Fatihah Deep Dive',
    description: 'Move from foundation tools into a full guided study of the Quran’s opening Surah and its role in worship and identity.',
    icon: '🌿',
    lessons: [
      lesson({
        id: 'qt-4',
        sectionId: 'qt-fatiha',
        order: 4,
        title: 'Praise, Lordship, and Mercy in Al-Fatihah',
        description: 'Study the opening names and attributes that shape a Muslim’s entire relationship with Allah.',
        estimatedMinutes: 20,
        objectives: [
          'Explain Alhamdu lillah as more than a phrase of thanks',
          'Understand رب العالمين as Lordship over all creation',
          'Connect الرحمن الرحيم to hope and dependence'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Opening with praise',
            content: 'The Surah begins by teaching the servant who Allah is before asking for guidance. Praise comes before request, anchoring dua in recognition and gratitude.'
          },
          {
            type: 'callout',
            title: 'Arabic focus',
            arabicText: 'ٱلْحَمْدُ لِلَّهِ رَبِّ ٱلْعَٰلَمِينَ',
            transliteration: 'Al-hamdu lillahi rabbil alamin',
            content: 'This phrase combines praise, ownership, and nurturing care. رب is not only master, but the One who sustains, grows, and guides.'
          },
          {
            type: 'reflection',
            title: 'Daily application',
            content: 'Before asking Allah for help in your day, begin by naming one sign of His mercy you are already living under.'
          }
        ],
        keyPoints: [
          'Praise forms the emotional foundation of worship.',
          'Lordship includes care, order, and guidance.',
          'Mercy should produce hope, not laziness.'
        ],
        materials: ['Al-Fatihah study card', 'Mercy reflection journal', 'Arabic phrase breakdown'],
        staffNote: 'The lead Tafsir instructor connects the opening of Al-Fatihah to how students begin Salah and dua.',
        quiz: {
          title: 'Al-Fatihah Opening Quiz',
          description: 'Check your understanding of praise, lordship, and mercy.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-4-q1',
              'Why does Al-Fatihah begin with praise before asking for guidance?',
              ['To anchor the heart in recognition of Allah before request', 'To delay the meaning of the Surah', 'Because guidance is less important'],
              'qt-4-q1-option-1',
              'The sequence teaches adab: know and praise Allah, then ask Him sincerely.'
            ),
            question(
              'qt-4-q2',
              'What does رب imply in addition to authority?',
              ['Nurturing, sustaining, and guiding care', 'Only punishment', 'Only creation without guidance'],
              'qt-4-q2-option-1',
              'The term points to Allah’s continuous care and governance over creation.'
            )
          ]
        }
      }),
      lesson({
        id: 'qt-5',
        sectionId: 'qt-fatiha',
        order: 5,
        title: 'Worship, Reliance, and the Straight Path',
        description: 'Study the heart of Al-Fatihah: devotion, dependence, and the constant request for guidance.',
        estimatedMinutes: 21,
        objectives: [
          'Explain the link between worship and seeking help',
          'Understand why guidance is requested repeatedly',
          'Recognize the straight path as a lived commitment'
        ],
        blocks: [
          {
            type: 'callout',
            title: 'Core covenant verse',
            arabicText: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
            transliteration: 'Iyyaka nabudu wa iyyaka nastaeen',
            content: 'The servant declares exclusive worship and exclusive reliance. Worship without dependence becomes pride; dependence without worship becomes empty wishfulness.'
          },
          {
            type: 'list',
            title: 'What the straight path includes',
            items: [
              'Correct belief',
              'Sincere worship',
              'Ethical conduct with people',
              'Steadiness during trials and success'
            ]
          },
          {
            type: 'reflection',
            title: 'Prayer audit',
            content: 'After your next Salah, ask: in what area of life am I asking for guidance but resisting obedience?' 
          }
        ],
        keyPoints: [
          'Worship and reliance must stay together.',
          'Guidance is not one event; it is an ongoing need.',
          'The straight path touches belief, action, and character.'
        ],
        materials: ['Straight path worksheet', 'Salah reflection card', 'Guidance checklist'],
        staffNote: 'The Reflection Facilitator helps students connect Al-Fatihah to their repeated daily requests inside Salah.',
        quiz: {
          title: 'Guidance and Reliance Quiz',
          description: 'Check your understanding of worship, reliance, and istiqamah.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-5-q1',
              'What is the balance taught by إياك نعبد وإياك نستعين?',
              ['Exclusive worship and exclusive dependence on Allah', 'Worship only in Ramadan', 'Asking people for all guidance'],
              'qt-5-q1-option-1',
              'The verse keeps action and dependence connected under Tawhid.'
            ),
            question(
              'qt-5-q2',
              'Why do believers ask for guidance repeatedly?',
              ['Because they need constancy and correction every day', 'Because previous guidance never mattered', 'Only because it sounds beautiful'],
              'qt-5-q2-option-1',
              'The request is ongoing because the heart, actions, and choices need daily steering.'
            )
          ]
        }
      }),
      lesson({
        id: 'qt-6',
        sectionId: 'qt-fatiha',
        order: 6,
        title: 'Al-Fatihah in Daily Worship and Life',
        description: 'Bring the meanings of Al-Fatihah into Salah, home routines, family teaching, and spiritual self-correction.',
        estimatedMinutes: 18,
        objectives: [
          'Connect Al-Fatihah to the emotional state of Salah',
          'Teach one part of the Surah to another learner',
          'Design a simple weekly reflection habit'
        ],
        blocks: [
          {
            type: 'text',
            title: 'The Surah you repeat most',
            content: 'Because Al-Fatihah is repeated in every rakah, it can either become routine sound or a living conversation. Students must learn to pause, understand, and mean what they recite.'
          },
          {
            type: 'list',
            title: 'A weekly Al-Fatihah habit',
            items: [
              'Choose one verse to focus on each day',
              'Write one action connected to that verse',
              'Explain that verse to a family member or peer',
              'Review how the verse appeared in your week'
            ]
          },
          {
            type: 'reflection',
            title: 'Teaching test',
            content: 'If you can explain Al-Fatihah simply to a child or parent, your own understanding has deepened.'
          }
        ],
        keyPoints: [
          'Repetition should deepen meaning, not drain it.',
          'Teaching others strengthens understanding.',
          'Al-Fatihah can become a weekly self-correction map.'
        ],
        materials: ['Family teaching prompt', 'Weekly reflection sheet', 'Salah focus card'],
        staffNote: 'The course staff encourage students to turn daily recitation into a structured personal and family practice.',
        quiz: {
          title: 'Living with Al-Fatihah Quiz',
          description: 'Check whether you can apply Al-Fatihah beyond memorization.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-6-q1',
              'What is a strong sign that Al-Fatihah is becoming meaningful in Salah?',
              ['You connect its verses to your real need for guidance and worship', 'You read it faster each day', 'You stop reflecting on it entirely'],
              'qt-6-q1-option-1',
              'Meaningful recitation shapes awareness, humility, and intention.'
            ),
            question(
              'qt-6-q2',
              'Why is teaching a verse to another person helpful?',
              ['It reveals whether you really understand it', 'It makes the verse shorter', 'It removes the need for review'],
              'qt-6-q2-option-1',
              'Explaining meaning clearly forces better understanding and recall.'
            )
          ]
        }
      })
    ]
  },
  {
    id: 'qt-lab',
    title: 'Short Surah Tafsir Lab',
    description: 'Apply your study method to compact Surahs and high-impact verses with clear themes and practical reflection.',
    icon: '🔍',
    lessons: [
      lesson({
        id: 'qt-7',
        sectionId: 'qt-lab',
        order: 7,
        title: 'Surah Al-Ikhlas: Pure Tawhid',
        description: 'Explore the concise declaration of Allah’s oneness and how it protects belief from subtle corruption.',
        estimatedMinutes: 19,
        objectives: [
          'Summarize the Tawhid message of Surah Al-Ikhlas',
          'Recognize why short Surahs can carry major theology',
          'Link belief in Allah’s uniqueness to worship sincerity'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Short, clear, decisive',
            content: 'Surah Al-Ikhlas is brief but weighty. It protects the believer from imagining Allah through created categories, relationships, or limitations.'
          },
          {
            type: 'list',
            title: 'Themes to underline',
            items: [
              'Allah is One in His essence and right to be worshipped',
              'He is eternal and independent',
              'He does not resemble creation in lineage or need',
              'Pure belief should purify intention'
            ]
          }
        ],
        keyPoints: [
          'Tawhid should remain simple, clear, and free from projection.',
          'Short Surahs can anchor major doctrines.',
          'Theology must shape sincerity.'
        ],
        materials: ['Tawhid concept sheet', 'Surah Al-Ikhlas reflection notes'],
        quiz: {
          title: 'Surah Al-Ikhlas Quiz',
          description: 'Confirm the central belief themes of this Surah.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-7-q1',
              'What does Surah Al-Ikhlas protect the believer from?',
              ['Imagining Allah through created limitations', 'Learning short Surahs', 'Reciting in prayer'],
              'qt-7-q1-option-1',
              'The Surah removes false ideas about dependence, lineage, and likeness.'
            ),
            question(
              'qt-7-q2',
              'What is one practical effect of studying this Surah?',
              ['Purifying intention in worship', 'Ignoring creed entirely', 'Reducing prayer'],
              'qt-7-q2-option-1',
              'Clear belief should make worship more sincere and free from showing off.'
            )
          ]
        }
      }),
      lesson({
        id: 'qt-8',
        sectionId: 'qt-lab',
        order: 8,
        title: 'Surah Al-Falaq: Protection from External Harm',
        description: 'Study how the Quran teaches the believer to seek protection from visible and hidden threats without panic.',
        estimatedMinutes: 18,
        objectives: [
          'Identify the categories of harm mentioned in Surah Al-Falaq',
          'Understand why seeking refuge is an act of worship',
          'Balance spiritual protection with responsible action'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Refuge as worship',
            content: 'The Surah trains the servant to turn to Allah against harm without superstition. Seeking refuge is not fear-driven weakness; it is worship grounded in trust.'
          },
          {
            type: 'list',
            title: 'Protection themes in this Surah',
            items: [
              'General created harms',
              'Fear and darkness that confuse judgment',
              'Malicious human action',
              'Envy that crosses into harm'
            ]
          }
        ],
        keyPoints: [
          'Seeking refuge is a form of Tawhid and dependence.',
          'The Quran names spiritual and social harms honestly.',
          'Trust in Allah works with practical caution, not against it.'
        ],
        materials: ['Protection remembrance card', 'Family safety reflection sheet'],
        quiz: {
          title: 'Surah Al-Falaq Quiz',
          description: 'Check your understanding of refuge and protection.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-8-q1',
              'Why is seeking refuge in Allah described as worship?',
              ['Because it expresses dependence on Him alone', 'Because it replaces all action', 'Because it is only cultural'],
              'qt-8-q1-option-1',
              'Seeking refuge is an act of faith and reliance directed to Allah.'
            ),
            question(
              'qt-8-q2',
              'What balance does the Surah teach?',
              ['Spiritual refuge and practical responsibility together', 'Ignore danger if you recite enough', 'Only worry about visible threats'],
              'qt-8-q2-option-1',
              'The believer seeks Allah’s protection while remaining responsible and alert.'
            )
          ]
        }
      }),
      lesson({
        id: 'qt-9',
        sectionId: 'qt-lab',
        order: 9,
        title: 'Surah An-Nas: Protection from Inner Whispers',
        description: 'Explore how the Quran names spiritual vulnerability, internal whispering, and the need for constant remembrance.',
        estimatedMinutes: 18,
        objectives: [
          'Recognize the difference between outer and inner threat',
          'Understand the role of dhikr in resisting whispering',
          'Identify how weak thoughts can become harmful choices'
        ],
        blocks: [
          {
            type: 'text',
            title: 'The heart needs protection too',
            content: 'Not every danger is external. Some begin as whispers, doubts, temptations, and recurring suggestions that weaken resolve or distort perspective.'
          },
          {
            type: 'list',
            title: 'A response plan for whispering',
            items: [
              'Recognize the thought without normalizing it',
              'Seek refuge immediately',
              'Replace the whisper with dhikr or beneficial action',
              'Get counsel if the pattern becomes persistent or confusing'
            ]
          }
        ],
        keyPoints: [
          'Spiritual resilience requires active remembrance.',
          'Inner whispers often grow when left unchallenged.',
          'Seeking help early is part of wisdom.'
        ],
        materials: ['Dhikr action plan', 'Reflection prompt card'],
        quiz: {
          title: 'Surah An-Nas Quiz',
          description: 'Check your understanding of inner protection and spiritual habits.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-9-q1',
              'What kind of danger is highlighted in Surah An-Nas?',
              ['Inner whispers and suggestion', 'Only weather events', 'Only public law'],
              'qt-9-q1-option-1',
              'The Surah emphasizes inward vulnerability and recurring whispering.'
            ),
            question(
              'qt-9-q2',
              'What is a healthy first response to harmful whispering?',
              ['Seek refuge in Allah and replace the thought with dhikr or action', 'Accept it as identity', 'Ignore Allah and isolate completely'],
              'qt-9-q2-option-1',
              'The Surah trains believers to interrupt whispers with refuge and remembrance.'
            )
          ]
        }
      }),
      lesson({
        id: 'qt-10',
        sectionId: 'qt-lab',
        order: 10,
        title: 'Ayat al-Kursi: Power, Knowledge, and Security',
        description: 'Conclude the course with one of the Quran’s most powerful verses and a structured reflection on Allah’s knowledge, authority, and protection.',
        estimatedMinutes: 24,
        objectives: [
          'Identify the major themes in Ayat al-Kursi',
          'Connect divine knowledge and authority to trust',
          'Summarize your own method for future Tafsir study'
        ],
        blocks: [
          {
            type: 'text',
            title: 'A verse of awe and security',
            content: 'Ayat al-Kursi combines majesty, knowledge, life, and protection. The student leaves this course able to notice how theology shapes emotional security.'
          },
          {
            type: 'list',
            title: 'Themes to review in your final notes',
            items: [
              'Allah’s perfect life and sustaining power',
              'His unrestricted knowledge of what is before and after',
              'The limits of created intercession',
              'Security rooted in His preservation, not ours'
            ]
          },
          {
            type: 'reflection',
            title: 'Final course reflection',
            content: 'Write a short paragraph explaining how your Quran study method has changed between lesson 1 and now.'
          }
        ],
        keyPoints: [
          'Theology should calm the heart and strengthen obedience.',
          'Ayat al-Kursi connects knowledge, power, and protection.',
          'Good Tafsir habits can now continue independently with guidance.'
        ],
        materials: ['Final reflection worksheet', 'Ayat al-Kursi theme map', 'Next-study plan template'],
        quiz: {
          title: 'Final Tafsir Lab Quiz',
          description: 'Complete the course by checking your understanding of the final themes and study method.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'qt-10-q1',
              'What should Ayat al-Kursi strengthen in the student?',
              ['Trust in Allah’s knowledge, authority, and protection', 'Fear of studying longer verses', 'Neglect of reflection'],
              'qt-10-q1-option-1',
              'The verse teaches awe, confidence, and humble dependence on Allah.'
            ),
            question(
              'qt-10-q2',
              'What is the best final habit to carry forward after this course?',
              ['A structured study routine using translation, Tafsir, and reflection together', 'Reading translations without context', 'Stopping all note-taking'],
              'qt-10-q2-option-1',
              'The course was built around a repeatable method: meaning, context, and application.'
            )
          ]
        }
      })
    ]
  }
];

const lessonMetrics: CourseModuleLessonMetric[] = sections.flatMap((section) => section.lessons).map((item, index) => ({
  lessonId: item.id,
  studentCount: 22 + (index % 4) * 5,
  completionRate: 57 + ((index * 7) % 28),
  averageScore: 73 + ((index * 3) % 14),
  updatedLabel: `Week ${index + 1}`
}));

const averageCompletion = Math.round(lessonMetrics.reduce((sum, item) => sum + item.completionRate, 0) / lessonMetrics.length);
const averageScore = Math.round(lessonMetrics.reduce((sum, item) => sum + item.averageScore, 0) / lessonMetrics.length);

export const quranTranslationCourseData: DedicatedCourseModule = {
  metadata: courseMetadata,
  publicRoute: '/quran-translation',
  studentRoute: '/student/quran-translation-player',
  adminRoute: '/admin/courses/quran-translation',
  heroBadge: 'Guided Tafsir Track',
  heroHeadline: 'Understand the Quran with context, vocabulary, and guided reflection.',
  heroSummary: 'This dedicated translation and Tafsir experience takes students from study foundations to guided Surah analysis, using real reflection tools, structured staff support, and short assessment checkpoints in every section.',
  estimatedHours: 18,
  sections,
  features: [
    { icon: '📖', title: 'Guided Verse Meaning', description: 'Students move beyond surface translation into structured understanding.' },
    { icon: '🧠', title: 'Contextual Tafsir', description: 'Every section teaches when and why context matters for accurate interpretation.' },
    { icon: '📝', title: 'Reflection Journals', description: 'Each lesson ends with personal application prompts and guided note-taking.' },
    { icon: '🧩', title: 'Word Study Practice', description: 'Vocabulary tracking helps students connect repeated themes across verses.' },
    { icon: '👥', title: 'Faculty Support Roles', description: 'Dedicated staff roles cover Tafsir, vocabulary, and reflection facilitation.' },
    { icon: '✅', title: 'Lesson-by-Lesson Quizzes', description: 'Short quizzes confirm understanding before the next section opens.' }
  ],
  benefits: [
    { icon: '🌱', title: 'Faith with Understanding', description: 'Students link Quran meaning to worship, decisions, and spiritual maturity.', tone: 'emerald' },
    { icon: '🧭', title: 'Reliable Study Method', description: 'The course gives a repeatable method for meaning, context, and application.', tone: 'blue' },
    { icon: '🛡️', title: 'Protection from Shallow Reading', description: 'Context and faculty guidance reduce oversimplification and confusion.', tone: 'amber' },
    { icon: '🏡', title: 'Family-Friendly Reflection', description: 'Materials are designed to be discussed with parents, spouses, or study circles.', tone: 'violet' }
  ],
  staff: [
    {
      id: 'qt-staff-1',
      name: 'Quran Understanding Faculty',
      role: 'Lead Tafsir Instruction',
      bio: 'Guides students through trusted commentary themes, structured verse reflection, and the big-picture flow of each Surah section.',
      qualification: courseMetadata.teacherInfo.qualification,
      experience: courseMetadata.teacherInfo.experience,
      languages: courseMetadata.teacherInfo.languages,
      focus: 'Classical Tafsir structure, thematic verse study, and reflective learning habits.'
    },
    {
      id: 'qt-staff-2',
      name: 'Arabic Vocabulary Mentor',
      role: 'Word Study and Root Analysis Support',
      bio: 'Helps students identify recurring Quran vocabulary, root patterns, and key terms without overwhelming them with advanced grammar.',
      qualification: 'Arabic language support for beginner-to-intermediate Quran students',
      experience: 'Focused lesson guidance during translation and vocabulary units',
      languages: ['Arabic', 'English', 'Urdu'],
      focus: 'Vocabulary notebooks, recurring word recognition, and guided root-word review.'
    },
    {
      id: 'qt-staff-3',
      name: 'Reflection Circle Facilitator',
      role: 'Application and Study Habit Coaching',
      bio: 'Keeps students connecting meaning to worship, family discussion, and weekly spiritual action plans.',
      qualification: 'Student mentoring and reflection-based learning support',
      experience: 'Weekly reflection coaching and discussion moderation',
      languages: ['English', 'Urdu', 'Arabic'],
      focus: 'Turning Tafsir into lived practice instead of passive information.'
    }
  ],
  resourceHighlights: [
    { title: 'Tafsir Study Journal', description: 'A guided journal for meaning, context, application, and weekly reflection summaries.', type: 'Workbook' },
    { title: 'Vocabulary Tracker Pack', description: 'Root-word and theme sheets to reinforce recurring Quran vocabulary.', type: 'Reference' },
    { title: 'Family Reflection Prompts', description: 'Discussion prompts that help students revisit the lesson with parents or peers.', type: 'Discussion Guide' }
  ],
  milestoneBadges: [
    { threshold: 3, name: 'Context Builder', description: 'Completed the foundational study tools section.', icon: '🧭' },
    { threshold: 6, name: 'Fatihah Interpreter', description: 'Completed the guided Al-Fatihah deep-dive.', icon: '🌿' },
    { threshold: 10, name: 'Tafsir Explorer', description: 'Completed the full translation and Tafsir learning path.', icon: '📖' }
  ],
  adminStats: {
    totalEnrollments: 94,
    activeStudents: 58,
    completionRate: averageCompletion,
    averageScore
  },
  lessonMetrics,
  enrollmentCta: 'Enroll in Quran Translation'
};