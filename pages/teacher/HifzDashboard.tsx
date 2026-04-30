import React, { useState } from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle2, MessageSquare, BarChart3, Download } from 'lucide-react';

const TeacherHifzDashboard: React.FC = () => {
  const [students, setStudents] = useState([
    {
      id: 'std-001',
      name: 'Ahmed',
      currentPage: 234,
      totalPages: 234,
      retentionScore: 87,
      streakDays: 15,
      weakPages: 3,
      lastActive: '2 hours ago',
      status: 'on-track',
    },
    {
      id: 'std-002',
      name: 'Fatima',
      currentPage: 189,
      totalPages: 189,
      retentionScore: 92,
      streakDays: 22,
      weakPages: 1,
      lastActive: '1 hour ago',
      status: 'excellent',
    },
    {
      id: 'std-003',
      name: 'Muhammad',
      currentPage: 145,
      totalPages: 145,
      retentionScore: 68,
      streakDays: 3,
      weakPages: 7,
      lastActive: '3 days ago',
      status: 'at-risk',
    },
    {
      id: 'std-004',
      name: 'Aisha',
      currentPage: 267,
      totalPages: 267,
      retentionScore: 85,
      streakDays: 18,
      weakPages: 2,
      lastActive: '1 hour ago',
      status: 'on-track',
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState(students[0]);
  const [feedbackText, setFeedbackText] = useState('');

  const handleAddFeedback = () => {
    console.log('Feedback added for:', selectedStudent.name);
    setFeedbackText('');
  };

  const handleScheduleTest = () => {
    console.log('Scheduling test for:', selectedStudent.name);
  };

  const handleExportReport = () => {
    console.log('Exporting report for:', selectedStudent.name);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-emerald-400 bg-emerald-900/20 border-emerald-400/30';
      case 'on-track':
        return 'text-cyan-400 bg-cyan-900/20 border-cyan-400/30';
      case 'at-risk':
        return 'text-red-400 bg-red-900/20 border-red-400/30';
      default:
        return 'text-slate-400 bg-slate-900/20 border-slate-600/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-2">
          Teacher Hifz Dashboard
        </h1>
        <p className="text-slate-400">Manage students, track progress, and provide feedback</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-purple-900/30 to-purple-600/10 border border-purple-400/30 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Total Students</p>
          <p className="text-3xl font-bold text-purple-300">{students.length}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-600/10 border border-emerald-400/30 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">Excellent Performers</p>
          <p className="text-3xl font-bold text-emerald-300">{students.filter((s) => s.status === 'excellent').length}</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-600/10 border border-cyan-400/30 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">On Track</p>
          <p className="text-3xl font-bold text-cyan-300">{students.filter((s) => s.status === 'on-track').length}</p>
        </div>
        <div className="bg-gradient-to-br from-red-900/30 to-red-600/10 border border-red-400/30 rounded-lg p-4">
          <p className="text-slate-400 text-sm mb-1">At Risk</p>
          <p className="text-3xl font-bold text-red-300">{students.filter((s) => s.status === 'at-risk').length}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Student List */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">My Students</h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedStudent.id === student.id
                      ? 'bg-blue-900/30 border-blue-400/50'
                      : 'bg-slate-900/20 border-slate-600/30 hover:border-slate-500/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold">{student.name}</p>
                    <span className={`text-xs px-2 py-1 rounded border ${getStatusColor(student.status)}`}>
                      {student.status === 'at-risk' ? '⚠️' : '✓'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Page {student.currentPage} • Streak: {student.streakDays}d</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Student Details & Feedback */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Profile */}
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-600/10 border border-blue-400/30 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-blue-200">{selectedStudent.name}</h3>
                <p className="text-slate-400 text-sm">Last active: {selectedStudent.lastActive}</p>
              </div>
              <div className={`px-4 py-2 rounded-lg border text-sm font-semibold ${getStatusColor(selectedStudent.status)}`}>
                {selectedStudent.status.toUpperCase()}
              </div>
            </div>

            {/* Progress Stats */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-blue-900/20 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Pages Memorized</p>
                <p className="text-xl font-bold text-blue-300">{selectedStudent.totalPages}</p>
              </div>
              <div className="bg-emerald-900/20 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Retention Score</p>
                <p className="text-xl font-bold text-emerald-300">{selectedStudent.retentionScore}%</p>
              </div>
              <div className="bg-orange-900/20 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Current Streak</p>
                <p className="text-xl font-bold text-orange-300">{selectedStudent.streakDays}d</p>
              </div>
              <div className="bg-red-900/20 p-3 rounded">
                <p className="text-xs text-slate-400 mb-1">Weak Pages</p>
                <p className="text-xl font-bold text-red-300">{selectedStudent.weakPages}</p>
              </div>
            </div>
          </div>

          {/* Feedback & Actions */}
          <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Add Feedback</h4>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Write feedback for the student (e.g., 'Great improvement in Tajweed this week! Work on page 145 especially.')..."
              className="w-full bg-slate-900/30 border border-slate-600/30 rounded px-4 py-3 text-slate-100 placeholder-slate-500 mb-4 focus:outline-none focus:border-blue-500/50 min-h-24"
            />

            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleAddFeedback}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <MessageSquare size={18} />
                Send Feedback
              </button>
              <button
                onClick={handleScheduleTest}
                className="bg-emerald-500 hover:bg-emerald-600 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <BarChart3 size={18} />
                Schedule Test
              </button>
              <button
                onClick={handleExportReport}
                className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Weak Pages Analysis */}
      <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-400/30 rounded-lg p-6 mb-8">
        <div className="flex items-center mb-4">
          <AlertCircle className="text-red-400 mr-3" size={24} />
          <h3 className="text-lg font-semibold">Weak Pages Across Students</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-900/30 border border-red-400/30 rounded p-4">
            <p className="text-sm text-slate-400 mb-2">Most Challenging Pages</p>
            <div className="space-y-1">
              <p className="text-slate-200">Page 145 (7 students)</p>
              <p className="text-slate-200">Page 267 (5 students)</p>
              <p className="text-slate-200">Page 89 (4 students)</p>
            </div>
          </div>
          <div className="bg-orange-900/30 border border-orange-400/30 rounded p-4">
            <p className="text-sm text-slate-400 mb-2">Common Mistakes</p>
            <div className="space-y-1">
              <p className="text-slate-200">Noon Sakinah (12%)</p>
              <p className="text-slate-200">Madd Rules (8%)</p>
              <p className="text-slate-200">Lam Shamsiyyah (6%)</p>
            </div>
          </div>
          <div className="bg-yellow-900/30 border border-yellow-400/30 rounded p-4">
            <p className="text-sm text-slate-400 mb-2">Intervention Needed</p>
            <div className="space-y-1">
              <p className="text-slate-200">Muhammad (3 weak pages)</p>
              <p className="text-slate-200">Layla (5 weak pages)</p>
              <p className="text-slate-200">Hassan (2 weak pages)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Student Activity */}
      <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { name: 'Ahmed', action: 'Submitted recording for Page 234', time: '2 hours ago', icon: '🎙️' },
            { name: 'Fatima', action: 'Completed Juz 9 memorization', time: '4 hours ago', icon: '✅' },
            { name: 'Muhammad', action: 'Marked weak pages: 145, 156, 167', time: '1 day ago', icon: '⚠️' },
            { name: 'Aisha', action: 'Passed Juz test with 92% score', time: '2 days ago', icon: '🏆' },
          ].map((activity, idx) => (
            <div key={idx} className="flex items-center gap-4 p-3 bg-slate-900/20 rounded-lg border border-slate-700/30">
              <span className="text-xl">{activity.icon}</span>
              <div className="flex-1">
                <p className="font-semibold text-slate-200">{activity.name}</p>
                <p className="text-sm text-slate-400">{activity.action}</p>
              </div>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TeacherHifzDashboard;
