import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TRANSLATIONS } from '../../constants';
import LanguageSelector from '../LanguageSelector';
import LogoLink from '../LogoLink';
import ThemeToggle from '../ThemeToggle';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { 
  Users, 
  GraduationCap, 
  Calendar, 
  DollarSign, 
  LayoutDashboard,
  LogOut,
  Menu,
  X,
  UserCircle,
  UserPlus,
  BookOpen,
  ClipboardList,
  FileText,
  CreditCard,
  MessageSquare,
  Globe,
  Settings,
  ChevronDown,
  ChevronRight,
  Database,
  BarChart3,
  Sparkles,
  Home
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['courses', 'students', 'teachers']);
  const [unreadCounts, setUnreadCounts] = useState({ announcements: 0, messages: 0 });

  useEffect(() => {
    fetchUnreadCounts();
    const interval = setInterval(fetchUnreadCounts, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCounts = async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [announcementsSnap, messagesSnap] = await Promise.all([
        getDocs(collection(db, 'announcements')),
        getDocs(collection(db, 'messages'))
      ]);
      
      const recentAnnouncements = announcementsSnap.docs.filter(
        doc => new Date(doc.data().createdAt) >= thirtyDaysAgo
      );
      const recentMessages = messagesSnap.docs.filter(
        doc => new Date(doc.data().createdAt || doc.data().sentAt) >= thirtyDaysAgo
      );
      
      setUnreadCounts({
        announcements: recentAnnouncements.length,
        messages: recentMessages.length
      });
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev => 
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navStructure = [
    { path: '/admin', icon: LayoutDashboard, label: t.dashboard.admin.dashboard, exact: true },
    { path: '/admin/ai', icon: Sparkles, label: 'AI Center', exact: false },
    { path: '/admin/copilot', icon: MessageSquare, label: 'AI Copilot', exact: false },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', exact: false },
    {
      id: 'courses',
      label: t.dashboard.admin.courses,
      icon: BookOpen,
      children: [
        { path: '/admin/courses/create', label: t.dashboard.admin.createCourse },
        { path: '/admin/courses/list', label: t.dashboard.admin.editCourses },
        { path: '/admin/courses/lessons', label: t.dashboard.admin.lessonsManager },
        { path: '/admin/courses/media', label: t.dashboard.admin.mediaLibrary },
        { path: '/admin/courses/noorani', label: 'Noorani Qaida Course' },
      ]
    },
    {
      id: 'students',
      label: t.dashboard.admin.students,
      icon: Users,
      children: [
        { path: '/admin/students/add', label: t.dashboard.admin.addStudent },
        { path: '/admin/students', label: t.dashboard.admin.allStudents },
        { path: '/admin/students/progress', label: t.dashboard.admin.progressRecords },
        { path: '/admin/admissions', label: t.dashboard.admin.admissions },
        { path: '/admin/signups', label: 'Signup Approvals' },
      ]
    },
    {
      id: 'teachers',
      label: t.dashboard.admin.teachers,
      icon: GraduationCap,
      children: [
        { path: '/admin/teachers/add', label: t.dashboard.admin.addTeacher },
        { path: '/admin/teachers', label: t.dashboard.admin.teacherList },
        { path: '/admin/teachers/schedule', label: t.dashboard.admin.schedule },
      ]
    },
    {
      id: 'academic',
      label: t.dashboard.admin.academic,
      icon: ClipboardList,
      children: [
        { path: '/admin/attendance', label: t.dashboard.admin.attendance },
        { path: '/admin/homework', label: t.dashboard.admin.homework },
        { path: '/admin/exams', label: t.dashboard.admin.exams },
        { path: '/admin/results', label: t.dashboard.admin.results },
      ]
    },
    {
      id: 'finance',
      label: t.dashboard.admin.finance,
      icon: DollarSign,
      children: [
        { path: '/admin/fees', label: t.dashboard.admin.feeRecords },
        { path: '/admin/fees/plans', label: t.dashboard.admin.feePlans },
        { path: '/admin/fees/invoices', label: t.dashboard.admin.invoices },
        { path: '/admin/fees/payments', label: t.dashboard.admin.payments },
        { path: '/admin/fees/reports', label: t.dashboard.admin.reports },
      ]
    },
    {
      id: 'communication',
      label: t.dashboard.admin.communication,
      icon: MessageSquare,
      children: [
        { path: '/admin/announcements', label: t.dashboard.admin.announcements },
        { path: '/admin/messages', label: t.dashboard.admin.messages },
      ]
    },
    {
      id: 'website',
      label: t.dashboard.admin.website,
      icon: Globe,
      children: [
        { path: '/admin/cms/home', label: t.dashboard.admin.homePage },
        { path: '/admin/packages', label: t.dashboard.admin.pricingPackages },
        { path: '/admin/cms/courses', label: t.dashboard.admin.coursesPage },
        { path: '/admin/cms/media', label: t.dashboard.admin.mediaBanners },
        { path: '/admin/features', label: t.features.title },
      ]
    },
    {
      id: 'settings',
      label: t.dashboard.admin.settings,
      icon: Settings,
      children: [
        { path: '/admin/settings', label: t.dashboard.admin.systemSettings },
        { path: '/admin/settings/admins', label: t.dashboard.admin.adminManagement },
        { path: '/admin/settings/seed-data', label: t.dashboard.admin.seedDatabase },
      ]
    },
  ];

  const isActive = (path: string, exact?: boolean) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-[#050a12]">
      {/* Top Header */}
      <header className="fixed top-0 right-0 left-0 h-16 bg-black/60 backdrop-blur-2xl border-b border-white/5 z-40 flex items-center justify-end gap-3 pr-8">
        <ThemeToggle />
        <LanguageSelector />
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#080e1e]/95 backdrop-blur-xl border-r border-white/5 transition-all duration-300 z-50 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
        style={{ marginTop: '64px', height: 'calc(100vh - 64px)' }}
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
                <p className="text-sm font-bold text-white truncate">{user?.displayName || 'Admin'}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 64px - 280px)' }}>
          {navStructure.map((item) => {
            if ('children' in item) {
              const Icon = item.icon;
              const isExpanded = expandedMenus.includes(item.id);
              const hasActiveChild = item.children.some(child => location.pathname.startsWith(child.path));
              
              return (
                <div key={item.id}>
                  <button
                    onClick={() => toggleMenu(item.id)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all ${
                      hasActiveChild
                        ? 'bg-white/5 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={20} />
                      {sidebarOpen && <span className="text-sm font-bold">{item.label}</span>}
                    </div>
                    {sidebarOpen && (
                      isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
                    )}
                  </button>
                  
                  {isExpanded && sidebarOpen && (
                    <div className="ml-4 mt-1 space-y-1">
                      {item.children.map((child) => {
                        const active = location.pathname === child.path || location.pathname.startsWith(child.path + '/');
                        const showBadge = (child.label === t.dashboard.admin.announcements && unreadCounts.announcements > 0) ||
                                         (child.label === t.dashboard.admin.messages && unreadCounts.messages > 0);
                        const badgeCount = child.label === t.dashboard.admin.announcements ? unreadCounts.announcements : unreadCounts.messages;
                        
                        return (
                          <Link
                            key={child.path}
                            to={child.path}
                            className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg text-sm transition-all ${
                              active
                                ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                                : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-1 h-1 rounded-full bg-current"></span>
                              {child.label}
                            </div>
                            {showBadge && (
                              <span className="px-2 py-0.5 bg-red-500 rounded-full text-[10px] font-bold text-white">
                                {badgeCount > 99 ? '99+' : badgeCount}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            } else {
              const Icon = item.icon;
              const active = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {sidebarOpen && <span className="text-sm font-bold">{item.label}</span>}
                </Link>
              );
            }
          })}
        </nav>

        {/* Language & Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 space-y-2">
          <Link
            to="/"
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          >
            <Home size={20} />
            {sidebarOpen && <span className="text-sm font-bold">Visit Homepage</span>}
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition-all"
          >
            <LogOut size={20} />
            {sidebarOpen && <span className="text-sm font-bold">{t.dashboard.admin.logout}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? 'ml-64' : 'ml-20'
        }`}
        style={{ marginTop: '64px', minHeight: 'calc(100vh - 64px)' }}
      >
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
