import { courses } from './courses';
import {
  CourseModuleLesson,
  CourseModuleLessonMetric,
  CourseModuleQuizQuestion,
  CourseModuleSection,
  DedicatedCourseModule
} from '../types/dedicated-course.types';
import { applyCourseModuleCompleteness } from '../utils/courseModuleCompleteness';

const courseMetadata = courses.find((course) => course.id === 'islamic-studies');

if (!courseMetadata) {
  throw new Error('islamic-studies metadata is missing from data/courses.ts');
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
    id: 'is-faith',
    title: 'Foundations of Faith',
    description: 'Anchor the course in Aqeedah, sincerity, and the sources that shape all Islamic understanding.',
    icon: '🕊️',
    lessons: [
      lesson({
        id: 'is-1',
        sectionId: 'is-faith',
        order: 1,
        title: 'The Six Pillars of Iman',
        description: 'Study the framework of Islamic belief and why each pillar affects how a Muslim sees life, hardship, and hope.',
        estimatedMinutes: 18,
        objectives: [
          'Name and explain the six pillars of Iman',
          'Connect belief to daily behavior and resilience',
          'Recognize belief as the root of stable worship'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Belief is the unseen foundation',
            content: 'Aqeedah is not just a list to memorize. It is the lens through which a Muslim understands Allah, the unseen, accountability, and the meaning of obedience.'
          },
          {
            type: 'list',
            title: 'Why each pillar matters',
            items: [
              'Belief in Allah shapes worship and trust',
              'Belief in angels reminds the student of unseen responsibility',
              'Belief in books and messengers ties us to revelation and guidance',
              'Belief in the Last Day and decree shapes patience, urgency, and humility'
            ]
          },
          {
            type: 'reflection',
            title: 'Belief audit',
            content: 'Which pillar of Iman most strengthens you right now, and which one needs deeper study to affect your daily life?' 
          }
        ],
        keyPoints: [
          'Iman is meant to stabilize the heart and actions together.',
          'Islamic belief is practical, not abstract.',
          'Weakness in belief eventually affects worship and choices.'
        ],
        materials: ['Iman summary sheet', 'Belief reflection journal'],
        staffNote: 'The Islamic Foundations Faculty uses this lesson to make Aqeedah practical for family and student life.',
        quiz: {
          title: 'Iman Foundations Quiz',
          description: 'Check your understanding of the six pillars of belief.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-1-q1',
              'Why is Iman described as a foundation?',
              ['Because it shapes worship, choices, and resilience', 'Because it replaces the Quran', 'Because it only matters for scholars'],
              'is-1-q1-option-1',
              'Belief provides the inner structure that supports the rest of religious life.'
            ),
            question(
              'is-1-q2',
              'Which pillar especially reminds believers of accountability for actions?',
              ['Belief in the Last Day', 'Belief in food only', 'Belief in weather'],
              'is-1-q2-option-1',
              'The Last Day keeps the believer mindful of responsibility and return to Allah.'
            )
          ]
        }
      }),
      lesson({
        id: 'is-2',
        sectionId: 'is-faith',
        order: 2,
        title: 'Tawhid, Sincerity, and Intention',
        description: 'Learn how Tawhid protects worship from showing off, confusion, and half-hearted devotion.',
        estimatedMinutes: 19,
        objectives: [
          'Understand how Tawhid shapes sincerity',
          'Identify common intention mistakes in worship',
          'Practice renewing intention before visible acts'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Tawhid is not only theory',
            content: 'When a Muslim says Allah alone deserves worship, that belief must reach prayer, charity, service, speech, and hidden private obedience.'
          },
          {
            type: 'list',
            title: 'Signs intention needs repair',
            items: [
              'You care more about being seen than being accepted',
              'You delay good deeds unless others are watching',
              'You feel empty if praise does not follow the deed'
            ]
          },
          {
            type: 'callout',
            title: 'Practical habit',
            content: 'Before a visible act of worship, name privately who you are doing it for and what quality of the act you want Allah to accept.'
          }
        ],
        keyPoints: [
          'Tawhid should purify intention.',
          'Sincerity needs regular renewal.',
          'Hidden worship trains visible worship.'
        ],
        materials: ['Intention checklist', 'Hidden worship planner'],
        staffNote: 'The Seerah Mentor ties sincerity to the Prophetic model of serving without seeking attention.',
        quiz: {
          title: 'Sincerity Quiz',
          description: 'Check whether you can identify sincerity and intention problems clearly.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-2-q1',
              'What does Tawhid demand from intention?',
              ['That worship be directed to Allah alone', 'That worship be public only', 'That intention never be reviewed'],
              'is-2-q1-option-1',
              'Tawhid purifies who the worship is really for.'
            ),
            question(
              'is-2-q2',
              'Which is a sign of weakened sincerity?',
              ['Doing more only when people will notice', 'Making dua in private', 'Reviewing your intention before prayer'],
              'is-2-q2-option-1',
              'Public attention can distort intention if not corrected.'
            )
          ]
        }
      }),
      lesson({
        id: 'is-3',
        sectionId: 'is-faith',
        order: 3,
        title: 'Quran and Sunnah as Sources of Guidance',
        description: 'Learn how revelation guides belief and practice, and why Muslims need both the Quran and the Prophetic example together.',
        estimatedMinutes: 18,
        objectives: [
          'Recognize the Quran and Sunnah as complementary sources',
          'Understand why Islamic practice cannot be built on preference alone',
          'Build respect for qualified scholarship and transmission'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Guidance is transmitted, not invented',
            content: 'The Quran provides revelation and principles, while the Sunnah explains, demonstrates, and applies those principles. Separating the two leaves Islam distorted.'
          },
          {
            type: 'list',
            title: 'What the Sunnah clarifies',
            items: [
              'How worship is performed in detail',
              'How Quranic guidance looks in real life',
              'What moral and communal excellence looks like in action'
            ]
          }
        ],
        keyPoints: [
          'The Quran and Sunnah work together.',
          'Personal preference cannot replace transmitted guidance.',
          'Reliable scholarship protects understanding.'
        ],
        materials: ['Sources of Islam chart', 'Hadith reading notes'],
        quiz: {
          title: 'Sources of Guidance Quiz',
          description: 'Confirm the relationship between the Quran, Sunnah, and learned guidance.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-3-q1',
              'Why is the Sunnah necessary alongside the Quran?',
              ['It explains and demonstrates revealed guidance', 'It replaces the Quran', 'It is optional for practice'],
              'is-3-q1-option-1',
              'The Sunnah clarifies how Quranic teachings are lived and applied.'
            ),
            question(
              'is-3-q2',
              'What should guide practice when preference conflicts with revelation?',
              ['Revelation and reliable scholarship', 'Preference alone', 'Peer pressure'],
              'is-3-q2-option-1',
              'Islamic practice stays anchored to revealed guidance, not convenience.'
            )
          ]
        }
      })
    ]
  },
  {
    id: 'is-worship',
    title: 'Worship and Purification',
    description: 'Move from belief into daily ibadah, purification, and the fiqh essentials every Muslim should know well.',
    icon: '💧',
    lessons: [
      lesson({
        id: 'is-4',
        sectionId: 'is-worship',
        order: 4,
        title: 'Taharah: Cleanliness and Worship Readiness',
        description: 'Study physical and spiritual cleanliness, and how preparation affects the quality of worship.',
        estimatedMinutes: 20,
        objectives: [
          'Understand why purity matters in Islam',
          'Differentiate everyday cleanliness and ritual readiness',
          'Apply a consistent personal readiness checklist'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Purity is both practical and spiritual',
            content: 'Islam trains the believer to care for cleanliness because worship is approached with order, dignity, and conscious preparation.'
          },
          {
            type: 'list',
            title: 'A worship readiness checklist',
            items: [
              'Body and clothing are clean',
              'Place of prayer is suitable',
              'Wudhu or required purification is complete',
              'Heart is prepared with intention and presence'
            ]
          }
        ],
        keyPoints: [
          'Purity prepares the body and heart for worship.',
          'Taharah teaches dignity and discipline.',
          'Preparation affects concentration.'
        ],
        materials: ['Purification checklist', 'Prayer preparation card'],
        quiz: {
          title: 'Taharah Quiz',
          description: 'Confirm the role of preparation and cleanliness in worship.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-4-q1',
              'Why does Islam emphasize purification before worship?',
              ['Because preparation affects dignity, readiness, and obedience', 'Because worship is only physical', 'Because purity has no spiritual meaning'],
              'is-4-q1-option-1',
              'Taharah combines practical cleanliness with spiritual readiness.'
            ),
            question(
              'is-4-q2',
              'Which item belongs on a worship readiness checklist?',
              ['Clean clothing and a present intention', 'Only a loud voice', 'Only memorized phrases'],
              'is-4-q2-option-1',
              'Worship readiness includes physical and internal preparation together.'
            )
          ]
        }
      }),
      lesson({
        id: 'is-5',
        sectionId: 'is-worship',
        order: 5,
        title: 'Salah Essentials and Presence of Heart',
        description: 'Review the obligations, structure, and inner presence that transform prayer from routine into living worship.',
        estimatedMinutes: 22,
        objectives: [
          'Name key essentials of Salah',
          'Identify distractions that weaken khushu',
          'Build one practical habit for better presence in prayer'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Prayer has an outer form and an inner state',
            content: 'Correct motions and recitations matter, but Salah is strongest when they are joined with humility, focus, and awareness of standing before Allah.'
          },
          {
            type: 'list',
            title: 'Simple ways to improve khushu',
            items: [
              'Prepare before the prayer time rather than rushing into it',
              'Understand the words you recite regularly',
              'Remove avoidable distractions from the prayer space',
              'Pause briefly before takbir to gather intention'
            ]
          }
        ],
        keyPoints: [
          'The form of prayer protects the act.',
          'Presence of heart gives prayer its sweetness.',
          'Preparation before Salah often determines concentration during it.'
        ],
        materials: ['Salah focus planner', 'Khushu reminder card'],
        quiz: {
          title: 'Salah Essentials Quiz',
          description: 'Check your understanding of prayer structure and focus.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-5-q1',
              'What makes Salah strongest?',
              ['Correct form joined with presence of heart', 'Speed alone', 'Volume alone'],
              'is-5-q1-option-1',
              'Prayer is strongest when outward correctness and inward humility meet.'
            ),
            question(
              'is-5-q2',
              'Which habit best supports khushu?',
              ['Preparing early and reducing distractions', 'Checking messages during wudhu', 'Rushing into prayer'],
              'is-5-q2-option-1',
              'Preparation and reduced distraction make presence easier.'
            )
          ]
        }
      }),
      lesson({
        id: 'is-6',
        sectionId: 'is-worship',
        order: 6,
        title: 'Fasting, Zakah, and Social Responsibility',
        description: 'Study how worship disciplines the self while building care, justice, and solidarity with others.',
        estimatedMinutes: 20,
        objectives: [
          'Explain the moral training of fasting',
          'Understand why Zakah cleanses wealth and society',
          'Connect worship to responsibility for others'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Worship reforms the individual and the community',
            content: 'Fasting trains restraint and God-consciousness. Zakah trains gratitude, fairness, and detachment from greed. Both reshape how Muslims live with others.'
          },
          {
            type: 'list',
            title: 'What these obligations train',
            items: [
              'Patience and self-control',
              'Awareness of the vulnerable',
              'Gratitude for provision',
              'A habit of disciplined generosity'
            ]
          }
        ],
        keyPoints: [
          'Worship is deeply social as well as personal.',
          'Fasting and Zakah train the heart against selfishness.',
          'Islamic obligations cultivate justice and mercy.'
        ],
        materials: ['Ramadan reflection sheet', 'Generosity planning guide'],
        quiz: {
          title: 'Worship and Society Quiz',
          description: 'Confirm how fasting and Zakah shape both person and community.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-6-q1',
              'What does fasting primarily train in the believer?',
              ['Self-control and God-consciousness', 'Only public celebration', 'Financial accounting only'],
              'is-6-q1-option-1',
              'Fasting trains restraint, sincerity, and awareness of Allah.'
            ),
            question(
              'is-6-q2',
              'Why is Zakah socially important?',
              ['It supports justice, care, and circulation of wealth', 'It increases greed', 'It removes all personal responsibility'],
              'is-6-q2-option-1',
              'Zakah links gratitude to real care for others.'
            )
          ]
        }
      })
    ]
  },
  {
    id: 'is-seerah',
    title: 'Seerah and Character Formation',
    description: 'Study the Prophetic model in Makkah and Madinah and translate those lessons into personal character.',
    icon: '🌙',
    lessons: [
      lesson({
        id: 'is-7',
        sectionId: 'is-seerah',
        order: 7,
        title: 'Patience and Dawah in the Makkan Period',
        description: 'Learn how the early Prophetic mission built faith, endurance, and principled patience under pressure.',
        estimatedMinutes: 19,
        objectives: [
          'Summarize key Makkan lessons in patience and da’wah',
          'Understand endurance without compromising principles',
          'Apply Prophetic patience to modern pressure points'
        ],
        blocks: [
          {
            type: 'text',
            title: 'The Makkan school of endurance',
            content: 'The early years of Islam trained believers in clarity, restraint, resilience, and hope despite mockery, rejection, and hardship.'
          },
          {
            type: 'list',
            title: 'Makkan traits to imitate',
            items: [
              'Patience without surrendering truth',
              'Gentle firmness in da’wah',
              'Reliance on Allah during slow progress'
            ]
          }
        ],
        keyPoints: [
          'Patience is active steadiness, not passivity.',
          'Da’wah requires wisdom and emotional discipline.',
          'The Makkan period teaches strength before power.'
        ],
        materials: ['Seerah timeline card', 'Patience reflection notes'],
        quiz: {
          title: 'Makkan Seerah Quiz',
          description: 'Check your understanding of patience and da’wah in the early mission.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-7-q1',
              'What kind of patience is modeled in the Makkan period?',
              ['Active steadiness with principle', 'Silence without purpose', 'Avoiding all responsibility'],
              'is-7-q1-option-1',
              'Makkan patience held onto truth while enduring hardship wisely.'
            ),
            question(
              'is-7-q2',
              'What does the Makkan period especially build before political strength?',
              ['Faith, character, and endurance', 'Trade routes only', 'Public status'],
              'is-7-q2-option-1',
              'The early mission developed inner and communal strength first.'
            )
          ]
        }
      }),
      lesson({
        id: 'is-8',
        sectionId: 'is-seerah',
        order: 8,
        title: 'Madinah: Community, Justice, and Mercy',
        description: 'See how the Prophet ﷺ built a principled community with justice, compassion, and structured responsibility.',
        estimatedMinutes: 20,
        objectives: [
          'Identify key themes of the Madinan community',
          'Connect mercy and justice rather than separating them',
          'Recognize the role of leadership and shared responsibility'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Mercy is not softness without structure',
            content: 'The Madinan period shows that compassion and order belong together. Families, contracts, worship, conflict resolution, and public responsibility were all guided through revelation.'
          },
          {
            type: 'list',
            title: 'Madinan community lessons',
            items: [
              'Rights and duties must be taught together',
              'Justice protects the vulnerable',
              'Mercy should be disciplined, not chaotic',
              'Leadership requires service and trustworthiness'
            ]
          }
        ],
        keyPoints: [
          'Mercy and justice reinforce each other in Islam.',
          'Community needs principles, structure, and service.',
          'The Prophetic model remains relevant for institutions and families.'
        ],
        materials: ['Community values chart', 'Service leadership worksheet'],
        quiz: {
          title: 'Madinah Community Quiz',
          description: 'Check your understanding of justice, mercy, and responsibility in the Prophetic community.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-8-q1',
              'What does the Madinan model show about mercy?',
              ['Mercy works together with structure and justice', 'Mercy means no rules', 'Mercy replaces responsibility'],
              'is-8-q1-option-1',
              'The Prophetic model joined compassion with accountable order.'
            ),
            question(
              'is-8-q2',
              'What protects a community in the Madinan framework?',
              ['Shared rights, duties, and trustworthy leadership', 'Only slogans', 'Only private worship'],
              'is-8-q2-option-1',
              'Islamic community health depends on principle, service, and accountability.'
            )
          ]
        }
      }),
      lesson({
        id: 'is-9',
        sectionId: 'is-seerah',
        order: 9,
        title: 'Daily Akhlaq and Adab',
        description: 'Turn faith and Seerah into concrete habits of speech, respect, honesty, and family conduct.',
        estimatedMinutes: 18,
        objectives: [
          'Connect Akhlaq to Islamic belief',
          'Identify one character habit to repair this week',
          'Apply Prophetic etiquette in speech and relationships'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Character is a daily test of belief',
            content: 'Good character appears in ordinary moments: how we speak, listen, apologize, keep trust, and respond when nobody is praising us.'
          },
          {
            type: 'list',
            title: 'High-impact adab habits',
            items: [
              'Speak truth without cruelty',
              'Keep promises and return trust',
              'Respect parents, elders, and teachers',
              'Correct mistakes without humiliating others'
            ]
          }
        ],
        keyPoints: [
          'Akhlaq is where belief becomes visible.',
          'Small repeated manners shape the whole household.',
          'Character reform needs specific habits, not vague wishes.'
        ],
        materials: ['Character habit tracker', 'Family adab challenge card'],
        quiz: {
          title: 'Akhlaq and Adab Quiz',
          description: 'Check your understanding of how manners reflect faith.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-9-q1',
              'Where does good character most clearly appear?',
              ['In ordinary speech, trust, and relationships', 'Only in public events', 'Only in formal lessons'],
              'is-9-q1-option-1',
              'Akhlaq is tested in repeated daily interactions.'
            ),
            question(
              'is-9-q2',
              'What helps character reform actually stick?',
              ['Choosing concrete habits to practice regularly', 'Waiting for emotion to change first', 'Ignoring mistakes'],
              'is-9-q2-option-1',
              'Specific repeated actions are what shape stronger character.'
            )
          ]
        }
      })
    ]
  },
  {
    id: 'is-everyday',
    title: 'Everyday Fiqh and Family Life',
    description: 'Close the course by applying core Islamic guidance to money, relationships, decision-making, and digital behavior.',
    icon: '🏡',
    lessons: [
      lesson({
        id: 'is-10',
        sectionId: 'is-everyday',
        order: 10,
        title: 'Halal, Haram, and Careful Decision-Making',
        description: 'Learn a principled way to approach permissible, impermissible, and doubtful matters with humility and caution.',
        estimatedMinutes: 20,
        objectives: [
          'Understand the role of halal and haram in shaping conscience',
          'Recognize the category of doubtful matters',
          'Use a careful decision-making framework before acting'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Islam shapes moral caution',
            content: 'A mature Muslim does not only ask, “Can I do this?” but also, “Will this bring me nearer to Allah, protect others, and keep my heart clean?”'
          },
          {
            type: 'list',
            title: 'A practical decision framework',
            items: [
              'Check clear evidence if the issue is known',
              'Avoid doubtful matters when harm or confusion is strong',
              'Seek knowledgeable guidance when unsure',
              'Measure the effect on your heart and the people around you'
            ]
          }
        ],
        keyPoints: [
          'Halal and haram train moral discipline.',
          'Doubtful matters require caution, not arrogance.',
          'Seeking guidance is a strength.'
        ],
        materials: ['Decision-making checklist', 'Doubtful matters worksheet'],
        quiz: {
          title: 'Halal and Haram Quiz',
          description: 'Check your approach to principled decisions and doubtful matters.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-10-q1',
              'What is a mature question beyond “Can I do this?”',
              ['Will this bring me closer to Allah and protect others?', 'Will this impress people?', 'Will this save time only?'],
              'is-10-q1-option-1',
              'Islamic decision-making looks at obedience, conscience, and consequences.'
            ),
            question(
              'is-10-q2',
              'How should doubtful matters usually be handled?',
              ['With caution and learned guidance', 'With pride and impulse', 'By mocking scholars'],
              'is-10-q2-option-1',
              'Caution and consultation protect the believer’s conscience.'
            )
          ]
        }
      }),
      lesson({
        id: 'is-11',
        sectionId: 'is-everyday',
        order: 11,
        title: 'Rights, Responsibilities, and Family Trust',
        description: 'Study how Islam organizes relationships through responsibility, compassion, and trustworthy conduct.',
        estimatedMinutes: 19,
        objectives: [
          'Recognize the link between rights and duties',
          'Apply trust and mercy inside family roles',
          'Repair one area of relational negligence'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Family life is a trust',
            content: 'Islam teaches that rights are not slogans for self-interest. They are paired with duties, mercy, and accountability before Allah for how one treats others.'
          },
          {
            type: 'list',
            title: 'Relationship duties to review',
            items: [
              'Listening without contempt',
              'Speaking respectfully during tension',
              'Honoring privacy and trust',
              'Supporting family members with fairness and consistency'
            ]
          }
        ],
        keyPoints: [
          'Rights and responsibilities must stay linked.',
          'Family trust is protected by speech and consistency.',
          'Mercy is strongest when paired with responsibility.'
        ],
        materials: ['Family trust checklist', 'Relationship repair planner'],
        quiz: {
          title: 'Family Trust Quiz',
          description: 'Confirm how Islamic guidance frames rights, duties, and compassion.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-11-q1',
              'How does Islam frame rights inside family life?',
              ['As responsibilities paired with mercy and accountability', 'As tools for selfishness', 'As optional ideals with no duties'],
              'is-11-q1-option-1',
              'Islamic rights make sense only when joined to responsibility and trust.'
            ),
            question(
              'is-11-q2',
              'What protects family trust most consistently?',
              ['Respectful speech and reliable conduct', 'Public embarrassment', 'Avoiding all correction'],
              'is-11-q2-option-1',
              'Trust grows through stable character and responsible communication.'
            )
          ]
        }
      }),
      lesson({
        id: 'is-12',
        sectionId: 'is-everyday',
        order: 12,
        title: 'Digital Conduct, Community, and Accountability',
        description: 'Apply Islamic ethics to speech, privacy, rumor, and responsibility in digital and public spaces.',
        estimatedMinutes: 18,
        objectives: [
          'Extend Akhlaq principles into digital behavior',
          'Recognize online harms like rumor and mockery',
          'Finish the course with a personal accountability plan'
        ],
        blocks: [
          {
            type: 'text',
            title: 'Screens do not remove accountability',
            content: 'The same Allah who hears public speech knows private messages, comments, forwarded rumors, and hidden online habits. Digital conduct is part of Islamic character.'
          },
          {
            type: 'list',
            title: 'Digital adab rules',
            items: [
              'Verify before forwarding',
              'Do not mock, expose, or humiliate people online',
              'Protect privacy and trust in digital spaces',
              'Use beneficial content more than reactive scrolling'
            ]
          },
          {
            type: 'reflection',
            title: 'Final action plan',
            content: 'Choose one online habit you will stop, one you will reduce, and one beneficial habit you will build after this course.'
          }
        ],
        keyPoints: [
          'Digital behavior is moral behavior.',
          'Verification and privacy are Islamic duties.',
          'A believer remains accountable in every space.'
        ],
        materials: ['Digital adab checklist', 'Final accountability plan'],
        quiz: {
          title: 'Digital Conduct Quiz',
          description: 'Complete the course by applying Islamic ethics to online and public behavior.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'is-12-q1',
              'What is one core digital adab principle?',
              ['Verify before forwarding information', 'Share rumors quickly', 'Assume privacy does not matter'],
              'is-12-q1-option-1',
              'Islamic ethics require caution, verification, and protection from harm.'
            ),
            question(
              'is-12-q2',
              'Why does digital behavior matter Islamically?',
              ['Because accountability applies in every space', 'Because online speech is not real', 'Because only offline manners matter'],
              'is-12-q2-option-1',
              'A Muslim remains morally responsible whether speaking in person or through a screen.'
            )
          ]
        }
      })
    ]
  }
];

