import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Book, Users, BarChart3, Trophy, Settings, Home, Menu, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import StudentHifzDashboard from './student/HifzDashboard';
import TeacherHifzDashboard from './teacher/HifzDashboard';
import AdminHifzAnalytics from './admin/HifzAnalytics';
import MemorizationInterface from './student/MemorizationInterface';
import RevisionScheduleUI from './student/RevisionSchedule';
import GamificationUI from './student/Gamification';
import TestInterface from './student/TestInterface';

type UserRole = 'student' | 'teacher' | 'admin' | 'parent';
type HifzView = 'dashboard' | 'memorize' | 'revision' | 'test' | 'gamification' | 'manage' | 'analytics' | 'settings';

interface HifzCoursePageProps {
  userRole?: UserRole;
}

const HifzCoursePage: React.FC<HifzCoursePageProps> = ({ userRole: propUserRole }) => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Detect user role from AuthContext or use prop as fallback
  const userRole = (user?.role as UserRole) || propUserRole || 'student';
  
  const [currentView, setCurrentView] = useState<HifzView>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * OPEN ACCESS MODE
   * ================
   * Payment/subscription system is temporarily disabled.
   * All logged-in users (students, teachers, admins) have full access.
   * Premium/payment features will be configured later.
   */
  const hasAccess = true;

  // Determine available views based on user role
  const getAvailableViews = (): Record<HifzView, string> => {
    const baseViews: Record<HifzView, string> = {
      dashboard: '📊 Dashboard',
      memorize: '🎙️ Memorize',
      revision: '🔄 Revisions',
      test: '🧪 Tests',
      gamification: '🏆 Achievements',
      manage: '👥 Manage',
      analytics: '📈 Analytics',
      settings: '⚙️ Settings',
    };

    switch (userRole) {
      case 'student':
        return {
          dashboard: '📊 Dashboard',
          memorize: '🎙️ Memorize',
          revision: '🔄 Revisions',
          test: '🧪 Tests',
          gamification: '🏆 Achievements',
          settings: '⚙️ Settings',
        } as Record<HifzView, string>;
      case 'teacher':
        return {
          dashboard: '📊 Dashboard',
          manage: '👥 Manage Students',
          analytics: '📈 Analytics',
          settings: '⚙️ Settings',
        } as Record<HifzView, string>;
      case 'admin':
        return {
          dashboard: '📊 Dashboard',
          analytics: '📈 Analytics',
          settings: '⚙️ Settings',
        } as Record<HifzView, string>;
      default:
        return { dashboard: '📊 Dashboard' } as Record<HifzView, string>;
    }
  };

  const availableViews = getAvailableViews();

  const renderContent = () => {
    try {
      switch (currentView) {
        case 'dashboard':
          if (userRole === 'student') return <StudentHifzDashboard />;
          if (userRole === 'teacher') return <TeacherHifzDashboard />;
          if (userRole === 'admin') return <AdminHifzAnalytics />;
          return <StudentHifzDashboard />;

      case 'memorize':
        return <MemorizationInterface />;

      case 'revision':
        return <RevisionScheduleUI />;

      case 'test':
        return <TestInterface />;

      case 'gamification':
        return <GamificationUI />;

      case 'manage':
        return <TeacherHifzDashboard />;

      case 'analytics':
        return <AdminHifzAnalytics />;

      case 'settings':
        return (
          <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-slate-100 p-6">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 mb-8">
              Settings
            </h1>
            <div className="max-w-4xl">
              <div className="bg-gradient-to-br from-slate-800/30 to-slate-700/10 border border-slate-600/30 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Hifz System Settings</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border-b border-slate-600/30">
                    <span className="text-slate-300">Notifications</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-slate-600/30">
                    <span className="text-slate-300">Push Alerts for Weak Pages</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <span className="text-slate-300">Daily Revision Reminders</span>
                    <input type="checkbox" defaultChecked className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return <StudentHifzDashboard />;
      }
    } catch (err) {
      console.error('Error rendering content:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      return (
        <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41] text-white p-6 flex items-center justify-center">
          <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-8 max-w-md text-center">
            <AlertCircle className="mx-auto mb-4 text-red-400" size={48} />
            <h2 className="text-xl font-bold mb-2 text-red-300">Error Loading Content</h2>
            <p className="text-slate-300 mb-4">{err instanceof Error ? err.message : 'Something went wrong'}</p>
            <button
              onClick={() => {
                setError(null);
                setCurrentView('dashboard');
              }}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-[#0e1436] to-[#131b41]">
      {/* Show login required only after auth has finished loading and no user is found */}
      {!authLoading && !user && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md text-center">
            <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Please Log In</h2>
            <p className="text-slate-400 mb-6">
              You need to be logged in to access the Hifz System
            </p>
            <button
              onClick={() => navigate('/login')}
              className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg font-semibold transition"
            >
              Go to Login
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Open access for all logged-in users */}
      {!authLoading && user && (
        <>
          {/* Error Alert */}
          {error && (
            <div className="bg-red-900/30 border-b border-red-500/30 p-4 text-red-300 flex items-center gap-3">
              <AlertCircle size={20} />
              <span>{error}</span>
              <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-300">✕</button>
            </div>
          )}
          {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-sm border-b border-slate-700/50 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="text-white hover:text-cyan-400 transition"
        >
          ← Back
        </button>
        <h1 className="text-lg font-bold text-cyan-300">Hifz System</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-white hover:text-cyan-400 transition"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop Layout */}
      <div className="hidden lg:grid lg:grid-cols-5 min-h-screen">
        {/* Sidebar */}
        <div className="lg:col-span-1 bg-gradient-to-br from-slate-900/50 to-slate-800/30 border-r border-slate-700/50 sticky top-0 h-screen overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <Book className="text-cyan-400" size={28} />
              <div>
                <h2 className="font-bold text-white">Hifz System</h2>
                <p className="text-xs text-slate-400">Quran Memorization</p>
              </div>
            </div>

            <button
              onClick={() => navigate(-1)}
              className="w-full mb-6 flex items-center gap-2 px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 text-slate-300 hover:text-white rounded-lg transition border border-slate-600/30"
            >
              <Home size={18} />
              Back to Course
            </button>

            <div className="space-y-2">
              {Object.entries(availableViews).map(([view, label]) => (
                <button
                  key={view}
                  onClick={() => setCurrentView(view as HifzView)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition border ${
                    currentView === view
                      ? 'bg-cyan-600/30 border-cyan-400/50 text-cyan-300 font-semibold'
                      : 'bg-slate-900/20 border-slate-600/30 text-slate-300 hover:border-slate-500/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-4 overflow-y-auto max-h-screen">
          {renderContent()}
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 z-40 bg-slate-900/95 backdrop-blur-sm p-4 overflow-y-auto mt-16">
          <div className="space-y-2">
            {Object.entries(availableViews).map(([view, label]) => (
              <button
                key={view}
                onClick={() => {
                  setCurrentView(view as HifzView);
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg transition border ${
                  currentView === view
                    ? 'bg-cyan-600/30 border-cyan-400/50 text-cyan-300 font-semibold'
                    : 'bg-slate-900/20 border-slate-600/30 text-slate-300'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mobile Content */}
      <div className="lg:hidden mt-16">
        {renderContent()}
      </div>
        </>
      )}
    </div>
  );
};

export default HifzCoursePage;
