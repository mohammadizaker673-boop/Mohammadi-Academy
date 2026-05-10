import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { ACADEMY_NAME } from '../../constants';
import { UserRole } from '../../types/auth.types';
import LanguageSelector from '../../components/LanguageSelector';
import LogoLink from '../../components/LogoLink';

const CompleteProfilePage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { user, loading, needsProfileCompletion, completeProfile } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    role: 'student' as Exclude<UserRole, 'admin'>
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        displayName: user.displayName || user.email.split('@')[0] || '',
        phone: user.phone || '',
        role: user.role === 'teacher' ? 'teacher' : 'student'
      }));
    }
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, navigate, user]);

  useEffect(() => {
    if (!loading && user && !needsProfileCompletion) {
      navigate(user.role === 'admin' ? '/admin' : user.role === 'teacher' ? '/teacher' : '/student', { replace: true });
    }
  }, [loading, navigate, needsProfileCompletion, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      await completeProfile({
        displayName: formData.displayName.trim(),
        phone: formData.phone.trim(),
        role: formData.role
      });

      navigate(formData.role === 'teacher' ? '/teacher' : '/student', { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to complete profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0f2b]">
      <div className="fixed top-6 right-6 z-50">
        <LanguageSelector />
      </div>

      <div className="fixed top-6 left-6 z-50">
        <LogoLink showText={false} compact />
      </div>

      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-8 sm:p-10 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Complete Your Profile</h1>
            <p className="text-slate-400">{ACADEMY_NAME}</p>
          </div>

          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
            Tell us your name and role so we can finish setting up your account.
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

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
                Phone Number <span className="text-slate-400 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
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

            <button
              type="submit"
              disabled={saving}
              className="w-full px-10 py-5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white font-black rounded-[1.2rem] transition-all shadow-xl shadow-primary-900/40 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {saving ? 'Saving...' : 'Finish Setup'}
            </button>
          </form>

          <div className="mt-8 text-center">
            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompleteProfilePage;