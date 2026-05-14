import React, { useState } from 'react';
import { Brain, Languages, LoaderCircle, MessageSquareQuote, Sparkles } from 'lucide-react';
import { generateAIText, hasOpenRouterApiKey } from '../../services/aiService';
import { LessonReference } from '../../utils/lessonExperience';
import { useLanguage } from '../../contexts/LanguageContext';

interface LessonAITutorProps {
  lessonTitle: string;
  lessonContext: string;
  reflectionQuestions: string[];
  references: LessonReference[];
}

const LessonAITutor: React.FC<LessonAITutorProps> = ({ lessonTitle, lessonContext, reflectionQuestions, references }) => {
  const { language } = useLanguage();
  const aiConfigured = hasOpenRouterApiKey();
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [responseLabel, setResponseLabel] = useState('');

  const targetLanguageByLang: Record<string, string> = {
    en: 'English',
    ar: 'Arabic',
    fa: 'Farsi',
    ps: 'Pashto'
  };

  const uiByLang: Record<string, any> = {
    en: {
      title: 'AI Lesson Tutor',
      subtitle: 'Use focused prompts to simplify the lesson, get examples, switch language, or self-test your understanding.',
      active: 'OpenRouter Active',
      offline: 'AI Offline',
      askSpecific: 'Ask something specific',
      placeholder: 'Ask for clarification, a simpler explanation, or a study question from this lesson...',
      restricted: 'The tutor is restricted to lesson context and verified references.',
      askTutor: 'Ask Tutor',
      customQuestion: 'Custom Question',
      preparing: 'Preparing a lesson-focused answer...',
      tutorResponse: 'Tutor Response',
      aiOfflineMessage: 'OpenRouter is not configured, so the lesson tutor cannot generate a live response yet.',
      aiErrorMessage: 'The lesson tutor could not generate a response right now. Try again or ask your teacher directly.'
    },
    ar: {
      title: 'مساعد الدرس بالذكاء الاصطناعي',
      subtitle: 'استخدم مطالبات مركزة لتبسيط الدرس والحصول على أمثلة واختبار فهمك.',
      active: 'OpenRouter فعال',
      offline: 'الذكاء الاصطناعي غير متصل',
      askSpecific: 'اسأل سؤالا محددا',
      placeholder: 'اطلب توضيحا أو تبسيطا أو سؤالا تدريبيا من هذا الدرس...',
      restricted: 'المساعد مقيد بسياق الدرس والمراجع الموثوقة.',
      askTutor: 'اسأل المساعد',
      customQuestion: 'سؤال مخصص',
      preparing: 'يتم إعداد إجابة مركزة على الدرس...',
      tutorResponse: 'رد المساعد',
      aiOfflineMessage: 'لم يتم إعداد OpenRouter لذلك لا يمكن إنشاء رد مباشر الآن.',
      aiErrorMessage: 'تعذر إنشاء رد الآن. حاول مرة أخرى أو اسأل معلمك مباشرة.'
    },
    fa: {
      title: 'مربی هوش مصنوعی درس',
      subtitle: 'با درخواست های هدفمند درس را ساده کنید، مثال بگیرید و فهم خود را ارزیابی کنید.',
      active: 'OpenRouter فعال',
      offline: 'هوش مصنوعی آفلاین',
      askSpecific: 'یک سوال مشخص بپرسید',
      placeholder: 'برای توضیح بیشتر، ساده سازی یا سوال تمرینی از این درس بپرسید...',
      restricted: 'مربی فقط به محتوای درس و منابع تایید شده محدود است.',
      askTutor: 'از مربی بپرس',
      customQuestion: 'سوال سفارشی',
      preparing: 'در حال آماده سازی پاسخ مبتنی بر درس...',
      tutorResponse: 'پاسخ مربی',
      aiOfflineMessage: 'OpenRouter تنظیم نشده است، بنابراین پاسخ زنده تولید نمی شود.',
      aiErrorMessage: 'در حال حاضر تولید پاسخ ممکن نیست. دوباره تلاش کنید یا از معلم بپرسید.'
    },
    ps: {
      title: 'د درس AI ښوونکی',
      subtitle: 'متمرکز غوښتنې وکاروئ ترڅو درس ساده کړئ، بېلګې واخلئ او ځان وازمویئ.',
      active: 'OpenRouter فعال',
      offline: 'AI آفلاین',
      askSpecific: 'يو مشخصه پوښتنه وکړئ',
      placeholder: 'له دې درس څخه روښانتيا، ساده تشريح يا تمريني پوښتنه وغواړئ...',
      restricted: 'ښوونکی يوازې د درس له متن او باوري سرچينو سره محدود دی.',
      askTutor: 'له ښوونکي وپوښته',
      customQuestion: 'ځانګړې پوښتنه',
      preparing: 'د درس اړوند ځواب چمتو کېږي...',
      tutorResponse: 'د ښوونکي ځواب',
      aiOfflineMessage: 'OpenRouter نه دی تنظیم شوی، نو ژوندی ځواب نه شي جوړېدای.',
      aiErrorMessage: 'اوس ځواب نه شي جوړېدای. بیا هڅه وکړئ یا له ښوونکي وپوښتئ.'
    }
  };

  const ui = uiByLang[language] || uiByLang.en;
  const quickActions = [
    {
      label: language === 'ar' ? 'اشرح كأني بعمر 10' : language === 'fa' ? 'مثل 10 ساله توضیح بده' : language === 'ps' ? 'لکه د لس کلن لپاره تشریح' : 'Explain Like I\'m 10',
      prompt: `Explain this lesson like I am 10 years old. Respond only in ${targetLanguageByLang[language] || 'English'}. Keep the language warm, simple, and clear.`
    },
    {
      label: language === 'ar' ? 'مثال من الحياة' : language === 'fa' ? 'مثال واقعی' : language === 'ps' ? 'د ژوند بېلګه' : 'Real-Life Example',
      prompt: `Give one realistic daily-life example that shows how this lesson should be practiced. Respond in ${targetLanguageByLang[language] || 'English'}.`
    },
    {
      label: language === 'ar' ? 'ملخص الدرس' : language === 'fa' ? 'خلاصه درس' : language === 'ps' ? 'د درس لنډيز' : 'Lesson Summary',
      prompt: `Summarize this lesson using short bullet points. Respond only in ${targetLanguageByLang[language] || 'English'}.`
    },
    {
      label: language === 'ar' ? 'اسألني 3 أسئلة' : language === 'fa' ? '3 سوال از من بپرس' : language === 'ps' ? 'له ما 3 پوښتنې وکړه' : 'Ask Me Questions',
      prompt: `Ask me exactly 3 short questions from this lesson without giving the answers yet. Respond in ${targetLanguageByLang[language] || 'English'}.`
    }
  ];

  const submitPrompt = async (label: string, prompt: string) => {
    if (!prompt.trim()) {
      return;
    }

    if (!aiConfigured) {
      setResponseLabel(label);
      setResponse(ui.aiOfflineMessage);
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
      setResponse(ui.aiErrorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-sky-300 mb-2 flex items-center gap-2">
            <Brain size={16} /> {ui.title}
          </h3>
          <p className="text-sm text-slate-300">
            {ui.subtitle}
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-white/5 text-[10px] uppercase tracking-[0.2em] text-slate-400">
          {aiConfigured ? ui.active : ui.offline}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {quickActions.map((action) => (
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
          <MessageSquareQuote size={16} /> {ui.askSpecific}
        </div>
        <textarea
          value={customPrompt}
          onChange={(event) => setCustomPrompt(event.target.value)}
          rows={3}
          placeholder={ui.placeholder}
          className="w-full rounded-xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/60"
        />
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <Languages size={14} /> {ui.restricted}
          </p>
          <button
            type="button"
            onClick={() => submitPrompt(ui.customQuestion, customPrompt)}
            disabled={loading || !customPrompt.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold hover:from-primary-400 hover:to-accent-400 transition disabled:opacity-50"
          >
            {ui.askTutor}
          </button>
        </div>
      </div>

      {(response || loading) && (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-primary-300 font-black mb-3">
            {loading ? <LoaderCircle className="animate-spin" size={14} /> : <Sparkles size={14} />}
            {responseLabel || ui.tutorResponse}
          </div>
          <div className="text-sm text-slate-100 whitespace-pre-wrap leading-6">
            {loading ? ui.preparing : response}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonAITutor;