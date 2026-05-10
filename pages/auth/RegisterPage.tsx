import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ACADEMY_NAME } from '../../constants';
import { UserRole } from '../../types/auth.types';
import LanguageSelector from '../../components/LanguageSelector';
import LogoLink from '../../components/LogoLink';

const RegisterPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'student' as UserRole
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        phone: formData.phone,
        role: formData.role
      });
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to register');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-[#0a0f2b]">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-12 text-center max-w-md">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-accent-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-3xl font-black text-white mb-4">Registration Successful!</h2>
          <p className="text-slate-300">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

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

      {/* Register Card */}
      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-8 sm:p-10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">
              Create Account
            </h1>
            <p className="text-slate-400">{ACADEMY_NAME}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Register Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">
                Full Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400"
                placeholder="John Doe"
              />
            </div>

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
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">
                Phone Number <span className="text-slate-400 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required={false}
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400"
                placeholder="+93 79 646 4640"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">
                I am a
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white"
              >
                <option value="student" className="bg-slate-900">Student</option>
                <option value="teacher" className="bg-slate-900">Teacher</option>
              </select>
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
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-primary-400 mb-3 uppercase tracking-[0.2em]">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-[1.2rem] focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400 focus:bg-white/15 outline-none transition-all text-white placeholder-slate-400"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-10 py-5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-black rounded-[1.2rem] transition-all shadow-xl shadow-primary-900/40 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
                Sign In
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

export default RegisterPage;

