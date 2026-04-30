import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { TRANSLATIONS, ACADEMY_NAME } from '../../constants';
import LanguageSelector from '../../components/LanguageSelector';
import LogoLink from '../../components/LogoLink';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const LoginPage: React.FC = () => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
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
      
      // Get user data to determine redirect
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await withTimeout(getDoc(doc(db, 'users', user.uid)), 5000);
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const role = userData.role;
            
            // Redirect based on role
            if (role === 'admin') {
              navigate('/admin', { replace: true });
            } else if (role === 'teacher') {
              navigate('/teacher', { replace: true });
            } else if (role === 'student') {
              navigate('/student', { replace: true });
            } else {
              navigate(from, { replace: true });
            }
            return;
          } else {
            const email = user.email?.toLowerCase() || '';
            if (email === 'admin@mohammadiacademy.com') {
              navigate('/admin', { replace: true });
            } else {
              navigate(from, { replace: true });
            }
            return;
          }
        } catch (docError) {
          setInfo('Signed in. Loading your dashboard...');
          const email = user.email?.toLowerCase() || '';
          if (email === 'admin@mohammadiacademy.com') {
            navigate('/admin', { replace: true });
            return;
          }
        }
      }
      
      // Fallback redirect
      navigate(from, { replace: true });
    } catch (err: any) {
      // If login fails because user doesn't exist, offer to create account
      if (err.code === 'auth/user-not-found' || err.message?.includes('user-not-found')) {
        try {
          setInfo('Account not found. Creating new account...');
          
          // Create new user account
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            formData.email,
            formData.password
          );

          // Create user document in Firestore with student role by default
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: formData.email,
            displayName: formData.email.split('@')[0],
            phone: '',
            role: 'student', // Default role
            photoURL: null,
            emailVerified: false,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            lastLogin: new Date()
          });

          setInfo('Account created successfully! Redirecting...');
          
          setTimeout(() => {
            navigate('/student', { replace: true });
          }, 1000);
        } catch (createErr: any) {
          setError('Failed to create account: ' + (createErr.message || 'Unknown error'));
        }
      } else {
        setError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
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

          {/* Admin Login Helper */}
          <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-200 text-xs">
            <p className="font-bold mb-2">👨‍💼 First time admin login?</p>
            <p className="mb-2">Email: <span className="font-mono">admin@mohammadiacademy.com</span></p>
            <p>Password: <span className="font-mono">admin123456</span></p>
            <p className="mt-2 text-amber-300">Or <Link to="/quick-admin" className="underline font-bold hover:text-white">use Quick Admin Access</Link></p>
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
