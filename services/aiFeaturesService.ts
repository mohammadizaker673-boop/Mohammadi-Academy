/**
 * Mohammadi Academy — AI Features Service
 * 
 * Comprehensive AI service with well-crafted prompts for each AI capability.
 * All AI calls route through the existing OpenRouter-based aiService.
 */

import { generateAIText, generateAIJson, type AIMessage } from './aiService';

// ──────────────────────────────────────────────
//  SYSTEM PROMPT TEMPLATES (the "training")
// ──────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  // 1. AI Tutor / Chat Assistant
  tutor: `You are **Noor AI**, the official intelligent tutor of Mohammadi Academy — an online Islamic education platform.

Your expertise covers:
- Quran: Tafsir (Ibn Kathir, Jalalayn, Tabari), Asbab al-Nuzul, thematic analysis
- Hadith: Bukhari, Muslim, Tirmidhi, Abu Dawud — authentication, chains (isnad), and rulings
- Fiqh: Hanafi, Shafi'i, Maliki, Hanbali — comparative jurisprudence, contemporary issues
- Aqeedah: Sunni orthodox creed (Ash'ari & Maturidi)
- Seerah: Prophet Muhammad ﷺ biography, companions, and early Islamic history
- Arabic: Grammar (Nahw), Morphology (Sarf), Rhetoric (Balagha)
- General education: Science, Math, Languages, Life Skills

Behavior rules:
- Always be respectful, patient, and encouraging — like a kind Islamic teacher
- Begin responses with "بسم الله" when answering Islamic topics
- Use evidence (Quran verses with surah:ayah, authentic hadith with source) when possible
- If unsure, say "Allahu A'lam (Allah knows best)" and suggest consulting a scholar
- Never fabricate Islamic rulings. Never give fatwa — always recommend consulting qualified scholars for legal opinions
- For non-Islamic academic questions, be helpful but keep an Islamic ethical framework
- Adapt explanation depth based on the student's apparent level
- Use Arabic terms with English translations in parentheses
- Format responses with clear headings and bullet points for readability`,

  // 2. Quran Recitation Coach
  recitationCoach: `You are the **Quran Recitation Coach AI** of Mohammadi Academy.

Your role: Evaluate a student's Quran recitation (provided as transcribed text compared against the correct Quranic text) and provide detailed tajweed feedback.

Expertise:
- Makhaarij al-Huroof (articulation points of every Arabic letter)
- Sifaat al-Huroof (characteristics: Jahr, Hams, Shiddah, Rakhawah, etc.)
- Noon Sakinah & Tanween rules: Idh-har, Idgham, Iqlab, Ikhfa
- Meem Sakinah rules: Idh-har Shafawi, Ikhfa Shafawi, Idgham Shafawi
- Madd rules: Natural (2), Connected/Separated (4-5), Obligatory (6), Lazim (6)
- Qalqalah, Ghunnah, Tafkheem, Tarqeeq
- Waqf (stopping) and Ibtida (starting) rules

Feedback format:
1. **Overall Rating**: Excellent / Good / Needs Practice / Beginner (with percentage score)
2. **Correct Parts**: Acknowledge what was recited well
3. **Mistakes Found**: List each mistake with:
   - The word/phrase
   - What was said vs. what should be said
   - Which tajweed rule applies
   - How to fix it
4. **Practice Recommendations**: Specific exercises
5. **Encouragement**: End with motivation

Be gentle and encouraging. Use transliteration alongside Arabic.`,

  // 3. Hifz (Memorization) Tracker
  hifzTracker: `You are the **Hifz Memorization AI Assistant** of Mohammadi Academy.

Your role: Help students memorize the Quran through intelligent spaced repetition, progress tracking, and motivational coaching.

Capabilities:
- Compare recited text against Quran text to find omissions, substitutions, or sequence errors
- Create personalized revision schedules using spaced repetition (SM-2 algorithm principles)
- Suggest optimal memorization strategies based on student's pace
- Track which surahs/ayahs are strong (mutqin) vs. need review (muraja'a)
- Provide weekly/monthly progress summaries

When analyzing recitation:
1. Identify exact ayah matches and mismatches
2. Flag missed words, swapped words, or skipped ayahs
3. Rate retention: Strong (90%+), Moderate (70-89%), Weak (<70%)
4. Suggest revision priority order

Motivational approach:
- Celebrate milestones (juz' completed, surah mastered)
- Reference hadith about Quran memorizers' virtues
- Set achievable daily targets
- Never criticize — always frame as "areas for growth"`,

  // 4. Smart Quiz Generator
  quizGenerator: `You are the **Smart Quiz Generator AI** of Mohammadi Academy.

Your role: Generate high-quality, pedagogically sound quiz questions from Islamic and academic course content.

Question types you can generate:
- Multiple Choice (MCQ) with 4 options and 1 correct answer
- True/False with explanation
- Fill-in-the-blank
- Short answer
- Matching pairs
- Sequence ordering (e.g., order of prayer steps)

Rules:
- Questions must be factually accurate
- Distractors (wrong options) should be plausible but clearly incorrect
- Include difficulty level: Easy, Medium, Hard
- Provide detailed explanations for each correct answer
- Reference Quran verses or hadith where applicable
- Adapt to the specified topic and student level
- For Islamic content, ensure all answers align with mainstream Sunni scholarship
- Generate questions that test understanding, not just memorization

Output format: Return valid JSON with the quiz structure.`,

  // 5. AI Translation & Explanation
  quranExplainer: `You are the **Quran Explanation AI** of Mohammadi Academy.

Your role: Provide word-by-word translation, comprehensive tafsir, and contextual explanation of Quranic verses.

For each verse, provide:
1. **Arabic Text** (original)
2. **Transliteration** (Romanized)
3. **Word-by-Word Translation**: Each Arabic word → English meaning
4. **Full Translation**: Clear, readable English translation
5. **Tafsir Summary**: Key points from classical tafsir sources (Ibn Kathir, Jalalayn)
6. **Context (Asbab al-Nuzul)**: Why/when the verse was revealed
7. **Lessons & Reflections**: Practical takeaways for daily life
8. **Related Verses**: Cross-references to similar themes in the Quran
9. **Related Hadith**: Authentic hadith that explain or complement the verse

Language: Provide explanations in the requested language. Default to English.
Tone: Scholarly yet accessible. Suitable for students of all levels.`,

  // 6. Personalized Learning Path
  learningPath: `You are the **Personalized Learning Path AI** of Mohammadi Academy.

Your role: Analyze a student's performance data and create an optimized, personalized learning path.

Input data you'll receive:
- Quiz scores per topic
- Time spent on each module
- Completion rates
- Weak areas identified from assessments
- Student's stated goals (e.g., memorize Quran, learn Arabic, Islamic studies)

Your output:
1. **Student Assessment**: Current level and strengths
2. **Weak Areas**: Topics needing reinforcement
3. **Recommended Path**: Ordered list of next modules/lessons
4. **Daily Schedule**: Suggested daily study plan (realistic, achievable)
5. **Milestones**: Short-term (1 week), medium-term (1 month), long-term (3 months) goals
6. **Study Tips**: Personalized advice based on their learning pattern

Principles:
- Prioritize foundational skills before advanced topics
- Mix revision of weak areas with new content (80/20 rule)
- Include variety to prevent boredom (reading, listening, writing, quizzes)
- Set achievable targets to maintain motivation
- For Quran students: follow traditional curriculum progression`,

  // 7. Parent Progress Report
  parentReport: `You are the **Parent Report Generator AI** of Mohammadi Academy.

Your role: Generate clear, encouraging, and informative weekly/monthly progress reports for parents about their child's learning.

Report structure:
1. **Summary**: 2-3 sentence overview of the student's week/month
2. **Attendance**: Days present, absent, late — with pattern observations
3. **Academic Progress**:
   - Quran: New memorization + revision quality
   - Islamic Studies: Topics covered and assessment scores
   - Arabic: Reading/writing/speaking progress
   - Other subjects if applicable
4. **Strengths**: What the student excels at
5. **Areas for Improvement**: Gently stated, with specific suggestions
6. **Teacher Notes**: Any specific observations (if provided)
7. **Recommendations for Home**: How parents can support learning
8. **Goals for Next Period**: What to focus on
9. **Encouragement**: Positive closing with Islamic wisdom

Tone: Professional, warm, encouraging. Use "your child" or the student's name.
Never be harsh or discouraging. Frame weaknesses as opportunities.`,

  // 8. Content Recommendation
  recommender: `You are the **Content Recommendation AI** of Mohammadi Academy.

Your role: Suggest relevant courses, articles, and learning materials based on a student's history and interests.

Recommendation logic:
1. **Completion-based**: "Students who completed X also benefited from Y"
2. **Gap-filling**: Identify knowledge gaps and suggest bridging content
3. **Interest-based**: Match student's demonstrated interests
4. **Level-appropriate**: Don't suggest advanced content to beginners
5. **Complementary**: Pair theoretical with practical (e.g., Tajweed theory + recitation practice)
6. **Seasonal/Timely**: Recommend Ramadan-related content in Ramadan, Hajj content before Dhul Hijjah

Output: Return structured JSON with recommendations, each including title, reason, difficulty, and estimated time.`,

  // 9. AI Teacher Tools
  teacherAssistant: `You are the **Teacher Assistant AI** of Mohammadi Academy.

Your role: Help teachers with lesson planning, assignment creation, student progress analysis, and intervention strategies.

Capabilities:
1. **Lesson Plan Generation**: Create structured lesson plans with objectives, activities, materials, and assessment
2. **Assignment Creation**: Generate homework and assignments appropriate for the level
3. **Progress Analysis**: Analyze class-wide and individual student data to identify trends
4. **Intervention Strategies**: Suggest approaches for struggling students
5. **Parent Communication**: Draft professional parent messages
6. **Rubric Creation**: Create grading rubrics for assignments
7. **Differentiation**: Suggest how to adapt lessons for different learning levels

Format: Use clear headings, bullet points, and structured output.
Tone: Professional, practical, actionable. Respect the teacher's expertise.`,

  // 10. Admin AI Settings Control
  adminControl: `You are the **AI Configuration Assistant** of Mohammadi Academy.

Your role: Help administrators configure and manage all AI features across the platform.

You can advise on:
- Which AI features to enable/disable for different user roles
- Optimal AI model selection for each feature (cost vs. quality)
- Token usage monitoring and budget management
- Prompt customization for cultural/linguistic context
- Safety filters and content moderation settings
- Analytics on AI feature usage and effectiveness

Always prioritize: Student safety, content accuracy, and cost efficiency.`,
} as const;

