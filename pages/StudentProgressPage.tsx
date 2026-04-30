import React, { useEffect } from 'react';
import { TRANSLATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CheckCircle, Clock, Zap, Award, TrendingUp, Book } from 'lucide-react';

const StudentProgressPage: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  useEffect(() => {
    if (t) {
      document.documentElement.dir = t.dir;
      document.documentElement.lang = language;
    }
  }, [language, t]);

  const progressData = t?.studentProgress || {
    title: 'Your Progress',
    subtitle: 'Track your Quranic learning journey',
    stats: {
      overall: 'Overall Progress',
      lessons: 'Lessons',
      lessonsDesc: 'Completed',
      quizzes: 'Quizzes Passed',
      avg: 'avg',
      attendance: 'Attendance',
      attendanceDesc: 'This month'
    },
    courseProgress: 'Course Progress',
    learningDistribution: 'Learning Distribution',
    attendanceTrend: 'Attendance Trend',
    quizPerformance: 'Quiz Performance',
    recentActivity: 'Recent Activity',
    today: 'Today',
    yesterday: 'Yesterday'
  };

  // Mock student progress data
  const studentStats = {
    overallProgress: 65,
    coursesEnrolled: 3,
    lessonsCompleted: 24,
    totalLessons: 36,
    quizzesPassed: 8,
    averageScore: 87,
    attendanceRate: 92,
    certificatesEarned: 1
  };

  // Course progress data
  const courseProgress = [
    { name: progressData.courses?.[0] || 'Tajweed', progress: 80, lessons: '20/25' },
    { name: progressData.courses?.[1] || 'Quran Memorization', progress: 60, lessons: '15/30' },
    { name: progressData.courses?.[2] || 'Islamic Studies', progress: 55, lessons: '11/25' }
  ];

  // Monthly attendance data
  const attendanceData = [
    { month: 'Jan', attendance: 85 },
    { month: 'Feb', attendance: 90 },
    { month: 'Mar', attendance: 88 },
    { month: 'Apr', attendance: 92 },
    { month: 'May', attendance: 95 },
    { month: 'Jun', attendance: 92 }
  ];

  // Quiz scores over time
  const quizScores = [
    { quiz: progressData.quizzes?.[0] || 'Quiz 1', score: 85 },
    { quiz: progressData.quizzes?.[1] || 'Quiz 2', score: 90 },
    { quiz: progressData.quizzes?.[2] || 'Quiz 3', score: 78 },
    { quiz: progressData.quizzes?.[3] || 'Quiz 4', score: 88 },
    { quiz: progressData.quizzes?.[4] || 'Quiz 5', score: 92 }
  ];

  // Learning distribution
  const learningDistribution = [
    { name: progressData.categories?.[0] || 'Videos', value: 40 },
    { name: progressData.categories?.[1] || 'Practice', value: 35 },
    { name: progressData.categories?.[2] || 'Reading', value: 15 },
    { name: progressData.categories?.[3] || 'Quizzes', value: 10 }
  ];

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6', '#ec4899'];

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0e1436] to-[#0a0f2b] py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-black text-white mb-2">
            {progressData.title || 'Your Progress'}
          </h1>
          <p className="text-slate-400">
            {progressData.subtitle || 'Track your Quranic learning journey'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={TrendingUp}
            title={progressData.stats?.overall || 'Overall Progress'}
            value={`${studentStats.overallProgress}%`}
            color="bg-gradient-to-br from-primary-500 to-primary-600"
          />
          <StatCard
            icon={Book}
            title={progressData.stats?.lessons || 'Lessons'}
            value={`${studentStats.lessonsCompleted}/${studentStats.totalLessons}`}
            subtitle={progressData.stats?.lessonsDesc || 'Completed'}
            color="bg-gradient-to-br from-accent-500 to-accent-600"
          />
          <StatCard
            icon={Zap}
            title={progressData.stats?.quizzes || 'Quizzes Passed'}
            value={studentStats.quizzesPassed}
            subtitle={`${studentStats.averageScore}% ${progressData.stats?.avg || 'avg'}`}
            color="bg-gradient-to-br from-sky-500 to-sky-600"
          />
          <StatCard
            icon={Award}
            title={progressData.stats?.attendance || 'Attendance'}
            value={`${studentStats.attendanceRate}%`}
            subtitle={progressData.stats?.attendanceDesc || 'This month'}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
        </div>

        {/* Course Progress Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Individual Course Progress */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6">
              {progressData.courseProgress || 'Course Progress'}
            </h2>
            <div className="space-y-6">
              {courseProgress.map((course, idx) => (
                <div key={idx}>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-white font-bold">{course.name}</p>
                    <span className="text-primary-300 text-sm">{course.progress}%</span>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-primary-500 to-accent-500 h-full rounded-full transition-all"
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">{course.lessons} lessons</p>
                </div>
              ))}
            </div>
          </div>

          {/* Learning Distribution */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6">
              {progressData.learningDistribution || 'Learning Distribution'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={learningDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {learningDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Attendance Trend */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6">
              {progressData.attendanceTrend || 'Attendance Trend'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.2)' }}
                    cursor={{ stroke: 'rgba(59,130,246,0.3)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="attendance"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quiz Scores */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6">
              {progressData.quizPerformance || 'Quiz Performance'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizScores}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="quiz" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <Bar dataKey="score" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-black text-white mb-6">
            {progressData.recentActivity || 'Recent Activity'}
          </h2>
          <div className="space-y-4">
            {[
              { icon: CheckCircle, title: 'Completed Lesson 24', date: progressData.today || 'Today', desc: 'Tajweed Rules - Part 3' },
              { icon: Zap, title: 'Passed Quiz 5', date: progressData.yesterday || 'Yesterday', desc: 'Score: 92/100' },
              { icon: Award, title: 'Earned Certificate', date: '5 days ago', desc: 'Islamic Fundamentals - Level 1' },
              { icon: Clock, title: 'Attended Class', date: '1 week ago', desc: 'One-on-one Session' }
            ].map((activity, idx) => (
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
        </div>
      </div>
    </div>
  );
};

export default StudentProgressPage;
