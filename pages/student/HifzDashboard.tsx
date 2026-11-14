import React, { useEffect, useState } from 'react';
import { BarChart3, BookOpen, Trophy, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hifzDataService from '../../services/hifzDataService';
import type { MemorizationRecord } from '../../types/hifz.types';

// Student Hifz dashboard: only real numbers from the student's Hifz record.
// No Hifz record yet means an honest empty state, never invented numbers.
const StudentHifzDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [memorizations, setMemorizations] = useState<MemorizationRecord[]>([]);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const [p, memos] = await Promise.all([
          hifzDataService.getStudentProfile(user.uid).catch(() => null),
          hifzDataService.getStudentMemorizations(user.uid).catch(() => []),
        ]);
        if (cancelled) return;
        setProfile(p);
        setMemorizations(memos);
      } catch (err) {
        console.error('Failed to load Hifz dashboard:', err);
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

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
        <h1 className="text-4xl font-bold mb-2">Your Hifz Journey</h1>
        <p className="text-slate-400">Could not load your Hifz record. Please try again later.</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            السلام عليكم {user?.displayName || ''}
          </h1>
          <p className="text-slate-400">Welcome to your Hifz Journey</p>
        </div>
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-400/30 rounded-lg p-8 text-center">
          <p className="text-cyan-300 text-lg font-semibold">Your Hifz journey hasn't started yet</p>
          <p className="text-slate-300 mt-2">
            Your teacher will set up your Hifz record when you begin. Once it exists, your pages memorized,
            current Juz, retention and streak will appear here.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = profile.totalPagesMemoized ?? 0;
  const completionPercentage = Math.round((totalPages / 604) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
          السلام عليكم {profile.name || user?.displayName || ''}
        </h1>
        <p className="text-slate-400">Welcome to your Hifz Journey</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-6">
          <BookOpen className="text-purple-400 mb-2" size={28} />
          <p className="text-slate-400 text-sm">Pages Memorized</p>
          <p className="text-3xl font-bold text-purple-300">{totalPages}</p>
        </div>

        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-600/10 border border-cyan-400/30 rounded-lg p-6">
          <TrendingUp className="text-cyan-400 mb-2" size={28} />
          <p className="text-slate-400 text-sm">Current Progress</p>
          <p className="text-3xl font-bold text-cyan-300">{profile.currentJuz ?? 0}/30 Juz</p>
        </div>

        <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 border border-green-400/30 rounded-lg p-6">
          <BarChart3 className="text-green-400 mb-2" size={28} />
          <p className="text-slate-400 text-sm">Retention Score</p>
          <p className="text-3xl font-bold text-green-300">{profile.retentionScore ?? 0}%</p>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-600/10 border border-orange-400/30 rounded-lg p-6">
          <p className="text-orange-300 text-2xl mb-1">🔥</p>
          <p className="text-slate-400 text-sm">Current Streak</p>
          <p className="text-3xl font-bold text-orange-300">{profile.streakDays ?? 0} Days</p>
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Trophy className="text-yellow-400" size={20} /> Overall Completion
        </h2>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-slate-400 text-sm mt-2">{completionPercentage}% of the Quran memorized ({totalPages} of 604 pages)</p>
      </div>

      <div className="mt-8 bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Recent Memorization</h2>
        {memorizations.length > 0 ? (
          <div className="space-y-3">
            {memorizations.slice(0, 8).map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-100">Surah {m.surahNumber}, Ayahs {m.ayahStart}–{m.ayahEnd}</p>
                  <p className="text-sm text-slate-400">Page {m.pageNumber} • Juz {m.juzNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-300">{m.timestamp ? new Date(m.timestamp).toLocaleDateString() : ''}</p>
                  {m.qualityScore !== undefined && m.qualityScore !== null && (
                    <p className="text-xs text-slate-400">Quality {m.qualityScore}%</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No memorization records yet.</p>
        )}
      </div>
    </div>
  );
};

export default StudentHifzDashboard;
