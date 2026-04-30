import React, { useState } from 'react';
import { Brain, Loader2, Calendar, Target, TrendingUp, RefreshCw } from 'lucide-react';
import { analyzeHifzProgress } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey } from '../../services/aiService';

const AIHifzTracker: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [memorizedSurahs, setMemorizedSurahs] = useState('');
  const [dailyTarget, setDailyTarget] = useState(5);
  const [revisionEntries, setRevisionEntries] = useState([
    { surah: '', score: 85, date: new Date().toISOString().split('T')[0] },
  ]);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const hasApiKey = hasOpenRouterApiKey();

  const addRevisionEntry = () => {
    setRevisionEntries(prev => [...prev, { surah: '', score: 80, date: new Date().toISOString().split('T')[0] }]);
  };

  const updateEntry = (index: number, field: string, value: string | number) => {
    setRevisionEntries(prev =>
      prev.map((entry, i) => (i === index ? { ...entry, [field]: value } : entry))
    );
  };

  const removeEntry = (index: number) => {
    if (revisionEntries.length > 1) {
      setRevisionEntries(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleAnalyze = async () => {
    if (!studentName.trim()) return;
    setLoading(true);
    setAnalysis('');

    try {
      const surahs = memorizedSurahs.split(',').map(s => s.trim()).filter(Boolean);
      const scores = revisionEntries.filter(e => e.surah.trim());
      const result = await analyzeHifzProgress(studentName, surahs, scores, dailyTarget);
      setAnalysis(result);
    } catch {
      setAnalysis('Error analyzing progress. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Brain className="mx-auto mb-4 text-primary-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Hifz Tracker Not Configured</h2>
          <p className="text-slate-400">Please configure the OpenRouter API key to enable AI Hifz Tracking.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-400 to-purple-600 flex items-center justify-center">
          <Brain className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">AI Hifz Tracker</h1>
          <p className="text-slate-400">Intelligent Quran memorization analysis & revision scheduling</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <h3 className="font-bold text-white flex items-center gap-2">
              <Target size={18} className="text-violet-400" />
              Student Information
            </h3>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Student Name</label>
              <input
                value={studentName}
                onChange={e => setStudentName(e.target.value)}
                placeholder="Enter student name"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Memorized Surahs (comma-separated)</label>
              <input
                value={memorizedSurahs}
                onChange={e => setMemorizedSurahs(e.target.value)}
                placeholder="e.g., Al-Fatiha, Al-Baqarah, Yasin"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Daily Target (ayahs/day)</label>
              <input
                type="number"
                value={dailyTarget}
                onChange={e => setDailyTarget(parseInt(e.target.value) || 1)}
                min={1}
                max={50}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none"
              />
            </div>
          </div>

          {/* Revision Scores */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Calendar size={18} className="text-violet-400" />
                Recent Revision Scores
              </h3>
              <button
                onClick={addRevisionEntry}
                className="text-xs bg-white/5 hover:bg-white/10 text-primary-400 px-3 py-1 rounded-lg font-bold transition-all"
              >
                + Add Entry
              </button>
            </div>

            <div className="space-y-3">
              {revisionEntries.map((entry, i) => (
                <div key={i} className="grid grid-cols-[1fr,80px,120px,32px] gap-2 items-end">
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Surah</label>
                    <input
                      value={entry.surah}
                      onChange={e => updateEntry(i, 'surah', e.target.value)}
                      placeholder="Surah name"
                      className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Score %</label>
                    <input
                      type="number"
                      value={entry.score}
                      onChange={e => updateEntry(i, 'score', parseInt(e.target.value) || 0)}
                      min={0}
                      max={100}
                      className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block mb-1">Date</label>
                    <input
                      type="date"
                      value={entry.date}
                      onChange={e => updateEntry(i, 'date', e.target.value)}
                      className="w-full px-2 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs focus:border-primary-400 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => removeEntry(i)}
                    className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                    title="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !studentName.trim()}
            className="w-full py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-violet-400 hover:to-purple-500 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Analyzing Memorization...
              </>
            ) : (
              <>
                <TrendingUp size={18} />
                Analyze & Generate Plan
              </>
            )}
          </button>
        </div>

        {/* Analysis Result */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-violet-400" />
              Analysis & Revision Plan
            </h3>
            {analysis && (
              <button onClick={() => setAnalysis('')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <RefreshCw size={14} /> Clear
              </button>
            )}
          </div>
          {analysis ? (
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300 leading-relaxed">
              {analysis}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Brain size={40} className="mb-4 opacity-30" />
              <p className="text-sm text-center">Enter student data and click analyze to get a personalized Hifz revision plan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIHifzTracker;
