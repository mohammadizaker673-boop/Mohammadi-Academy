import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Send, Bot, User, Sparkles, Loader2, Trash2, BookOpen, ArrowLeft, ChevronRight } from 'lucide-react';
import { aiTutorChat } from '../services/aiFeaturesService';
import { hasOpenRouterApiKey, type AIMessage } from '../services/aiService';
import LogoLink from '../components/LogoLink';
import LanguageSelector from '../components/LanguageSelector';
import BackButton from '../components/BackButton';
import { useLanguage } from '../contexts/LanguageContext';
import { TRANSLATIONS } from '../constants';
import { DepthOrbs } from '../components/motion/MotionElements';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

interface SubjectTeacher {
  id: string;
  name: string;
  title: string;
  emoji: string;
  color: string;
  systemPrompt: string;
  quickQuestions: string[];
  greeting: string;
}

const SUBJECT_TEACHERS: SubjectTeacher[] = [
  {
    id: 'quran',
    name: 'Sheikh Noor',
    title: 'Quran & Tajweed',
    emoji: '📖',
    color: 'from-emerald-500 to-teal-500',
    systemPrompt: `You are Sheikh Noor, the Quran & Tajweed AI teacher at Mohammadi Academy. You specialize in:
- Quran recitation and Tajweed rules (Noon Sakinah, Meem Sakinah, Madd, Qalqalah, etc.)
- Tafsir (interpretation) from classical scholars (Ibn Kathir, Jalalayn)
- Memorization techniques and Hifz guidance
- Arabic phonetics and Makhaarij al-Huroof
Always use proper Islamic etiquette, reference Surah:Ayah numbers, and be encouraging. Begin Islamic responses with بسم الله.`,
    quickQuestions: [
      'What are the basic Tajweed rules?',
      'How do I memorize Quran effectively?',
      'Explain Surah Al-Fatiha',
      'What is the difference between Idgham and Ikhfa?',
    ],
    greeting: 'بسم الله الرحمن الرحيم\n\nAssalamu Alaikum! I am **Sheikh Noor**, your Quran & Tajweed teacher. I can help you with recitation rules, memorization, and understanding the Holy Quran. What would you like to learn today?',
  },
  {
    id: 'islamic-studies',
    name: 'Ustadh Ibrahim',
    title: 'Islamic Studies & Fiqh',
    emoji: '🕌',
    color: 'from-amber-500 to-orange-500',
    systemPrompt: `You are Ustadh Ibrahim, the Islamic Studies & Fiqh AI teacher at Mohammadi Academy. You specialize in:
- Fiqh (Islamic jurisprudence) across major schools: Hanafi, Shafi'i, Maliki, Hanbali
- Aqeedah (Islamic creed) - Ash'ari & Maturidi traditions
- Hadith sciences - authentication, chains (isnad), major collections
- Seerah (Prophet's biography) and Islamic history
- Daily ibadah (worship) guidance
Never give fatwa — always recommend consulting qualified scholars. Cite hadith with source (Bukhari, Muslim, etc.).`,
    quickQuestions: [
      'What are the 5 pillars of Islam?',
      'Explain the concept of Tawheed',
      'What are the rules of fasting?',
      'Who was Prophet Muhammad ﷺ?',
    ],
    greeting: 'بسم الله الرحمن الرحيم\n\nAssalamu Alaikum! I am **Ustadh Ibrahim**, your Islamic Studies teacher. I cover Fiqh, Aqeedah, Hadith, and Seerah. Ask me anything about Islam and I will guide you with authentic sources.',
  },
  {
    id: 'arabic',
    name: 'Mu\'allim Ahmad',
    title: 'Arabic Language',
    emoji: '🇸🇦',
    color: 'from-blue-500 to-indigo-500',
    systemPrompt: `You are Mu'allim Ahmad, the Arabic Language AI teacher at Mohammadi Academy. You specialize in:
- Arabic grammar (Nahw) - sentence structure, i'rab, types of words
- Arabic morphology (Sarf) - verb patterns, root systems, derived forms
- Vocabulary building with contextual examples
- Conversational Arabic for beginners to advanced
- Quranic Arabic specifically for understanding the Quran
- Arabic rhetoric (Balagha)
Use Arabic script with transliteration and English meaning. Be patient with beginners.`,
    quickQuestions: [
      'Teach me basic Arabic greetings',
      'What are Arabic verb patterns?',
      'How does Arabic grammar work?',
      'Common Quranic vocabulary',
    ],
    greeting: 'مرحباً! Marhaban!\n\nI am **Mu\'allim Ahmad**, your Arabic Language teacher. Whether you\'re starting from Alif-Ba or diving into advanced grammar, I\'m here to help. Let\'s begin your Arabic journey!',
  },
  {
    id: 'science',
    name: 'Dr. Fatima',
    title: 'Science & STEM',
    emoji: '🔬',
    color: 'from-violet-500 to-purple-500',
    systemPrompt: `You are Dr. Fatima, the Science & STEM AI teacher at Mohammadi Academy. You specialize in:
- General science (biology, chemistry, physics) for all levels
- Mathematics fundamentals and problem-solving
- Environmental science and natural world
- STEM concepts explained simply
- Connecting scientific knowledge with Islamic perspective when relevant
Make complex topics accessible. Use examples, analogies, and step-by-step explanations. Encourage curiosity.`,
    quickQuestions: [
      'How does photosynthesis work?',
      'Explain the water cycle',
      'What are Newton\'s laws of motion?',
      'Basic algebra help',
    ],
    greeting: 'Welcome! I am **Dr. Fatima**, your Science & STEM teacher. From biology to physics to math, I make complex topics simple and fun. What are you curious about today?',
  },
  {
    id: 'it',
    name: 'Engineer Zain',
    title: 'IT & Digital Skills',
    emoji: '💻',
    color: 'from-cyan-500 to-blue-500',
    systemPrompt: `You are Engineer Zain, the IT & Digital Skills AI teacher at Mohammadi Academy. You specialize in:
- Computer basics and digital literacy
- Programming fundamentals (Scratch, Python, web basics)
- Online safety and digital citizenship
- Artificial Intelligence concepts
- Digital productivity tools
Explain technology concepts in simple terms. Use practical examples. Be mindful of age-appropriate content.`,
    quickQuestions: [
      'How do computers work?',
      'Teach me basic coding concepts',
      'What is Artificial Intelligence?',
      'How to stay safe online?',
    ],
    greeting: 'Hey there! I\'m **Engineer Zain**, your IT & Digital Skills teacher. Whether it\'s coding, computers, or AI — I\'ll break it down for you step by step. What tech topic interests you?',
  },
  {
    id: 'life-skills',
    name: 'Mentor Aisha',
    title: 'Life Skills & Career',
    emoji: '🌱',
    color: 'from-rose-500 to-pink-500',
    systemPrompt: `You are Mentor Aisha, the Life Skills & Career AI teacher at Mohammadi Academy. You specialize in:
- Character building and Islamic manners (Adab)
- Financial literacy with halal income principles
- Career awareness and CV/resume basics
- Health, first aid, and family wellness
- Small business basics and entrepreneurship
- Agriculture and practical life skills
Give practical, actionable advice. Connect life skills with Islamic ethics when relevant.`,
    quickQuestions: [
      'How to write a good CV?',
      'What is halal income?',
      'Basic first aid tips',
      'How to start a small business?',
    ],
    greeting: 'Assalamu Alaikum! I\'m **Mentor Aisha**, your Life Skills & Career guide. From financial literacy to career planning to personal development — I\'m here to help you grow. What can I help you with?',
  },
  {
    id: 'languages',
    name: 'Teacher Mariam',
    title: 'English, Farsi & Pashto',
    emoji: '🌍',
    color: 'from-teal-500 to-emerald-500',
    systemPrompt: `You are Teacher Mariam, the Languages AI teacher at Mohammadi Academy. You specialize in:
- English language (grammar, vocabulary, conversation, writing)
- Persian/Dari language (reading, writing, conversation)
- Pashto language (reading, writing, conversation)
- Language learning strategies and tips
- Translation assistance between these languages
Adapt to the student's current level. Use examples, practice sentences, and encourage speaking. Be patient.`,
    quickQuestions: [
      'Help me improve my English grammar',
      'Teach me Dari/Persian basics',
      'Common Pashto phrases',
      'How to learn a new language fast?',
    ],
    greeting: 'Hello! سلام! سلام!\n\nI\'m **Teacher Mariam**, your language tutor. I can help you with English, Persian (Dari), and Pashto. Let\'s practice together — which language would you like to work on?',
  },
  {
    id: 'general',
    name: 'Noor AI',
    title: 'General Tutor',
    emoji: '✨',
    color: 'from-primary-500 to-accent-500',
    systemPrompt: `You are Noor AI, the general-purpose intelligent tutor of Mohammadi Academy. You can help with ANY subject:
- Quran, Hadith, Fiqh, Islamic Studies
- Arabic, English, Persian, Pashto languages
- Science, Math, Technology, AI
- Life skills, career, health
- General knowledge for all ages
Be respectful, encouraging, and adapt to the student's level. Use Islamic etiquette when appropriate.`,
    quickQuestions: [
      'What are the 5 pillars of Islam?',
      'Help me with my homework',
      'Teach me something new today',
      'What courses does the academy offer?',
    ],
    greeting: 'بسم الله الرحمن الرحيم\n\nAssalamu Alaikum! I\'m **Noor AI**, your all-in-one tutor at Mohammadi Academy. I can help with Quran, Islamic studies, languages, science, IT, and more. What would you like to learn?',
  },
];