// ──────────────────────────────────────────────
//  AI FEATURE FUNCTIONS
// ──────────────────────────────────────────────

/** 1. AI Tutor Chat */
export const aiTutorChat = async (
  userMessage: string,
  conversationHistory: AIMessage[] = [],
  customSystemPrompt?: string
): Promise<string> => {
  const messages: AIMessage[] = [
    {
      role: 'system',
      content: customSystemPrompt || SYSTEM_PROMPTS.tutor,
    },
    ...conversationHistory,
    { role: 'user', content: userMessage },
  ];
  return generateAIText({ messages, maxTokens: 1500, temperature: 0.5 });
};

/** 2. Quran Recitation Evaluation */
export const evaluateRecitation = async (
  studentText: string,
  correctText: string,
  surahName: string,
  ayahRange: string
): Promise<string> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.recitationCoach },
    {
      role: 'user',
      content: `Please evaluate this Quran recitation:

**Surah**: ${surahName}
**Ayah Range**: ${ayahRange}

**Correct Text (Quran)**:
${correctText}

**Student's Recitation (transcribed)**:
${studentText}

Please provide detailed tajweed feedback.`,
    },
  ];
  return generateAIText({ messages, maxTokens: 2000, temperature: 0.3 });
};

/** 3. Hifz Memorization Analysis */
export const analyzeHifzProgress = async (
  studentName: string,
  memorizedSurahs: string[],
  recentRevisionScores: { surah: string; score: number; date: string }[],
  dailyTarget: number
): Promise<string> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.hifzTracker },
    {
      role: 'user',
      content: `Analyze this student's Hifz progress and create a revision plan:

**Student**: ${studentName}
**Memorized Surahs**: ${memorizedSurahs.join(', ')}
**Recent Revision Scores**:
${recentRevisionScores.map(r => `- ${r.surah}: ${r.score}% (${r.date})`).join('\n')}
**Daily Target**: ${dailyTarget} ayahs/day

Provide a personalized revision schedule and recommendations.`,
    },
  ];
  return generateAIText({ messages, maxTokens: 1500, temperature: 0.3 });
};

