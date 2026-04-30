import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Users, BookOpen, AlertTriangle, Award, BarChart3, PieChart, ArrowUp } from 'lucide-react';

const AdminHifzAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('month');
  const [selectedMetric, setSelectedMetric] = useState('retention');

  // Academy-wide metrics
  const academyMetrics = {
    totalStudents: 127,
    activeStudents: 98,
    totalPagesMemo: 8934,
    avgPagePerStudent: 71.2,
    completionRate: 44.1,
    avgRetention: 82.3,
    totalTeachers: 12,
    avgStudentsPerTeacher: 10.6,
  };

  // At-risk students
  const atRiskStudents = [
    { id: 1, name: 'Muhammad', pages: 45, retention: 58, streakDays: 2, lastActive: '5 days ago' },
    { id: 2, name: 'Layla', pages: 32, retention: 52, streakDays: 0, lastActive: '7 days ago' },
    { id: 3, name: 'Hassan', pages: 89, retention: 64, streakDays: 1, lastActive: '3 days ago' },
    { id: 4, name: 'Zahra', pages: 120, retention: 68, streakDays: 3, lastActive: '2 days ago' },
    { id: 5, name: 'Omar', pages: 78, retention: 60, streakDays: 0, lastActive: '6 days ago' },
  ];

  // Weak page patterns
  const weakPagePatterns = [
    { pageNum: 145, failureCount: 18, affectedStudents: 7, topError: 'Noon Sakinah' },
    { pageNum: 267, failureCount: 14, affectedStudents: 5, topError: 'Madd Rules' },
    { pageNum: 89, failureCount: 12, affectedStudents: 4, topError: 'Lam Shamsiyyah' },
    { pageNum: 234, failureCount: 10, affectedStudents: 4, topError: 'Ikhfaa' },
    { pageNum: 156, failureCount: 9, affectedStudents: 3, topError: 'Raa Rules' },
  ];

  // Teacher performance
  const teacherPerformance = [
    { id: 1, name: 'Dr. Fatima', students: 12, avgRetention: 86, completionRate: 58 },
    { id: 2, name: 'Sheikh Ahmed', students: 14, avgRetention: 88, completionRate: 62 },
    { id: 3, name: 'Hajja Aisha', students: 10, avgRetention: 84, completionRate: 52 },
    { id: 4, name: 'Muhammad Ali', students: 11, avgRetention: 79, completionRate: 45 },
    { id: 5, name: 'Layla Hassan', students: 9, avgRetention: 81, completionRate: 48 },
  ];

  // Progress trends (last 7 days)
  const progressTrends = {
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    memorized: [125, 142, 138, 156, 149, 168, 172],
    revisions: [93, 108, 101, 125, 118, 140, 155],
  };

  const maxMemo = Math.max(...progressTrends.memorized);
  const maxRevision = Math.max(...progressTrends.revisions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-2">
          Hifz Academy Analytics
        </h1>
        <p className="text-slate-400">Real-time academy performance metrics and insights</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-8">
        {['week', 'month', 'quarter', 'year'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg capitalize transition ${
              timeRange === range
                ? 'bg-blue-500 text-white'
                : 'bg-slate-800/30 text-slate-400 hover:bg-slate-700/30'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/10 border border-blue-400/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm">Total Students</p>
            <Users className="text-blue-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-blue-300 mb-1">{academyMetrics.totalStudents}</p>
          <p className="text-xs text-slate-400">
            <span className="text-green-400">↑ 8</span> active this week
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 border border-emerald-400/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm">Completion Rate</p>
            <TrendingUp className="text-emerald-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-emerald-300 mb-1">{academyMetrics.completionRate}%</p>
          <p className="text-xs text-slate-400">
            <span className="text-green-400">↑ 2.3%</span> from last month
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm">Avg Retention</p>
            <BarChart3 className="text-purple-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-purple-300 mb-1">{academyMetrics.avgRetention}%</p>
          <p className="text-xs text-slate-400">
            <span className="text-green-400">↑ 1.2%</span> from last month
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-900/30 to-orange-600/10 border border-orange-400/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-400 text-sm">Pages Memorized</p>
            <BookOpen className="text-orange-400" size={20} />
          </div>
          <p className="text-3xl font-bold text-orange-300 mb-1">{(academyMetrics.totalPagesMemo / 1000).toFixed(1)}k</p>
          <p className="text-xs text-slate-400">
            <span className="text-green-400">↑ 1.2k</span> this month
          </p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Progress Trends */}
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Weekly Memorization Trend</h3>
          <div className="space-y-4">
            {progressTrends.days.map((day, idx) => (
              <div key={day} className="flex items-center gap-3">
                <div className="w-12 text-sm text-slate-400 font-semibold">{day}</div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-8 bg-slate-900/30 rounded-lg relative overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg transition-all"
                      style={{ width: `${(progressTrends.memorized[idx] / maxMemo) * 100}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm text-slate-300">{progressTrends.memorized[idx]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Performance */}
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Top Performers</h3>
          <div className="space-y-3">
            {teacherPerformance.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-slate-900/20 p-3 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-200">{teacher.name}</p>
                  <span className="text-xs bg-green-900/30 text-green-300 px-2 py-1 rounded">
                    ⭐ {teacher.avgRetention}%
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-400">
                  <span>{teacher.students} students</span>
                  <span className="text-blue-400">{teacher.completionRate}% completion</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* At-Risk Students */}
      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-400/30 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-red-400" size={24} />
            <h3 className="text-lg font-semibold">At-Risk Students</h3>
          </div>
          <span className="text-sm text-slate-400">{atRiskStudents.length} students need attention</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {atRiskStudents.map((student) => (
            <div
              key={student.id}
              className="bg-red-900/30 border border-red-400/30 rounded-lg p-4 hover:border-red-400/50 transition"
            >
              <h4 className="font-semibold text-red-200 mb-2">{student.name}</h4>
              <div className="space-y-1 text-sm text-slate-300">
                <p>📖 Page {student.pages}</p>
                <p>📊 Retention: {student.retention}%</p>
                <p>🔥 Streak: {student.streakDays}d</p>
                <p className="text-xs text-slate-400">Last: {student.lastActive}</p>
              </div>
              <button className="mt-3 w-full bg-red-600/50 hover:bg-red-600 text-sm py-1 rounded transition font-semibold">
                Review
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Weak Page Patterns */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">System-Wide Weak Page Analysis</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-600/30">
                <th className="text-left py-3 px-4 text-slate-400">Page #</th>
                <th className="text-left py-3 px-4 text-slate-400">Failures</th>
                <th className="text-left py-3 px-4 text-slate-400">Affected Students</th>
                <th className="text-left py-3 px-4 text-slate-400">Common Error</th>
                <th className="text-left py-3 px-4 text-slate-400">Difficulty Track</th>
              </tr>
            </thead>
            <tbody>
              {weakPagePatterns.map((pattern) => (
                <tr key={pattern.pageNum} className="border-b border-slate-700/30 hover:bg-slate-800/20 transition">
                  <td className="py-3 px-4 font-semibold text-blue-300">{pattern.pageNum}</td>
                  <td className="py-3 px-4">
                    <span className="bg-red-900/30 text-red-300 px-2 py-1 rounded text-xs font-semibold">
                      {pattern.failureCount}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300">{pattern.affectedStudents} students</td>
                  <td className="py-3 px-4 text-slate-300">{pattern.topError}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-700/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-red-500 to-orange-500"
                          style={{ width: `${(pattern.failureCount / 20) * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-orange-400">{Math.round((pattern.failureCount / 20) * 100)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Academy Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg Pages per Student</span>
              <span className="text-emerald-300 font-semibold">{academyMetrics.avgPagePerStudent}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Teachers</span>
              <span className="text-purple-300 font-semibold">{academyMetrics.totalTeachers}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg Students per Teacher</span>
              <span className="text-blue-300 font-semibold">{academyMetrics.avgStudentsPerTeacher}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Active This Week</span>
              <span className="text-cyan-300 font-semibold">{academyMetrics.activeStudents}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Recommended Actions</h3>
          <div className="space-y-3">
            <button className="w-full text-left bg-blue-900/20 border border-blue-400/30 p-3 rounded-lg hover:border-blue-400/50 transition">
              <p className="font-semibold text-blue-300">Review At-Risk Students</p>
              <p className="text-xs text-slate-400">5 students need intervention</p>
            </button>
            <button className="w-full text-left bg-orange-900/20 border border-orange-400/30 p-3 rounded-lg hover:border-orange-400/50 transition">
              <p className="font-semibold text-orange-300">Analyze Weak Pages</p>
              <p className="text-xs text-slate-400">Page 145 has 18 failures</p>
            </button>
            <button className="w-full text-left bg-green-900/20 border border-green-400/30 p-3 rounded-lg hover:border-green-400/50 transition">
              <p className="font-semibold text-green-300">Download Monthly Report</p>
              <p className="text-xs text-slate-400">Complete academy overview</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHifzAnalytics;