const AITutorPage: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const [selectedTeacher, setSelectedTeacher] = useState<SubjectTeacher | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasApiKey = hasOpenRouterApiKey();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectTeacher = (teacher: SubjectTeacher) => {
    setSelectedTeacher(teacher);
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: teacher.greeting,
        timestamp: new Date(),
      },
    ]);
    setInput('');
  };

  const goBack = () => {
    setSelectedTeacher(null);
    setMessages([]);
    setInput('');
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading || !selectedTeacher) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history: AIMessage[] = messages
        .filter(m => m.id !== '0')
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await aiTutorChat(messageText, history, selectedTeacher.systemPrompt);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, I encountered an issue. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    if (selectedTeacher) {
      setMessages([
        {
          id: '0',
          role: 'assistant',
          content: selectedTeacher.greeting,
          timestamp: new Date(),
        },
      ]);
    }
  };

  // Teacher selection grid
  if (!selectedTeacher) {
    return (
      <div className="min-h-screen bg-[#050a12] relative overflow-hidden">
        <DepthOrbs count={4} colors={['rgba(59,130,246,0.10)', 'rgba(245,158,11,0.06)', 'rgba(139,92,246,0.10)', 'rgba(16,185,129,0.06)']} />
        {/* Nav */}
        <nav className="fixed top-0 w-full z-50 bg-[#050a12]/80 backdrop-blur-2xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <LogoLink />
            <div className="flex items-center gap-4">
              <LanguageSelector />
              <Link to="/courses" className="text-slate-300 hover:text-primary-400 text-[11px] font-black uppercase tracking-wider transition-colors">Courses</Link>
              <Link to="/" className="px-5 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full text-[11px] font-black uppercase tracking-wider hover:from-primary-400 hover:to-accent-400 transition-all">Home</Link>
            </div>
          </div>
        </nav>

        <div className="pt-32 pb-20 px-6">
          <div className="max-w-6xl mx-auto page-enter">
            <BackButton to="/" label="← Back to Home" variant="light" />
            <div className="text-center mt-6 mb-16 relative">
              {/* Decorative orbit */}
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none opacity-20" aria-hidden="true">
                <div className="absolute inset-0 rounded-full border border-white/[0.04] animate-spin-slow" />
                <div className="absolute inset-12 rounded-full border border-primary-400/[0.06]" style={{ animationDirection: 'reverse' }} />
              </div>
              <div className="inline-flex items-center gap-3 px-5 py-2.5 bg-primary-400/10 border border-primary-400/20 rounded-full mb-6 animate-glow">
                <Sparkles size={16} className="text-primary-400" />
                <span className="text-primary-300 text-[10px] font-black tracking-[0.3em] uppercase">AI-Powered Learning</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-accent-400 mb-6 animate-text-glow">
                AI Teachers
              </h1>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Choose a subject-specialized AI teacher to get personalized help. Each teacher is trained in their field and ready to guide you.
              </p>
            </div>

            {!hasApiKey && (
              <div className="max-w-lg mx-auto mb-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
                <Bot className="mx-auto mb-3 text-amber-400" size={36} />
                <h3 className="text-lg font-bold text-white mb-2">AI Not Configured</h3>
                <p className="text-slate-400 text-sm">The AI system requires an API key to function. Please contact the administrator.</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 stagger-children">
              {SUBJECT_TEACHERS.map(teacher => (
                <button
                  key={teacher.id}
                  onClick={() => hasApiKey && selectTeacher(teacher)}
                  disabled={!hasApiKey}
                  className={`group text-left bg-white/5 border border-white/10 rounded-2xl p-6 transition-all depth-card reveal ${
                    hasApiKey ? 'hover:border-primary-400/40 hover:bg-white/[0.08] cursor-pointer' : 'opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${teacher.color} flex items-center justify-center text-2xl mb-4 animate-float-slow`}>
                    {teacher.emoji}
                  </div>
                  <h3 className="text-lg font-black text-white mb-1">{teacher.name}</h3>
                  <p className="text-sm text-slate-400 mb-4">{teacher.title}</p>
                  <div className="flex items-center gap-1 text-primary-400 text-xs font-bold uppercase tracking-wider">
                    Start Chat <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-white/10 bg-[#050a12] py-8">
          <div className="max-w-6xl mx-auto px-6 text-center">
            <p className="text-slate-500 text-sm">&copy; 2026 Mohammadi Online Quran Academy. All rights reserved.</p>
          </div>
        </footer>
      </div>
    );
  }

  // Chat view
  return (
    <div className="min-h-screen bg-[#050a12] flex flex-col">
      {/* Chat header */}
      <div className="bg-[#050a12]/80 backdrop-blur-2xl border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={goBack}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${selectedTeacher.color} flex items-center justify-center text-lg`}>
            {selectedTeacher.emoji}
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">{selectedTeacher.name}</h2>
            <p className="text-xs text-slate-400">{selectedTeacher.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={clearChat}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
            title="Clear chat"
          >
            <Trash2 size={18} />
          </button>
          <Link to="/ai-tutor" onClick={goBack} className="text-xs text-slate-400 hover:text-white font-bold uppercase tracking-wider transition-colors">
            All Teachers
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 max-w-4xl mx-auto w-full">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedTeacher.color} flex items-center justify-center flex-shrink-0 text-sm`}>
                {selectedTeacher.emoji}
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                msg.role === 'user'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/10 text-slate-200 border border-white/10'
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</div>
              <div className="text-[10px] mt-2 opacity-50">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-white" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${selectedTeacher.color} flex items-center justify-center flex-shrink-0 text-sm`}>
              {selectedTeacher.emoji}
            </div>
            <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/10">
              <Loader2 className="animate-spin text-primary-400" size={18} />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Questions */}
      {messages.length <= 1 && (
        <div className="px-6 pb-3 max-w-4xl mx-auto w-full">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Suggested Questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedTeacher.quickQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q)}
                className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-slate-300 hover:text-white transition-all"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 py-4 border-t border-white/10 max-w-4xl mx-auto w-full">
        <form
          onSubmit={e => {
            e.preventDefault();
            sendMessage();
          }}
          className="flex gap-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={`Ask ${selectedTeacher.name} anything...`}
            className="flex-1 px-5 py-3 bg-white/10 border border-white/15 rounded-full text-white placeholder:text-slate-400 focus:border-primary-400 focus:outline-none transition-all"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-5 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full font-bold disabled:opacity-50 hover:from-primary-400 hover:to-accent-400 transition-all"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutorPage;
