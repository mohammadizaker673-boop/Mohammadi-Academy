import React, { useEffect, useState } from 'react';
import { CheckCircle2, RefreshCw, Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hifzDataService from '../../services/hifzDataService';
import type { MemorizationRecord } from '../../types/hifz.types';

// Revision schedule built from the student's REAL memorization records:
// the pages they actually memorized, most recent first. There is no
// automated 3-layer revision engine yet, so nothing is invented here.
const RevisionScheduleUI: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [memorizations, setMemorizations] = useState<MemorizationRecord[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const memos = await hifzDataService.getStudentMemorizations(user.uid).catch(() => []);
        if (!cancelled) setMemorizations(memos);
      } catch (err) {
        console.error('Failed to load revision schedule:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
          Revision Schedule
        </h1>
        <p className="text-slate-400">Revise the pages you have memorized, most recent first</p>
      </div>

      {loadError && (
        <p className="text-red-300 mb-8">Could not load your memorization records. Please try again later.</p>
      )}

      {/* Pages to revise — real memorization records */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-6">
          <RefreshCw className="text-emerald-400" size={24} />
          <h2 className="text-2xl font-bold text-emerald-300">Your Memorized Pages</h2>
        </div>
        {memorizations.length > 0 ? (
          <div className="space-y-3">
            {memorizations.map((m: any) => (
              <div
                key={m.id}
                className="p-4 rounded-lg border bg-slate-900/20 border-slate-600/30 hover:border-slate-500/50 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <CheckCircle2 className="text-emerald-400" size={24} />
                    <div>
                      <p className="font-semibold text-slate-100">
                        Surah {m.surahNumber}, Ayahs {m.ayahStart}–{m.ayahEnd}
                      </p>
                      <p className="text-sm text-slate-400">
                        Page {m.pageNumber} • Juz {m.juzNumber}
                        {m.timestamp ? ` • Memorized ${new Date(m.timestamp).toLocaleDateString()}` : ''}
                      </p>
                    </div>
                  </div>
                  {m.qualityScore !== undefined && m.qualityScore !== null && (
                    <span className="text-sm font-semibold text-emerald-300">Quality {m.qualityScore}%</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">
            No pages memorized yet. Your revision schedule will appear here once you start memorizing.
          </p>
        )}
      </div>

      {/* How revision works — static guidance, not data */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Target className="text-purple-400" size={20} /> How Revision Works
        </h3>
        <div className="space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-900/30 text-blue-400 font-bold flex-shrink-0">1</div>
            <div>
              <p className="font-semibold text-slate-200">Same-Day Binding</p>
              <p className="text-sm text-slate-400">Review new pages several times today for immediate memory formation</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-900/30 text-emerald-400 font-bold flex-shrink-0">2</div>
            <div>
              <p className="font-semibold text-slate-200">7-Day Reinforcement</p>
              <p className="text-sm text-slate-400">Review each Juz several times over 7 days for deeper retention</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-900/30 text-purple-400 font-bold flex-shrink-0">3</div>
            <div>
              <p className="font-semibold text-slate-200">Long-Term Spacing</p>
              <p className="text-sm text-slate-400">Monthly reviews with increasing intervals for permanence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevisionScheduleUI;
