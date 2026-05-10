import { courses } from './courses';
import {
  CourseModuleLesson,
  CourseModuleLessonMetric,
  CourseModuleQuizQuestion,
  CourseModuleSection,
  DedicatedCourseModule
} from '../types/dedicated-course.types';
import { applyCourseModuleCompleteness } from '../utils/courseModuleCompleteness';

const courseMetadata = courses.find((course) => course.id === 'noorani-qaida');

if (!courseMetadata) {
  throw new Error('noorani-qaida metadata is missing from data/courses.ts');
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
    id: 'noorani-foundations',
    title: 'Phase 1: Foundations (Makharij + Letters)',
    description: 'Master Arabic letter recognition and correct articulation points before moving to vowels and joining.',
    icon: '🔤',
    lessons: [
      lesson({
        id: 'noorani-1',
        sectionId: 'noorani-foundations',
        order: 1,
        title: 'Orientation and The Noorani Method',
        description: 'Understand the Learn-Repeat-Correct cycle and build your daily study routine.',
        estimatedMinutes: 20,
        objectives: [
          'Understand the daily Noorani learning flow',
          'Set a realistic 20-30 minute daily plan',
          'Learn the four rules: listen, repeat, correct, repeat again'
        ],
        blocks: [
          {
            type: 'callout',
            title: 'Daily System (Your Success Engine)',
            content: 'Every lesson follows one system: listen to the model, repeat, get correction, repeat correctly. You do this daily with short focused sessions.'
          },
          {
            type: 'list',
            title: 'Daily Flow',
            items: [
              '5-10 min lesson learning',
              '3-5 min audio imitation',
              '5-10 min voice recording practice',
              'Mini quiz + progress update',
              'Teacher feedback or live correction session'
            ]
          },
          {
            type: 'reflection',
            title: 'Commitment Check',
            content: 'When during your day will you practice? Set a fixed time now and keep it for all 6-8 weeks.'
          }
        ],
        keyPoints: [
          'Short daily practice beats long inconsistent sessions.',
          'Correction is not failure; it is how pronunciation becomes accurate.',
          'Your voice recording is part of the lesson, not optional.'
        ],
        materials: ['Student roadmap', 'Daily practice template', 'Teacher correction checklist'],
        staffNote: 'Ensure student has microphone setup and understands the correction routine before letter lessons.',
        quiz: {
          title: 'Noorani Learning Method Quiz',
          description: 'Confirm that you understand the learning process.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'nq1-q1',
              'What is the core teaching cycle in this course?',
              ['Listen-Repeat-Correct-Repeat', 'Memorize-Test-Skip', 'Read once then move on', 'Watch videos only'],
              'nq1-q1-option-1',
              'This cycle ensures pronunciation correction and real mastery before progress.'
            ),
            question(
              'nq1-q2',
              'What is the recommended daily study duration?',
              ['5 minutes', '20-30 minutes', '60-90 minutes', 'Only weekends'],
              'nq1-q2-option-2',
              'The course is optimized for focused, consistent 20-30 minute sessions.'
            )
          ]
        }
      }),
      lesson({
        id: 'noorani-2',
        sectionId: 'noorani-foundations',
        order: 2,
        title: 'Arabic Alphabet Part 1 (ا to ث)',
        description: 'Learn the first group of Arabic letters with clear shape recognition and pronunciation.',
        estimatedMinutes: 25,
        objectives: [
          'Recognize forms of ا ب ت ث',
          'Pronounce each letter from its correct articulation area',
          'Avoid common beginner confusion between similar letters'
        ],
        blocks: [
          {
            type: 'audio-letter',
            title: 'Tap-Hear-Repeat: Letter Set 1',
            content: 'Practice each letter three times: normal speed then slow speed.',
            letters: [
              { letter: 'ا', name: 'Alif', transliteration: 'aa', makhraj: 'Oral cavity / throat opening' },
              { letter: 'ب', name: 'Ba', transliteration: 'ba', makhraj: 'Two lips' },
              { letter: 'ت', name: 'Ta', transliteration: 'ta', makhraj: 'Tip of tongue + upper teeth root' },
              { letter: 'ث', name: 'Tha', transliteration: 'tha', makhraj: 'Tip of tongue between teeth' }
            ],
            speedToggle: true,
            caption: 'Listen carefully and copy exact tongue/lip placement.'
          },
          {
            type: 'pronunciation-guide',
            title: 'Makhraj Map for Set 1',
            articulationZones: [
              { zone: 'Lips', letters: 'ب', description: 'Press lips softly and release with breath.' },
              { zone: 'Tongue Tip + Teeth Root', letters: 'ت', description: 'Touch near upper teeth root without force.' },
              { zone: 'Tongue Tip Between Teeth', letters: 'ث', description: 'Slightly place tongue tip between teeth.' }
            ]
          },
          {
            type: 'letter-practice',
            title: 'Recognition Drill',
            practiceItems: [
              { arabic: 'ا', transliteration: 'aa' },
              { arabic: 'ب', transliteration: 'ba' },
              { arabic: 'ت', transliteration: 'ta' },
              { arabic: 'ث', transliteration: 'tha' }
            ]
          }
        ],
        keyPoints: [
          'Shape recognition comes before speed.',
          'Wrong tongue placement creates long-term pronunciation issues.',
          'Repeat each letter aloud multiple times.'
        ],
        materials: ['Letter flashcards set 1', 'Audio drill track 1', 'Worksheet page 1'],
        staffNote: 'Correct ث early. Students often replace it with س or ت.',
        quiz: {
          title: 'Alphabet Set 1 Quiz',
          description: 'Check your recognition and pronunciation understanding.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question(
              'nq2-q1',
              'Which letter is pronounced with the tongue tip between the teeth?',
              ['ب', 'ت', 'ث', 'ا'],
              'nq2-q1-option-3',
              'ث (tha) is produced with the tongue tip between the teeth.'
            ),
            question(
              'nq2-q2',
              'Which letter is produced using both lips?',
              ['ا', 'ب', 'ت', 'ث'],
              'nq2-q2-option-2',
              'ب (ba) is produced from the lips.'
            )
          ]
        }
      }),
      lesson({
        id: 'noorani-3',
        sectionId: 'noorani-foundations',
        order: 3,
        title: 'Arabic Alphabet Part 2 (ج to ز)',
        description: 'Continue letter learning with focus on throat and tongue articulation differences.',
        estimatedMinutes: 25,
        objectives: [
          'Read and pronounce ج ح خ د ذ ر ز',
          'Differentiate similar sounding letters',
          'Use recording feedback to improve precision'
        ],
        blocks: [
          {
            type: 'audio-letter',
            title: 'Letter Set 2 Audio Practice',
            letters: [
              { letter: 'ج', name: 'Jeem', transliteration: 'j', makhraj: 'Middle tongue with palate' },
              { letter: 'ح', name: 'Haa', transliteration: 'h', makhraj: 'Middle throat' },
              { letter: 'خ', name: 'Khaa', transliteration: 'kh', makhraj: 'Upper throat' },
              { letter: 'د', name: 'Dal', transliteration: 'd', makhraj: 'Tongue tip + teeth root' },
              { letter: 'ذ', name: 'Dhal', transliteration: 'dh', makhraj: 'Tongue tip between teeth' },
              { letter: 'ر', name: 'Ra', transliteration: 'r', makhraj: 'Tongue tip slight vibration' },
              { letter: 'ز', name: 'Zay', transliteration: 'z', makhraj: 'Tongue tip + teeth root with sound' }
            ],
            speedToggle: true
          },
          {
            type: 'callout',
            title: 'Common Mistake Alert',
            content: 'Students often mix ح and خ. ح is soft breath from the throat, while خ has a rougher friction sound.'
          }
        ],
        keyPoints: [
          'ح and خ need separate throat control.',
          'ذ is not the same as د.',
          'Recording your own recitation reveals hidden errors.'
        ],
        materials: ['Letter flashcards set 2', 'Self-recording checklist'],
        quiz: {
          title: 'Alphabet Set 2 Quiz',
          description: 'Strengthen recognition of new letters.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq3-q1', 'Which letter has a rough throat sound?', ['ح', 'خ', 'ج', 'د'], 'nq3-q1-option-2', 'خ is pronounced with a stronger throat friction.'),
            question('nq3-q2', 'Which letter is pronounced between the teeth?', ['د', 'ر', 'ذ', 'ز'], 'nq3-q2-option-3', 'ذ uses tongue tip between teeth.')
          ]
        }
      }),
      lesson({
        id: 'noorani-4',
        sectionId: 'noorani-foundations',
        order: 4,
        title: 'Arabic Alphabet Part 3 (س to ظ)',
        description: 'Learn the central letter group with focus on tongue placement and emphatic sounds.',
        estimatedMinutes: 25,
        objectives: [
          'Pronounce س ش ص ض ط ظ correctly',
          'Differentiate heavy and light sound families',
          'Build strong ear training for similar sounds'
        ],
        blocks: [
          {
            type: 'audio-letter',
            title: 'Letter Set 3 Audio',
            letters: [
              { letter: 'س', name: 'Seen', transliteration: 's', makhraj: 'Tongue tip near lower teeth' },
              { letter: 'ش', name: 'Sheen', transliteration: 'sh', makhraj: 'Middle tongue + palate' },
              { letter: 'ص', name: 'Saad', transliteration: 's (heavy)', makhraj: 'Tongue tip with elevated back tongue' },
              { letter: 'ض', name: 'Dhaad', transliteration: 'd (heavy)', makhraj: 'Side of tongue + molars' },
              { letter: 'ط', name: 'Taa', transliteration: 't (heavy)', makhraj: 'Tongue tip + palate pressure' },
              { letter: 'ظ', name: 'Zaa', transliteration: 'dh (heavy)', makhraj: 'Tongue tip with emphasis' }
            ]
          },
          {
            type: 'pronunciation-guide',
            title: 'Heavy vs Light Letters',
            articulationZones: [
              { zone: 'Light letters', letters: 'س ش', description: 'Natural tongue shape, no heavy mouth fullness.' },
              { zone: 'Heavy letters', letters: 'ص ض ط ظ', description: 'Elevate back of tongue and broaden sound.' }
            ]
          }
        ],
        keyPoints: [
          'Heavy letters must sound full and deep.',
          'ض needs side-tongue control.',
          'Do not flatten heavy letters into light ones.'
        ],
        materials: ['Heavy-light contrast chart', 'Pronunciation mirror drill'],
        quiz: {
          title: 'Heavy and Light Letters Quiz',
          description: 'Check your understanding of Tafkheem vs Tarqeeq basics.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq4-q1', 'Which letter is heavy?', ['س', 'ش', 'ص', 'ر'], 'nq4-q1-option-3', 'ص is an emphatic heavy letter.'),
            question('nq4-q2', 'Which letter is known for side-tongue articulation?', ['ط', 'ض', 'ظ', 'س'], 'nq4-q2-option-2', 'ض is pronounced from the side of the tongue.')
          ]
        }
      }),
      lesson({
        id: 'noorani-5',
        sectionId: 'noorani-foundations',
        order: 5,
        title: 'Arabic Alphabet Part 4 (ع to ي)',
        description: 'Complete the alphabet and strengthen throat + lip coordination for final letters.',
        estimatedMinutes: 25,
        objectives: [
          'Read and pronounce ع غ ف ق ك ل م ن ه و ي',
          'Differentiate deep throat and oral sounds',
          'Complete full alphabet confidence check'
        ],
        blocks: [
          {
            type: 'audio-letter',
            title: 'Final Alphabet Set Audio',
            letters: [
              { letter: 'ع', name: 'Ayn', transliteration: 'ʿ', makhraj: 'Middle throat deep constriction' },
              { letter: 'غ', name: 'Ghayn', transliteration: 'gh', makhraj: 'Upper throat with vibration' },
              { letter: 'ف', name: 'Fa', transliteration: 'f', makhraj: 'Upper teeth + lower lip' },
              { letter: 'ق', name: 'Qaf', transliteration: 'q', makhraj: 'Back tongue + soft palate' },
              { letter: 'ك', name: 'Kaf', transliteration: 'k', makhraj: 'Back tongue less deep than qaf' },
              { letter: 'ل', name: 'Lam', transliteration: 'l', makhraj: 'Tongue tip with gum line' },
              { letter: 'م', name: 'Meem', transliteration: 'm', makhraj: 'Closed lips with nasal resonance' },
              { letter: 'ن', name: 'Noon', transliteration: 'n', makhraj: 'Tongue tip + nasal passage' },
              { letter: 'ه', name: 'Ha', transliteration: 'h', makhraj: 'Lower throat breathy' },
              { letter: 'و', name: 'Waw', transliteration: 'w', makhraj: 'Rounded lips' },
              { letter: 'ي', name: 'Ya', transliteration: 'y', makhraj: 'Middle tongue + palate' }
            ],
            speedToggle: true
          },
          {
            type: 'callout',
            title: 'Difficult Pair: ق vs ك',
            content: 'ق is deeper, heavier, and further back in the mouth. ك is lighter and less deep.'
          }
        ],
        keyPoints: [
          'ع and غ require throat control and patience.',
          'ق and ك are different in depth and strength.',
          'You now know all core alphabet letters.'
        ],
        materials: ['Full alphabet poster', 'Advanced articulation checklist'],
        quiz: {
          title: 'Full Alphabet Completion Quiz',
          description: 'Validate your full alphabet mastery.',
          passingScore: 75,
          allowRetake: true,
          questions: [
            question('nq5-q1', 'Which letter is produced deeper in the mouth?', ['ق', 'ك', 'ف', 'ل'], 'nq5-q1-option-1', 'ق has a deeper back-tongue articulation.'),
            question('nq5-q2', 'Which letter uses upper teeth and lower lip?', ['و', 'ف', 'ن', 'ه'], 'nq5-q2-option-2', 'ف is pronounced with upper teeth touching lower lip.')
          ]
        }
      }),
      lesson({
        id: 'noorani-6',
        sectionId: 'noorani-foundations',
        order: 6,
        title: 'Makhraj Mastery + Heavy/Light Consolidation',
        description: 'Consolidate all articulation points and prepare for vowel application.',
        estimatedMinutes: 30,
        objectives: [
          'Review all major Makharij zones',
          'Apply heavy/light distinction consistently',
          'Pass phase checkpoint before Harakaat'
        ],
        blocks: [
          {
            type: 'pronunciation-guide',
            title: 'Complete Makhraj Zone Map',
            articulationZones: [
              { zone: 'Throat', letters: 'ء ه ع ح غ خ', description: 'Produced through different throat depths.' },
              { zone: 'Tongue', letters: 'Most Arabic letters', description: 'Position differs by tip, middle, side, or back of tongue.' },
              { zone: 'Lips', letters: 'ف ب م و', description: 'Lip closure/shape controls sound.' },
              { zone: 'Nasal passage', letters: 'ن م (ghunnah)', description: 'Used for nasal resonance in specific rules.' }
            ]
          },
          {
            type: 'list',
            title: 'Phase 1 Mastery Checklist',
            items: [
              'All 28 letters recognized instantly',
              'No major confusion in similar letters',
              'Heavy letters pronounced with fullness',
              'Student can self-correct after listening'
            ]
          }
        ],
        keyPoints: [
          'Strong foundations reduce errors in all future phases.',
          'Do not rush to vowels before articulation is stable.',
          'Teacher correction at this stage is critical.'
        ],
        materials: ['Phase 1 assessment sheet', 'Teacher checkpoint rubric'],
        quiz: {
          title: 'Phase 1 Checkpoint Quiz',
          description: 'Gate assessment before moving forward.',
          passingScore: 80,
          allowRetake: true,
          questions: [
            question('nq6-q1', 'How many letters are in the Arabic alphabet?', ['26', '27', '28', '29'], 'nq6-q1-option-3', 'The Arabic alphabet has 28 core letters.'),
            question('nq6-q2', 'Which set contains only heavy letters?', ['س ش ت', 'ص ض ط', 'ب م ن', 'ف ك ل'], 'nq6-q2-option-2', 'ص ض ط are all heavy letters.')
          ]
        }
      })
    ]
  },
  {
    id: 'noorani-harakaat',
    title: 'Phase 2: Harakaat (Short Vowels)',
    description: 'Learn how vowel marks change letter sounds and begin smooth syllable reading.',
    icon: '📗',
    lessons: [
      lesson({
        id: 'noorani-7',
        sectionId: 'noorani-harakaat',
        order: 1,
        title: 'Fatha (َ) - Open Sound',
        description: 'Learn open vowel sound with every major letter family.',
        estimatedMinutes: 20,
        objectives: [
          'Read letters with Fatha correctly',
          'Avoid over-lengthening short vowels',
          'Build rhythm through repetition drills'
        ],
        blocks: [
          {
            type: 'letter-practice',
            title: 'Fatha Drill',
            practiceItems: [
              { arabic: 'بَ', transliteration: 'ba' },
              { arabic: 'تَ', transliteration: 'ta' },
              { arabic: 'ثَ', transliteration: 'tha' },
              { arabic: 'جَ', transliteration: 'ja' },
              { arabic: 'حَ', transliteration: 'ha' },
              { arabic: 'خَ', transliteration: 'kha' }
            ],
            caption: 'Short sound only. Do not stretch unless Madd appears.'
          },
          {
            type: 'callout',
            title: 'Teacher Feedback Pattern',
            content: 'Read each letter 3 times. Teacher stops immediately on wrong vowel length and asks for correction.'
          }
        ],
        keyPoints: ['Fatha gives a short open "a" sound.', 'Keep it short and clear.', 'Accuracy is more important than speed.'],
        materials: ['Fatha worksheet', 'Audio line-by-line drill'],
        quiz: {
          title: 'Fatha Quiz',
          description: 'Identify correct Fatha reading.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq7-q1', 'How is بَ read?', ['bee', 'baa (long)', 'ba (short)', 'bu'], 'nq7-q1-option-3', 'Fatha gives a short "a" sound.'),
            question('nq7-q2', 'Which is a correct Fatha example?', ['بِ', 'بُ', 'بَ', 'بْ'], 'nq7-q2-option-3', 'بَ contains Fatha.')
          ]
        }
      }),
      lesson({
        id: 'noorani-8',
        sectionId: 'noorani-harakaat',
        order: 2,
        title: 'Kasra (ِ) - Lower Sound',
        description: 'Learn the short "i" vowel and stabilize smooth pronunciation.',
        estimatedMinutes: 20,
        objectives: ['Read Kasra forms clearly', 'Differentiate Kasra from Fatha and Damma', 'Maintain short vowel timing'],
        blocks: [
          {
            type: 'letter-practice',
            title: 'Kasra Drill',
            practiceItems: [
              { arabic: 'بِ', transliteration: 'bi' },
              { arabic: 'تِ', transliteration: 'ti' },
              { arabic: 'ثِ', transliteration: 'thi' },
              { arabic: 'دِ', transliteration: 'di' },
              { arabic: 'رِ', transliteration: 'ri' },
              { arabic: 'سِ', transliteration: 'si' }
            ]
          },
          {
            type: 'reflection',
            title: 'Self-Check',
            content: 'Record yourself reading six Kasra forms. Can you hear any form sounding like Fatha or Damma?'
          }
        ],
        keyPoints: ['Kasra gives a short "i" sound.', 'Do not flatten into "a".', 'Use listening to self-correct.'],
        materials: ['Kasra practice card', 'Self-recording prompt sheet'],
        quiz: {
          title: 'Kasra Quiz',
          description: 'Reinforce short i-sound reading.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq8-q1', 'What sound does Kasra produce?', ['Short a', 'Short i', 'Short u', 'No sound'], 'nq8-q1-option-2', 'Kasra produces a short i sound.'),
            question('nq8-q2', 'Which symbol is Kasra?', ['َ', 'ِ', 'ُ', 'ْ'], 'nq8-q2-option-2', 'Kasra is the diagonal mark below the letter.')
          ]
        }
      }),
      lesson({
        id: 'noorani-9',
        sectionId: 'noorani-harakaat',
        order: 3,
        title: 'Damma (ُ) - Rounded Sound',
        description: 'Learn short "u" sound with controlled lip rounding.',
        estimatedMinutes: 20,
        objectives: ['Read Damma forms correctly', 'Round lips gently for "u"', 'Avoid turning Damma into long sound'],
        blocks: [
          {
            type: 'letter-practice',
            title: 'Damma Drill',
            practiceItems: [
              { arabic: 'بُ', transliteration: 'bu' },
              { arabic: 'تُ', transliteration: 'tu' },
              { arabic: 'ثُ', transliteration: 'thu' },
              { arabic: 'قُ', transliteration: 'qu' },
              { arabic: 'لُ', transliteration: 'lu' },
              { arabic: 'مُ', transliteration: 'mu' }
            ]
          },
          {
            type: 'callout',
            title: 'Lip Control Tip',
            content: 'For Damma, lightly round lips. Do not over-round into a long "oo".'
          }
        ],
        keyPoints: ['Damma is short u.', 'Lips help form the sound.', 'Keep timing short like other Harakaat.'],
        materials: ['Damma drill sheet'],
        quiz: {
          title: 'Damma Quiz',
          description: 'Confirm Damma recognition.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq9-q1', 'Which vowel mark is Damma?', ['َ', 'ِ', 'ُ', 'ْ'], 'nq9-q1-option-3', 'Damma is written above the letter as a small curl.'),
            question('nq9-q2', 'How is تُ read?', ['ta', 'ti', 'tu', 'taa'], 'nq9-q2-option-3', 'Damma gives the short u sound.')
          ]
        }
      }),
      lesson({
        id: 'noorani-10',
        sectionId: 'noorani-harakaat',
        order: 4,
        title: 'Mixed Harakaat Reading Lines',
        description: 'Practice switching between Fatha, Kasra, and Damma without confusion.',
        estimatedMinutes: 25,
        objectives: ['Read mixed vowel lines accurately', 'Improve speed without losing clarity', 'Strengthen listening discrimination'],
        blocks: [
          {
            type: 'join-animation',
            title: 'Mixed Harakaat Flow',
            practiceItems: [
              { arabic: 'بَ تِ ثُ', transliteration: 'ba ti thu' },
              { arabic: 'جُ دَ رِ', transliteration: 'ju da ri' },
              { arabic: 'سِ صَ ضُ', transliteration: 'si sa du' },
              { arabic: 'فَ قِ كُ', transliteration: 'fa qi ku' }
            ],
            caption: 'Move smoothly from one short vowel to another.'
          }
        ],
        keyPoints: ['Mixed practice builds fluency.', 'Do not merge vowels unintentionally.', 'Pause and reset when errors increase.'],
        materials: ['Mixed harakaat reading lines'],
        quiz: {
          title: 'Mixed Harakaat Quiz',
          description: 'Evaluate vowel switching.',
          passingScore: 75,
          allowRetake: true,
          questions: [
            question('nq10-q1', 'What is the best way to improve mixed vowel reading?', ['Skip difficult lines', 'Practice line by line with correction', 'Read silently only', 'Memorize without reciting'], 'nq10-q1-option-2', 'Line-by-line corrected recitation builds reliable fluency.'),
            question('nq10-q2', 'Which sequence contains all three short vowels?', ['بَ بِ بُ', 'بَ بَ بَ', 'بِ بِ بِ', 'بُ بُ بُ'], 'nq10-q2-option-1', 'This sequence includes Fatha, Kasra, and Damma.')
          ]
        }
      }),
      lesson({
        id: 'noorani-11',
        sectionId: 'noorani-harakaat',
        order: 5,
        title: 'Phase 2 Checkpoint: Harakaat Mastery',
        description: 'Consolidate all short vowel reading before moving to joined letters.',
        estimatedMinutes: 25,
        objectives: ['Pass short vowel mastery check', 'Stabilize rhythm', 'Prepare for connected letters'],
        blocks: [
          {
            type: 'list',
            title: 'Harakaat Mastery Checklist',
            items: [
              'Can read all three vowels on any known letter',
              'No major confusion between short sounds',
              'Can read mixed lines in one breath group',
              'Can self-detect long vs short mistakes'
            ]
          }
        ],
        keyPoints: ['Harakaat stability is required for joining letters.', 'Teacher checkpoint prevents weak progression.'],
        materials: ['Phase 2 assessment sheet'],
        quiz: {
          title: 'Phase 2 Checkpoint Quiz',
          description: 'Gateway assessment for joining letters.',
          passingScore: 80,
          allowRetake: true,
          questions: [
            question('nq11-q1', 'What is required before moving to joining letters?', ['Perfect handwriting', 'Harakaat mastery', 'Memorizing surahs', 'Learning Tajweed theory'], 'nq11-q1-option-2', 'Short vowel mastery is required first.'),
            question('nq11-q2', 'Short vowels should generally be:', ['Very long', 'Moderate and controlled', 'Silent', 'Random'], 'nq11-q2-option-2', 'Short vowels are brief, clear, and controlled.')
          ]
        }
      })
    ]
  },
  {
    id: 'noorani-joining',
    title: 'Phase 3: Joining Letters (Huroof Murakkaba)',
    description: 'Transition from single letters to connected letters and early word reading.',
    icon: '🔗',
    lessons: [
      lesson({
        id: 'noorani-12',
        sectionId: 'noorani-joining',
        order: 1,
        title: 'How Arabic Letters Join',
        description: 'Understand beginning, middle, and end forms of letters.',
        estimatedMinutes: 25,
        objectives: ['Identify positional forms', 'Understand connection rules', 'Read basic connected patterns'],
        blocks: [
          {
            type: 'join-animation',
            title: 'Visual Join Demonstration',
            practiceItems: [
              { arabic: 'ب + ا = با', transliteration: 'ba' },
              { arabic: 'ت + ا = تا', transliteration: 'ta' },
              { arabic: 'ن + و = نو', transliteration: 'nu' }
            ],
            caption: 'Watch the letter shape changes as it connects.'
          }
        ],
        keyPoints: ['Arabic letters change shape by position.', 'Connection awareness reduces reading hesitation.'],
        materials: ['Joined-letter chart'],
        quiz: {
          title: 'Joining Basics Quiz',
          description: 'Assess understanding of connected forms.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq12-q1', 'Do Arabic letters keep the same shape in all positions?', ['Yes', 'No', 'Only in Quran text', 'Only for children'], 'nq12-q1-option-2', 'Most letters change based on position.'),
            question('nq12-q2', 'Why is joining practice important?', ['For handwriting only', 'To read real Arabic words', 'Only for advanced Tajweed', 'Not important'], 'nq12-q2-option-2', 'Words are formed through joined letters.')
          ]
        }
      }),
      lesson({
        id: 'noorani-13',
        sectionId: 'noorani-joining',
        order: 2,
        title: 'Two-Letter Combinations - Set 1',
        description: 'Read simple 2-letter combinations with short vowels.',
        estimatedMinutes: 22,
        objectives: ['Read two-letter combinations smoothly', 'Maintain vowel clarity in connected forms'],
        blocks: [
          {
            type: 'join-animation',
            title: '2-Letter Reading Drill',
            practiceItems: [
              { arabic: 'بَتَ', transliteration: 'ba-ta' },
              { arabic: 'دِرِ', transliteration: 'di-ri' },
              { arabic: 'فُقُ', transliteration: 'fu-qu' }
            ]
          }
        ],
        keyPoints: ['Read in syllable units.', 'Keep each short vowel distinct.'],
        materials: ['2-letter practice sheet A'],
        quiz: {
          title: '2-Letter Set 1 Quiz',
          description: 'Check connected reading skills.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq13-q1', 'Best strategy for 2-letter combinations?', ['Guess quickly', 'Read syllable by syllable', 'Skip vowels', 'Read silently only'], 'nq13-q1-option-2', 'Syllable-based reading builds stable fluency.'),
            question('nq13-q2', 'What should remain clear in connected reading?', ['Only first letter', 'Only final letter', 'Short vowels', 'Nothing'], 'nq13-q2-option-3', 'Vowel clarity is essential.')
          ]
        }
      }),
      lesson({
        id: 'noorani-14',
        sectionId: 'noorani-joining',
        order: 3,
        title: 'Two-Letter Combinations - Set 2',
        description: 'Expand two-letter drills with heavier and throat letters.',
        estimatedMinutes: 22,
        objectives: ['Handle harder letter pairs', 'Maintain articulation in connected text'],
        blocks: [
          {
            type: 'join-animation',
            title: '2-Letter Advanced Drill',
            practiceItems: [
              { arabic: 'صَفَ', transliteration: 'sa-fa' },
              { arabic: 'غُرُ', transliteration: 'ghu-ru' },
              { arabic: 'عِمِ', transliteration: 'ʿi-mi' }
            ]
          }
        ],
        keyPoints: ['Do not lose heavy-letter quality in connected forms.', 'Throat letters require calm, controlled airflow.'],
        materials: ['2-letter practice sheet B'],
        quiz: {
          title: '2-Letter Set 2 Quiz',
          description: 'Consolidate advanced two-letter reading.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq14-q1', 'In connected reading, heavy letters should:', ['Become light', 'Remain heavy', 'Be skipped', 'Be whispered'], 'nq14-q1-option-2', 'Heavy letters stay heavy even in combinations.'),
            question('nq14-q2', 'Throat letters require:', ['Fast breathing', 'Controlled airflow', 'Closed lips', 'Nasal-only sound'], 'nq14-q2-option-2', 'Controlled airflow helps clean throat articulation.')
          ]
        }
      }),
      lesson({
        id: 'noorani-15',
        sectionId: 'noorani-joining',
        order: 4,
        title: 'Three-Letter Combinations - Set 1',
        description: 'Move to 3-letter connected units with rhythm control.',
        estimatedMinutes: 25,
        objectives: ['Read 3-letter combinations', 'Control pacing without dropping sounds'],
        blocks: [
          {
            type: 'join-animation',
            title: '3-Letter Pattern Drill',
            practiceItems: [
              { arabic: 'بَتَحَ', transliteration: 'ba-ta-ha' },
              { arabic: 'سِلِمِ', transliteration: 'si-li-mi' },
              { arabic: 'قُرُبُ', transliteration: 'qu-ru-bu' }
            ]
          }
        ],
        keyPoints: ['Break into chunks, then blend smoothly.', 'Do not swallow middle letters.'],
        materials: ['3-letter worksheet set 1'],
        quiz: {
          title: '3-Letter Set 1 Quiz',
          description: 'Assess rhythm and letter integrity.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq15-q1', 'What is the best way to read a new 3-letter combination?', ['Skip the middle letter', 'Chunk then blend', 'Read from memory only', 'Ignore vowels'], 'nq15-q1-option-2', 'Chunking then blending gives accurate flow.'),
            question('nq15-q2', 'A common mistake in 3-letter reading is:', ['Clear pronunciation', 'Swallowing middle letters', 'Listening carefully', 'Slow practice'], 'nq15-q2-option-2', 'Middle-letter loss is a major beginner error.')
          ]
        }
      }),
      lesson({
        id: 'noorani-16',
        sectionId: 'noorani-joining',
        order: 5,
        title: 'Three-Letter Combinations - Set 2',
        description: 'Advanced 3-letter reading with mixed letter types.',
        estimatedMinutes: 25,
        objectives: ['Read mixed 3-letter patterns', 'Keep pronunciation quality under speed'],
        blocks: [
          {
            type: 'join-animation',
            title: '3-Letter Mixed Drill',
            practiceItems: [
              { arabic: 'ضَحِكُ', transliteration: 'da-hi-ku' },
              { arabic: 'عَبَدَ', transliteration: 'ʿa-ba-da' },
              { arabic: 'غَفَرَ', transliteration: 'gha-fa-ra' }
            ]
          }
        ],
        keyPoints: ['Maintain articulation while increasing fluency.', 'Correction now prevents fossilized mistakes.'],
        materials: ['3-letter worksheet set 2'],
        quiz: {
          title: '3-Letter Set 2 Quiz',
          description: 'Evaluate advanced combination reading.',
          passingScore: 75,
          allowRetake: true,
          questions: [
            question('nq16-q1', 'What matters most when fluency increases?', ['Speed only', 'Pronunciation quality + rhythm', 'Skipping hard words', 'Long pauses'], 'nq16-q1-option-2', 'Fluency without accuracy is not acceptable in Quran reading.'),
            question('nq16-q2', 'Correction in this phase should be:', ['Delayed to final exam', 'Immediate and specific', 'Ignored', 'Only written'], 'nq16-q2-option-2', 'Immediate correction builds proper habits.')
          ]
        }
      }),
      lesson({
        id: 'noorani-17',
        sectionId: 'noorani-joining',
        order: 6,
        title: 'Word Formation Basics',
        description: 'Transition from combinations to simple words and reading lines.',
        estimatedMinutes: 30,
        objectives: ['Read simple words from connected letters', 'Prepare for Sukoon and Madd phase'],
        blocks: [
          {
            type: 'letter-practice',
            title: 'Early Word Reading',
            practiceItems: [
              { arabic: 'كَتَبَ', transliteration: 'ka-ta-ba', meaning: 'he wrote' },
              { arabic: 'قَرَأَ', transliteration: 'qa-ra-a', meaning: 'he read' },
              { arabic: 'عَلِمَ', transliteration: 'ʿa-li-ma', meaning: 'he knew' }
            ]
          },
          {
            type: 'reflection',
            title: 'Word Reading Confidence',
            content: 'Record yourself reading 10 basic words. Mark which words still need teacher correction.'
          }
        ],
        keyPoints: ['Word reading is your transition bridge to Quran lines.', 'Consistency now unlocks practical reading stage.'],
        materials: ['Basic word list (100 words)'],
        quiz: {
          title: 'Word Formation Quiz',
          description: 'Confirm readiness for advanced symbols.',
          passingScore: 80,
          allowRetake: true,
          questions: [
            question('nq17-q1', 'What is the purpose of word formation practice?', ['Decoration', 'Transition to real reading', 'Only for writing', 'Not needed'], 'nq17-q1-option-2', 'Word reading bridges combinations to real Quran text.'),
            question('nq17-q2', 'Best next step after reading words correctly?', ['Stop practice', 'Move to Sukoon and Madd', 'Skip to advanced Tajweed', 'Ignore teacher'], 'nq17-q2-option-2', 'Sukoon and Madd are next in sequence.')
          ]
        }
      })
    ]
  },
  {
    id: 'noorani-sukoon-madd',
    title: 'Phase 4: Sukoon & Madd',
    description: 'Understand stopping and elongation to read Quranic words naturally.',
    icon: '📕',
    lessons: [
      lesson({
        id: 'noorani-18',
        sectionId: 'noorani-sukoon-madd',
        order: 1,
        title: 'Sukoon (ْ) Basics',
        description: 'Learn how Sukoon creates a stop/no-vowel letter sound.',
        estimatedMinutes: 22,
        objectives: ['Identify Sukoon symbol', 'Read closed syllables correctly', 'Avoid adding extra vowels'],
        blocks: [
          {
            type: 'text',
            title: 'What Sukoon Means',
            content: 'Sukoon removes the vowel from a letter, creating a stop/closed sound. Example: بْ is "b" not "ba".'
          },
          {
            type: 'letter-practice',
            title: 'Sukoon Drill',
            practiceItems: [
              { arabic: 'أَبْ', transliteration: 'ab' },
              { arabic: 'إِتْ', transliteration: 'it' },
              { arabic: 'أُمْ', transliteration: 'um' }
            ]
          }
        ],
        keyPoints: ['Sukoon means no short vowel.', 'Do not insert extra sounds after Sukoon.'],
        materials: ['Sukoon worksheet'],
        quiz: {
          title: 'Sukoon Basics Quiz',
          description: 'Test closed-syllable reading.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq18-q1', 'What does Sukoon indicate?', ['Long vowel', 'No vowel', 'Heavy letter', 'Nasal sound'], 'nq18-q1-option-2', 'Sukoon indicates absence of vowel.'),
            question('nq18-q2', 'How should بْ be read?', ['ba', 'bi', 'bu', 'b'], 'nq18-q2-option-4', 'With Sukoon, the letter is read without a vowel.')
          ]
        }
      }),
      lesson({
        id: 'noorani-19',
        sectionId: 'noorani-sukoon-madd',
        order: 2,
        title: 'Madd with Alif (ا)',
        description: 'Learn two-count elongation when Alif follows Fatha.',
        estimatedMinutes: 22,
        objectives: ['Recognize Madd Alif pattern', 'Apply correct two-beat elongation'],
        blocks: [
          {
            type: 'audio-letter',
            title: 'Madd Comparison: Wrong vs Correct',
            content: 'Compare short and elongated forms. Listen, then imitate with exact timing.',
            letters: [
              { letter: 'بَا', name: 'Baa', transliteration: 'baa (2 counts)', makhraj: 'Ba + Alif elongation' },
              { letter: 'تَا', name: 'Taa', transliteration: 'taa (2 counts)', makhraj: 'Ta + Alif elongation' }
            ],
            speedToggle: true
          }
        ],
        keyPoints: ['Madd Alif after Fatha extends the sound.', 'Count should be controlled, not random.'],
        materials: ['Madd timing guide'],
        quiz: {
          title: 'Madd Alif Quiz',
          description: 'Confirm elongation concept.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq19-q1', 'When does Madd Alif occur?', ['After Kasra', 'After Damma', 'After Fatha', 'After Sukoon'], 'nq19-q1-option-3', 'Madd Alif occurs when Alif follows Fatha.'),
            question('nq19-q2', 'Madd should be:', ['Random length', 'Too short always', 'Measured and consistent', 'Ignored'], 'nq19-q2-option-3', 'Measured timing ensures proper recitation.')
          ]
        }
      }),
      lesson({
        id: 'noorani-20',
        sectionId: 'noorani-sukoon-madd',
        order: 3,
        title: 'Madd with Waw (و) and Ya (ي)',
        description: 'Learn long "oo" and "ee" sounds with Madd letters.',
        estimatedMinutes: 24,
        objectives: ['Recognize Madd Waw/Ya patterns', 'Apply clean elongation'],
        blocks: [
          {
            type: 'letter-practice',
            title: 'Madd Waw/Ya Drill',
            practiceItems: [
              { arabic: 'قُولُ', transliteration: 'quu-lu' },
              { arabic: 'فِيلٌ', transliteration: 'fii-lun' },
              { arabic: 'نُورٌ', transliteration: 'nuu-run' }
            ]
          }
        ],
        keyPoints: ['Waw can create long oo.', 'Ya can create long ee.', 'Timing must stay balanced across words.'],
        materials: ['Madd Waw/Ya worksheet'],
        quiz: {
          title: 'Madd Waw/Ya Quiz',
          description: 'Strengthen Madd pattern recognition.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq20-q1', 'Which letter can produce long "ee"?', ['ا', 'و', 'ي', 'ب'], 'nq20-q1-option-3', 'Ya can produce long ee in proper context.'),
            question('nq20-q2', 'Balanced Madd means:', ['Same controlled count each time', 'Different random lengths', 'No elongation', 'Only teacher elongates'], 'nq20-q2-option-1', 'Consistency is key in Quran reading.')
          ]
        }
      }),
      lesson({
        id: 'noorani-21',
        sectionId: 'noorani-sukoon-madd',
        order: 4,
        title: 'Leen Letters and Soft Flow',
        description: 'Learn soft gliding sounds with Leen patterns.',
        estimatedMinutes: 22,
        objectives: ['Identify Leen contexts', 'Read softly with control'],
        blocks: [
          {
            type: 'text',
            title: 'Leen Concept',
            content: 'Leen occurs when و or ي is sakin after Fatha, producing a soft gliding sound.'
          },
          {
            type: 'letter-practice',
            title: 'Leen Examples',
            practiceItems: [
              { arabic: 'خَوْف', transliteration: 'khawf' },
              { arabic: 'بَيْت', transliteration: 'bayt' },
              { arabic: 'قَوْم', transliteration: 'qawm' }
            ]
          }
        ],
        keyPoints: ['Leen is soft, not forced.', 'Context determines sound behavior.'],
        materials: ['Leen examples list'],
        quiz: {
          title: 'Leen Quiz',
          description: 'Check understanding of gliding sounds.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq21-q1', 'Leen letters are usually:', ['ا and ب', 'و and ي', 'ن and م', 'ق and ك'], 'nq21-q1-option-2', 'Leen mainly involves waw and ya in specific contexts.'),
            question('nq21-q2', 'Leen pronunciation should feel:', ['Harsh and heavy', 'Soft and controlled', 'Silent', 'Very long always'], 'nq21-q2-option-2', 'Leen should be smooth and soft.')
          ]
        }
      }),
      lesson({
        id: 'noorani-22',
        sectionId: 'noorani-sukoon-madd',
        order: 5,
        title: 'Phase 4 Checkpoint: Sukoon & Madd Integration',
        description: 'Read mixed lines containing Sukoon and all Madd patterns.',
        estimatedMinutes: 28,
        objectives: ['Integrate Sukoon and Madd in one reading flow', 'Prepare for Tanween and Shaddah'],
        blocks: [
          {
            type: 'join-animation',
            title: 'Integrated Reading Lines',
            practiceItems: [
              { arabic: 'قَالَ رَبِّي', transliteration: 'qaa-la rab-bi' },
              { arabic: 'بَيْتٌ نُورٌ', transliteration: 'bay-tun nuu-run' },
              { arabic: 'أَمْرٌ كَبِيرٌ', transliteration: 'am-run ka-bii-run' }
            ]
          }
        ],
        keyPoints: ['Integration accuracy matters more than speed.', 'Pause and reset if rules collapse.'],
        materials: ['Phase 4 checkpoint sheet'],
        quiz: {
          title: 'Phase 4 Checkpoint Quiz',
          description: 'Assess integration readiness.',
          passingScore: 80,
          allowRetake: true,
          questions: [
            question('nq22-q1', 'What does Phase 4 integration test?', ['Only alphabet memory', 'Sukoon + Madd application in context', 'Writing style', 'History knowledge'], 'nq22-q1-option-2', 'This phase tests contextual application.'),
            question('nq22-q2', 'If errors increase, best action is:', ['Continue faster', 'Pause and correct', 'Skip hard lines', 'End session'], 'nq22-q2-option-2', 'Pausing and correcting preserves quality.')
          ]
        }
      })
    ]
  },
  {
    id: 'noorani-advanced',
    title: 'Phase 5: Tanween & Advanced Rules',
    description: 'Prepare for authentic Quran reading with Tanween, Shaddah, and Tajweed intro.',
    icon: '📒',
    lessons: [
      lesson({
        id: 'noorani-23',
        sectionId: 'noorani-advanced',
        order: 1,
        title: 'Tanween Fath, Kasr, Damm',
        description: 'Learn the double-vowel endings and their sounds.',
        estimatedMinutes: 24,
        objectives: ['Recognize all Tanween types', 'Pronounce noun endings clearly'],
        blocks: [
          {
            type: 'letter-practice',
            title: 'Tanween Drill',
            practiceItems: [
              { arabic: 'كِتَابٌ', transliteration: 'kitaabun' },
              { arabic: 'بَيْتٍ', transliteration: 'baytin' },
              { arabic: 'قَلَمًا', transliteration: 'qalaman' }
            ]
          }
        ],
        keyPoints: ['Tanween adds n-sound ending.', 'Keep ending clear and not swallowed.'],
        materials: ['Tanween worksheet'],
        quiz: {
          title: 'Tanween Quiz',
          description: 'Assess ending sound control.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq23-q1', 'Tanween usually adds what?', ['m sound', 'n sound', 'w sound', 'silent ending'], 'nq23-q1-option-2', 'Tanween introduces a terminal n sound.'),
            question('nq23-q2', 'How many common Tanween marks are taught?', ['1', '2', '3', '4'], 'nq23-q2-option-3', 'Fath, Kasr, and Damm Tanween are the three common forms.')
          ]
        }
      }),
      lesson({
        id: 'noorani-24',
        sectionId: 'noorani-advanced',
        order: 2,
        title: 'Shaddah (ّ) - Doubled Letter Sound',
        description: 'Learn how Shaddah doubles consonant emphasis.',
        estimatedMinutes: 24,
        objectives: ['Recognize Shaddah', 'Pronounce doubled letter with proper timing'],
        blocks: [
          {
            type: 'text',
            title: 'Shaddah Rule',
            content: 'Shaddah means the consonant is doubled. You hold the consonant moment briefly, then release with vowel.'
          },
          {
            type: 'letter-practice',
            title: 'Shaddah Practice',
            practiceItems: [
              { arabic: 'رَبِّ', transliteration: 'rab-bi' },
              { arabic: 'إِنَّ', transliteration: 'in-na' },
              { arabic: 'مُحَمَّد', transliteration: 'mu-ham-mad' }
            ]
          }
        ],
        keyPoints: ['Do not ignore Shaddah.', 'Timing is consonant emphasis then vowel release.'],
        materials: ['Shaddah timing drill'],
        quiz: {
          title: 'Shaddah Quiz',
          description: 'Check doubled-consonant reading.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq24-q1', 'What does Shaddah indicate?', ['Long vowel only', 'Doubled consonant', 'Silence', 'Heavy letter only'], 'nq24-q1-option-2', 'Shaddah marks consonant doubling.'),
            question('nq24-q2', 'In رَبِّ, the doubled sound is on:', ['ر', 'ب', 'none', 'vowel only'], 'nq24-q2-option-2', 'The shaddah is on ب.')
          ]
        }
      }),
      lesson({
        id: 'noorani-25',
        sectionId: 'noorani-advanced',
        order: 3,
        title: 'Tanween + Shaddah Combined Patterns',
        description: 'Read words and short lines combining both advanced markers.',
        estimatedMinutes: 25,
        objectives: ['Handle combined symbols in fluent reading', 'Maintain rule awareness under pressure'],
        blocks: [
          {
            type: 'join-animation',
            title: 'Combined Pattern Drill',
            practiceItems: [
              { arabic: 'غَفُورٌ رَّحِيمٌ', transliteration: 'gha-fuu-run ra-hee-mun' },
              { arabic: 'إِنَّ اللَّهَ', transliteration: 'in-nal-la-ha' },
              { arabic: 'عَلِيمٌ حَكِيمٌ', transliteration: 'ʿa-lee-mun ha-kee-mun' }
            ]
          }
        ],
        keyPoints: ['Complexity increases; keep rule-by-rule attention.', 'Teacher correction should be immediate and concise.'],
        materials: ['Advanced pattern lines'],
        quiz: {
          title: 'Combined Pattern Quiz',
          description: 'Assess integrated advanced symbol reading.',
          passingScore: 75,
          allowRetake: true,
          questions: [
            question('nq25-q1', 'When reading complex patterns, the best approach is:', ['Rush for speed', 'Rule-by-rule attention', 'Skip difficult words', 'Ignore endings'], 'nq25-q1-option-2', 'Rule-aware reading prevents compound mistakes.'),
            question('nq25-q2', 'Immediate teacher correction helps by:', ['Interrupting progress', 'Preventing repeated errors', 'Reducing confidence always', 'Replacing student practice'], 'nq25-q2-option-2', 'Immediate correction prevents error reinforcement.')
          ]
        }
      }),
      lesson({
        id: 'noorani-26',
        sectionId: 'noorani-advanced',
        order: 4,
        title: 'Basic Tajweed Intro for Beginners',
        description: 'Simple introduction to core recitation etiquette and common rules.',
        estimatedMinutes: 26,
        objectives: ['Understand why Tajweed matters', 'Recognize beginner-level Tajweed cues'],
        blocks: [
          {
            type: 'list',
            title: 'Beginner Tajweed Focus',
            items: [
              'Correct Makharij is non-negotiable',
              'Length control in Madd',
              'Respecting stops and starts',
              'Avoiding letter substitution errors'
            ]
          },
          {
            type: 'callout',
            title: 'Not Perfection - Direction',
            content: 'At Noorani level, aim for strong foundations and disciplined correction, not advanced Tajweed mastery yet.'
          }
        ],
        keyPoints: ['Tajweed starts with clean basics.', 'Noorani is the launchpad for deeper Tajweed studies.'],
        materials: ['Beginner Tajweed quick guide'],
        quiz: {
          title: 'Tajweed Intro Quiz',
          description: 'Ensure conceptual understanding.',
          passingScore: 70,
          allowRetake: true,
          questions: [
            question('nq26-q1', 'Tajweed at this stage focuses mainly on:', ['Advanced Qiraat only', 'Correct basic pronunciation and flow', 'Calligraphy', 'Memorization speed'], 'nq26-q1-option-2', 'Foundational pronunciation and flow are key now.'),
            question('nq26-q2', 'Noorani course prepares students for:', ['No more learning needed', 'Further Tajweed and Quran reading', 'Only writing Arabic', 'Exam without practice'], 'nq26-q2-option-2', 'Noorani is foundational for next recitation stages.')
          ]
        }
      }),
      lesson({
        id: 'noorani-27',
        sectionId: 'noorani-advanced',
        order: 5,
        title: 'Phase 5 Checkpoint: Advanced Symbol Fluency',
        description: 'Assess readiness to read Quranic surahs with all learned symbols.',
        estimatedMinutes: 28,
        objectives: ['Consolidate Tanween/Shaddah/Sukoon/Madd', 'Prepare for practical Quran reading'],
        blocks: [
          {
            type: 'list',
            title: 'Readiness Checklist',
            items: [
              'Reads Tanween endings clearly',
              'Applies Shaddah timing correctly',
              'Controls Madd lengths consistently',
              'Handles mixed symbols without collapse'
            ]
          }
        ],
        keyPoints: ['This checkpoint ensures safe transition to real Quran lines.', 'Correction now saves months later.'],
        materials: ['Phase 5 checkpoint packet'],
        quiz: {
          title: 'Phase 5 Checkpoint Quiz',
          description: 'Final theoretical checkpoint before practical Quran reading.',
          passingScore: 80,
          allowRetake: true,
          questions: [
            question('nq27-q1', 'Why is Phase 5 checkpoint important?', ['To delay students', 'To ensure practical reading readiness', 'To reduce teacher role', 'For attendance only'], 'nq27-q1-option-2', 'It confirms readiness for real Quran passages.'),
            question('nq27-q2', 'If mixed-symbol reading is unstable, student should:', ['Skip to surah reading anyway', 'Review and correct before moving', 'Stop course permanently', 'Ignore teacher feedback'], 'nq27-q2-option-2', 'Review before progression preserves quality.')
          ]
        }
      })
    ]
  },
  {
    id: 'noorani-quran-transition',
    title: 'Phase 6: Practical Quran Reading',
    description: 'Transition from Noorani drills to real Mushaf reading with short Surahs and teacher correction.',
    icon: '📓',
    lessons: [
      lesson({
        id: 'noorani-28',
        sectionId: 'noorani-quran-transition',
        order: 1,
        title: 'Surah Al-Fatiha Guided Reading',
        description: 'Apply all fundamentals in the opening chapter of the Quran.',
        estimatedMinutes: 30,
        objectives: ['Read Al-Fatiha with guidance', 'Apply vowels, Madd, and Shaddah correctly'],
        blocks: [
          {
            type: 'text',
            title: 'Guided Surah Practice',
            content: 'Read ayah by ayah, record each ayah, receive correction, and repeat until clear.'
          },
          {
            type: 'case-study',
            title: 'Common Al-Fatiha Errors',
            items: [
              'Dropping Shaddah in "الرَّحْمَٰنِ"',
              'Weak heavy letter quality in "الصِّرَاطَ"',
              'Inconsistent Madd timing'
            ]
          }
        ],
        keyPoints: ['Al-Fatiha quality is central for daily prayer.', 'Precision is more important than speed.'],
        materials: ['Al-Fatiha annotated sheet', 'Teacher correction script'],
        quiz: {
          title: 'Al-Fatiha Rules Quiz',
          description: 'Check rule awareness inside practical recitation.',
          passingScore: 75,
          allowRetake: true,
          questions: [
            question('nq28-q1', 'In practical surah reading, what comes first?', ['Speed', 'Rule accuracy', 'Memorization only', 'Volume'], 'nq28-q1-option-2', 'Rule accuracy ensures valid recitation quality.'),
            question('nq28-q2', 'How should corrections be handled?', ['Ignored', 'Applied immediately with repeat', 'Saved for end of month', 'Only written'], 'nq28-q2-option-2', 'Immediate repeat correction builds strong habits.')
          ]
        }
      }),
      lesson({
        id: 'noorani-29',
        sectionId: 'noorani-quran-transition',
        order: 2,
        title: 'Surah Al-Ikhlas Practice',
        description: 'Practice concise surah recitation with confidence and clean articulation.',
        estimatedMinutes: 28,
        objectives: ['Recite Al-Ikhlas with confidence', 'Strengthen stop/start discipline'],
        blocks: [
          {
            type: 'text',
            title: 'Ayah-by-Ayah Method',
            content: 'Each ayah: listen once, repeat three times, record once, compare, correct.'
          }
        ],
        keyPoints: ['Short surahs are ideal for confidence building.', 'Structured repetition creates mastery.'],
        materials: ['Al-Ikhlas correction checklist'],
        quiz: {
          title: 'Al-Ikhlas Practice Quiz',
          description: 'Confirm practical process discipline.',
          passingScore: 75,
          allowRetake: true,
          questions: [
            question('nq29-q1', 'How many repeats are recommended before recording?', ['1', '2', '3', '10'], 'nq29-q1-option-3', 'Three guided repeats improve accuracy before recording.'),
            question('nq29-q2', 'Short surahs help mostly with:', ['Skipping basics', 'Confidence and consistency', 'Ignoring rules', 'Only memorization'], 'nq29-q2-option-2', 'They are excellent for confidence and controlled improvement.')
          ]
        }
      }),
      lesson({
        id: 'noorani-30',
        sectionId: 'noorani-quran-transition',
        order: 3,
        title: 'Surah Al-Falaq Practice',
        description: 'Continue practical reading with careful handling of ending sounds and symbols.',
        estimatedMinutes: 28,
        objectives: ['Improve flow in practical surah recitation', 'Handle endings and stops accurately'],
        blocks: [
          {
            type: 'case-study',
            title: 'Typical Errors in Al-Falaq',
            items: [
              'Rushed endings with Tanween',
              'Weak articulation in throat letters',
              'Inconsistent stop control'
            ]
          }
        ],
        keyPoints: ['Endings need full clarity.', 'Practical reading tests all previous phases together.'],
        materials: ['Al-Falaq feedback sheet'],
        quiz: {
          title: 'Al-Falaq Practice Quiz',
          description: 'Check error-awareness skills.',
          passingScore: 75,
          allowRetake: true,
          questions: [
            question('nq30-q1', 'Which area is often rushed in surah reading?', ['Middle letters only', 'Word endings', 'Title only', 'Nothing'], 'nq30-q1-option-2', 'Word endings are commonly rushed by beginners.'),
            question('nq30-q2', 'Practical reading primarily measures:', ['Memory only', 'Integrated application of rules', 'Writing speed', 'Translation'], 'nq30-q2-option-2', 'It tests integrated application of all learned rules.')
          ]
        }
      }),
      lesson({
        id: 'noorani-31',
        sectionId: 'noorani-quran-transition',
        order: 4,
        title: 'Surah An-Nas + Real Mushaf Transition',
        description: 'Bridge from guided sheets to reading directly from Mushaf pages.',
        estimatedMinutes: 30,
        objectives: ['Read An-Nas confidently', 'Start reading real Mushaf line by line'],
        blocks: [
          {
            type: 'callout',
            title: 'Mushaf Transition Rule',
            content: 'Start with short selected lines from Mushaf, maintain same correction process, and do not increase speed prematurely.'
          },
          {
            type: 'list',
            title: 'Transition Steps',
            items: [
              'Read one Mushaf line slowly',
              'Record and review',
              'Get correction',
              'Repeat until clean',
              'Move to next line'
            ]
          }
        ],
        keyPoints: ['Mushaf reading is the real transition goal.', 'Method stays the same; source text changes.'],
        materials: ['Mushaf transition tracker'],
        quiz: {
          title: 'Mushaf Transition Quiz',
          description: 'Confirm transition readiness mindset.',
          passingScore: 80,
          allowRetake: true,
          questions: [
            question('nq31-q1', 'What should remain unchanged during Mushaf transition?', ['Correction method', 'Only speed', 'Only schedule', 'Nothing'], 'nq31-q1-option-1', 'The correction loop remains identical.'),
            question('nq31-q2', 'Best pacing strategy in Mushaf transition is:', ['Fast jump to long passages', 'Slow line-by-line progression', 'No practice', 'Reading silently'], 'nq31-q2-option-2', 'Slow progression prevents collapse in quality.')
          ]
        }
      }),
      lesson({
        id: 'noorani-32',
        sectionId: 'noorani-quran-transition',
        order: 5,
        title: 'Final Assessment + Graduation Plan',
        description: 'Complete final evaluation and receive next-step plan for Tajweed and Quran study.',
        estimatedMinutes: 35,
        objectives: ['Demonstrate end-to-end reading readiness', 'Receive personalized continuation path'],
        blocks: [
          {
            type: 'list',
            title: 'Final Assessment Components',
            items: [
              'Alphabet and Makhraj spot-check',
              'Harakaat and symbol application',
              'Surah recitation sample',
              'Mushaf line reading',
              'Teacher feedback summary'
            ]
          },
          {
            type: 'reflection',
            title: 'Post-Noorani Plan',
            content: 'Choose your next path: Quran with Tajweed, Hifz, or combined reading + memorization track.'
          }
        ],
        keyPoints: ['Graduation means readiness for Quran reading progression.', 'Continue daily practice to preserve gains.'],
        materials: ['Final assessment rubric', 'Graduation certificate template', 'Next 90-day study plan'],
        quiz: {
          title: 'Final Noorani Completion Quiz',
          description: 'Course completion confirmation.',
          passingScore: 85,
          allowRetake: true,
          questions: [
            question('nq32-q1', 'Main graduation outcome of this course is:', ['Perfect advanced Tajweed', 'Foundational Quran reading readiness', 'Memorizing entire Quran', 'Arabic writing mastery'], 'nq32-q1-option-2', 'This course builds strong foundational reading readiness.'),
            question('nq32-q2', 'Best next step after Noorani completion:', ['Stop learning', 'Continue to Tajweed/Quran tracks', 'Only repeat alphabet forever', 'Ignore teacher guidance'], 'nq32-q2-option-2', 'Structured continuation is the intended path.')
          ]
        }
      })
    ]
  }
];

