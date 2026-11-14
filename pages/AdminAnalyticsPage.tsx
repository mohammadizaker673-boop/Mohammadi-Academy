import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, GraduationCap, Activity, BarChart3 } from 'lucide-react';
import { getDashboardStats } from '../services/db';
import { courses } from '../data/courses';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  onlineStudents: number;
  offlineStudents: number;
  totalTeachers: number;
  activeTeachers: number;
}

// Admin analytics shows ONLY numbers read from the database.
// Anything with no data source yet says so plainly instead of inventing it.
const AdminAnalyticsPage: React.FC = () => {
  const { language } = useLanguage();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await getDashboardStats();
        if (!cancelled) setStats(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        if (!cancelled) setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const COLORS = ['#3b82f6', '#06b6d4'];

  const StatCard = ({ icon: Icon, label, value, sub, color }: any) => (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:border-primary-400/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {sub && <p className="text-slate-400 text-sm mt-2">{sub}</p>}
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

  if (loadError || !stats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0e1436] to-[#0a0f2b] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-black text-white mb-2">System Analytics</h1>
          <p className="text-slate-400">Could not load analytics from the database. Please try again later.</p>
        </div>
      </div>
    );
  }

  const distribution = [
    { name: 'Online', value: stats.onlineStudents },
    { name: 'Offline', value: stats.offlineStudents },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1436] to-[#0a0f2b] py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">System Analytics</h1>
          <p className="text-slate-400">Live numbers from the academy database</p>
        </div>

        {/* KPI Stats — all read from Supabase */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Users}
            label="Total Students"
            value={stats.totalStudents.toLocaleString()}
            sub={`${stats.activeStudents} active`}
            color="bg-gradient-to-br from-primary-500 to-primary-600"
          />
          <StatCard
            icon={Activity}
            label="Active Students"
            value={stats.activeStudents.toLocaleString()}
            sub={stats.totalStudents > 0 ? `${Math.round((stats.activeStudents / stats.totalStudents) * 100)}% of total` : 'No students yet'}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={GraduationCap}
            label="Teachers"
            value={stats.totalTeachers.toLocaleString()}
            sub={`${stats.activeTeachers} active`}
            color="bg-gradient-to-br from-accent-500 to-accent-600"
          />
          <StatCard
            icon={BookOpen}
            label="Courses Listed"
            value={courses.length}
            sub="In the course catalogue"
            color="bg-gradient-to-br from-sky-500 to-sky-600"
          />
        </div>

        {/* Student distribution — real online/offline split */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              Student Distribution
            </h2>
            {stats.totalStudents > 0 ? (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-slate-400">No students yet.</p>
            )}
          </div>

          <NoData
            title="Revenue"
            note="Payments are arranged with parents on WhatsApp, so no revenue is recorded on the site yet."
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          <NoData
            title="Enrolment Growth"
            note="Enrolment requests are recorded, but monthly growth is not tracked yet."
          />
          <NoData
            title="Top Courses by Enrolment"
            note="Per-course enrolment counts are not tracked yet."
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <NoData
            title="Completion Rate"
            note="Lesson and course completion is not tracked yet."
          />
          <NoData
            title="Teacher Ratings"
            note="Teacher ratings are not collected yet."
          />
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
