import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../services/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

/**
 * Quick Admin Login - Development/Testing Only
 * This page allows quick access to admin dashboard for testing
 */
const QuickAdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  // Default admin credentials for testing
  const defaultAdmin = {
    email: 'admin@mohammadiacademy.com',
    password: 'admin123456'
  };

  const handleQuickLogin = async () => {
    setError('');
    setInfo('');
    setLoading(true);

    try {
      // First, try to log in
      await login(defaultAdmin);
      navigate('/admin', { replace: true });
    } catch (err: any) {
      // If login fails, try to create the admin account
      if (err.code === 'auth/user-not-found' || err.message?.includes('user-not-found')) {
        try {
          setInfo('Creating admin account for first time...');
          
          // Create the admin user
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            defaultAdmin.email,
            defaultAdmin.password
          );

          // Create Firestore user document
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: defaultAdmin.email,
            displayName: 'Administrator',
            phone: '',
            role: 'admin',
            photoURL: null,
            emailVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            lastLogin: new Date()
          });

          setInfo('Admin account created successfully! Redirecting...');
          navigate('/admin', { replace: true });
        } catch (createErr: any) {
          setError('Failed to create admin account: ' + (createErr.message || 'Unknown error'));
        }
      } else if (err.code === 'auth/wrong-password' || err.message?.includes('wrong-password')) {
        setError('Wrong password. Try admin123456');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address.');
      } else {
        setError(err.message || 'Failed to login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0f2b]">
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Quick Admin Access
            </h1>
            <p className="text-slate-400 text-sm">Development/Testing Mode</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              ❌ {error}
            </div>
          )}

          {info && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
              ⏳ {info}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm text-amber-200">
              <p className="font-bold mb-2">⚠️ Testing Credentials:</p>
              <p className="text-xs font-mono mb-1">Email: {defaultAdmin.email}</p>
              <p className="text-xs font-mono">Password: {defaultAdmin.password}</p>
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
                'Access Admin Dashboard'
              )}
            </button>

            <div className="pt-4 border-t border-white/10">
              <p className="text-center text-xs text-slate-400 mb-3">
                Don't have admin credentials?
              </p>
              <a
                href="/register"
                className="block w-full py-3 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-xl transition-all text-center text-sm"
              >
                Create Admin Account
              </a>
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

export default QuickAdminLogin;
