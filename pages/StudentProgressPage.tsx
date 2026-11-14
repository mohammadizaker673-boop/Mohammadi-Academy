import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, Clock, Award, TrendingUp, Book } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getStudentByUserId, getAttendanceByStudentId } from '../services/db';
import hifzDataService from '../services/hifzDataService';
import type { MemorizationRecord } from '../types/hifz.types';

// Student progress shows ONLY what is actually recorded for this student:
// Hifz memorization records and teacher-marked attendance. Anything with
// no recorded data says so plainly instead of inventing numbers.
const StudentProgressPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [hifzProfile, setHifzProfile] = useState<any>(null);
  const [memorizations, setMemorizations] = useState<MemorizationRecord[]>([]);
  const [attendanceRate, setAttendanceRate] = useState<number | null>(null);
  const [attendanceTotal, setAttendanceTotal] = useState(0);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language, user]);

  useEffect(() => {
    if (!user?.uid) return;
    let cancelled = false;
    (async () => {
      try {
        const [profile, memos, student] = await Promise.all([
          hifzDataService.getStudentProfile(user.uid).catch(() => null),
          hifzDataService.getStudentMemorizations(user.uid).catch(() => []),
          getStudentByUserId(user.uid).catch(() => null),
        ]);
        if (cancelled) return;
        setHifzProfile(profile);
        setMemorizations(memos);
        if (student) {
          const rows = await getAttendanceByStudentId(student.id).catch(() => []);
          if (cancelled) return;
          const total = rows.length;
          const present = rows.filter((r: any) => r.status === 'present').length;
          setAttendanceTotal(total);
          setAttendanceRate(total > 0 ? Math.round((present / total) * 100) : null);
        }
      } catch (err) {
        console.error('Failed to load student progress:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user?.uid]);

  const StatCard = ({ icon: Icon, title, value, subtitle, color }: any) => (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:border-primary-400/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{title}</p>
          <p className="text-4xl font-black text-white">{value}</p>
          {subtitle && <p className="text-primary-300 text-sm mt-2">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const NoData = ({ title, note }: { title: string; note: string }) => (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
      <h2 className="text-2xl font-black text-white mb-3">{title}</h2>
      <p className="text-slate-400">No data yet.</p>
      <p className="text-slate-500 text-sm mt-1">{note}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0e1436] to-[#0a0f2b] py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0e1436] to-[#0a0f2b] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-black text-white mb-2">Your Progress</h1>
          <p className="text-slate-400">Could not load your progress. Please try again later.</p>
        </div>
      </div>
    );
  }

  const pagesMemorized = hifzProfile?.totalPagesMemoized ?? memorizations.length;
  const currentJuz = hifzProfile?.currentJuz ?? 0;
  const retention = hifzProfile?.retentionScore;
  const hifzCompletion = Math.round((pagesMemorized / 604) * 100);

  const recentActivity = [
    ...memorizations.slice(0, 5).map((m: any) => ({
      icon: Book,
      title: `Memorized Surah ${m.surahNumber}, Ayahs ${m.ayahStart}–${m.ayahEnd}`,
      date: m.timestamp ? new Date(m.timestamp).toLocaleDateString() : '',
      desc: `Page ${m.pageNumber} • Juz ${m.juzNumber}${m.qualityScore ? ` • Quality ${m.qualityScore}%` : ''}`,
    })),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1436] to-[#0a0f2b] py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">Your Progress</h1>
          <p className="text-slate-400">Track your Quranic learning journey</p>
        </div>

        {/* Stats Grid — real recorded numbers only */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={TrendingUp}
            title="Hifz Progress"
            value={`${hifzCompletion}%`}
            subtitle={`${pagesMemorized} of 604 pages memorized`}
            color="bg-gradient-to-br from-primary-500 to-primary-600"
          />
          <StatCard
            icon={Book}
            title="Current Juz"
            value={currentJuz > 0 ? `${currentJuz}/30` : '—'}
            subtitle={currentJuz > 0 ? 'Juz in progress' : 'No Hifz profile yet'}
            color="bg-gradient-to-br from-accent-500 to-accent-600"
          />
          <StatCard
            icon={Award}
            title="Retention Score"
            value={retention !== undefined && retention !== null ? `${retention}%` : '—'}
            subtitle={retention !== undefined && retention !== null ? 'From your Hifz record' : 'No Hifz record yet'}
            color="bg-gradient-to-br from-sky-500 to-sky-600"
          />
          <StatCard
            icon={CheckCircle}
            title="Attendance"
            value={attendanceRate !== null ? `${attendanceRate}%` : '—'}
            subtitle={attendanceRate !== null ? `${attendanceTotal} classes recorded` : 'No attendance recorded yet'}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
        </div>

        {/* Hifz progress + recent activity */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6">Hifz Progress</h2>
            {hifzProfile ? (
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-white font-bold">Quran memorized</p>
                    <span className="text-primary-300 text-sm">{hifzCompletion}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all"
                      style={{ width: `${hifzCompletion}%` }}
                    />
                  </div>
                  <p className="text-slate-400 text-xs mt-2">{pagesMemorized} pages • Juz {currentJuz} of 30</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-slate-400">Day streak</p>
                    <p className="text-white font-bold text-lg">{hifzProfile.streakDays ?? 0} days</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4">
                    <p className="text-slate-400">Memorization records</p>
                    <p className="text-white font-bold text-lg">{memorizations.length}</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">
                No Hifz profile yet. Once your teacher sets up your Hifz record, your memorization progress will appear here.
              </p>
            )}
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6">Recent Activity</h2>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-start gap-4 pb-4 border-b border-white/10 last:border-0">
                    <div className="p-3 bg-primary-500/20 rounded-lg flex-shrink-0">
                      <activity.icon className="w-5 h-5 text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-bold">{activity.title}</p>
                      <p className="text-slate-400 text-sm">{activity.desc}</p>
                    </div>
                    <p className="text-slate-500 text-sm">{activity.date}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400">No memorization activity recorded yet.</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <NoData
            title="Course Progress"
            note="Per-lesson course progress is not tracked yet."
          />
          <NoData
            title="Quiz Performance"
            note="Quiz results are not recorded yet."
          />
        </div>
      </div>
    </div>
  );
};

export default StudentProgressPage;
