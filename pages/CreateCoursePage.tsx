import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Sparkles, BookOpen, Clock, Target, Loader2, ArrowLeft, Brain,
  GraduationCap, Zap, ChevronRight, Plus, Trophy, PenTool
} from 'lucide-react';
import { generateAIText, hasOpenRouterApiKey } from '../services/aiService';
import LogoLink from '../components/LogoLink';
import { DepthOrbs } from '../components/motion/MotionElements';

interface GeneratedCourse {
  id: string;
  title: string;
  description: string;
  level: string;
  duration: string;
  weeks: {
    title: string;
    topics: string[];
  }[];
  learningOutcomes: string[];
}

const SUGGESTED_TOPICS = [
  'Learn Python Programming',
  'Introduction to Artificial Intelligence',
  'Basic Web Development',
  'Photography Basics',
  'Creative Writing',
  'Financial Literacy for Teens',
  'Learn Drawing and Sketching',
  'Public Speaking Skills',
  'Basic First Aid',
  'Environmental Science',
  'Music Theory Basics',
  'Healthy Cooking & Nutrition',
];

const CreateCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [duration, setDuration] = useState<'4' | '6' | '8' | '12'>('6');
  const [loading, setLoading] = useState(false);
  const [generatedCourse, setGeneratedCourse] = useState<GeneratedCourse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const hasApiKey = hasOpenRouterApiKey();

  const generateCourse = async () => {
    if (!topic.trim() || loading) return;
    setLoading(true);
    setError(null);
    setGeneratedCourse(null);

    try {
      const raw = await generateAIText({
        messages: [
          {
            role: 'system',
            content: `You are an expert curriculum designer. Create a comprehensive, well-structured course plan. Return ONLY valid JSON, no markdown fences.`
          },
          {
            role: 'user',
            content: `Create a complete ${duration}-week course curriculum for someone who wants to learn: "${topic.trim()}"
Level: ${level}

Return JSON with this exact structure:
{
  "title": "Course title",
  "description": "2-3 sentence description of what students will learn",
  "level": "${level}",
  "duration": "${duration} weeks",
  "learningOutcomes": ["5-7 specific things students will be able to do after completing the course"],
  "weeks": [
    {
      "title": "Week 1: Topic Name",
      "topics": ["Lesson 1 topic", "Lesson 2 topic", "Lesson 3 topic"]
    }
  ]
}

Create exactly ${duration} weeks. Each week should have 3-4 lesson topics. Make it progressive - start from fundamentals and build up. Include practical, hands-on topics. Each lesson topic should be specific and actionable.`
          }
        ],
        maxTokens: 2000,
        temperature: 0.4,
        jsonMode: true,
      });

      const parsed = JSON.parse(raw.replace(/```json?/gi, '').replace(/```/g, '').trim());
      const courseId = `ai-custom-${Date.now()}`;
      const course: GeneratedCourse = {
        id: courseId,
        title: parsed.title,
        description: parsed.description,
        level: parsed.level || level,
        duration: parsed.duration || `${duration} weeks`,
        weeks: parsed.weeks || [],
        learningOutcomes: parsed.learningOutcomes || [],
      };

      setGeneratedCourse(course);
    } catch (err) {
      setError('Failed to generate course. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startLearning = () => {
    if (!generatedCourse) return;
    // Save course to localStorage so the learning page can pick it up
    localStorage.setItem(`ma_custom_course_${generatedCourse.id}`, JSON.stringify(generatedCourse));
    // Also save to course list for "My Courses"
    const savedList = JSON.parse(localStorage.getItem('ma_custom_courses') || '[]');
    savedList.push({
      id: generatedCourse.id,
      title: generatedCourse.title,
      description: generatedCourse.description,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem('ma_custom_courses', JSON.stringify(savedList));
    navigate(`/learn/${generatedCourse.id}`);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-[#050a12] flex items-center justify-center px-4">
        <div className="text-center max-w-lg">
          <Sparkles className="w-16 h-16 text-primary-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">AI Course Creator</h1>
          <p className="text-slate-300 mb-6">This feature uses AI to generate personalized courses. Please configure your OpenRouter API key.</p>
          <Link to="/courses" className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-bold">← Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a12] relative overflow-hidden">
      <DepthOrbs count={3} colors={['rgba(139,92,246,0.12)', 'rgba(59,130,246,0.08)', 'rgba(245,158,11,0.06)']} />
      {/* Header */}
      <header className="bg-[#050a12]/90 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/courses" className="text-slate-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <LogoLink showText={false} compact />
            <h1 className="text-lg font-bold text-white">Create Your Course</h1>
          </div>
          <Link to="/courses" className="px-4 py-2 text-slate-300 hover:text-white transition-colors text-sm">
            Browse Courses
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12 relative z-10">
        {!generatedCourse ? (
          <div className="space-y-10 page-enter">
            {/* Hero */}
            <div className="text-center relative">
              {/* Decorative orbit */}
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-8 w-[250px] h-[250px] pointer-events-none opacity-30" aria-hidden="true">
                <div className="absolute inset-0 rounded-full border border-white/[0.05] animate-spin-slow" />
                <div className="absolute inset-8 rounded-full border border-primary-400/[0.08]" />
              </div>
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-6 animate-float animate-glow">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-black text-white mb-4 animate-text-glow">What do you want to learn?</h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Tell us what you want to learn and our AI will create a personalized course with lessons, flashcards, exercises, quizzes, and weekly tests — all tailored just for you.
              </p>
            </div>

            {/* Input Form */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 space-y-6 reveal depth-card glass-depth">
              <div>
                <label className="block text-sm font-bold text-white mb-2">What do you want to learn?</label>
                <input
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generateCourse()}
                  placeholder="e.g., Learn Python Programming, Photography Basics, Financial Literacy..."
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white text-lg placeholder:text-slate-500 focus:border-primary-400 focus:outline-none transition-all"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Your Level</label>
                  <div className="flex gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => setLevel(l)}
                        className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          level === l
                            ? 'border-primary-400 bg-primary-500/20 text-white'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Course Duration</label>
                  <div className="flex gap-2">
                    {(['4', '6', '8', '12'] as const).map(d => (
                      <button
                        key={d}
                        onClick={() => setDuration(d)}
                        className={`flex-1 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                          duration === d
                            ? 'border-primary-400 bg-primary-500/20 text-white'
                            : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                        }`}
                      >
                        {d}w
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={generateCourse}
                disabled={!topic.trim() || loading}
                className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl text-white font-bold text-lg hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-40 flex items-center justify-center gap-3 shadow-lg shadow-primary-500/20"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating your course...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate My Course
                  </>
                )}
              </button>

              {error && (
                <p className="text-red-400 text-sm text-center">{error}</p>
              )}
            </div>

            {/* Suggested Topics */}
            <div>
              <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 text-center">Or try one of these</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {SUGGESTED_TOPICS.map(t => (
                  <button
                    key={t}
                    onClick={() => setTopic(t)}
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-full text-sm text-slate-300 hover:bg-white/10 hover:border-primary-400/50 transition-all"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 stagger-children">
              {[
                { icon: <BookOpen className="w-6 h-6" />, title: 'Rich Lessons', desc: 'Detailed explanations with examples' },
                { icon: <Brain className="w-6 h-6" />, title: 'Flashcards', desc: 'Interactive cards for memorization' },
                { icon: <PenTool className="w-6 h-6" />, title: 'Exercises', desc: 'Practice activities & fill-in-blanks' },
                { icon: <Trophy className="w-6 h-6" />, title: 'Weekly Tests', desc: 'Assess your progress each week' },
              ].map((f, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center reveal depth-card">
                  <div className="text-primary-400 mb-3 flex justify-center">{f.icon}</div>
                  <h3 className="text-white font-bold mb-1">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </div>
              ))}
            </div>

            {/* Previously Created Courses */}
            <PreviousCourses />
          </div>
        ) : (
          /* Generated Course Preview */
          <div className="space-y-8 page-enter">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" /> Course Created Successfully!
              </div>
              <h2 className="text-4xl font-black text-white mb-4">{generatedCourse.title}</h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">{generatedCourse.description}</p>
            </div>

            {/* Course Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Clock className="w-5 h-5 text-primary-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">{generatedCourse.duration}</p>
                <p className="text-xs text-slate-400">Duration</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <Target className="w-5 h-5 text-primary-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white capitalize">{generatedCourse.level}</p>
                <p className="text-xs text-slate-400">Level</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                <BookOpen className="w-5 h-5 text-primary-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">{generatedCourse.weeks.reduce((s, w) => s + w.topics.length, 0)}</p>
                <p className="text-xs text-slate-400">Lessons</p>
              </div>
            </div>

            {/* Learning Outcomes */}
            <div className="bg-gradient-to-br from-primary-500/5 to-accent-500/5 border border-primary-500/20 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary-400" /> What You'll Learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {generatedCourse.learningOutcomes.map((outcome, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Zap className="w-4 h-4 text-primary-400 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-200 text-sm">{outcome}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Week-by-Week Curriculum */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary-400" /> Course Curriculum
              </h3>
              {generatedCourse.weeks.map((week, wi) => (
                <div key={wi} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-primary-500/30 transition-all">
                  <h4 className="text-md font-bold text-primary-300 mb-3">{week.title}</h4>
                  <div className="space-y-2">
                    {week.topics.map((topic, ti) => (
                      <div key={ti} className="flex items-center gap-2 text-slate-300 text-sm">
                        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                        {topic}
                      </div>
                    ))}
                  </div>
                  {wi < generatedCourse.weeks.length - 1 && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-400">
                      <Trophy className="w-3.5 h-3.5" />
                      Weekly Test at end of week
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={startLearning}
                className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl text-white font-bold text-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-3"
              >
                <Zap className="w-5 h-5" />
                Start Learning Now
              </button>
              <button
                onClick={() => { setGeneratedCourse(null); setTopic(''); }}
                className="px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-slate-300 hover:bg-white/10 transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Create Different Course
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Previously Created Courses ───────────────────────────────────
const PreviousCourses: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<any[]>([]);

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('ma_custom_courses') || '[]');
    setCourses(saved);
  }, []);

  if (courses.length === 0) return null;

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-4">Your Created Courses</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {courses.map((course: any) => (
          <button
            key={course.id}
            onClick={() => navigate(`/learn/${course.id}`)}
            className="bg-white/5 border border-white/10 rounded-xl p-5 text-left hover:border-primary-400/50 transition-all group"
          >
            <h4 className="text-white font-bold mb-1 group-hover:text-primary-300 transition-colors">{course.title}</h4>
            <p className="text-sm text-slate-400 line-clamp-2">{course.description}</p>
            <p className="text-xs text-slate-500 mt-2">Created {new Date(course.createdAt).toLocaleDateString()}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CreateCoursePage;
