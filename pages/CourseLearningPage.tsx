import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  BookOpen, CheckCircle, ChevronRight, ChevronLeft, Play, Clock,
  MessageSquare, Brain, FileText, HelpCircle, ArrowLeft, Sparkles,
  PenTool, Star, RotateCcw, ChevronDown, ChevronUp,
  Target, Lightbulb, Zap, Trophy, Send, Loader2, GraduationCap, X
} from 'lucide-react';
import { courses } from '../data/courses';
import { generateAIText, hasOpenRouterApiKey } from '../services/aiService';
import LogoLink from '../components/LogoLink';
import BackButton from '../components/BackButton';

// ─── Types ───────────────────────────────────────────────────────
interface LessonContent {
  introduction: string;
  sections: { heading: string; body: string; }[];
  keyPoints: string[];
  realWorldExamples: { title: string; description: string; }[];
  analogy: string;
  historicalContext: string;
  commonMistakes: string[];
  practicePrompt: string;
  funFact: string;
  sources: string[];
  summary: string;
}

type LessonStep = 'lesson' | 'flashcards' | 'exercises' | 'quiz';

const STEP_ORDER: LessonStep[] = ['lesson', 'flashcards', 'exercises', 'quiz'];

interface FlashCard {
  id: string;
  front: string;
  back: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

interface ExerciseItem {
  id: string;
  type: 'fill-blank' | 'match' | 'order' | 'true-false';
  question: string;
  answer: string;
  options?: string[];
  explanation: string;
}

interface WeekData {
  weekNumber: number;
  title: string;
  topics: string[];
  lessons: LessonData[];
  test: QuizQuestion[];
}

interface LessonData {
  id: string;
  title: string;
  topic: string;
  content: LessonContent | null;
  flashcards: FlashCard[];
  exercises: ExerciseItem[];
  miniQuiz: QuizQuestion[];
  completed: boolean;
  unlocked: boolean;
  completedSteps: Set<LessonStep>;
}

// ─── Storage Helpers ──────────────────────────────────────────────
const STORAGE_PREFIX = 'ma_course_';
const ENROLLMENT_KEY = 'ma_enrollments';

const isEnrolled = (courseId: string): boolean => {
  try {
    const raw = localStorage.getItem(ENROLLMENT_KEY);
    const enrollments = raw ? JSON.parse(raw) : {};
    return !!enrollments[courseId];
  } catch { return false; }
};

const saveCourseProgress = (courseId: string, data: { currentWeek: number; currentLesson: number; completedLessons: string[]; weekTestScores: Record<number, number>; completedSteps?: Record<string, string[]> }) => {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${courseId}`, JSON.stringify(data));
  } catch { /* quota exceeded */ }
};

const loadCourseProgress = (courseId: string) => {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${courseId}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// ─── AI Content Generation ────────────────────────────────────────
const generateLessonContent = async (courseTitle: string, weekTitle: string, lessonTopic: string, lessonIndex: number): Promise<LessonContent> => {
  const prompt = `You are writing a lesson for the course "${courseTitle}".
Week: "${weekTitle}", Lesson ${lessonIndex + 1}: "${lessonTopic}".

Write this lesson like a chapter in a world-class textbook — structured, engaging, rich with examples, sources, and practical knowledge. The student should LEARN deeply, not just skim text.

Return ONLY valid JSON with these keys:
{
  "introduction": "An engaging 2-3 paragraph introduction that hooks the reader. Explain WHY this topic matters, what they'll learn, and how it connects to real life. Use vivid language.",
  "sections": [
    {"heading": "Section title", "body": "2-4 paragraphs of deep, clear teaching. Include inline examples, step-by-step breakdowns, and analogies. Teach as if explaining to a curious student face-to-face."}
  ],
  "keyPoints": ["7-10 essential takeaways — these should be concrete, memorable facts or rules the student must remember"],
  "realWorldExamples": [
    {"title": "Example title", "description": "A vivid, detailed real-world example showing how this concept applies in practice. Include specifics — names, numbers, scenarios."}
  ],
  "analogy": "A creative, memorable analogy that makes the core concept click instantly (e.g. 'Think of DNA like a recipe book...')",
  "historicalContext": "2-3 sentences about the history or origin of this concept — who discovered/developed it, when, and why it matters historically",
  "commonMistakes": ["3-5 common mistakes or misconceptions students have about this topic, with brief corrections"],
  "practicePrompt": "A specific, hands-on activity the student should do RIGHT NOW to apply what they learned. Be very specific — not vague.",
  "funFact": "A surprising, fascinating fact related to this topic that the student will want to share with others",
  "sources": ["3-5 real, credible reference sources (books, articles, websites) where the student can learn more. Use real titles and authors."],
  "summary": "A concise 2-3 sentence summary of the entire lesson — what was taught and what the student should now understand"
}

IMPORTANT: Generate 3-5 sections. Each section body should be 2-4 substantive paragraphs. Be thorough — this is a real lesson, not a summary. Write at a level appropriate for pre-teens to adults.`;

  const raw = await generateAIText({
    messages: [
      { role: 'system', content: 'You are an expert educational content creator who writes engaging, textbook-quality lessons. Return ONLY valid JSON, no markdown fences.' },
      { role: 'user', content: prompt }
    ],
    maxTokens: 3000,
    temperature: 0.5,
    jsonMode: true,
  });

  return JSON.parse(raw.replace(/```json?/gi, '').replace(/```/g, '').trim());
};

const generateFlashcards = async (courseTitle: string, lessonTopic: string): Promise<FlashCard[]> => {
  const raw = await generateAIText({
    messages: [
      { role: 'system', content: 'You are an educational content creator. Return ONLY valid JSON array, no markdown fences.' },
      { role: 'user', content: `Create 6 flashcards for the topic "${lessonTopic}" in the course "${courseTitle}". Return JSON array: [{"id":"1","front":"question/term","back":"answer/definition"}]. Make them clear and educational.` }
    ],
    maxTokens: 800,
    temperature: 0.3,
    jsonMode: true,
  });

  const parsed = JSON.parse(raw.replace(/```json?/gi, '').replace(/```/g, '').trim());
  return Array.isArray(parsed) ? parsed : parsed.flashcards || parsed.cards || [];
};

const generateExercises = async (courseTitle: string, lessonTopic: string): Promise<ExerciseItem[]> => {
  const raw = await generateAIText({
    messages: [
      { role: 'system', content: 'You are an educational content creator. Return ONLY valid JSON array, no markdown fences.' },
      { role: 'user', content: `Create 5 interactive exercises for "${lessonTopic}" in "${courseTitle}". Return JSON array: [{"id":"1","type":"fill-blank","question":"The ___ is...","answer":"correct answer","explanation":"Why this is correct"}]. Mix types: fill-blank, true-false. Make them test understanding, not just memorization.` }
    ],
    maxTokens: 800,
    temperature: 0.3,
    jsonMode: true,
  });

  const parsed = JSON.parse(raw.replace(/```json?/gi, '').replace(/```/g, '').trim());
  return Array.isArray(parsed) ? parsed : parsed.exercises || [];
};

const generateMiniQuiz = async (courseTitle: string, lessonTopic: string): Promise<QuizQuestion[]> => {
  const raw = await generateAIText({
    messages: [
      { role: 'system', content: 'You are an educational quiz creator. Return ONLY valid JSON array, no markdown fences.' },
      { role: 'user', content: `Create 4 multiple-choice quiz questions for "${lessonTopic}" in "${courseTitle}". Return JSON array: [{"id":"1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"Why A is correct"}]. Test real understanding.` }
    ],
    maxTokens: 800,
    temperature: 0.3,
    jsonMode: true,
  });

