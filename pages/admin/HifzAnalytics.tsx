import React, { useEffect, useState } from 'react';
import { Users, BookOpen, AlertTriangle } from 'lucide-react';
import hifzDataService from '../../services/hifzDataService';

// Admin Hifz analytics: only numbers read from the Hifz database.
// Anything with no data source yet says so plainly.
const AdminHifzAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [atRisk, setAtRisk] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, risk] = await Promise.all([
          hifzDataService.getAcademyStats().catch(() => null),
          hifzDataService.getAtRiskStudents().catch(() => []),
        ]);
        if (cancelled) return;
        setStats(s);
        setAtRisk(risk);
      } catch (err) {
        console.error('Failed to load Hifz analytics:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2">
          Hifz Analytics
        </h1>
        <p className="text-slate-400">Academy-wide Hifz numbers from the database</p>
      </div>

      {loadError && (
        <p className="text-red-300 mb-8">Could not load Hifz analytics. Please try again later.</p>
      )}

      {/* Real academy stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-6">
          <Users className="text-purple-400 mb-2" size={28} />
          <p className="text-slate-400 text-sm">Total Hifz Students</p>
          <p className="text-3xl font-bold text-purple-300">{stats?.totalStudents ?? 0}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-600/10 border border-cyan-400/30 rounded-lg p-6">
          <BookOpen className="text-cyan-400 mb-2" size={28} />
          <p className="text-slate-400 text-sm">Pages Memorized</p>
          <p className="text-3xl font-bold text-cyan-300">{stats?.totalPagesMemorized ?? 0}</p>
        </div>
        <div className="bg-gradient-to-br from-green-900/30 to-green-600/10 border border-green-400/30 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Average Retention</p>
          <p className="text-3xl font-bold text-green-300">{stats?.averageRetention != null ? `${stats.averageRetention}%` : '—'}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-900/30 to-orange-600/10 border border-orange-400/30 rounded-lg p-6">
          <p className="text-slate-400 text-sm">Active Today</p>
          <p className="text-3xl font-bold text-orange-300">{stats?.activeStudents ?? 0}</p>
        </div>
      </div>

      {/* At-risk students — real records */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <AlertTriangle className="text-amber-400" size={24} />
          <h2 className="text-2xl font-bold text-amber-300">Students Needing Attention</h2>
        </div>
        <p className="text-slate-400 text-sm mb-4">
          Students inactive for more than 7 days, with a streak under 2 days, or retention under 60%.
        </p>
        {atRisk.length > 0 ? (
          <div className="space-y-3">
            {atRisk.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-100">{s.name}</p>
                  <p className="text-sm text-slate-400">
                    {s.totalPagesMemoized ?? 0} pages • Juz {s.currentJuz ?? 0}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="text-slate-300">Retention {s.retentionScore ?? '—'}%</p>
                  <p className="text-slate-400">Streak {s.streakDays ?? 0} days</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No students flagged at risk right now.</p>
        )}
      </div>

      {/* Not yet tracked */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-3">Weekly Trend</h2>
          <p className="text-slate-400">No data yet.</p>
          <p className="text-slate-500 text-sm mt-1">Weekly memorization trends are not tracked yet.</p>
        </div>
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-3">Teacher Performance</h2>
          <p className="text-slate-400">No data yet.</p>
          <p className="text-slate-500 text-sm mt-1">Per-teacher performance is not tracked yet.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminHifzAnalytics;
