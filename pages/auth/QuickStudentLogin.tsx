import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { GraduationCap } from 'lucide-react';

/**
 * Quick Student Login - Development/Testing Only
 * This page allows quick access to student portal for testing
 */
const QuickStudentLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Default student credentials for testing
  const defaultStudent = {
    email: 'student@mohammadiacademy.com',
    password: 'student123456'
  };

  const handleQuickLogin = async () => {
    setError('');
    setLoading(true);

    try {
      await login(defaultStudent);
      navigate('/student', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login. Student account may not exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0f2b]">
      <div className="absolute top-20 left-10 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-accent-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-accent-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Quick Student Access
            </h1>
            <p className="text-slate-400 text-sm">Development/Testing Mode</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-accent-500/10 border border-accent-500/20 rounded-xl p-4 text-sm text-accent-200">
              <p className="font-bold mb-2">⚠️ Testing Credentials:</p>
              <p className="text-xs font-mono mb-1">Email: {defaultStudent.email}</p>
              <p className="text-xs font-mono">Password: {defaultStudent.password}</p>
            </div>

            <button
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 disabled:from-slate-700 disabled:to-slate-600 text-white font-black rounded-xl transition-all shadow-lg disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                'Access Student Portal'
              )}
            </button>

            <div className="pt-4 border-t border-white/10">
              <p className="text-center text-xs text-slate-400 mb-3">
                Need to test other roles?
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="/quick-admin"
                  className="py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-lg transition-all text-center text-xs"
                >
                  Admin Portal
                </a>
                <a
                  href="/quick-teacher-login"
                  className="py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-lg transition-all text-center text-xs"
                >
                  Teacher Portal
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center mt-6 text-xs text-slate-500">
          This page is for testing purposes only. Remove in production.
        </p>
      </div>
    </div>
  );
};

export default QuickStudentLogin;
