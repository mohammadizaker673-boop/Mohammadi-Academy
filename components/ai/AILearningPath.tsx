import React, { useState } from 'react';
import { Route, Loader2, Target, Clock, TrendingUp, RefreshCw } from 'lucide-react';
import { generateLearningPath, type LearningPathResult } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey } from '../../services/aiService';

const AILearningPath: React.FC = () => {
  const [studentName, setStudentName] = useState('');
  const [goals, setGoals] = useState('');
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [completedModules, setCompletedModules] = useState('');
  const [quizScores, setQuizScores] = useState([
    { topic: '', score: 75 },
  ]);
  const [result, setResult] = useState<LearningPathResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawResult, setRawResult] = useState('');

  const hasApiKey = hasOpenRouterApiKey();

  const addScore = () => setQuizScores(prev => [...prev, { topic: '', score: 75 }]);
  const updateScore = (i: number, field: string, val: string | number) =>
    setQuizScores(prev => prev.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  const removeScore = (i: number) => {
    if (quizScores.length > 1) setQuizScores(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleGenerate = async () => {
    if (!studentName.trim()) return;
    setLoading(true);
    setResult(null);
    setRawResult('');

    try {
      const path = await generateLearningPath(
        studentName,
        quizScores.filter(s => s.topic.trim()),
        completedModules.split(',').map(m => m.trim()).filter(Boolean),
        goals.split(',').map(g => g.trim()).filter(Boolean),
        hoursPerDay
      );
      setResult(path);
    } catch {
      setRawResult('Error generating learning path. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Route className="mx-auto mb-4 text-primary-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Learning Path AI Not Configured</h2>
          <p className="text-slate-400">Please configure the OpenRouter API key.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-teal-600 flex items-center justify-center">
          <Route className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Personalized Learning Path</h1>
          <p className="text-slate-400">AI-generated study plan tailored to your goals and performance</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Student Name</label>
              <input value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Student name"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Learning Goals (comma-separated)</label>
              <input value={goals} onChange={e => setGoals(e.target.value)} placeholder="e.g., Memorize Juz Amma, Learn Arabic basics"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Completed Modules (comma-separated)</label>
              <input value={completedModules} onChange={e => setCompletedModules(e.target.value)} placeholder="e.g., Arabic Basics, Noorani Qaida"
                className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Available Hours/Day</label>
              <input type="number" value={hoursPerDay} onChange={e => setHoursPerDay(parseFloat(e.target.value) || 0.5)} min={0.5} max={12} step={0.5}
                className="w-full px-4 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none" />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Quiz Scores</h3>
              <button onClick={addScore} className="text-xs bg-white/5 hover:bg-white/10 text-primary-400 px-3 py-1 rounded-lg font-bold transition-all">+ Add</button>
            </div>
            {quizScores.map((s, i) => (
              <div key={i} className="grid grid-cols-[1fr,80px,32px] gap-2 items-end">
                <input value={s.topic} onChange={e => updateScore(i, 'topic', e.target.value)} placeholder="Topic"
                  className="px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
                <input type="number" value={s.score} onChange={e => updateScore(i, 'score', parseInt(e.target.value) || 0)} min={0} max={100}
                  className="px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-xs focus:border-primary-400 focus:outline-none" />
                <button onClick={() => removeScore(i)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg">×</button>
              </div>
            ))}
          </div>

          <button onClick={handleGenerate} disabled={loading || !studentName.trim()}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-teal-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-cyan-400 hover:to-teal-500 transition-all flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="animate-spin" size={18} /> Generating Path...</> : <><Target size={18} /> Generate Learning Path</>}
          </button>
        </div>

        {/* Result */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp size={20} className="text-cyan-400" /> Your Learning Path
            </h3>
            {result && <button onClick={() => { setResult(null); setRawResult(''); }} className="text-xs text-slate-400 hover:text-white flex items-center gap-1"><RefreshCw size={14} /> Clear</button>}
          </div>

          {result ? (
            <div className="space-y-6">
              <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-xl p-4">
                <h4 className="text-sm font-bold text-cyan-300 mb-2">Assessment</h4>
                <p className="text-sm text-slate-300">{result.assessment}</p>
              </div>

              {result.weakAreas.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Weak Areas to Focus On</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.weakAreas.map((a, i) => (
                      <span key={i} className="px-3 py-1 bg-red-500/10 text-red-300 rounded-full text-xs font-semibold">{a}</span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-white mb-3">Recommended Path</h4>
                <div className="space-y-2">
                  {result.recommendedPath.map((p, i) => (
                    <div key={i} className="bg-white/5 rounded-lg p-3 flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{p.order}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{p.module}</p>
                        <p className="text-xs text-slate-400">{p.reason}</p>
                        <p className="text-xs text-cyan-400 flex items-center gap-1 mt-1"><Clock size={12} /> {p.estimatedTime}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {result.dailySchedule.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-3">Daily Schedule</h4>
                  <div className="space-y-1">
                    {result.dailySchedule.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <span className="text-cyan-400 font-mono text-xs w-16">{s.time}</span>
                        <span className="text-slate-300">{s.activity}</span>
                        <span className="text-slate-500 text-xs ml-auto">{s.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-white mb-2">Milestones</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">1 Week</p>
                    <ul className="space-y-1">{result.milestones.shortTerm.map((m, i) => <li key={i} className="text-xs text-slate-300">• {m}</li>)}</ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">1 Month</p>
                    <ul className="space-y-1">{result.milestones.mediumTerm.map((m, i) => <li key={i} className="text-xs text-slate-300">• {m}</li>)}</ul>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-2">3 Months</p>
                    <ul className="space-y-1">{result.milestones.longTerm.map((m, i) => <li key={i} className="text-xs text-slate-300">• {m}</li>)}</ul>
                  </div>
                </div>
              </div>

              {result.tips.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-2">Study Tips</h4>
                  <ul className="space-y-1">
                    {result.tips.map((t, i) => <li key={i} className="text-sm text-slate-300">💡 {t}</li>)}
                  </ul>
                </div>
              )}
            </div>
          ) : rawResult ? (
            <p className="text-sm text-red-400">{rawResult}</p>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Route size={40} className="mb-4 opacity-30" />
              <p className="text-sm text-center">Enter your information to get a personalized AI-generated learning path.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AILearningPath;
