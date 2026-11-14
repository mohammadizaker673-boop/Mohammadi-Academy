import React, { useEffect, useState } from 'react';
import { Flame, BookOpen, Award } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import hifzDataService from '../../services/hifzDataService';

// Gamification page: only the student's REAL streak and pages from their
// Hifz record. There is no badge system or leaderboard yet, so those
// sections say so honestly instead of inventing names and scores.
const GamificationUI: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const p = await hifzDataService.getStudentProfile(user.uid).catch(() => null);
        if (!cancelled) setProfile(p);
      } catch (err) {
        console.error('Failed to load gamification data:', err);
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

  const streak = profile?.streakDays ?? 0;
  const pages = profile?.totalPagesMemoized ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
          Achievements
        </h1>
        <p className="text-slate-400">Your real progress, from your Hifz record</p>
      </div>

      {loadError && (
        <p className="text-red-300 mb-8">Could not load your progress. Please try again later.</p>
      )}

      {/* Real stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-600/10 border border-orange-400/30 rounded-lg p-6 flex items-center gap-4">
          <Flame className="text-orange-400" size={36} />
          <div>
            <p className="text-slate-400 text-sm">Day Streak</p>
            <p className="text-3xl font-bold text-orange-300">{streak} {streak === 1 ? 'day' : 'days'}</p>
          </div>
        </div>
        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-600/10 border border-cyan-400/30 rounded-lg p-6 flex items-center gap-4">
          <BookOpen className="text-cyan-400" size={36} />
          <div>
            <p className="text-slate-400 text-sm">Pages Memorized</p>
            <p className="text-3xl font-bold text-cyan-300">{pages} of 604</p>
          </div>
        </div>
      </div>

      {!profile && (
        <div className="bg-gradient-to-r from-blue-900/30 to-cyan-900/30 border border-blue-400/30 rounded-lg p-8 text-center mb-8">
          <p className="text-cyan-300 text-lg font-semibold">Your Hifz record hasn't been set up yet</p>
          <p className="text-slate-300 mt-2">
            Once your teacher sets up your Hifz record, your streak and pages memorized will appear here.
          </p>
        </div>
      )}

      {/* Not yet built — honest empty states */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-8">
          <div className="flex items-center gap-2 mb-4">
            <Award className="text-amber-400" size={24} />
            <h2 className="text-2xl font-bold text-amber-300">Badges</h2>
          </div>
          <p className="text-slate-400">No badges yet.</p>
          <p className="text-slate-500 text-sm mt-1">A badge system is not available yet.</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-cyan-300 mb-4">Leaderboard</h2>
          <p className="text-slate-400">No leaderboard yet.</p>
          <p className="text-slate-500 text-sm mt-1">A leaderboard is not available yet.</p>
        </div>
      </div>
    </div>
  );
};

export default GamificationUI;
