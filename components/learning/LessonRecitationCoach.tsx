import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Mic, MicOff, Sparkles, Volume2 } from 'lucide-react';
import { generateAIText, hasOpenRouterApiKey } from '../../services/aiService';
import {
  LessonRecitationEvaluation,
  LessonRecitationMetrics,
  LessonRecitationTarget,
  LessonReference,
  evaluateRecitationTranscript,
} from '../../utils/lessonExperience';

interface LessonRecitationCoachProps {
  lessonTitle: string;
  target: LessonRecitationTarget;
  references: LessonReference[];
  metrics: LessonRecitationMetrics;
  onResult: (evaluation: LessonRecitationEvaluation) => void;
  onManualPracticeComplete: () => void;
}

const buildDeterministicFeedback = (
  evaluation: LessonRecitationEvaluation | null,
  target: LessonRecitationTarget
): string => {
  if (!evaluation) {
    return 'Start a practice attempt to receive structured pronunciation guidance for this lesson.';
  }

  const feedback: string[] = [];

  if (evaluation.score >= 85) {
    feedback.push('Your recitation matched the target closely. Keep the same calm pace and repeat it once more to lock it in.');
  } else if (evaluation.score >= 65) {
    feedback.push('You are close, but a slower repetition will help align the missing parts of the target more clearly.');
  } else {
    feedback.push('The transcript shows several missing target words. Slow down, listen once, and repeat the passage in smaller parts.');
  }

  if (evaluation.missingTokens.length > 0) {
    feedback.push(`Focus next on these missed words: ${evaluation.missingTokens.slice(0, 6).join(', ')}.`);
  }

  if (evaluation.extraTokens.length > 0) {
    feedback.push('A few extra words were detected, so keep the recitation tighter to the target text on the next attempt.');
  }

  if (target.transliteration) {
    feedback.push(`Transliteration support: ${target.transliteration}`);
  }

  return feedback.join(' ');
};

