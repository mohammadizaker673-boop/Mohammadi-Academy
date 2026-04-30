import React, { useState } from 'react';
import { BookOpen, Loader2, Languages, RefreshCw } from 'lucide-react';
import { explainQuranVerse } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey } from '../../services/aiService';

const POPULAR_VERSES = [
  { surah: 'Al-Baqarah', ayah: 255, arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ', label: 'Ayat al-Kursi (2:255)' },
  { surah: 'Al-Fatiha', ayah: 1, arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', label: 'Bismillah (1:1)' },
  { surah: 'Al-Ikhlas', ayah: 1, arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ', label: 'Al-Ikhlas (112:1)' },
  { surah: 'Al-Baqarah', ayah: 286, arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا', label: 'Burden (2:286)' },
  { surah: 'Al-Imran', ayah: 139, arabic: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ', label: 'Do Not Grieve (3:139)' },
  { surah: 'Ar-Rahman', ayah: 13, arabic: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ', label: 'Which Favors? (55:13)' },
  { surah: 'Al-Ankabut', ayah: 69, arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا', label: 'Strive (29:69)' },
  { surah: 'Ash-Sharh', ayah: 5, arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', label: 'With Hardship (94:5)' },
];

const LANGUAGES = ['English', 'Arabic', 'Urdu', 'Farsi', 'Pashto', 'French', 'Turkish', 'Malay', 'Indonesian'];

const AIQuranExplainer: React.FC = () => {
  const [surah, setSurah] = useState('');
  const [ayah, setAyah] = useState<number>(1);
  const [arabic, setArabic] = useState('');
  const [language, setLanguage] = useState('English');
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const hasApiKey = hasOpenRouterApiKey();

  const handleExplain = async () => {
    if (!surah.trim() || !arabic.trim()) return;
    setLoading(true);
    setExplanation('');

    try {
      const result = await explainQuranVerse(surah, ayah, arabic, language);
      setExplanation(result);
    } catch {
      setExplanation('Error generating explanation. Please check your API configuration.');
    } finally {
      setLoading(false);
    }
  };

  const selectPreset = (preset: typeof POPULAR_VERSES[0]) => {
    setSurah(preset.surah);
    setAyah(preset.ayah);
    setArabic(preset.arabic);
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <BookOpen className="mx-auto mb-4 text-primary-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Quran Explainer Not Configured</h2>
          <p className="text-slate-400">Please configure the OpenRouter API key to enable AI Quran Explanation.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center">
          <Languages className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Quran Translation & Explanation</h1>
          <p className="text-slate-400">AI-powered word-by-word translation, tafsir, and contextual analysis</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input */}
        <div className="space-y-4">
          {/* Popular Verses */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <h3 className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-3">Popular Verses</h3>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_VERSES.map(v => (
                <button
                  key={v.label}
                  onClick={() => selectPreset(v)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold text-left transition-all ${
                    surah === v.surah && ayah === v.ayah
                      ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Input */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Surah Name</label>
                <input
                  value={surah}
                  onChange={e => setSurah(e.target.value)}
                  placeholder="e.g., Al-Baqarah"
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Ayah Number</label>
                <input
                  type="number"
                  value={ayah}
                  onChange={e => setAyah(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Arabic Text</label>
              <textarea
                value={arabic}
                onChange={e => setArabic(e.target.value)}
                placeholder="Paste or type the Arabic verse..."
                rows={3}
                dir="rtl"
                className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none font-arabic text-lg"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 font-bold block mb-1">Explanation Language</label>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/10 border border-white/15 rounded-lg text-white text-sm focus:border-primary-400 focus:outline-none"
              >
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
          </div>

          <button
            onClick={handleExplain}
            disabled={loading || !surah.trim() || !arabic.trim()}
            className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-sky-400 hover:to-blue-500 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> Generating Explanation...</>
            ) : (
              <><BookOpen size={18} /> Explain This Verse</>
            )}
          </button>
        </div>

        {/* Explanation */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-sky-400" />
              Tafsir & Explanation
            </h3>
            {explanation && (
              <button onClick={() => setExplanation('')} className="text-xs text-slate-400 hover:text-white flex items-center gap-1">
                <RefreshCw size={14} /> Clear
              </button>
            )}
          </div>
          {explanation ? (
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto">
              {explanation}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Languages size={40} className="mb-4 opacity-30" />
              <p className="text-sm text-center">Select a verse or enter custom text to get a detailed AI explanation with tafsir.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIQuranExplainer;
