import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ACADEMY_NAME } from '../../constants';
import LanguageSelector from '../../components/LanguageSelector';
import LogoLink from '../../components/LogoLink';
import { supabase } from '../../services/supabase';
import { ShieldCheck } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, resetPassword, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // If already logged in as admin, redirect
  React.useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true });
    }
  }, [user, navigate]);

  const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), ms);
      promise
        .then(result => { clearTimeout(timer); resolve(result); })
        .catch(error => { clearTimeout(timer); reject(error); });
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);

    try {
      await login(formData);

      const userResult = await withTimeout(supabase.auth.getUser(), 5000);
      const sessionUser = userResult.data.user;
      if (sessionUser) {
        const profileResult = await withTimeout(
          supabase
            .from('profiles')
            .select('role')
            .eq('id', sessionUser.id)
            .maybeSingle(),
          5000
        );
        const role = profileResult.data?.role || 'student';

        if (role === 'admin') {
          navigate('/admin', { replace: true });
          return;
        }

        // Non-admin tried to use the admin login
        await supabase.auth.signOut();
        setError('Access denied. This login portal is for administrators only. Please use the main login page.');
        return;
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setInfo('');
    setOauthLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (oauthError) {
        throw oauthError;
      }
      // After OAuth redirect comes back, the auth state listener will
      // pick up the session; AdminLoginPage's useEffect will redirect admins.
    } catch (err: any) {
      setError(err.message || 'Failed to continue with Google');
      setOauthLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    setInfo('');

    if (!formData.email.trim()) {
      setError('Please enter your admin email first, then click Forgot Password.');
      return;
    }

    try {
      setResetLoading(true);
      await resetPassword(formData.email.trim());
      setInfo('Password reset email sent. Please check your inbox and spam folder.');
    } catch (err: any) {
      setError(err.message || 'Failed to send password reset email');
    } finally {
      setResetLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0f2b]">
      {/* Language Selector - Floating */}
      <div className="fixed top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      {/* Logo - Floating */}
      <div className="fixed top-6 left-6 z-50">
        <LogoLink showText={false} compact />
      </div>

      {/* Background Effects */}
      <div className="absolute top-20 left-10 w-96 h-96 bg-red-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-500/10 rounded-full blur-[120px]"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-8 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-slate-400">{ACADEMY_NAME}</p>
            <p className="text-red-400/80 text-xs mt-1 uppercase tracking-widest font-semibold">
              Administrators Only
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              ❌ {error}
            </div>
          )}

          {info && (
            <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-300 text-sm">
              ✅ {info}
            </div>
          )}

          {/* Google OAuth */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={oauthLoading || loading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {oauthLoading ? 'Redirecting...' : 'Continue with Google'}
            </button>
            <div className="mt-4 text-center text-slate-500 text-xs uppercase tracking-[0.2em]">or</div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-red-400 mb-3 uppercase tracking-[0.2em]">
                Admin Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-red-400/50 focus:border-red-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400"
                placeholder="admin@mohammadiacademy.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-red-400 mb-3 uppercase tracking-[0.2em]">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-red-400/50 focus:border-red-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={resetLoading || loading || oauthLoading}
                className="text-sm text-red-300 hover:text-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resetLoading ? 'Sending reset email...' : 'Forgot password?'}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-10 py-5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black rounded-[1.2rem] transition-all shadow-xl shadow-red-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Access Admin Dashboard'}
            </button>
          </form>

          {/* Back to main login */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="text-slate-400 hover:text-slate-200 text-sm transition-colors"
            >
              Not an admin?{' '}
              <span className="text-primary-400 hover:text-primary-300 font-semibold">
                Student / Teacher Login
              </span>
            </Link>
          </div>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Link
              to="/"
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