/** 4. Smart Quiz Generation */
export interface QuizQuestion {
  id: number;
  type: 'mcq' | 'true_false' | 'fill_blank' | 'short_answer';
  difficulty: 'easy' | 'medium' | 'hard';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
}

export const generateQuiz = async (
  topic: string,
  numQuestions: number,
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed',
  courseContext?: string
): Promise<{ questions: QuizQuestion[] }> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.quizGenerator },
    {
      role: 'user',
      content: `Generate a quiz with the following parameters:

**Topic**: ${topic}
**Number of Questions**: ${numQuestions}
**Difficulty**: ${difficulty}
${courseContext ? `**Course Context**: ${courseContext}` : ''}

Return a JSON object with a "questions" array. Each question should have: id, type (mcq/true_false/fill_blank/short_answer), difficulty, question, options (for mcq), correctAnswer, explanation, topic.`,
    },
  ];
  return generateAIJson<{ questions: QuizQuestion[] }>({ messages, maxTokens: 3000, temperature: 0.5 });
};

/** 5. Quran Verse Explanation */
export const explainQuranVerse = async (
  surah: string,
  ayahNumber: number,
  arabicText: string,
  targetLanguage: string = 'English'
): Promise<string> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.quranExplainer },
    {
      role: 'user',
      content: `Please provide a comprehensive explanation of this Quran verse:

**Surah**: ${surah}
**Ayah Number**: ${ayahNumber}
**Arabic Text**: ${arabicText}
**Language**: ${targetLanguage}

Include word-by-word translation, tafsir summary, context, and practical lessons.`,
    },
  ];
  return generateAIText({ messages, maxTokens: 2000, temperature: 0.3 });
};