const LessonRecitationCoach: React.FC<LessonRecitationCoachProps> = ({
  lessonTitle,
  target,
  references,
  metrics,
  onResult,
  onManualPracticeComplete,
}) => {
  const recognitionRef = useRef<any>(null);
  const transcriptBufferRef = useRef('');
  const [isSupported, setIsSupported] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [evaluation, setEvaluation] = useState<LessonRecitationEvaluation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState('');
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const aiConfigured = hasOpenRouterApiKey();

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = target.arabicText ? 'ar-SA' : 'en-US';
    setIsSupported(true);

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [target.arabicText]);

  const deterministicFeedback = useMemo(
    () => buildDeterministicFeedback(evaluation, target),
    [evaluation, target]
  );

  useEffect(() => {
    if (!evaluation || !aiConfigured || !evaluation.transcript.trim()) {
      setAiFeedback('');
      setIsGeneratingFeedback(false);
      return;
    }

    let active = true;
    setIsGeneratingFeedback(true);

    generateAIText({
      maxTokens: 220,
      temperature: 0.2,
      messages: [
        {
          role: 'system',
          content: [
            'You are Muhammadi Academy\'s recitation coach.',
            'Only evaluate the provided transcript against the provided target text.',
            'Keep the response supportive, brief, and practical.',
            'Do not invent fiqh rulings or theology. Do not mention content outside the target and references.'
          ].join(' ')
        },
        {
          role: 'user',
          content: [
            `Lesson: ${lessonTitle}`,
            `Target Arabic: ${target.arabicText || 'n/a'}`,
            `Target transliteration: ${target.transliteration || 'n/a'}`,
            `Transcript: ${evaluation.transcript}`,
            `Score: ${evaluation.score}`,
            `Matched tokens: ${evaluation.matchedTokens.join(', ') || 'none'}`,
            `Missing tokens: ${evaluation.missingTokens.join(', ') || 'none'}`,
            `Extra tokens: ${evaluation.extraTokens.join(', ') || 'none'}`,
            `Verified references: ${references.map((reference) => reference.citation).join('; ') || 'none'}`,
            'Give 2 or 3 short coaching sentences only.'
          ].join('\n')
        }
      ]
    })
      .then((response) => {
        if (active) {
          setAiFeedback(response);
        }
      })
      .catch(() => {
        if (active) {
          setAiFeedback('');
        }
      })
      .finally(() => {
        if (active) {
          setIsGeneratingFeedback(false);
        }
      });

    return () => {
      active = false;
    };
  }, [aiConfigured, evaluation, lessonTitle, references, target.arabicText, target.transliteration]);

  const handleListenToTarget = () => {
    const textToSpeak = target.arabicText || target.transliteration;
    if (!textToSpeak || !('speechSynthesis' in window)) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = target.arabicText ? 'ar-SA' : 'en-US';
    utterance.rate = 0.8;
    window.speechSynthesis.speak(utterance);
  };

  const finalizeAttempt = () => {
    const finalTranscript = transcriptBufferRef.current.trim();
    setIsListening(false);

    if (!finalTranscript) {
      return;
    }

    const nextEvaluation = evaluateRecitationTranscript(finalTranscript, target);
    setTranscript(finalTranscript);
    setEvaluation(nextEvaluation);
    onResult(nextEvaluation);
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition is not available in this browser.');
      return;
    }

    setError(null);
    setTranscript('');
    setEvaluation(null);
    transcriptBufferRef.current = '';
    setIsListening(true);

    recognitionRef.current.onresult = (event: any) => {
      const nextTranscript = Array.from(event.results)
        .map((result: any) => result[0]?.transcript || '')
        .join(' ')
        .trim();

      transcriptBufferRef.current = nextTranscript;
      setTranscript(nextTranscript);
    };

    recognitionRef.current.onerror = () => {
      setError('The browser could not capture a clean recitation attempt. Please try again.');
      setIsListening(false);
    };

    recognitionRef.current.onend = finalizeAttempt;
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const displayedFeedback = aiFeedback || deterministicFeedback;

  return (
    <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-cyan-300 mb-2 flex items-center gap-2">
            <Mic size={16} /> Recitation Coach
          </h3>
          <p className="text-sm text-slate-300">Practice the lesson text with browser speech recognition, then review where your recitation aligned and where it still needs slower repetition.</p>
        </div>
        <div className="text-right">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Best Score</p>
          <p className="text-2xl font-black text-white">{metrics.bestScore || 0}%</p>
          <p className="text-xs text-slate-400 mt-1">{metrics.attempts} attempts</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Target Recitation</p>
        {target.arabicText ? <p className="text-right text-white text-2xl font-arabic">{target.arabicText}</p> : null}
        {target.transliteration ? <p className="text-sm italic text-slate-300">{target.transliteration}</p> : null}
        <button
          type="button"
          onClick={handleListenToTarget}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white hover:bg-white/15 transition"
        >
          <Volume2 size={16} /> Listen to Target
        </button>
      </div>

      {!isSupported ? (
        <div className="rounded-2xl border border-dashed border-amber-500/30 bg-amber-500/10 p-4 space-y-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-amber-300 mt-0.5" size={18} />
            <div>
              <p className="text-sm font-bold text-amber-100">Live recitation capture is unavailable in this browser.</p>
              <p className="text-sm text-amber-50/80 mt-1">Use the target text and transliteration above, repeat it slowly three times, then mark practice complete to keep your learning path moving.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onManualPracticeComplete}
            className="px-4 py-2 rounded-xl bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 transition"
          >
            Mark Practice Complete
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`px-4 py-2 rounded-xl font-bold transition ${isListening ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-400 hover:to-blue-400'}`}
            >
              {isListening ? <><MicOff size={16} className="inline mr-2" />Stop Listening</> : <><Mic size={16} className="inline mr-2" />Start Recitation</>}
            </button>
          </div>

          {error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div>
          ) : null}

          {transcript ? (
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black mb-2">Captured Transcript</p>
              <p className="text-sm text-white leading-6">{transcript}</p>
            </div>
          ) : null}

          {evaluation ? (
            <div className="space-y-4">
              <div className={`rounded-2xl border p-4 ${evaluation.score >= 80 ? 'border-emerald-500/30 bg-emerald-500/10' : evaluation.score >= 60 ? 'border-amber-500/30 bg-amber-500/10' : 'border-rose-500/30 bg-rose-500/10'}`}>
                <div className="flex items-center gap-3">
                  {evaluation.score >= 80 ? <CheckCircle2 className="text-emerald-300" size={18} /> : <AlertCircle className="text-amber-300" size={18} />}
                  <div>
                    <p className="text-white font-bold">Recitation Match: {evaluation.score}%</p>
                    <p className="text-sm text-slate-200 mt-1">{displayedFeedback}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200 font-black mb-2">Matched</p>
                  <p className="text-sm text-emerald-50">{evaluation.matchedTokens.length > 0 ? evaluation.matchedTokens.join(', ') : 'No strong matches yet.'}</p>
                </div>
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-amber-200 font-black mb-2">Missed</p>
                  <p className="text-sm text-amber-50">{evaluation.missingTokens.length > 0 ? evaluation.missingTokens.join(', ') : 'No missed target words.'}</p>
                </div>
                <div className="rounded-xl bg-white/5 border border-white/10 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-black mb-2">Extra</p>
                  <p className="text-sm text-slate-200">{evaluation.extraTokens.length > 0 ? evaluation.extraTokens.join(', ') : 'No extra words detected.'}</p>
                </div>
              </div>

              {isGeneratingFeedback ? (
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 text-sm text-slate-300">
                  <Sparkles size={14} className="inline mr-2 text-cyan-300" /> Generating AI recitation notes...
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default LessonRecitationCoach;