const lessonMetrics: CourseModuleLessonMetric[] = sections.flatMap((section) => section.lessons).map((item, index) => ({
  lessonId: item.id,
  studentCount: 26 + (index % 5) * 4,
  completionRate: 60 + ((index * 5) % 24),
  averageScore: 74 + ((index * 4) % 13),
  updatedLabel: `Week ${index + 1}`
}));

const averageCompletion = Math.round(lessonMetrics.reduce((sum, item) => sum + item.completionRate, 0) / lessonMetrics.length);
const averageScore = Math.round(lessonMetrics.reduce((sum, item) => sum + item.averageScore, 0) / lessonMetrics.length);

export const islamicStudiesCourseData: DedicatedCourseModule = applyCourseModuleCompleteness({
  metadata: courseMetadata,
  publicRoute: '/islamic-studies',
  studentRoute: '/student/islamic-studies-player',
  adminRoute: '/admin/courses/islamic-studies',
  heroBadge: 'Faith and Practice Curriculum',
  heroHeadline: 'Build Islamic understanding that reaches belief, worship, family, and community life.',
  heroSummary: 'This dedicated Islamic Studies experience combines Aqeedah, Fiqh, Seerah, and character training into one guided course with practical materials, accountable lesson flow, and role-based teaching support.',
  estimatedHours: 20,
  sections,
  features: [
    { icon: '🕌', title: 'Core Aqeedah Lessons', description: 'Students begin with belief, Tawhid, sincerity, and the sources of guidance.' },
    { icon: '💧', title: 'Fiqh and Worship Basics', description: 'Purification, prayer, fasting, and responsibility are taught in practical terms.' },
    { icon: '🌙', title: 'Seerah and Character', description: 'The Prophetic model is translated into patience, mercy, and strong manners.' },
    { icon: '🏡', title: 'Family and Daily Life', description: 'Everyday Islamic decision-making is connected to home, work, and relationships.' },
    { icon: '📋', title: 'Action-Based Materials', description: 'Checklists, reflection sheets, and family discussion prompts support each section.' },
    { icon: '✅', title: 'Structured Quizzes', description: 'Short lesson quizzes keep understanding measurable and steady.' }
  ],
  benefits: [
    { icon: '🧱', title: 'Strong Foundations', description: 'Belief and worship are taught as one integrated path instead of isolated topics.', tone: 'emerald' },
    { icon: '🤝', title: 'Family and Community Relevance', description: 'Lessons include household trust, service, and real community accountability.', tone: 'blue' },
    { icon: '🛡️', title: 'Clear Ethical Guardrails', description: 'Students learn how to approach doubtful matters, speech, privacy, and conduct responsibly.', tone: 'amber' },
    { icon: '🌱', title: 'Personal Reform Focus', description: 'Each lesson closes the gap between Islamic knowledge and lived character.', tone: 'rose' }
  ],
  staff: [
    {
      id: 'is-staff-1',
      name: 'Islamic Foundations Faculty',
      role: 'Aqeedah and Fiqh Instruction',
      bio: 'Guides students through belief, worship, and the core principles that organize Islamic life in a clear, step-by-step way.',
      qualification: courseMetadata.teacherInfo.qualification,
      experience: courseMetadata.teacherInfo.experience,
      languages: courseMetadata.teacherInfo.languages,
      focus: 'Core belief, worship essentials, and structured understanding of Islamic duties.'
    },
    {
      id: 'is-staff-2',
      name: 'Seerah and Character Mentor',
      role: 'Prophetic Model and Akhlaq Coaching',
      bio: 'Helps students apply lessons from the Prophetic life to patience, mercy, family manners, and da’wah conduct.',
      qualification: 'Guided Seerah-based character development support',
      experience: 'Student mentoring through reflection and discussion-based learning',
      languages: ['Arabic', 'English', 'Urdu'],
      focus: 'Turning Seerah lessons into daily habits and relationship ethics.'
    },
    {
      id: 'is-staff-3',
      name: 'Family Guidance Coach',
      role: 'Everyday Practice and Household Support',
      bio: 'Supports students in bringing Islamic conduct into family life, responsibilities, and digital behavior.',
      qualification: 'Applied family and community education support',
      experience: 'Coaching learners through checklists, routines, and personal accountability plans',
      languages: ['English', 'Urdu', 'Arabic'],
      focus: 'Family trust, practical akhlaq, and community-minded accountability.'
    }
  ],
  resourceHighlights: [
    { title: 'Islamic Foundations Handbook', description: 'A section-by-section handbook summarizing Aqeedah, Fiqh, Seerah, and character principles.', type: 'Reference' },
    { title: 'Family Discussion Prompts', description: 'Prompts for parents, spouses, or siblings to discuss each topic and build shared accountability.', type: 'Discussion Guide' },
    { title: 'Practice Checklists', description: 'Worship readiness, intention, adab, and digital conduct checklists for weekly use.', type: 'Toolkit' }
  ],
  milestoneBadges: [
    { threshold: 3, name: 'Belief Builder', description: 'Completed the Foundations of Faith section.', icon: '🕊️' },
    { threshold: 6, name: 'Worship Grounded', description: 'Completed the worship and purification section.', icon: '💧' },
    { threshold: 12, name: 'Balanced Muslim Learner', description: 'Completed the full Islamic Studies course.', icon: '🌙' }
  ],
  adminStats: {
    totalEnrollments: 112,
    activeStudents: 69,
    completionRate: averageCompletion,
    averageScore
  },
  lessonMetrics,
  enrollmentCta: 'Enroll in Islamic Studies'
});