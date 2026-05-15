import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CalendarClock, Sparkles, Video } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MeetingsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleOpenSchedule = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role === 'teacher') {
      navigate('/teacher/lessons');
      return;
    }

    if (user.role === 'student') {
      navigate('/student');
      return;
    }

    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-[#0a0f2b] py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-200 text-xs font-black uppercase tracking-[0.2em] mb-4">
            <Sparkles size={14} />
            In-App Meetings
          </div>
          <h1 className="text-4xl font-black text-white mb-3">Video Calls Inside App</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Live classes are now time-based. Teachers schedule lesson sessions, and students join at class time directly from their dashboard.
          </p>
          {user && (
            <p className="text-slate-400 text-sm mt-2">
              Signed in as <span className="text-white font-semibold">{user.displayName || user.email}</span>
            </p>
          )}
        </div>

        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6 md:p-8 text-center">
          <div className="inline-flex items-center gap-2 mb-4 text-white font-bold">
            <CalendarClock size={20} className="text-primary-400" />
            Class-Based Meeting Flow
          </div>
          <p className="text-slate-300 text-sm md:text-base max-w-2xl mx-auto mb-6">
            No manual room IDs needed. Teachers set a lesson time in My Lessons, and students join from their Class Schedule card when the time window opens.
          </p>
          <button
            onClick={handleOpenSchedule}
            className="px-5 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all inline-flex items-center gap-2"
          >
            <Video size={16} />
            Open My Class Schedule
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MeetingsHubPage;
