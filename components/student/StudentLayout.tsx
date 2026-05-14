import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TRANSLATIONS } from '../../constants';
import LanguageSelector from '../LanguageSelector';
import LogoLink from '../LogoLink';
import ThemeToggle from '../ThemeToggle';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  LayoutDashboard,
  BookOpen,
  Calendar,
  DollarSign,
  User,
  LogOut,
  Menu,
  X,
  UserCircle,
  Bell,
  TrendingUp
} from 'lucide-react';

const StudentLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000); // Refresh every minute
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const q = query(
        collection(db, 'announcements'),
        where('targetAudience', 'in', ['all', 'students']),
        where('createdAt', '>=', thirtyDaysAgo.toISOString())
      );
      const snapshot = await getDocs(q);
      setUnreadCount(snapshot.size);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navItems = [
    { path: '/student', icon: LayoutDashboard, label: t.dashboard.student.dashboard, exact: true },
    { path: '/student/progress', icon: TrendingUp, label: 'My Progress' },
    { path: '/student/attendance', icon: Calendar, label: t.dashboard.student.attendance },
    { path: '/student/fees', icon: DollarSign, label: t.dashboard.student.fees },
    { path: '/student/announcements', icon: Bell, label: t.dashboard.student.announcements },
    { path: '/student/profile', icon: User, label: t.dashboard.student.myProfile },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#050a12]">
      {/* Global dashboard controls (always visible) */}
      <div className="fixed top-4 right-4 z-[60] flex items-center gap-2 rounded-xl bg-black/40 border border-white/10 backdrop-blur-xl p-2">
        <ThemeToggle />
        <LanguageSelector />
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#080e1e]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <LogoLink showText={sidebarOpen} compact={!sidebarOpen} />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
              <UserCircle className="text-white" size={24} />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Student'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative ${
                  active
                    ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="relative">
                  <Icon size={20} />
                  {item.label === t.dashboard.student.announcements && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold text-white">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </div>
                {sidebarOpen && (
                  <span className="text-sm font-bold">{item.label}</span>
                )}
                {sidebarOpen && item.label === t.dashboard.student.announcements && unreadCount > 0 && (
                  <span className="ml-auto px-2 py-0.5 bg-red-500 rounded-full text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Language & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-2">
          {sidebarOpen && (
            <div className="px-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-bold">{t.dashboard.student.logout}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
      >
        <div className="p-8 pt-24">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