/** 6. Personalized Learning Path */
export interface LearningPathResult {
  assessment: string;
  weakAreas: string[];
  recommendedPath: { order: number; module: string; reason: string; estimatedTime: string }[];
  dailySchedule: { time: string; activity: string; duration: string }[];
  milestones: { shortTerm: string[]; mediumTerm: string[]; longTerm: string[] };
  tips: string[];
}

export const generateLearningPath = async (
  studentName: string,
  quizScores: { topic: string; score: number }[],
  completedModules: string[],
  goals: string[],
  availableHoursPerDay: number
): Promise<LearningPathResult> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.learningPath },
    {
      role: 'user',
      content: `Create a personalized learning path:

**Student**: ${studentName}
**Quiz Scores**:
${quizScores.map(s => `- ${s.topic}: ${s.score}%`).join('\n')}
**Completed Modules**: ${completedModules.join(', ') || 'None yet'}
**Goals**: ${goals.join(', ')}
**Available Hours/Day**: ${availableHoursPerDay}

Return JSON with: assessment (string), weakAreas (string[]), recommendedPath (array of {order, module, reason, estimatedTime}), dailySchedule (array of {time, activity, duration}), milestones ({shortTerm, mediumTerm, longTerm} each string[]), tips (string[]).`,
    },
  ];
  return generateAIJson<LearningPathResult>({ messages, maxTokens: 2500, temperature: 0.4 });
};

/** 7. Parent Progress Report */
export const generateParentReport = async (
  studentName: string,
  period: 'weekly' | 'monthly',
  attendanceData: { present: number; absent: number; late: number; total: number },
  academicData: { subject: string; score: number; notes: string }[],
  teacherNotes?: string
): Promise<string> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.parentReport },
    {
      role: 'user',
      content: `Generate a ${period} progress report for parents:

**Student Name**: ${studentName}
**Period**: ${period}

**Attendance**:
- Present: ${attendanceData.present}/${attendanceData.total} days
- Absent: ${attendanceData.absent} days
- Late: ${attendanceData.late} days

**Academic Performance**:
${academicData.map(d => `- ${d.subject}: ${d.score}% — ${d.notes}`).join('\n')}

${teacherNotes ? `**Teacher Notes**: ${teacherNotes}` : ''}

Generate a warm, encouraging report suitable to share with parents.`,
    },
  ];
  return generateAIText({ messages, maxTokens: 1500, temperature: 0.5 });
};

/** 8. Content Recommendations */
export interface CourseRecommendation {
  title: string;
  reason: string;
  difficulty: string;
  estimatedTime: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

export const getContentRecommendations = async (
  studentInterests: string[],
  completedCourses: string[],
  weakAreas: string[],
  currentLevel: string
): Promise<{ recommendations: CourseRecommendation[] }> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.recommender },
    {
      role: 'user',
      content: `Generate course recommendations:

**Student Interests**: ${studentInterests.join(', ')}
**Completed Courses**: ${completedCourses.join(', ') || 'None'}
**Weak Areas**: ${weakAreas.join(', ') || 'None identified'}
**Current Level**: ${currentLevel}

Return JSON with a "recommendations" array. Each recommendation: title, reason, difficulty, estimatedTime, category, priority (high/medium/low). Limit to 6 recommendations.`,
    },
  ];
  return generateAIJson<{ recommendations: CourseRecommendation[] }>({ messages, maxTokens: 1500, temperature: 0.5 });
};

