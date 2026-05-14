import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDashboardStats } from '../../services/db';
import { TRANSLATIONS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { Users, GraduationCap, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  onlineStudents: number;
  offlineStudents: number;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language]?.dashboard?.admin || TRANSLATIONS['en'].dashboard?.admin;
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    onlineStudents: 0,
    offlineStudents: 0,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dir = TRANSLATIONS[language]?.dir || 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    fetchDashboardStats().catch(error => console.error('Error fetching stats:', error));
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const data = await getDashboardStats();
      setStats({
        totalStudents: data.totalStudents,
        activeStudents: data.activeStudents,
        totalTeachers: data.totalTeachers,
        activeTeachers: data.activeTeachers,
        onlineStudents: data.onlineStudents,
        offlineStudents: data.offlineStudents,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const statCards = [
    {
      title: t?.totalStudents || 'Total Students',
      value: stats.totalStudents,
      subtitle: `${stats.activeStudents} ${t?.active || 'active'}`,
      icon: Users,
      gradient: 'from-primary-500 to-accent-400',
      bgGradient: 'from-sky-500/10 to-blue-500/10',
    },
    {
      title: t?.onlineStudents || 'Online Students',
      value: stats.onlineStudents,
      subtitle: t?.remotelearning || 'Remote learning',
      icon: Users,
      gradient: 'from-primary-500 to-accent-500',
      bgGradient: 'from-primary-500/10 to-accent-500/10',
    },
    {
      title: t?.offlineStudents || 'Offline Students',
      value: stats.offlineStudents,
      subtitle: t?.inCenter || 'In-center',
      icon: Users,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
    },
    {
      title: t?.totalTeachers || 'Total Teachers',
      value: stats.totalTeachers,
      subtitle: `${stats.activeTeachers} ${t?.active || 'active'}`,
      icon: GraduationCap,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">{t?.title || 'Dashboard'}</h1>
        <p className="text-white">{t?.welcome || 'Welcome to Mohammadi Academy Management'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className="relative group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                    <Icon className="text-white" size={24} />
                  </div>
                  <TrendingUp className="text-green-400" size={20} />
                </div>
                <h3 className="text-3xl font-black text-white mb-1">{card.value}</h3>
                <p className="text-sm font-bold text-white">{card.title}</p>
                <p className="text-xs text-white mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-black text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center">
                <Users size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">New student registered</p>
                <p className="text-xs text-white">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <GraduationCap size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">Teacher profile updated</p>
                <p className="text-xs text-white">5 hours ago</p>
              </div>
            </div>
          </div>
        </div>

      {/* Alerts */}
      <div className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <AlertCircle className="text-orange-400 flex-shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-black text-white mb-1">System Notice</h3>
            <p className="text-sm text-white">
              Welcome to your new academy management system! Start by adding students and teachers from the sidebar menu.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