  const parsed = JSON.parse(raw.replace(/```json?/gi, '').replace(/```/g, '').trim());
  return Array.isArray(parsed) ? parsed : parsed.questions || [];
};

const generateWeeklyTest = async (courseTitle: string, weekTitle: string, topics: string[]): Promise<QuizQuestion[]> => {
  const raw = await generateAIText({
    messages: [
      { role: 'system', content: 'You are an educational assessment creator. Return ONLY valid JSON array, no markdown fences.' },
      { role: 'user', content: `Create a 10-question weekly test for Week: "${weekTitle}" in course "${courseTitle}". Topics covered: ${topics.join(', ')}. Return JSON array: [{"id":"1","question":"...","options":["A","B","C","D"],"correctIndex":0,"explanation":"Why this is correct"}]. Test comprehension across all topics.` }
    ],
    maxTokens: 1500,
    temperature: 0.3,
    jsonMode: true,
  });

  const parsed = JSON.parse(raw.replace(/```json?/gi, '').replace(/```/g, '').trim());
  return Array.isArray(parsed) ? parsed : parsed.questions || [];
};

// ─── Build Weeks from Course Syllabus ─────────────────────────────
const buildWeeksFromCourse = (course: typeof courses[0]): WeekData[] => {
  if (course.syllabus && course.syllabus.length > 0) {
    return course.syllabus.map((week, wi) => ({
      weekNumber: wi + 1,
      title: week.title,
      topics: week.topics,
      lessons: week.topics.map((topic, ti) => ({
        id: `w${wi + 1}-l${ti + 1}`,
        title: `Lesson ${ti + 1}`,
        topic,
        content: null,
        flashcards: [],
        exercises: [],
        miniQuiz: [],
        completed: false,
        unlocked: wi === 0 && ti === 0,
        completedSteps: new Set<LessonStep>(),
      })),
      test: [],
    }));
  }

  // Fallback: generate weeks from learning outcomes
  const outcomes = course.learningOutcomes || [];
  const weeksCount = Math.max(4, Math.ceil(outcomes.length / 2));
  const weeks: WeekData[] = [];

  for (let i = 0; i < weeksCount; i++) {
    const topicsForWeek = outcomes.slice(i * 2, i * 2 + 2).map(o => o.description);
    if (topicsForWeek.length === 0) {
      topicsForWeek.push(`Advanced concepts in ${course.title} - Part ${i + 1}`);
    }
    weeks.push({
      weekNumber: i + 1,
      title: `Week ${i + 1}: ${topicsForWeek[0]?.slice(0, 50)}...`,
      topics: topicsForWeek,
      lessons: topicsForWeek.map((topic, ti) => ({
        id: `w${i + 1}-l${ti + 1}`,
        title: `Lesson ${ti + 1}`,
        topic,
        content: null,
        flashcards: [],
        exercises: [],
        miniQuiz: [],
        completed: false,
        unlocked: i === 0 && ti === 0,
        completedSteps: new Set<LessonStep>(),
      })),
      test: [],
    });
  }

  return weeks;
};

// ─── Flashcard Component ─────────────────────────────────────────
const FlashcardViewer: React.FC<{ cards: FlashCard[] }> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState<Set<string>>(new Set());

  if (cards.length === 0) return <p className="text-slate-400 text-center py-8">Loading flashcards...</p>;

  const card = cards[currentIndex];
  const progress = knownCards.size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">Card {currentIndex + 1} of {cards.length}</span>
        <span className="text-sm text-emerald-400">{progress} / {cards.length} mastered</span>
      </div>

      <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500" style={{ width: `${(progress / cards.length) * 100}%` }} />
      </div>

      <button
        type="button"
        onClick={() => setFlipped(f => !f)}
        className="w-full min-h-[220px] rounded-2xl border-2 border-white/10 hover:border-primary-400/50 transition-all duration-300 p-8 text-center cursor-pointer perspective-1000"
        style={{ background: flipped ? 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(20,184,166,0.1))' : 'rgba(255,255,255,0.03)' }}
      >
        <p className="text-xs uppercase tracking-widest text-slate-500 mb-4">{flipped ? '✓ Answer' : '? Question'}</p>
        <p className={`text-xl font-semibold ${flipped ? 'text-emerald-300' : 'text-white'}`}>
          {flipped ? card.back : card.front}
        </p>
        <p className="text-xs text-slate-500 mt-6">Click to {flipped ? 'see question' : 'reveal answer'}</p>
      </button>

      <div className="flex items-center justify-between gap-4">
        <button
          onClick={() => { setCurrentIndex(i => Math.max(0, i - 1)); setFlipped(false); }}
          disabled={currentIndex === 0}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-30 transition-all"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setKnownCards(prev => new Set(prev).add(card.id));
              if (currentIndex < cards.length - 1) {
                setCurrentIndex(i => i + 1);
                setFlipped(false);
              }
            }}
            className="px-5 py-2 bg-emerald-500/20 border border-emerald-500/50 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition-all flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4" /> I know this
          </button>
          <button
            onClick={() => {
              const updated = new Set(knownCards);
              updated.delete(card.id);
              setKnownCards(updated);
              if (currentIndex < cards.length - 1) {
                setCurrentIndex(i => i + 1);
                setFlipped(false);
              }
            }}
            className="px-5 py-2 bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-400 hover:bg-amber-500/30 transition-all flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Review again
          </button>
        </div>

        <button
          onClick={() => { setCurrentIndex(i => Math.min(cards.length - 1, i + 1)); setFlipped(false); }}
          disabled={currentIndex === cards.length - 1}
          className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10 disabled:opacity-30 transition-all"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ─── Exercise Component ──────────────────────────────────────────
