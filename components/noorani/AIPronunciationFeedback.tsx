import React from 'react';
import { CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { PronunciationAnalysisResult } from '../../services/aiPronunciationService';

interface AIPronunciationFeedbackProps {
  result: PronunciationAnalysisResult | null;
  loading?: boolean;
}

const AIPronunciationFeedback: React.FC<AIPronunciationFeedbackProps> = ({
  result,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-6 flex items-center justify-center gap-3">
        <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-500 border-t-transparent" />
        <p className="text-slate-300 text-sm">Analyzing pronunciation...</p>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const { analysis, confidence } = result;
  const passed = analysis.passedThreshold;

  return (
    <div className="space-y-4">
      {/* Header with Overall Score */}
      <div className={`rounded-3xl bg-gradient-to-br p-8 border ${
        passed
          ? 'from-green-500/20 to-emerald-500/10 border-green-500/30'
          : 'from-yellow-500/20 to-amber-500/10 border-yellow-500/30'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-xs font-bold uppercase tracking-[0.2em] mb-2 ${
              passed ? 'text-green-300' : 'text-yellow-300'
            }`}>
              {passed ? '✓ Excellent!' : 'Keep Practicing'}
            </p>
            <p className="text-white font-black text-3xl sm:text-4xl">
              {analysis.overallAccuracy}%
            </p>
            <p className="text-slate-300 text-sm mt-1">Overall Pronunciation Accuracy</p>
          </div>
          <div className="text-5xl">
            {passed ? '🎉' : '📚'}
          </div>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
          <div className="w-2 h-2 rounded-full bg-primary-400" />
          <span className="text-xs text-slate-300">
            Analysis confidence: <span className="font-bold text-primary-300">{confidence}%</span>
          </span>
        </div>
      </div>

      {/* Strong Letters */}
      {analysis.strongLetters.length > 0 && (
        <div className="rounded-2xl bg-green-500/10 border border-green-500/20 p-5">
          <p className="text-xs font-bold text-green-300 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <CheckCircle2 size={14} /> Strong Letters
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.strongLetters.map(letter => (
              <div
                key={letter}
                className="px-3 py-1.5 rounded-lg bg-green-500/20 border border-green-500/40 text-green-200 text-sm font-semibold text-center"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Weak Letters */}
      {analysis.weakLetters.length > 0 && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-500/20 p-5">
          <p className="text-xs font-bold text-amber-300 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <AlertCircle size={14} /> Areas for Improvement
          </p>
          <div className="flex flex-wrap gap-2">
            {analysis.weakLetters.map(letter => (
              <div
                key={letter}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-200 text-sm font-semibold text-center"
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed Letter Scores */}
      {analysis.letterScores.length > 0 && (
        <div className="rounded-2xl bg-slate-800/60 border border-white/10 p-5">
          <p className="text-xs font-bold text-accent-300 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <TrendingUp size={14} /> Detailed Scores
          </p>
          <div className="space-y-3">
            {analysis.letterScores.map(score => {
              const scorePercent = score.accuracy;
              let scoreColor = 'text-green-400 bg-green-500/10 border-green-500/20';
              
              if (scorePercent < 75) {
                scoreColor = 'text-red-400 bg-red-500/10 border-red-500/20';
              } else if (scorePercent < 85) {
                scoreColor = 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
              }

              return (
                <div
                  key={score.letter}
                  className={`rounded-xl border p-4 transition ${scoreColor}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <p className="text-3xl font-arabic text-white">{score.letter}</p>
                      <div>
                        <p className="text-xs font-bold uppercase text-inherit">{score.makhrajQuality}</p>
                        <p className="text-xs opacity-75">{`Duration: ${(score.durationRatio * 100).toFixed(0)}%`}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black text-inherit">{scorePercent}%</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full transition-all"
                      style={{
                        width: `${scorePercent}%`,
                        backgroundColor: scorePercent >= 85 ? '#22c55e' : scorePercent >= 75 ? '#eab308' : '#ef4444',
                      }}
                    />
                  </div>

                  {/* Feedback */}
                  <p className="text-xs opacity-75 leading-relaxed">{score.details}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="rounded-2xl bg-blue-500/10 border border-blue-500/20 p-5">
          <p className="text-xs font-bold text-blue-300 uppercase tracking-[0.2em] mb-3">
            💡 Recommendations
          </p>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-blue-200">
                <span className="text-blue-400 font-bold mt-0.5 shrink-0">→</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Message */}
      <div className={`rounded-2xl p-5 border ${
        passed
          ? 'bg-green-500/10 border-green-500/20'
          : 'bg-amber-500/10 border-amber-500/20'
      }`}>
        <p className={`text-sm font-semibold ${passed ? 'text-green-200' : 'text-amber-200'}`}>
          {passed
            ? '✓ Great job! You passed this lesson. Move on to the next one or practice more.'
            : 'Keep practicing to improve your pronunciation. Try recording again!'}
        </p>
      </div>
    </div>
  );
};

export default AIPronunciationFeedback;
