import React, { useEffect } from 'react';
import { TRANSLATIONS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, BookOpen, DollarSign, TrendingUp, Activity, BarChart3, PieChart as PieIcon, Calendar } from 'lucide-react';

const AdminAnalyticsPage: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  useEffect(() => {
    if (t) {
      document.documentElement.dir = t.dir;
      document.documentElement.lang = language;
    }
  }, [language, t]);

  const analyticsData = t?.adminAnalytics || {
    title: 'System Analytics',
    subtitle: 'Comprehensive overview of academy performance',
    thisMonth: 'this month',
    stats: {
      students: 'Total Students',
      courses: 'Active Courses',
      revenue: 'Monthly Revenue',
      completion: 'Completion Rate'
    },
    revenueTrend: 'Revenue Trend',
    studentGrowth: 'Student Enrollment Growth',
    topCourses: 'Top Courses',
    distribution: 'Student Distribution by Level',
    retention: 'Cohort Retention',
    teacherPerformance: 'Top Teachers by Rating',
    summary: 'System Summary',
    activeStudents: 'Active Students',
    totalTeachers: 'Active Teachers',
    totalEnrollments: 'Total Enrollments',
    totalRevenue: 'Total Revenue',
    enrolled: 'of total',
    available: 'available',
    perStudent: 'per student',
    allTime: 'All time',
    students: 'students'
  };

  // Mock admin analytics data
  const systemStats = {
    totalStudents: 1250,
    activeStudents: 892,
    totalTeachers: 24,
    activeTeachers: 18,
    totalCourses: 12,
    enrollments: 3428,
    totalRevenue: 45320,
    monthlyRevenue: 8750,
    studentGrowth: 12.5,
    completionRate: 78
  };

  // Monthly revenue data
  const revenueData = [
    { month: 'Jan', revenue: 5200, students: 120 },
    { month: 'Feb', revenue: 6100, students: 145 },
    { month: 'Mar', revenue: 7300, students: 178 },
    { month: 'Apr', revenue: 8150, students: 195 },
    { month: 'May', revenue: 8750, students: 210 },
    { month: 'Jun', revenue: 9200, students: 235 }
  ];

  // Top courses enrollment
  const topCourses = [
    { name: analyticsData.courses?.[0] || 'Tajweed', enrollments: 650, completion: 85 },
    { name: analyticsData.courses?.[1] || 'Hifz', enrollments: 520, completion: 72 },
    { name: analyticsData.courses?.[2] || 'Islamic Studies', enrollments: 480, completion: 68 },
    { name: analyticsData.courses?.[3] || 'Arabic Grammar', enrollments: 380, completion: 75 },
    { name: analyticsData.courses?.[4] || 'Tafsir', enrollments: 320, completion: 82 }
  ];

  // Student distribution by level
  const studentDistribution = [
    { name: analyticsData.levels?.[0] || 'Beginner', value: 520 },
    { name: analyticsData.levels?.[1] || 'Intermediate', value: 480 },
    { name: analyticsData.levels?.[2] || 'Advanced', value: 250 }
  ];

  // Student retention (cohort analysis)
  const cohortData = [
    { week: 'Week 1', retention: 100 },
    { week: 'Week 2', retention: 92 },
    { week: 'Week 3', retention: 87 },
    { week: 'Week 4', retention: 82 },
    { week: 'Week 8', retention: 78 },
    { week: 'Week 12', retention: 75 }
  ];

  // Teacher performance
  const teacherPerformance = [
    { name: analyticsData.teachers?.[0] || 'Ustadha Fatima', rating: 4.9, students: 85 },
    { name: analyticsData.teachers?.[1] || 'Sheikh Muhammad', rating: 5.0, students: 120 },
    { name: analyticsData.teachers?.[2] || 'Ustadha Aisha', rating: 4.95, students: 95 },
    { name: analyticsData.teachers?.[3] || 'Sheikh Omar', rating: 4.92, students: 78 },
    { name: analyticsData.teachers?.[4] || 'Ustadha Layla', rating: 4.98, students: 89 }
  ];

  const COLORS = ['#3b82f6', '#06b6d4', '#8b5cf6'];

  const StatCard = ({ icon: Icon, label, value, change, color }: any) => (
    <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 hover:border-primary-400/50 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
          <p className="text-3xl font-black text-white">{value}</p>
          {change && (
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-bold">{change}% {analyticsData.thisMonth || 'this month'}</span>
            </div>
          )}
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
            {analyticsData.title || 'System Analytics'}
          </h1>
          <p className="text-slate-400">
            {analyticsData.subtitle || 'Comprehensive overview of academy performance'}
          </p>
        </div>

        {/* KPI Stats */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <StatCard
            icon={Users}
            label={analyticsData.stats?.students || 'Total Students'}
            value={systemStats.totalStudents.toLocaleString()}
            change={systemStats.studentGrowth}
            color="bg-gradient-to-br from-primary-500 to-primary-600"
          />
          <StatCard
            icon={BookOpen}
            label={analyticsData.stats?.courses || 'Active Courses'}
            value={systemStats.totalCourses}
            change={8}
            color="bg-gradient-to-br from-accent-500 to-accent-600"
          />
          <StatCard
            icon={DollarSign}
            label={analyticsData.stats?.revenue || 'Monthly Revenue'}
            value={`$${systemStats.monthlyRevenue.toLocaleString()}`}
            change={15}
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon={Activity}
            label={analyticsData.stats?.completion || 'Completion Rate'}
            value={`${systemStats.completionRate}%`}
            change={5}
            color="bg-gradient-to-br from-sky-500 to-sky-600"
          />
        </div>

        {/* Revenue and Growth */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Trend */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-6 h-6" />
              {analyticsData.revenueTrend || 'Revenue Trend'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Growth */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <Users className="w-6 h-6" />
              {analyticsData.studentGrowth || 'Student Enrollment Growth'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="students"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: '#06b6d4', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Top Courses and Distribution */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Top Courses */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6">
              {analyticsData.topCourses || 'Top Courses'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCourses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis type="number" stroke="rgba(255,255,255,0.5)" />
                  <YAxis dataKey="name" type="category" stroke="rgba(255,255,255,0.5)" width={120} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <Bar dataKey="enrollments" fill="#3b82f6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Student Distribution */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <PieIcon className="w-6 h-6" />
              {analyticsData.distribution || 'Student Distribution by Level'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={studentDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {studentDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Retention and Teacher Performance */}
        <div className="grid lg:grid-cols-2 gap-8 mb-12">
          {/* Cohort Retention */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6" />
              {analyticsData.retention || 'Cohort Retention'}
            </h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cohortData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
                  <YAxis stroke="rgba(255,255,255,0.5)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid rgba(255,255,255,0.2)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="retention"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    dot={{ fill: '#8b5cf6', r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Teacher Performance */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
            <h2 className="text-2xl font-black text-white mb-6">
              {analyticsData.teacherPerformance || 'Top Teachers by Rating'}
            </h2>
            <div className="space-y-4">
              {teacherPerformance.map((teacher, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex-1">
                    <p className="text-white font-bold">{teacher.name}</p>
                    <p className="text-slate-400 text-sm">{teacher.students} {analyticsData.students || 'students'}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <span className="text-primary-300 font-black">{teacher.rating}</span>
                      <span className="text-yellow-400">★</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-8">
          <h2 className="text-2xl font-black text-white mb-6">
            {analyticsData.summary || 'System Summary'}
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">{analyticsData.activeStudents || 'Active Students'}</p>
              <p className="text-3xl font-black text-emerald-400">{systemStats.activeStudents}</p>
              <p className="text-slate-500 text-xs mt-2">{((systemStats.activeStudents / systemStats.totalStudents) * 100).toFixed(0)}% {analyticsData.enrolled || 'of total'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">{analyticsData.totalTeachers || 'Active Teachers'}</p>
              <p className="text-3xl font-black text-primary-400">{systemStats.activeTeachers}</p>
              <p className="text-slate-500 text-xs mt-2">{((systemStats.activeTeachers / systemStats.totalTeachers) * 100).toFixed(0)}% {analyticsData.available || 'available'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">{analyticsData.totalEnrollments || 'Total Enrollments'}</p>
              <p className="text-3xl font-black text-sky-400">{systemStats.enrollments.toLocaleString()}</p>
              <p className="text-slate-500 text-xs mt-2">{(systemStats.enrollments / systemStats.totalStudents).toFixed(1)} {analyticsData.perStudent || 'per student'}</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-2">{analyticsData.totalRevenue || 'Total Revenue'}</p>
              <p className="text-3xl font-black text-emerald-400">${systemStats.totalRevenue.toLocaleString()}</p>
              <p className="text-slate-500 text-xs mt-2">{analyticsData.allTime || 'All time'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsPage;
