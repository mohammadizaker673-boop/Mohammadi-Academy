import React, { useState } from 'react';
import { Brain, Languages, LoaderCircle, MessageSquareQuote, Sparkles } from 'lucide-react';
import { generateAIText, hasOpenRouterApiKey } from '../../services/aiService';
import { LessonReference } from '../../utils/lessonExperience';

interface LessonAITutorProps {
  lessonTitle: string;
  lessonContext: string;
  reflectionQuestions: string[];
  references: LessonReference[];
}

const QUICK_ACTIONS = [
  {
    label: 'Explain Like I\'m 10',
    prompt: 'Explain this lesson like I am 10 years old. Keep the language warm, simple, and clear.'
  },
  {
    label: 'Real-Life Example',
    prompt: 'Give one realistic daily-life example that shows how this lesson should be practiced.'
  },
  {
    label: 'Summary in English',
    prompt: 'Summarize this lesson in clear English using short bullet points.'
  },
  {
    label: 'Summary in Urdu',
    prompt: 'Summarize this lesson in simple Urdu for students and families.'
  },
  {
    label: 'Summary in Arabic',
    prompt: 'Summarize this lesson in clear Arabic suitable for learners.'
  },
  {
    label: 'Ask Me Questions',
    prompt: 'Ask me exactly 3 short questions from this lesson without giving the answers yet.'
  }
];

const LessonAITutor: React.FC<LessonAITutorProps> = ({ lessonTitle, lessonContext, reflectionQuestions, references }) => {
  const aiConfigured = hasOpenRouterApiKey();
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [responseLabel, setResponseLabel] = useState('');

  const submitPrompt = async (label: string, prompt: string) => {
    if (!prompt.trim()) {
      return;
    }

    if (!aiConfigured) {
      setResponseLabel(label);
      setResponse('OpenRouter is not configured, so the lesson tutor cannot generate a live response yet.');
      return;
    }

    setLoading(true);
    setResponseLabel(label);

    try {
      const aiResponse = await generateAIText({
        maxTokens: 800,
        temperature: 0.35,
        messages: [
          {
            role: 'system',
            content: [
              'You are Muhammadi Academy\'s lesson tutor.',
              'Stay strictly inside the supplied lesson context and references.',
              'Do not improvise fatwa-style answers or unsupported rulings.',
              'If the learner asks something beyond the lesson context, tell them to ask a qualified teacher or scholar.',
              'Use respectful, practical language and keep the answer easy to study.'
            ].join(' ')
          },
          {
            role: 'user',
            content: [
              `Lesson: ${lessonTitle}`,
              `Context:\n${lessonContext}`,
              `Reflection prompts: ${reflectionQuestions.join(' | ')}`,
              `Verified references: ${references.map((reference) => `${reference.citation} (${reference.sourceType})`).join(' | ')}`,
              `Task: ${prompt}`
            ].join('\n\n')
          }
        ]
      });

      setResponse(aiResponse);
    } catch (error) {
      console.error('Lesson AI tutor failed:', error);
      setResponse('The lesson tutor could not generate a response right now. Try again or ask your teacher directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-sky-300 mb-2 flex items-center gap-2">
            <Brain size={16} /> AI Lesson Tutor
          </h3>
          <p className="text-sm text-slate-300">
            Use focused prompts to simplify the lesson, get examples, switch language, or self-test your understanding.
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          {aiConfigured ? 'OpenRouter Active' : 'AI Offline'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={() => submitPrompt(action.label, action.prompt)}
            disabled={loading}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-slate-100 hover:bg-white/10 transition disabled:opacity-50"
          >
            <span className="font-semibold">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <MessageSquareQuote size={16} /> Ask something specific
        </div>
        <textarea
          value={customPrompt}
          onChange={(event) => setCustomPrompt(event.target.value)}
          rows={3}
          placeholder="Ask for clarification, a simpler explanation, or a study question from this lesson..."
          className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/60"
        />
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <Languages size={14} /> The tutor is restricted to lesson context and verified references.
          </p>
          <button
            type="button"
            onClick={() => submitPrompt('Custom Question', customPrompt)}
            disabled={loading || !customPrompt.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:from-primary-400 hover:to-accent-400 transition disabled:opacity-50"
          >
            Ask Tutor
          </button>
        </div>
      </div>

      {(response || loading) && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary-300 font-black mb-3">
            {loading ? <LoaderCircle className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {responseLabel || 'Tutor Response'}
          </div>
          <div className="text-sm text-slate-100 whitespace-pre-wrap leading-6">
            {loading ? 'Preparing a lesson-focused answer...' : response}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonAITutor;