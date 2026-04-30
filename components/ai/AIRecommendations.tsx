import React, { useState } from 'react';
import { Compass, Loader2, Star, RefreshCw } from 'lucide-react';
import { getContentRecommendations, type CourseRecommendation } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey } from '../../services/aiService';

const INTEREST_OPTIONS = [
  'Quran Memorization', 'Tajweed', 'Arabic Language', 'Islamic History',
  'Hadith Studies', 'Fiqh', 'Seerah', 'Islamic Finance', 'Tafsir',
  'Prayer & Worship', 'Life Skills', 'Science', 'Mathematics',
  'Digital Skills', 'Leadership', 'Parenting in Islam',
];

const LEVEL_OPTIONS = ['Beginner', 'Elementary', 'Intermediate', 'Advanced', 'Scholar'];

const AIRecommendations: React.FC = () => {
  const [interests, setInterests] = useState<string[]>([]);
  const [completedCourses, setCompletedCourses] = useState('');
  const [weakAreas, setWeakAreas] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [recommendations, setRecommendations] = useState<CourseRecommendation[] | null>(null);
  const [loading, setLoading] = useState(false);

  const hasApiKey = hasOpenRouterApiKey();

  const toggleInterest = (interest: string) => {
    setInterests(prev => prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]);
  };

  const handleGenerate = async () => {
    if (interests.length === 0) return;
    setLoading(true);
    setRecommendations(null);
    try {
      const result = await getContentRecommendations(
        interests,
        completedCourses.split(',').map(c => c.trim()).filter(Boolean),
        weakAreas.split(',').map(w => w.trim()).filter(Boolean),
        level
      );
      setRecommendations(result.recommendations);
    } catch {
      setRecommendations(null);
    } finally {
      setLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Compass className="mx-auto mb-4 text-primary-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Recommendations Not Configured</h2>
          <p className="text-slate-400">Please configure the OpenRouter API key.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center">
          <Compass className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Content Recommendations</h1>
          <p className="text-slate-400">AI-powered course and learning material suggestions</p>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-5">
        <div>
          <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-3 block">Your Interests (select at least one)</label>
          <div className="flex flex-wrap gap-2">
            {INTEREST_OPTIONS.map(i => (
              <button key={i} onClick={() => toggleInterest(i)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  interests.includes(i) ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}>
                {i}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Your Level</label>
            <select value={level} onChange={e => setLevel(e.target.value)}
              className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none">
              {LEVEL_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Completed Courses</label>
            <input value={completedCourses} onChange={e => setCompletedCourses(e.target.value)} placeholder="Comma-separated"
              className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-bold block mb-1">Weak Areas</label>
            <input value={weakAreas} onChange={e => setWeakAreas(e.target.value)} placeholder="Comma-separated"
              className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none" />
          </div>
        </div>

        <button onClick={handleGenerate} disabled={loading || interests.length === 0}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-indigo-400 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="animate-spin" size={18} /> Getting Recommendations...</> : <><Star size={18} /> Get Recommendations</>}
        </button>
      </div>

      {/* Results */}
      {recommendations && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recommended for You</h3>
            <button onClick={() => setRecommendations(null)} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
              <RefreshCw size={14} /> Clear
            </button>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-indigo-500/30 transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-white font-bold text-sm flex-1 group-hover:text-indigo-300 transition-colors">{rec.title}</h4>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ml-2 flex-shrink-0 ${
                    rec.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                    rec.priority === 'medium' ? 'bg-amber-500/20 text-amber-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>{rec.priority}</span>
                </div>
                <p className="text-xs text-slate-400 mb-3">{rec.reason}</p>
                <div className="flex items-center gap-3 text-[10px] text-slate-500">
                  <span className="px-2 py-0.5 bg-white/5 rounded">{rec.difficulty}</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded">{rec.estimatedTime}</span>
                  <span className="px-2 py-0.5 bg-white/5 rounded">{rec.category}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
