import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Video, PlusCircle, LogIn, Copy, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MeetingsHubPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomInput, setRoomInput] = useState('');
  const [copied, setCopied] = useState(false);

  const suggestedRoomId = useMemo(() => {
    return `room-${crypto.randomUUID().slice(0, 8)}`;
  }, []);

  const suggestedRoomLink = `${window.location.origin}/meeting/${suggestedRoomId}`;

  const handleCreateRoom = () => {
    navigate(`/meeting/${suggestedRoomId}`);
  };

  const handleJoinRoom = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = roomInput.trim();
    if (!normalized) return;
    navigate(`/meeting/${encodeURIComponent(normalized)}`);
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(suggestedRoomLink);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
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
            Teachers, students, parents, and admins can meet directly inside your platform. No external meeting page needed.
          </p>
          {user && (
            <p className="text-slate-400 text-sm mt-2">
              Signed in as <span className="text-white font-semibold">{user.displayName || user.email}</span>
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3 text-white font-bold">
              <PlusCircle size={18} className="text-primary-400" />
              Start New Meeting
            </div>
            <p className="text-slate-400 text-sm mb-5">
              Create an instant room and share the link with students, teachers, or parents.
            </p>

            <div className="bg-slate-800/70 border border-white/10 rounded-xl p-3 mb-4">
              <p className="text-xs uppercase tracking-wider text-slate-400 mb-1">Room ID</p>
              <p className="text-white font-mono text-sm break-all">{suggestedRoomId}</p>
            </div>

            <div className="flex gap-3 mb-4">
              <button
                onClick={handleCreateRoom}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all"
              >
                Start Now
              </button>
              <button
                onClick={copyInvite}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition-all flex items-center gap-2"
              >
                <Copy size={16} />
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>

            <p className="text-xs text-slate-500 break-all">{suggestedRoomLink}</p>
          </div>

          <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3 text-white font-bold">
              <LogIn size={18} className="text-primary-400" />
              Join Existing Meeting
            </div>
            <p className="text-slate-400 text-sm mb-5">
              Paste the room ID received from teacher/admin and join instantly.
            </p>

            <form onSubmit={handleJoinRoom} className="space-y-4">
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Enter room id (e.g. room-a1b2c3d4)"
                className="w-full px-4 py-3 bg-slate-800/70 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
              />
              <button
                type="submit"
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Video size={16} />
                Join Room
              </button>
            </form>
          </div>
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
