import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import LanguageSelector from '../../components/LanguageSelector';
import LogoLink from '../../components/LogoLink';

const AdminResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) {
        return;
      }

      setHasRecoverySession(Boolean(data.session));
      setCheckingSession(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) {
        return;
      }

      if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
        setHasRecoverySession(Boolean(session));
        setCheckingSession(false);
      }
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess('Password updated successfully. Redirecting to admin login...');
      setTimeout(() => navigate('/dashboard', { replace: true }), 1400);
    } catch (err: any) {
      setError(err?.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0a0f2b] flex items-center justify-center px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0f2b]">
      <div className="fixed top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      <div className="fixed top-6 left-6 z-50">
        <LogoLink showText={false} compact />
      </div>

      <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Set New Password</h1>
            <p className="text-slate-400">Admin Account Recovery</p>
          </div>

          {!hasRecoverySession && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              This reset link is invalid or expired. Please request a new password reset email.
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-red-400 mb-3 uppercase tracking-[0.2em]">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                minLength={8}
                required
                disabled={!hasRecoverySession}
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-red-400/50 focus:border-red-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400 disabled:opacity-60"
                placeholder="At least 8 characters"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-red-400 mb-3 uppercase tracking-[0.2em]">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                minLength={8}
                required
                disabled={!hasRecoverySession}
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-red-400/50 focus:border-red-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400 disabled:opacity-60"
                placeholder="Repeat new password"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !hasRecoverySession}
              className="w-full px-10 py-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black rounded-[1.2rem] transition-all shadow-xl shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Updating Password...' : 'Update Password'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/dashboard" className="text-slate-400 hover:text-slate-200 text-sm transition-colors">
              Back to Admin Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminResetPasswordPage;
