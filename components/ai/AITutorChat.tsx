import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, Trash2, BookOpen } from 'lucide-react';
import { aiTutorChat } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey, type AIMessage } from '../../services/aiService';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
};

const QUICK_QUESTIONS = [
  'What are the 5 pillars of Islam?',
  'Explain Surah Al-Fatiha',
  'What is the importance of Salah?',
  'Teach me basic Arabic greetings',
  'What are the rules of fasting in Ramadan?',
  'Who was Prophet Muhammad ﷺ?',
  'Explain the concept of Tawheed',
  'What is Tajweed and why is it important?',
];

const AITutorChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'بسم الله الرحمن الرحيم\n\nAssalamu Alaikum! I am **Noor AI**, your personal Islamic studies tutor at Mohammadi Academy. 🌟\n\nI can help you with:\n- **Quran** — Tafsir, translation, and understanding\n- **Hadith** — Authentic narrations and their meanings\n- **Fiqh** — Islamic jurisprudence and daily rulings\n- **Arabic** — Grammar, vocabulary, and conversation\n- **Islamic History** — Seerah and companions\n- **General Studies** — Science, Math, and more\n\nAsk me anything!',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasApiKey = hasOpenRouterApiKey();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

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

      const response = await aiTutorChat(messageText, history);

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I apologize, I encountered an issue processing your request. Please try again or check your API configuration.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([messages[0]]);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Bot className="mx-auto mb-4 text-primary-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">AI Tutor Not Configured</h2>
          <p className="text-slate-400">Please configure the OpenRouter API key in your environment settings to enable Noor AI Tutor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
            <Sparkles className="text-white" size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Noor AI Tutor</h2>
            <p className="text-xs text-slate-400">Your Islamic knowledge companion</p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all"
          title="Clear chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map(msg => (
          <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0">
                <Bot size={16} className="text-white" />
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
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-white" />
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
        <div className="px-6 pb-3">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-slate-400" />
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Quick Questions</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_QUESTIONS.map((q, i) => (
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
      <div className="px-6 py-4 border-t border-white/10">
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
            placeholder="Ask Noor AI anything..."
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

export default AITutorChat;
