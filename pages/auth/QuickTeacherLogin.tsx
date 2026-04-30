import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { GraduationCap } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../services/firebase';

const QuickTeacherLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const defaultTeacher = {
    email: 'teacher@mohammadiacademy.com',
    password: 'teacher123456'
  };

  const handleQuickLogin = async () => {
    setError('');
    setInfo('');
    setLoading(true);

    try {
      await login(defaultTeacher);
      navigate('/teacher', { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.message?.includes('user-not-found')) {
        try {
          setInfo('Creating teacher account for first time...');

          const userCredential = await createUserWithEmailAndPassword(
            auth,
            defaultTeacher.email,
            defaultTeacher.password
          );

          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: defaultTeacher.email,
            displayName: 'Test Teacher',
            phone: '+1234567891',
            role: 'teacher',
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true,
            lastLogin: new Date()
          });

          await setDoc(doc(db, 'teachers', userCredential.user.uid), {
            userId: userCredential.user.uid,
            fullName: 'Test Teacher',
            email: defaultTeacher.email,
            phone: '+1234567891',
            dateOfBirth: '1990-01-01',
            age: 36,
            gender: 'male',
            nationality: 'Afghan',
            qualification: ['Islamic Studies'],
            specializations: ['Quran Translation', 'Islamic Studies'],
            experienceYears: 8,
            joiningDate: new Date().toISOString(),
            maxStudents: 20,
            currentStudents: 0,
            assignedStudentIds: [],
            availability: {
              days: ['Monday', 'Wednesday', 'Saturday'],
              timeSlots: ['09:00 AM - 11:00 AM']
            },
            salaryType: 'monthly',
            salaryAmount: 500,
            status: 'active',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });

          setInfo('Teacher account created successfully! Redirecting...');
          navigate('/teacher', { replace: true });
        } catch (createErr: any) {
          setError('Failed to create teacher account: ' + (createErr.message || 'Unknown error'));
        }
      } else {
        setError(err.message || 'Failed to login. Teacher account may not exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[#0a0f2b]">
      <div className="absolute top-20 left-10 w-96 h-96 bg-primary-500/10 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px]"></div>

      <div className="relative w-full max-w-md">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] p-10 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-10 h-10 text-emerald-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2">
              Quick Teacher Access
            </h1>
            <p className="text-slate-400 text-sm">Development/Testing Mode</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-300 text-sm">
              {error}
            </div>
          )}

          {info && (
            <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-300 text-sm">
              {info}
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-200">
              <p className="font-bold mb-2">⚠️ Testing Credentials:</p>
              <p className="text-xs font-mono mb-1">Email: {defaultTeacher.email}</p>
              <p className="text-xs font-mono">Password: {defaultTeacher.password}</p>
            </div>

            <button
              onClick={handleQuickLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-primary-500 to-emerald-500 hover:from-primary-400 hover:to-emerald-400 disabled:from-slate-700 disabled:to-slate-600 text-white font-black rounded-xl transition-all shadow-lg disabled:shadow-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                'Access Teacher Portal'
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
                  href="/quick-student-login"
                  className="py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-white font-semibold rounded-lg transition-all text-center text-xs"
                >
                  Student Portal
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

export default QuickTeacherLogin;