const lessonMetrics: CourseModuleLessonMetric[] = sections
  .flatMap((section) => section.lessons)
  .map((lessonItem, index) => ({
    lessonId: lessonItem.id,
    studentCount: 42 + ((index * 3) % 28),
    completionRate: 58 + ((index * 7) % 33),
    averageScore: 72 + ((index * 5) % 17),
    updatedLabel: `Week ${Math.floor(index / 4) + 1}`
  }));

const averageCompletion = Math.round(lessonMetrics.reduce((sum, item) => sum + item.completionRate, 0) / lessonMetrics.length);
const averageScore = Math.round(lessonMetrics.reduce((sum, item) => sum + item.averageScore, 0) / lessonMetrics.length);

export const nooraniQaidaCourseData: DedicatedCourseModule = applyCourseModuleCompleteness({
  metadata: courseMetadata,
  publicRoute: '/courses/noorani-qaida',
  studentRoute: '/student/noorani-qaida-player',
  adminRoute: '/admin/courses/noorani',
  heroBadge: 'Guided Daily Noorani System',
  heroHeadline: 'Learn to read Quran confidently with a personal teacher-like daily guidance path.',
  heroSummary: 'This professional Noorani Qaida program combines structured daily learning, interactive practice, voice recording, teacher correction workflows, AI support, and milestone tracking. Students progress from letters to real Quran reading through a disciplined and measurable 6-phase journey.',
  estimatedHours: 24,
  sections,
  features: [
    { icon: '📅', title: 'Daily Structured Journey', description: 'Every lesson follows a proven routine: learn, listen, record, correct, and track progress.' },
    { icon: '🎤', title: 'Voice Practice Workflow', description: 'Built-in recording and recitation practice make correction immediate and measurable.' },
    { icon: '🧭', title: 'Step-by-Step Phases', description: 'Students move from letters to practical Quran reading with no random jumps.' },
    { icon: '🧠', title: 'Smart Progress Tracking', description: 'Weak letter detection, quiz trends, and correction history keep learning focused.' },
    { icon: '👨‍🏫', title: 'Teacher Accountability', description: 'Every phase includes review checkpoints and clear teaching scripts.' },
    { icon: '🎯', title: 'Quran Transition Ready', description: 'Final phase trains students on short surahs and real Mushaf reading.' }
  ],
  benefits: [
    { icon: '🛡️', title: 'No Guesswork Learning', description: 'Students never wonder what to do next; each day has a clear path.', tone: 'emerald' },
    { icon: '🔁', title: 'Correction-Centered Method', description: 'Listen, repeat, correct, and repeat again until pronunciation is stable.', tone: 'blue' },
    { icon: '📈', title: 'Measurable Improvement', description: 'Progress bars, checkpoints, and quizzes make growth visible for student and parent.', tone: 'amber' },
    { icon: '🌙', title: 'Real Quran Readiness', description: 'Graduates leave ready for Tajweed courses, Hifz tracks, or direct Quran reading.', tone: 'violet' }
  ],
  staff: [
    {
      id: 'nq-staff-1',
      name: 'Noorani Foundations Faculty',
      role: 'Alphabet and Makharij Specialist',
      bio: 'Leads beginner students through articulation, letter precision, and confidence-building drills.',
      qualification: courseMetadata.teacherInfo.qualification,
      experience: courseMetadata.teacherInfo.experience,
      languages: courseMetadata.teacherInfo.languages,
      focus: 'Letter recognition, pronunciation correction, and foundational fluency.'
    },
    {
      id: 'nq-staff-2',
      name: 'Recitation Correction Mentor',
      role: 'Voice Feedback and Daily Accountability',
      bio: 'Reviews student recordings and provides concise corrective feedback with repeat tasks.',
      qualification: 'Quran recitation coaching and corrective pronunciation training',
      experience: '6+ years of one-on-one beginner correction coaching',
      languages: ['Arabic', 'English', 'Urdu'],
      focus: 'Error detection, correction loops, and pronunciation confidence.'
    },
    {
      id: 'nq-staff-3',
      name: 'Quran Transition Coach',
      role: 'Surah Reading and Mushaf Bridge',
      bio: 'Guides students from Noorani pages into short surah recitation and real Mushaf reading routines.',
      qualification: 'Practical Quran-reading curriculum specialist',
      experience: 'Student transition coaching from Qaida to Quran',
      languages: ['Arabic', 'Urdu', 'English', 'Dari'],
      focus: 'Practical application, surah confidence, and next-stage planning.'
    }
  ],
  resourceHighlights: [
    { title: 'Interactive Noorani Workbook', description: 'Phase-based pages with checkpoints and home practice prompts.', type: 'Workbook' },
    { title: 'Teacher Script Pack', description: 'Standardized correction scripts and live-session flow guidance.', type: 'Teaching Script' },
    { title: 'Voice Practice Checklist', description: 'Daily submission and correction tracker for students and teachers.', type: 'Practice Tracker' }
  ],
  milestoneBadges: [
    { threshold: 3, name: 'First Letters Complete', description: 'Completed early alphabet and method setup lessons.', icon: '🔤' },
    { threshold: 8, name: 'Harakaat Master', description: 'Demonstrated stable short-vowel reading.', icon: '📗' },
    { threshold: 14, name: 'Word Builder', description: 'Can read joined letters and beginner words.', icon: '🔗' },
    { threshold: 22, name: 'Rule Integrator', description: 'Applied Sukoon, Madd, and advanced symbols correctly.', icon: '📒' },
    { threshold: 32, name: 'Qaida Graduate', description: 'Completed practical surah reading and Mushaf transition.', icon: '🎓' }
  ],
  adminStats: {
    totalEnrollments: 168,
    activeStudents: 104,
    completionRate: averageCompletion,
    averageScore
  },
  lessonMetrics,
  enrollmentCta: 'Enroll in Noorani Qaida'
});