import React, { useMemo, useState } from 'react';
import { Brain, Route, Sparkles, TrendingUp } from 'lucide-react';
import { generateAIJson, hasOpenRouterApiKey } from '../../services/aiService';
import {
  LessonInsight,
  LessonPathRecommendation,
  LessonProgressPrediction,
  LessonReference,
  WeakLessonInsight,
  buildLessonProgressPrediction,
  buildPersonalizedLearningPath,
} from '../../utils/lessonExperience';

interface WeeklyPlanDay {
  day: string;
  focus: string;
  practice: string;
}

interface WeeklyStudyPlan {
  title: string;
  summary: string;
  days: WeeklyPlanDay[];
}

interface LearningPathPanelProps {
  lessonTitle: string;
  lessonContext: string;
  insight: LessonInsight;
  weakLessons: WeakLessonInsight[];
  references: LessonReference[];
  overallProgress: number;
  currentLessonIndex: number;
  totalLessons: number;
  extensionAvailable?: boolean;
}

const buildFallbackWeeklyPlan = (
  lessonTitle: string,
  path: LessonPathRecommendation,
  prediction: LessonProgressPrediction,
  weakLessons: WeakLessonInsight[]
): WeeklyStudyPlan => {
  const weakestLesson = weakLessons[0]?.title || 'your weakest recent lesson';
  const stepOne = path.steps[0] || `Review ${lessonTitle}.`;
  const stepTwo = path.steps[1] || `Spend five focused minutes on ${weakestLesson}.`;
  const stepThree = path.steps[2] || 'Close the session with one action point.';

  return {
    title: `${path.headline} Weekly Plan`,
    summary: prediction.summary,
    days: [
      { day: 'Day 1', focus: stepOne, practice: 'Write one short summary from memory.' },
      { day: 'Day 2', focus: `Review ${weakestLesson}.`, practice: 'Repeat one difficult point slowly and clearly.' },
      { day: 'Day 3', focus: stepTwo, practice: 'Answer one reflection question in your own words.' },
      { day: 'Day 4', focus: `Revisit ${lessonTitle} with better pacing.`, practice: 'Use your notes and highlights for a five-minute recap.' },
      { day: 'Day 5', focus: stepThree, practice: 'Ask one clarifying question if anything still feels unclear.' },
      { day: 'Day 6', focus: 'Run a self-check on the current lesson.', practice: 'Review the verified references and connect them to the lesson theme.' },
      { day: 'Day 7', focus: prediction.nextMilestone === 'Course completion' ? 'Prepare for the next major checkpoint.' : `Aim toward the ${prediction.nextMilestone}.`, practice: 'End the week by choosing one lesson habit to keep.' },
    ]
  };
};

const modeClasses: Record<LessonPathRecommendation['mode'], string> = {
  revision: 'bg-rose-500/15 text-rose-100 border-rose-500/30',
  steady: 'bg-amber-500/15 text-amber-100 border-amber-500/30',
  advanced: 'bg-emerald-500/15 text-emerald-100 border-emerald-500/30'
};