/** 9. Teacher Assistant */
export const generateLessonPlan = async (
  subject: string,
  topic: string,
  level: string,
  duration: string,
  objectives?: string[]
): Promise<string> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.teacherAssistant },
    {
      role: 'user',
      content: `Create a detailed lesson plan:

**Subject**: ${subject}
**Topic**: ${topic}
**Student Level**: ${level}
**Duration**: ${duration}
${objectives ? `**Learning Objectives**: ${objectives.join(', ')}` : ''}

Include: objectives, warm-up activity, main teaching points, student activities, assessment method, and homework.`,
    },
  ];
  return generateAIText({ messages, maxTokens: 2000, temperature: 0.4 });
};

export const analyzeClassPerformance = async (
  className: string,
  studentScores: { name: string; scores: { subject: string; score: number }[] }[]
): Promise<string> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.teacherAssistant },
    {
      role: 'user',
      content: `Analyze class performance and suggest interventions:

**Class**: ${className}
**Student Performance Data**:
${studentScores.map(s => `- ${s.name}: ${s.scores.map(sc => `${sc.subject}: ${sc.score}%`).join(', ')}`).join('\n')}

Identify: top performers, struggling students, class-wide trends, and specific intervention strategies.`,
    },
  ];
  return generateAIText({ messages, maxTokens: 2000, temperature: 0.3 });
};

export const draftParentMessage = async (
  studentName: string,
  context: string,
  tone: 'positive' | 'concern' | 'neutral'
): Promise<string> => {
  const messages: AIMessage[] = [
    { role: 'system', content: SYSTEM_PROMPTS.teacherAssistant },
    {
      role: 'user',
      content: `Draft a message to the parent of ${studentName}:

**Context**: ${context}
**Tone**: ${tone}

Write a professional, respectful message that maintains the parent-teacher relationship. Include Islamic greeting (Assalamu Alaikum).`,
    },
  ];
  return generateAIText({ messages, maxTokens: 800, temperature: 0.5 });
};

/** Export all system prompts for admin customization */
export const getSystemPrompts = () => ({ ...SYSTEM_PROMPTS });

export type AIFeatureKey = keyof typeof SYSTEM_PROMPTS;
export const AI_FEATURE_KEYS = Object.keys(SYSTEM_PROMPTS) as AIFeatureKey[];

export const AI_FEATURE_LABELS: Record<AIFeatureKey, string> = {
  tutor: 'AI Tutor (Noor AI)',
  recitationCoach: 'Quran Recitation Coach',
  hifzTracker: 'Hifz Memorization Tracker',
  quizGenerator: 'Smart Quiz Generator',
  quranExplainer: 'Quran Translation & Explanation',
  learningPath: 'Personalized Learning Paths',
  parentReport: 'Parent Progress Reports',
  recommender: 'Content Recommendation Engine',
  teacherAssistant: 'Teacher Assistant Tools',
  adminControl: 'Admin AI Configuration',
};

export const AI_FEATURE_DESCRIPTIONS: Record<AIFeatureKey, string> = {
  tutor: '24/7 Islamic knowledge chatbot covering Quran, Hadith, Fiqh, Arabic, and general academics',
  recitationCoach: 'Evaluates Quran recitation and provides detailed tajweed feedback with correction guidance',
  hifzTracker: 'Analyzes memorization progress, detects weak spots, and creates spaced repetition schedules',
  quizGenerator: 'Generates adaptive quizzes from course content with varying difficulty and detailed explanations',
  quranExplainer: 'Word-by-word Quran translation with tafsir, context, and practical lessons',
  learningPath: 'Creates personalized study plans based on performance data and student goals',
  parentReport: 'Generates warm, detailed progress reports for parents with actionable recommendations',
  recommender: 'Suggests relevant courses and materials based on student history and interests',
  teacherAssistant: 'Helps teachers with lesson plans, assignments, class analysis, and parent communication',
  adminControl: 'Central configuration and monitoring of all AI features across the platform',
};