const ExercisePanel: React.FC<{ exercises: ExerciseItem[]; onComplete: () => void }> = ({ exercises, onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  if (exercises.length === 0) return <p className="text-slate-400 text-center py-8">Loading exercises...</p>;

  const score = exercises.filter(ex => {
    const userAns = (answers[ex.id] || '').trim().toLowerCase();
    return userAns === ex.answer.trim().toLowerCase();
  }).length;

  const handleSubmit = () => {
    setSubmitted(true);
    if (score === exercises.length) onComplete();
  };

  return (
    <div className="space-y-6">
      {exercises.map((ex, idx) => {
        const userAns = (answers[ex.id] || '').trim().toLowerCase();
        const isCorrect = userAns === ex.answer.trim().toLowerCase();
        return (
          <div key={ex.id} className={`p-5 rounded-xl border transition-all ${submitted ? (isCorrect ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-red-500/50 bg-red-500/5') : 'border-white/10 bg-white/5'}`}>
            <p className="text-xs uppercase tracking-widest text-primary-400 mb-2">Exercise {idx + 1} {ex.type === 'true-false' ? '• True/False' : '• Fill in the blank'}</p>
            <p className="text-white font-medium mb-4">{ex.question}</p>

            {ex.type === 'true-false' ? (
              <div className="flex gap-3">
                {['True', 'False'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => !submitted && setAnswers(prev => ({ ...prev, [ex.id]: opt.toLowerCase() }))}
                    className={`px-6 py-2 rounded-lg border transition-all ${
                      answers[ex.id] === opt.toLowerCase()
                        ? 'border-primary-400 bg-primary-500/20 text-white'
                        : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                    } ${submitted ? 'pointer-events-none' : ''}`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            ) : (
              <input
                type="text"
                value={answers[ex.id] || ''}
                onChange={e => !submitted && setAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                placeholder="Type your answer..."
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                disabled={submitted}
              />
            )}

            {submitted && (
              <div className={`mt-3 p-3 rounded-lg ${isCorrect ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                <p className={`text-sm font-medium ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                  {isCorrect ? '✓ Correct!' : `✗ Incorrect. Answer: ${ex.answer}`}
                </p>
                <p className="text-sm text-slate-400 mt-1">{ex.explanation}</p>
              </div>
            )}
          </div>
        );
      })}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < exercises.length}
          className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-bold hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-40"
        >
          Submit Answers
        </button>
      )}

      {submitted && (
        <div className="text-center p-6 rounded-xl bg-white/5 border border-white/10">
          <p className="text-3xl mb-2">{score === exercises.length ? '🎉' : score >= exercises.length / 2 ? '👍' : '📚'}</p>
          <p className="text-xl font-bold text-white">{score} / {exercises.length} correct</p>
          <p className="text-slate-400 mt-1">{score === exercises.length ? 'Perfect! You nailed it!' : 'Keep practicing to improve!'}</p>
        </div>
      )}
    </div>
  );
};

// ─── Quiz Component ──────────────────────────────────────────────
const QuizPanel: React.FC<{ questions: QuizQuestion[]; title: string; onComplete: (score: number) => void; isWeeklyTest?: boolean }> = ({ questions, title, onComplete, isWeeklyTest }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);

  if (questions.length === 0) return <p className="text-slate-400 text-center py-8">Loading quiz...</p>;

  const score = questions.filter(q => answers[q.id] === q.correctIndex).length;
  const percentage = Math.round((score / questions.length) * 100);

  const handleSubmit = () => {
    setSubmitted(true);
    onComplete(percentage);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          {isWeeklyTest ? <Trophy className="w-5 h-5 text-amber-400" /> : <HelpCircle className="w-5 h-5 text-primary-400" />}
          {title}
        </h3>
        <span className="text-sm text-slate-400">{questions.length} questions</span>
      </div>

      {questions.map((q, idx) => (
        <div key={q.id} className={`p-5 rounded-xl border transition-all ${submitted ? (answers[q.id] === q.correctIndex ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-red-500/50 bg-red-500/5') : 'border-white/10 bg-white/5'}`}>
          <p className="text-xs uppercase tracking-widest text-primary-400 mb-2">Question {idx + 1}</p>
          <p className="text-white font-medium mb-4">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                type="button"
                onClick={() => !submitted && setAnswers(prev => ({ ...prev, [q.id]: oi }))}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${
                  answers[q.id] === oi
                    ? 'border-primary-400 bg-primary-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                } ${submitted ? 'pointer-events-none' : ''} ${submitted && oi === q.correctIndex ? '!border-emerald-400 !bg-emerald-500/15' : ''}`}
              >
                <span className="font-mono text-xs mr-3 text-slate-500">{String.fromCharCode(65 + oi)}</span>
                {opt}
              </button>
            ))}
          </div>
          {submitted && (
            <div className="mt-3 p-3 rounded-lg bg-white/5">
              <p className="text-sm text-slate-300">{q.explanation}</p>
            </div>
          )}
        </div>
      ))}

      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(answers).length < questions.length}
          className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-bold hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-40"
        >
          Submit {isWeeklyTest ? 'Test' : 'Quiz'}
        </button>
      )}

      {submitted && (
        <div className={`text-center p-8 rounded-2xl border ${percentage >= 70 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
          <p className="text-5xl mb-3">{percentage >= 90 ? '🏆' : percentage >= 70 ? '🎉' : percentage >= 50 ? '💪' : '📚'}</p>
          <p className="text-3xl font-black text-white mb-1">{percentage}%</p>
          <p className="text-lg text-slate-300">{score} / {questions.length} correct</p>
          <p className="text-slate-400 mt-2">
            {percentage >= 90 ? 'Outstanding! You mastered this material!' : 
             percentage >= 70 ? 'Great job! You passed!' : 
             percentage >= 50 ? 'Good effort! Review the material and try again.' :
             'Keep studying and try again. You\'ll get there!'}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── AI Chat Tutor (inline) ──────────────────────────────────────
const InlineAITutor: React.FC<{ courseTitle: string; lessonTopic: string }> = ({ courseTitle, lessonTopic }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    { role: 'assistant', content: `Hi! I'm your AI tutor for "${lessonTopic}". Ask me anything about this lesson — I'll explain concepts, give examples, or help you practice. 😊` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));
      const response = await generateAIText({
        messages: [
          { role: 'system', content: `You are an AI tutor for the course "${courseTitle}", currently teaching the lesson on "${lessonTopic}". Be helpful, clear, encouraging. Give examples. Use bullet points for clarity. Keep responses focused on the topic but answer any related questions.` },
          ...history,
          { role: 'user', content: userMsg }
        ],
        maxTokens: 800,
        temperature: 0.4,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an issue. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[500px]">
      <div className="flex-1 overflow-y-auto space-y-4 p-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap ${
              msg.role === 'user' ? 'bg-primary-500/20 border border-primary-500/30 text-white' : 'bg-white/5 border border-white/10 text-slate-200'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10">
              <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-white/10 p-4 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about this lesson..."
          className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          className="px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white hover:from-primary-400 hover:to-accent-400 disabled:opacity-40 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────
const CourseLearningPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const course = courses.find(c => c.id === courseId);

  // Check for custom AI course in localStorage
  const [customCourse, setCustomCourse] = useState<any>(null);
  useEffect(() => {
    if (!course && courseId?.startsWith('ai-custom-')) {
      const stored = localStorage.getItem(`ma_custom_course_${courseId}`);
      if (stored) setCustomCourse(JSON.parse(stored));
    }
  }, [course, courseId]);

  const activeCourse = course || customCourse;

  // Enrollment guard — redirect unenrolled users to course detail page
  useEffect(() => {
    if (courseId && !courseId.startsWith('ai-custom-') && !isEnrolled(courseId)) {
      navigate(`/courses/${courseId}`, { replace: true });
    }
  }, [courseId, navigate]);

  const [weeks, setWeeks] = useState<WeekData[]>([]);
  const [currentWeekIdx, setCurrentWeekIdx] = useState(0);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [currentStep, setCurrentStep] = useState<LessonStep>('lesson');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [weekTestScores, setWeekTestScores] = useState<Record<number, number>>({});
  const [showWeekTest, setShowWeekTest] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showAITutor, setShowAITutor] = useState(false);

  const hasApiKey = hasOpenRouterApiKey();

  // Initialize weeks from course data
  useEffect(() => {
    if (!activeCourse) return;

    let builtWeeks: WeekData[];
    if (customCourse) {
      const rawWeeks = customCourse.weeks || customCourse.curriculum || [];
      builtWeeks = rawWeeks.map((w: any, wi: number) => {
        const topics = w.topics || w.lessons?.map((l: any) => l.topic || l.title || l) || [];
        return {
          weekNumber: wi + 1,
          title: w.title || `Week ${wi + 1}`,
          topics,
          lessons: topics.map((topic: string, ti: number) => ({
            id: `w${wi + 1}-l${ti + 1}`,
            title: `Lesson ${ti + 1}`,
            topic: typeof topic === 'string' ? topic : (topic as any)?.title || `Lesson ${ti + 1}`,
            content: null,
            flashcards: [],
            exercises: [],
            miniQuiz: [],
            completed: false,
            unlocked: wi === 0 && ti === 0,
            completedSteps: new Set<LessonStep>(),
          })),
          test: [],
        };
      });
    } else {
      builtWeeks = buildWeeksFromCourse(activeCourse);
    }

    // Load saved progress
    const saved = loadCourseProgress(courseId || '');
    if (saved) {
      const savedWeek = Math.min(saved.currentWeek || 0, builtWeeks.length - 1);
      const savedLesson = Math.min(saved.currentLesson || 0, (builtWeeks[savedWeek]?.lessons.length || 1) - 1);
      setCurrentWeekIdx(savedWeek);
      setCurrentLessonIdx(savedLesson);
      setCompletedLessons(new Set(saved.completedLessons || []));
      setWeekTestScores(saved.weekTestScores || {});

      // Restore completedSteps and unlock lessons based on completion
      const savedSteps = saved.completedSteps || {};
      builtWeeks.forEach((week, wi) => {
        week.lessons.forEach((lesson, li) => {
          if (saved.completedLessons?.includes(lesson.id)) {
            lesson.completed = true;
            lesson.unlocked = true;
          }
          // Restore step completion from saved data
          if (savedSteps[lesson.id]) {
            lesson.completedSteps = new Set(savedSteps[lesson.id] as LessonStep[]);
          }
          // Unlock next lesson
          if (wi === 0 && li === 0) lesson.unlocked = true;
          if (li > 0 && builtWeeks[wi].lessons[li - 1]?.completed) lesson.unlocked = true;
          if (wi > 0 && li === 0 && builtWeeks[wi - 1].lessons.every((l: LessonData) => l.completed)) lesson.unlocked = true;
        });
      });
    }

    setWeeks(builtWeeks);
  }, [activeCourse, courseId]);

  // Save progress whenever it changes
  useEffect(() => {
    if (!courseId || weeks.length === 0) return;
    // Serialize completedSteps Sets as arrays keyed by lessonId
    const completedStepsMap: Record<string, string[]> = {};
    weeks.forEach(w => w.lessons.forEach(l => {
      if (l.completedSteps.size > 0) {
        completedStepsMap[l.id] = Array.from(l.completedSteps);
      }
    }));
    saveCourseProgress(courseId, {
      currentWeek: currentWeekIdx,
      currentLesson: currentLessonIdx,
      completedLessons: Array.from(completedLessons),
      weekTestScores,
      completedSteps: completedStepsMap,
    });
  }, [courseId, currentWeekIdx, currentLessonIdx, completedLessons, weekTestScores, weeks]);

  // Load lesson content when switching lessons
  const currentWeek = weeks[currentWeekIdx];
  const currentLesson = currentWeek?.lessons?.[currentLessonIdx];

  const loadLessonContent = useCallback(async () => {
    if (!currentLesson || !activeCourse || currentLesson.content || !hasApiKey) return;

    setLoading(true);
    setGenerationError(null);
    try {
      const courseTitle = activeCourse.title || customCourse?.title || 'Course';
      const weekTitle = currentWeek?.title || `Week ${currentWeekIdx + 1}`;
      const [content, flashcards, exercises, miniQuiz] = await Promise.all([
        generateLessonContent(courseTitle, weekTitle, currentLesson.topic, currentLessonIdx),
        generateFlashcards(courseTitle, currentLesson.topic),
        generateExercises(courseTitle, currentLesson.topic),
        generateMiniQuiz(courseTitle, currentLesson.topic),
      ]);

      setWeeks(prev => {
        const updated = [...prev];
        if (updated[currentWeekIdx]?.lessons[currentLessonIdx]) {
          const lesson = updated[currentWeekIdx].lessons[currentLessonIdx];
          lesson.content = content;
          lesson.flashcards = flashcards;
          lesson.exercises = exercises;
          lesson.miniQuiz = miniQuiz;
        }
        return updated;
      });
    } catch (err) {
      console.error('Failed to generate lesson content:', err);
      setGenerationError(err instanceof Error ? err.message : 'Failed to generate lesson. Check your API key and try again.');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLesson?.id, currentWeekIdx, currentLessonIdx, hasApiKey, activeCourse, weeks.length]);

  useEffect(() => {
    loadLessonContent();
  }, [loadLessonContent]);

  const markLessonComplete = () => {
    if (!currentLesson) return;
    const newCompleted = new Set(completedLessons);
    newCompleted.add(currentLesson.id);
    setCompletedLessons(newCompleted);

    setWeeks(prev => {
      const updated = [...prev];
      updated[currentWeekIdx].lessons[currentLessonIdx].completed = true;

      // Unlock next lesson
      const nextLessonIdx = currentLessonIdx + 1;
      if (nextLessonIdx < updated[currentWeekIdx].lessons.length) {
        updated[currentWeekIdx].lessons[nextLessonIdx].unlocked = true;
      } else if (currentWeekIdx + 1 < updated.length) {
        // All lessons in week done — can take weekly test or move to next week
        updated[currentWeekIdx + 1].lessons[0].unlocked = true;
      }
      return updated;
    });
  };

  const goToLesson = (weekIdx: number, lessonIdx: number) => {
    if (!weeks[weekIdx]?.lessons[lessonIdx]?.unlocked) return;
    setCurrentWeekIdx(weekIdx);
    setCurrentLessonIdx(lessonIdx);
    setCurrentStep('lesson');
    setShowWeekTest(false);
    setShowAITutor(false);
  };

  const goToNextLesson = () => {
    if (currentLessonIdx + 1 < (currentWeek?.lessons.length || 0)) {
      goToLesson(currentWeekIdx, currentLessonIdx + 1);
    } else if (currentWeekIdx + 1 < weeks.length) {
      goToLesson(currentWeekIdx + 1, 0);
    }
  };

  // Step completion helpers
  const completeCurrentStep = () => {
    if (!currentLesson) return;
    setWeeks(prev => {
      const updated = [...prev];
      updated[currentWeekIdx].lessons[currentLessonIdx].completedSteps.add(currentStep);
      return [...updated]; // force re-render
    });
  };

  const advanceToNextStep = () => {
    completeCurrentStep();
    const currentIdx = STEP_ORDER.indexOf(currentStep);
    if (currentIdx < STEP_ORDER.length - 1) {
      setCurrentStep(STEP_ORDER[currentIdx + 1]);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // All steps done — mark lesson complete & go next
      markLessonComplete();
    }
  };

  const isStepCompleted = (step: LessonStep) => currentLesson?.completedSteps.has(step) || false;
  const isStepAccessible = (step: LessonStep) => {
    const idx = STEP_ORDER.indexOf(step);
    if (idx === 0) return true;
    return isStepCompleted(STEP_ORDER[idx - 1]);
  };

  const stepsCompleted = STEP_ORDER.filter(s => isStepCompleted(s)).length;

  const startWeeklyTest = async () => {
    if (!currentWeek || !activeCourse || !hasApiKey) return;
    setShowWeekTest(true);
    setCurrentStep('quiz');

    if (currentWeek.test.length === 0) {
      setLoading(true);
      try {
        const test = await generateWeeklyTest(activeCourse.title || customCourse?.title, currentWeek.title, currentWeek.topics);
        setWeeks(prev => {
          const updated = [...prev];
          updated[currentWeekIdx].test = test;
          return updated;
        });
      } catch (err) {
        console.error('Failed to generate weekly test:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const allLessonsInWeekComplete = currentWeek?.lessons.every(l => l.completed) || false;
  const totalLessons = weeks.reduce((sum, w) => sum + w.lessons.length, 0);
  const totalCompleted = completedLessons.size;
  const overallProgress = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  if (!activeCourse) {
    // If it's a custom course, it may still be loading from localStorage
    if (courseId?.startsWith('ai-custom-')) {
      return (
        <div className="min-h-screen bg-[#050a12] flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary-400 mx-auto mb-4" />
            <p className="text-slate-300">Loading course...</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-[#050a12] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-primary-400 hover:text-primary-300">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#050a12] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <Sparkles className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">AI-Powered Learning</h1>
          <p className="text-slate-300 mb-6">This course uses AI to generate personalized lessons, flashcards, exercises, and quizzes. Please configure your OpenRouter API key to start learning.</p>
          <p className="text-sm text-slate-400 mb-6">Add <code className="text-primary-300">VITE_OPENROUTER_API_KEY</code> to your environment variables.</p>
          <Link to="/courses" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-bold hover:from-primary-400 hover:to-accent-400 transition-all">
            ← Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a12] flex flex-col">
      {/* Header */}
      <header className="bg-[#050a12]/90 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/courses')} className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <LogoLink showText={false} compact />
            <div>
              <h1 className="text-sm font-bold text-white truncate max-w-[300px]">{activeCourse.title || customCourse?.title}</h1>
              <p className="text-xs text-slate-400">Week {currentWeekIdx + 1} • Lesson {currentLessonIdx + 1}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-slate-400">
              <Target className="w-4 h-4 text-primary-400" />
              <span>{overallProgress}% complete</span>
            </div>
            <div className="hidden sm:block w-32 h-2 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
            </div>
            <button
              onClick={() => setSidebarOpen(s => !s)}
              className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-300 hover:bg-white/10"
              title={sidebarOpen ? 'Hide sidebar' : 'Show sidebar'}
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Sidebar - desktop */}
        <aside className={`${sidebarOpen ? 'w-72 xl:w-80' : 'w-0'} transition-all duration-300 border-r border-white/10 overflow-hidden flex-shrink-0 hidden lg:block`}>
          <div className="w-72 xl:w-80 h-full overflow-y-auto p-4 space-y-4">
            {/* Progress card */}
            <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white">Your Progress</span>
                <span className="text-lg font-black text-primary-300">{overallProgress}%</span>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all" style={{ width: `${overallProgress}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">{totalCompleted} of {totalLessons} lessons completed</p>
            </div>

            {/* Week list */}
            {weeks.map((week, wi) => {
              const weekCompleted = week.lessons.every(l => l.completed);
              const weekLessonsCompleted = week.lessons.filter(l => l.completed).length;
              const isCurrentWeek = wi === currentWeekIdx;

              return (
                <div key={wi} className={`rounded-xl border transition-all ${isCurrentWeek ? 'border-primary-500/30 bg-white/5' : 'border-white/5 bg-white/[0.02]'}`}>
                  <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => setCurrentWeekIdx(wi)}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black ${weekCompleted ? 'bg-emerald-500/20 text-emerald-400' : isCurrentWeek ? 'bg-primary-500/20 text-primary-400' : 'bg-white/5 text-slate-500'}`}>
                        {weekCompleted ? <CheckCircle className="w-4 h-4" /> : `W${wi + 1}`}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white truncate max-w-[170px]">{week.title}</p>
                        <p className="text-xs text-slate-400">{weekLessonsCompleted}/{week.lessons.length} lessons</p>
                      </div>
                    </div>
                    {isCurrentWeek ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>

                  {isCurrentWeek && (
                    <div className="px-3 pb-3 space-y-1">
                      {week.lessons.map((lesson, li) => (
                        <button
                          key={lesson.id}
                          onClick={() => goToLesson(wi, li)}
                          disabled={!lesson.unlocked}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 ${
                            wi === currentWeekIdx && li === currentLessonIdx
                              ? 'bg-primary-500/20 border border-primary-500/30 text-white'
                              : lesson.completed
                              ? 'text-emerald-400 hover:bg-white/5'
                              : lesson.unlocked
                              ? 'text-slate-300 hover:bg-white/5'
                              : 'text-slate-600 cursor-not-allowed'
                          }`}
                        >
                          {lesson.completed ? (
                            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                          ) : !lesson.unlocked ? (
                            <span className="w-3.5 h-3.5 flex-shrink-0 text-center">🔒</span>
                          ) : (
                            <Play className="w-3.5 h-3.5 flex-shrink-0" />
                          )}
                          <span className="truncate">{lesson.topic}</span>
                        </button>
                      ))}

                      {/* Weekly Test button */}
                      <button
                        onClick={startWeeklyTest}
                        disabled={!allLessonsInWeekComplete}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2 mt-2 ${
                          weekTestScores[wi + 1] !== undefined
                            ? 'text-amber-400 bg-amber-500/10'
                            : allLessonsInWeekComplete
                            ? 'text-amber-400 hover:bg-amber-500/10 border border-amber-500/20'
                            : 'text-slate-600 cursor-not-allowed'
                        }`}
                      >
                        <Trophy className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Weekly Test</span>
                        {weekTestScores[wi + 1] !== undefined && (
                          <span className="ml-auto text-xs font-bold">{weekTestScores[wi + 1]}%</span>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/60" />
            <aside className="absolute left-0 top-0 bottom-0 w-72 bg-[#050a12] border-r border-white/10 overflow-y-auto p-4 space-y-4" onClick={e => e.stopPropagation()}>
              <button onClick={() => setSidebarOpen(false)} className="mb-2 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
              {/* Same content as desktop sidebar but for mobile */}
              <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-white">Progress</span>
                  <span className="text-lg font-black text-primary-300">{overallProgress}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500" style={{ width: `${overallProgress}%` }} />
                </div>
              </div>
              {weeks.map((week, wi) => (
                <div key={wi} className="rounded-xl border border-white/5 bg-white/[0.02] p-3">
                  <p className="text-sm font-semibold text-white mb-2">{week.title}</p>
                  {week.lessons.map((lesson, li) => (
                    <button
                      key={lesson.id}
                      onClick={() => { goToLesson(wi, li); setSidebarOpen(false); }}
                      disabled={!lesson.unlocked}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${
                        lesson.completed ? 'text-emerald-400' : lesson.unlocked ? 'text-slate-300' : 'text-slate-600'
                      }`}
                    >
                      {lesson.completed ? <CheckCircle className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span className="truncate">{lesson.topic}</span>
                    </button>
                  ))}
                </div>
              ))}
            </aside>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 page-enter">
            {/* Step Progress Bar */}
            <div className="mb-8">
              <div className="flex items-center gap-1 mb-4">
                {STEP_ORDER.map((step, i) => {
                  const stepLabels: Record<LessonStep, { label: string; icon: React.ReactNode }> = {
                    lesson: { label: 'Read Lesson', icon: <BookOpen className="w-4 h-4" /> },
                    flashcards: { label: 'Flashcards', icon: <Brain className="w-4 h-4" /> },
                    exercises: { label: 'Practice', icon: <PenTool className="w-4 h-4" /> },
                    quiz: { label: 'Quiz', icon: <HelpCircle className="w-4 h-4" /> },
                  };
                  const info = stepLabels[step];
                  const done = isStepCompleted(step);
                  const active = currentStep === step && !showWeekTest;
                  const accessible = isStepAccessible(step);

                  return (
                    <React.Fragment key={step}>
                      <button
                        onClick={() => accessible && !showWeekTest && setCurrentStep(step)}
                        disabled={!accessible}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                          active ? 'bg-primary-500/20 text-white border border-primary-400/50 shadow-lg shadow-primary-500/10' :
                          done ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                          accessible ? 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10 cursor-pointer' :
                          'bg-white/[0.02] text-slate-600 border border-white/5 cursor-not-allowed'
                        }`}
                      >
                        {done ? <CheckCircle className="w-4 h-4" /> : info.icon}
                        <span className="hidden sm:inline">{info.label}</span>
                        <span className="sm:hidden">{i + 1}</span>
                      </button>
                      {i < STEP_ORDER.length - 1 && (
                        <div className={`flex-1 h-0.5 rounded-full min-w-[16px] ${done ? 'bg-emerald-500/50' : 'bg-white/10'}`} />
                      )}
                    </React.Fragment>
                  );
                })}
                {allLessonsInWeekComplete && (
                  <>
                    <div className={`flex-1 h-0.5 rounded-full min-w-[16px] ${stepsCompleted === 4 ? 'bg-amber-500/50' : 'bg-white/10'}`} />
                    <button
                      onClick={startWeeklyTest}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                        showWeekTest ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50' :
                        'bg-white/5 text-amber-500 border border-amber-500/20 hover:bg-amber-500/10'
                      }`}
                    >
                      <Trophy className="w-4 h-4" />
                      <span className="hidden sm:inline">Weekly Test</span>
                    </button>
                  </>
                )}
              </div>
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-500" style={{ width: `${(stepsCompleted / STEP_ORDER.length) * 100}%` }} />
              </div>
            </div>

            {/* AI Tutor Toggle */}
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setShowAITutor(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  showAITutor ? 'bg-primary-500/20 text-primary-300 border border-primary-400/40' : 'bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                {showAITutor ? 'Hide AI Tutor' : 'Ask AI Tutor'}
              </button>
            </div>

            {/* AI Tutor Panel (collapsible) */}
            {showAITutor && !loading && currentLesson && (
              <div className="mb-8 bg-white/5 border border-primary-400/20 rounded-2xl overflow-hidden">
                <div className="px-4 py-3 bg-primary-500/10 border-b border-primary-400/20 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-primary-400" />
                  <span className="text-sm font-bold text-white">AI Tutor — ask anything about this lesson</span>
                </div>
                <InlineAITutor courseTitle={activeCourse.title || customCourse?.title} lessonTopic={currentLesson.topic} />
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary-400 mb-4" />
                <p className="text-slate-300">Generating your personalized lesson content...</p>
                <p className="text-xs text-slate-500 mt-2">This may take a moment — preparing lesson, flashcards, exercises & quiz</p>
              </div>
            )}

            {/* Waiting for course data to load */}
            {!loading && !currentLesson && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-10 h-10 animate-spin text-primary-400 mb-4" />
                <p className="text-slate-300">Loading course structure...</p>
              </div>
            )}

            {/* Weekly Test View */}
            {showWeekTest && !loading && currentWeek && (
              <QuizPanel
                questions={currentWeek.test}
                title={`Week ${currentWeekIdx + 1} Test: ${currentWeek.title}`}
                isWeeklyTest
                onComplete={(score) => {
                  setWeekTestScores(prev => ({ ...prev, [currentWeekIdx + 1]: score }));
                }}
              />
            )}

            {/* Lesson Tab */}
            {currentStep === 'lesson' && !showWeekTest && !loading && currentLesson && (
              <div className="space-y-8">
                {/* Lesson Header */}
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary-400 mb-2">
                    Week {currentWeekIdx + 1} • Lesson {currentLessonIdx + 1}
                  </p>
                  <h2 className="text-3xl font-black text-white mb-2">{currentLesson.topic}</h2>
                </div>

                {currentLesson.content ? (
                  <>
                    {/* Introduction */}
                    <div className="bg-gradient-to-br from-primary-500/10 to-accent-500/5 border border-primary-500/20 rounded-2xl p-6 sm:p-8 reveal depth-card">
                      <div className="flex items-center gap-2 mb-4">
                        <BookOpen className="w-5 h-5 text-primary-400" />
                        <h3 className="text-lg font-bold text-white">Introduction</h3>
                      </div>
                      <div className="prose prose-invert max-w-none">
                        {(currentLesson.content.introduction || '').split('\n\n').map((para, i) => (
                          <p key={i} className="text-slate-200 leading-relaxed mb-4 text-[15px]">{para}</p>
                        ))}
                      </div>
                    </div>

                    {/* Structured Sections — like textbook chapters */}
                    {(currentLesson.content.sections || []).map((section, i) => (
                      <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 reveal" style={{ transitionDelay: `${(i + 1) * 80}ms` }}>
                        <div className="flex items-start gap-3 mb-4">
                          <div className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm font-black text-primary-400 flex-shrink-0">{i + 1}</div>
                          <h3 className="text-xl font-bold text-white mt-0.5">{section.heading}</h3>
                        </div>
                        <div className="prose prose-invert max-w-none pl-11">
                          {section.body.split('\n\n').map((para, pi) => (
                            <p key={pi} className="text-slate-200 leading-relaxed mb-4 text-[15px]">{para}</p>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Real-World Examples */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 reveal" style={{ transitionDelay: '200ms' }}>
                      <div className="flex items-center gap-2 mb-5">
                        <Lightbulb className="w-5 h-5 text-amber-400" />
                        <h3 className="text-lg font-bold text-white">Real-World Examples</h3>
                      </div>
                      <div className="space-y-4">
                        {(currentLesson.content.realWorldExamples || currentLesson.content.keyPoints?.map((k: string) => ({ title: '', description: k })) || []).map((ex: any, i: number) => (
                          <div key={i} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl">
                            {ex.title && <p className="text-amber-300 font-bold text-sm mb-1">{ex.title}</p>}
                            <p className="text-slate-200 text-[15px] leading-relaxed">{ex.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Analogy */}
                    {currentLesson.content.analogy && (
                      <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-6 reveal" style={{ transitionDelay: '250ms' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Zap className="w-5 h-5 text-violet-400" />
                          <h3 className="text-lg font-bold text-white">Think of it This Way</h3>
                        </div>
                        <p className="text-slate-200 text-[15px] leading-relaxed italic">"{currentLesson.content.analogy}"</p>
                      </div>
                    )}

                    {/* Historical Context */}
                    {currentLesson.content.historicalContext && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 reveal" style={{ transitionDelay: '280ms' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Clock className="w-5 h-5 text-cyan-400" />
                          <h3 className="text-lg font-bold text-white">Historical Context</h3>
                        </div>
                        <p className="text-slate-200 text-[15px] leading-relaxed">{currentLesson.content.historicalContext}</p>
                      </div>
                    )}

                    {/* Key Takeaways */}
                    <div className="bg-gradient-to-br from-primary-500/5 to-accent-500/5 border border-primary-500/20 rounded-2xl p-6 reveal" style={{ transitionDelay: '300ms' }}>
                      <div className="flex items-center gap-2 mb-4">
                        <Target className="w-5 h-5 text-primary-400" />
                        <h3 className="text-lg font-bold text-white">Key Takeaways</h3>
                      </div>
                      <div className="space-y-3">
                        {currentLesson.content.keyPoints.map((point, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center text-xs font-bold text-primary-400 flex-shrink-0 mt-0.5">{i + 1}</div>
                            <p className="text-slate-200 text-[15px]">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Common Mistakes */}
                    {currentLesson.content.commonMistakes && currentLesson.content.commonMistakes.length > 0 && (
                      <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-6 reveal" style={{ transitionDelay: '320ms' }}>
                        <div className="flex items-center gap-2 mb-4">
                          <X className="w-5 h-5 text-red-400" />
                          <h3 className="text-lg font-bold text-white">Common Mistakes to Avoid</h3>
                        </div>
                        <div className="space-y-3">
                          {currentLesson.content.commonMistakes.map((mistake, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-red-500/5 rounded-lg">
                              <span className="text-red-400 font-bold flex-shrink-0 mt-0.5">⚠</span>
                              <p className="text-slate-200 text-[15px]">{mistake}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Try It Yourself */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-6 reveal" style={{ transitionDelay: '350ms' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <PenTool className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-lg font-bold text-white">Try It Yourself</h3>
                      </div>
                      <p className="text-slate-200 text-[15px] leading-relaxed">{currentLesson.content.practicePrompt}</p>
                    </div>

                    {/* Fun Fact */}
                    <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl p-6 reveal" style={{ transitionDelay: '380ms' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-violet-400" />
                        <h3 className="text-lg font-bold text-white">Did You Know?</h3>
                      </div>
                      <p className="text-slate-200 text-[15px] leading-relaxed">{currentLesson.content.funFact}</p>
                    </div>

                    {/* Summary */}
                    {currentLesson.content.summary && (
                      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 reveal" style={{ transitionDelay: '400ms' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <GraduationCap className="w-5 h-5 text-primary-400" />
                          <h3 className="text-lg font-bold text-white">Lesson Summary</h3>
                        </div>
                        <p className="text-slate-200 text-[15px] leading-relaxed">{currentLesson.content.summary}</p>
                      </div>
                    )}

                    {/* Sources / Further Reading */}
                    {currentLesson.content.sources && currentLesson.content.sources.length > 0 && (
                      <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6 reveal" style={{ transitionDelay: '420ms' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <FileText className="w-5 h-5 text-slate-400" />
                          <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">Sources & Further Reading</h3>
                        </div>
                        <ul className="space-y-1.5">
                          {currentLesson.content.sources.map((src, i) => (
                            <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                              <span className="text-slate-500 mt-0.5">•</span>
                              {src}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Continue to Next Step CTA */}
                    <div className="pt-4 border-t border-white/10">
                      <button
                        onClick={advanceToNextStep}
                        className="w-full px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl text-white font-black text-lg hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-3"
                      >
                        <span>Continue to Flashcards →</span>
                      </button>
                      <p className="text-center text-xs text-slate-500 mt-2">Step 1 of 4 — read the lesson, then reinforce with flashcards, exercises & quiz</p>
                    </div>
                  </>
                ) : !loading ? (
                  <div className="text-center py-16">
                    <Sparkles className="w-16 h-16 text-primary-400 mx-auto mb-6" />
                    <h3 className="text-2xl font-bold text-white mb-3">Ready to Learn</h3>
                    <p className="text-slate-300 mb-8 max-w-md mx-auto">
                      AI will generate a detailed, textbook-style lesson with examples, flashcards, exercises and a quiz for this topic.
                    </p>
                    {generationError && (
                      <div className="max-w-md mx-auto mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-left">
                        <p className="text-red-400 text-sm font-medium mb-1">Generation failed</p>
                        <p className="text-red-300/70 text-xs">{generationError}</p>
                      </div>
                    )}
                    <button
                      onClick={loadLessonContent}
                      className="px-10 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl text-white font-black text-lg hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg shadow-primary-500/20 flex items-center gap-3 mx-auto"
                    >
                      <Sparkles className="w-5 h-5" />
                      {generationError ? 'Retry Generation' : 'Generate Lesson'}
                    </button>
                  </div>
                ) : null}
              </div>
            )}

            {/* Flashcards Step */}
            {currentStep === 'flashcards' && !showWeekTest && !loading && currentLesson && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary-400 mb-2">Step 2 of 4 — Reinforce Your Learning</p>
                  <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                    <Brain className="w-6 h-6 text-primary-400" />
                    Flashcards: {currentLesson.topic}
                  </h2>
                  <p className="text-slate-400 text-sm">Review these flashcards to memorize the key concepts from the lesson.</p>
                </div>
                <FlashcardViewer cards={currentLesson.flashcards} />
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={advanceToNextStep}
                    className="w-full px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl text-white font-black text-lg hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-3"
                  >
                    <span>Continue to Exercises</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Exercises Step */}
            {currentStep === 'exercises' && !showWeekTest && !loading && currentLesson && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary-400 mb-2">Step 3 of 4 — Apply Your Knowledge</p>
                  <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                    <PenTool className="w-6 h-6 text-primary-400" />
                    Practice: {currentLesson.topic}
                  </h2>
                  <p className="text-slate-400 text-sm">Complete these exercises to test your understanding before the quiz.</p>
                </div>
                <ExercisePanel exercises={currentLesson.exercises} onComplete={() => {}} />
                <div className="pt-4 border-t border-white/10">
                  <button
                    onClick={advanceToNextStep}
                    className="w-full px-8 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-2xl text-white font-black text-lg hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg shadow-primary-500/20 flex items-center justify-center gap-3"
                  >
                    <span>Continue to Quiz</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Step */}
            {currentStep === 'quiz' && !showWeekTest && !loading && currentLesson && (
              <div className="space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest text-primary-400 mb-2">Step 4 of 4 — Prove Your Mastery</p>
                  <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                    <HelpCircle className="w-6 h-6 text-primary-400" />
                    Quiz: {currentLesson.topic}
                  </h2>
                  <p className="text-slate-400 text-sm">Pass this quiz to complete the lesson and unlock the next one.</p>
                </div>
                <QuizPanel
                  questions={currentLesson.miniQuiz}
                  title={`Lesson Quiz: ${currentLesson.topic}`}
                  onComplete={(score) => {
                    completeCurrentStep();
                    if (score >= 60) {
                      markLessonComplete();
                    }
                  }}
                />
                {currentLesson.completed && (
                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <div className="text-center p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle className="w-5 h-5" />
                      <span>Lesson Complete! All 4 steps finished.</span>
                    </div>
                    <button
                      onClick={goToNextLesson}
                      className="w-full px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl text-white font-black text-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-3"
                    >
                      <span>Next Lesson</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default CourseLearningPage;
