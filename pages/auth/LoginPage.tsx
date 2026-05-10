import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { TRANSLATIONS, ACADEMY_NAME } from '../../constants';
import LanguageSelector from '../../components/LanguageSelector';
import LogoLink from '../../components/LogoLink';
import { supabase } from '../../services/supabase';

const LoginPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signInWithOAuth } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), ms);
      promise
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });

  const from = (location.state as any)?.from?.pathname || '/';

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
        if (role === 'teacher') {
          navigate('/teacher', { replace: true });
          return;
        }
        navigate('/student', { replace: true });
        return;
      }

      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to login');
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    setError('');
    setInfo(`Redirecting to ${provider === 'google' ? 'Google' : 'Facebook'}...`);
    try {
      await signInWithOAuth(provider);
    } catch (err: any) {
      setInfo('');
      setError(err.message || `Failed to continue with ${provider}`);
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
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-8 sm:p-10 shadow-2xl">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-slate-400">{ACADEMY_NAME}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              ❌ {error}
            </div>
          )}

          {/* Info Message */}
          {info && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
              ⏳ {info}
            </div>
          )}

          <div className="mb-6 space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl hover:bg-white/15 transition text-white font-semibold"
            >
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('facebook')}
              className="w-full px-4 py-3 bg-[#1877F2]/20 border border-[#1877F2]/40 rounded-xl hover:bg-[#1877F2]/30 transition text-white font-semibold"
            >
              Continue with Facebook
            </button>
            <div className="text-center text-slate-500 text-xs uppercase tracking-[0.2em]">or</div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-6 py-5 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <Link
                to="/forgot-password"
                className="text-primary-400 hover:text-primary-300 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-10 py-5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-black rounded-[1.2rem] transition-all shadow-xl shadow-primary-900/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Register Here
              </Link>
            </p>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
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

export default LoginPage;
