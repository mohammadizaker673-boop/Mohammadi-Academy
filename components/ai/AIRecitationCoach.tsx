import React, { useState } from 'react';
import { Mic, MicOff, BookOpen, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { evaluateRecitation } from '../../services/aiFeaturesService';
import { hasOpenRouterApiKey } from '../../services/aiService';

const SAMPLE_SURAHS = [
  { name: 'Al-Fatiha', ayahRange: '1-7', arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ ﴿١﴾ الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ﴿٢﴾ الرَّحْمَٰنِ الرَّحِيمِ ﴿٣﴾ مَالِكِ يَوْمِ الدِّينِ ﴿٤﴾ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ﴿٥﴾ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ﴿٦﴾ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ ﴿٧﴾' },
  { name: 'Al-Ikhlas', ayahRange: '1-4', arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾' },
  { name: 'Al-Falaq', ayahRange: '1-5', arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾' },
  { name: 'An-Nas', ayahRange: '1-6', arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾' },
  { name: 'Al-Asr', ayahRange: '1-3', arabic: 'وَالْعَصْرِ ﴿١﴾ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ ﴿٢﴾ إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ ﴿٣﴾' },
];

const AIRecitationCoach: React.FC = () => {
  const [selectedSurah, setSelectedSurah] = useState(SAMPLE_SURAHS[0]);
  const [studentInput, setStudentInput] = useState('');
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);
  const [customSurah, setCustomSurah] = useState('');
  const [customAyahRange, setCustomAyahRange] = useState('');
  const [customArabic, setCustomArabic] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  const hasApiKey = hasOpenRouterApiKey();

  const handleEvaluate = async () => {
    if (!studentInput.trim()) return;
    setLoading(true);
    setFeedback('');

    try {
      const surahName = useCustom ? customSurah : selectedSurah.name;
      const ayahRange = useCustom ? customAyahRange : selectedSurah.ayahRange;
      const correctText = useCustom ? customArabic : selectedSurah.arabic;

      const result = await evaluateRecitation(studentInput, correctText, surahName, ayahRange);
      setFeedback(result);
    } catch (err) {
      setFeedback('Error evaluating recitation. Please check your API configuration and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!hasApiKey) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Mic className="mx-auto mb-4 text-primary-400" size={48} />
          <h2 className="text-xl font-bold text-white mb-2">Recitation Coach Not Configured</h2>
          <p className="text-slate-400">Please configure the OpenRouter API key to enable the Quran Recitation Coach.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center">
          <Mic className="text-white" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Quran Recitation Coach</h1>
          <p className="text-slate-400">AI-powered tajweed feedback and correction</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left: Surah Selection & Input */}
        <div className="space-y-4">
          {/* Mode Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setUseCustom(false)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!useCustom ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              Select Surah
            </button>
            <button
              onClick={() => setUseCustom(true)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${useCustom ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
            >
              Custom Text
            </button>
          </div>

          {!useCustom ? (
            <>
              {/* Surah Selection */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">Select Surah</label>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_SURAHS.map(s => (
                    <button
                      key={s.name}
                      onClick={() => setSelectedSurah(s)}
                      className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                        selectedSurah.name === s.name
                          ? 'bg-primary-500 text-white'
                          : 'bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Correct Text Display */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">
                  Correct Quranic Text — {selectedSurah.name} (Ayahs {selectedSurah.ayahRange})
                </label>
                <div className="text-right font-arabic text-xl leading-loose text-emerald-300 p-3 bg-white/5 rounded-xl" dir="rtl">
                  {selectedSurah.arabic}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Surah Name</label>
                  <input
                    value={customSurah}
                    onChange={e => setCustomSurah(e.target.value)}
                    placeholder="e.g., Al-Baqarah"
                    className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 font-bold block mb-1">Ayah Range</label>
                  <input
                    value={customAyahRange}
                    onChange={e => setCustomAyahRange(e.target.value)}
                    placeholder="e.g., 1-5"
                    className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 font-bold block mb-1">Correct Arabic Text</label>
                <textarea
                  value={customArabic}
                  onChange={e => setCustomArabic(e.target.value)}
                  placeholder="Paste the correct Quranic text here..."
                  rows={4}
                  dir="rtl"
                  className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white text-sm placeholder:text-slate-500 focus:border-primary-400 focus:outline-none font-arabic text-lg"
                />
              </div>
            </div>
          )}

          {/* Student Input */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <label className="text-xs text-slate-400 uppercase tracking-wider font-bold mb-2 block">
              Your Recitation (type what you recited)
            </label>
            <textarea
              value={studentInput}
              onChange={e => setStudentInput(e.target.value)}
              placeholder="Type your recitation in Arabic here... (you can also use transliteration)"
              rows={4}
              dir="rtl"
              className="w-full px-3 py-2 bg-white/10 border border-white/15 rounded-lg text-white placeholder:text-slate-500 focus:border-primary-400 focus:outline-none font-arabic text-lg"
            />
          </div>

          <button
            onClick={handleEvaluate}
            disabled={loading || !studentInput.trim()}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-bold text-sm uppercase tracking-wider disabled:opacity-50 hover:from-emerald-400 hover:to-teal-500 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                Analyzing Recitation...
              </>
            ) : (
              <>
                <CheckCircle size={18} />
                Evaluate My Recitation
              </>
            )}
          </button>
        </div>

        {/* Right: Feedback */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <BookOpen size={20} className="text-emerald-400" />
              Tajweed Feedback
            </h3>
            {feedback && (
              <button
                onClick={() => setFeedback('')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
              >
                <RefreshCw size={14} /> Clear
              </button>
            )}
          </div>
          {feedback ? (
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-slate-300 leading-relaxed">
              {feedback}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <Mic size={40} className="mb-4 opacity-30" />
              <p className="text-sm">Select a surah, type your recitation, and click evaluate to get AI tajweed feedback.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecitationCoach;