const LearningPathPanel: React.FC<LearningPathPanelProps> = ({
  lessonTitle,
  lessonContext,
  insight,
  weakLessons,
  references,
  overallProgress,
  currentLessonIndex,
  totalLessons,
  extensionAvailable,
}) => {
  const aiConfigured = hasOpenRouterApiKey();
  const [aiPlan, setAiPlan] = useState<WeeklyStudyPlan | null>(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);

  const path = useMemo(
    () => buildPersonalizedLearningPath({ insight, weakLessons, lessonTitle, extensionAvailable }),
    [extensionAvailable, insight, lessonTitle, weakLessons]
  );

  const prediction = useMemo(
    () => buildLessonProgressPrediction({ insight, overallProgress, currentLessonIndex, totalLessons }),
    [currentLessonIndex, insight, overallProgress, totalLessons]
  );

  const fallbackPlan = useMemo(
    () => buildFallbackWeeklyPlan(lessonTitle, path, prediction, weakLessons),
    [lessonTitle, path, prediction, weakLessons]
  );

  const displayedPlan = aiPlan || fallbackPlan;

  const handleGenerateAIPlan = async () => {
    if (!aiConfigured) {
      setPlanError('AI planning is not configured on this device. Showing the local weekly plan instead.');
      return;
    }

    setIsGeneratingPlan(true);
    setPlanError(null);

    try {
      const response = await generateAIJson<WeeklyStudyPlan>({
        temperature: 0.35,
        maxTokens: 900,
        messages: [
          {
            role: 'system',
            content: [
              'You are Muhammadi Academy\'s Islamic learning planner.',
              'Create a brief, practical 7-day plan using only the supplied lesson context and verified references.',
              'Do not invent new religious sources.',
              'Return JSON with these keys only: title, summary, days. Each item in days must have day, focus, practice.'
            ].join(' ')
          },
          {
            role: 'user',
            content: [
              `Lesson title: ${lessonTitle}`,
              `Understanding score: ${insight.understandingScore}`,
              `Insight status: ${insight.status}`,
              `Overall progress: ${overallProgress}%`,
              `Current lesson position: ${currentLessonIndex + 1} of ${totalLessons}`,
              `Deterministic path: ${path.headline} - ${path.summary}`,
              `Weak lessons: ${weakLessons.map((lesson) => `${lesson.title} (${lesson.understandingScore}%)`).join('; ') || 'none'}`,
              `Verified references: ${references.map((reference) => reference.citation).join('; ') || 'none'}`,
              `Lesson context:\n${lessonContext}`,
              'Return exactly 7 days.'
            ].join('\n\n')
          }
        ]
      });

      if (response?.title && response?.summary && Array.isArray(response.days) && response.days.length > 0) {
        setAiPlan({
          title: response.title,
          summary: response.summary,
          days: response.days.slice(0, 7).map((day, index) => ({
            day: day.day || `Day ${index + 1}`,
            focus: day.focus || fallbackPlan.days[index]?.focus || path.steps[index % path.steps.length],
            practice: day.practice || fallbackPlan.days[index]?.practice || 'Review your notes and apply one lesson point.'
          }))
        });
      } else {
        setPlanError('The AI plan response was incomplete, so the local weekly plan is still in use.');
      }
    } catch (error) {
      console.error('Failed to generate AI learning path plan:', error);
      setPlanError('AI plan generation failed, so the local weekly plan is still in use.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="rounded-2xl bg-slate-950/30 border border-white/5 p-5 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-sm font-black uppercase tracking-[0.2em] text-fuchsia-300 mb-2 flex items-center gap-2">
            <Route size={16} /> Personalized Learning Path
          </h3>
          <p className="text-sm text-slate-300">This path combines your current lesson signal, weaker topics, and overall course position so the next move is guided instead of generic.</p>
        </div>
        <div className={`inline-flex rounded-full border px-3 py-1 text-xs uppercase tracking-[0.2em] ${modeClasses[path.mode]}`}>
          {path.headline}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Path Summary</p>
          <p className="text-white font-semibold">{path.summary}</p>
          <div className="space-y-2">
            {path.steps.map((step) => (
              <div key={step} className="flex items-start gap-2 text-sm text-slate-200">
                <Brain size={14} className="text-fuchsia-300 mt-0.5" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl bg-white/5 border border-white/5 p-4 space-y-3">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Progress Prediction</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-900/60 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Pace</p>
              <p className="text-white font-bold mt-2">{prediction.paceLabel}</p>
            </div>
            <div className="rounded-xl bg-slate-900/60 p-3">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400 font-black">Next Milestone</p>
              <p className="text-white font-bold mt-2">{prediction.nextMilestone}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 text-sm text-slate-200">
            <TrendingUp size={14} className="text-emerald-300 mt-0.5" />
            <span>{prediction.projectedCompletionText}</span>
          </div>
          <p className="text-sm text-slate-300">{prediction.summary}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">7-Day Study Plan</p>
            <p className="text-sm text-slate-300 mt-1">{displayedPlan.summary}</p>
          </div>
          <button
            type="button"
            onClick={handleGenerateAIPlan}
            disabled={isGeneratingPlan}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-500 to-primary-500 text-white font-bold hover:from-fuchsia-400 hover:to-primary-400 transition disabled:opacity-60"
          >
            <Sparkles size={14} className="inline mr-2" />
            {isGeneratingPlan ? 'Generating...' : aiPlan ? 'Refresh AI Plan' : 'Generate AI Plan'}
          </button>
        </div>

        {planError ? (
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-100">{planError}</div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {displayedPlan.days.map((day) => (
            <div key={day.day} className="rounded-xl bg-slate-900/60 border border-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-fuchsia-200 font-black">{day.day}</p>
              <p className="text-sm font-semibold text-white mt-2">{day.focus}</p>
              <p className="text-sm text-slate-300 mt-3">{day.practice}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LearningPathPanel;