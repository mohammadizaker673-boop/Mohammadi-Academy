import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Clock, Globe } from 'lucide-react';
import { AutomatedCourse } from '../types/automated-course.types';
import { fetchAutomatedCourse } from '../services/automatedCourseService';
import { buildAutomatedCourseFromPrebuilt } from '../data/automated-content';
import { useAuth } from '../contexts/AuthContext';
import LogoLink from '../components/LogoLink';
import LanguageSelector from '../components/LanguageSelector';
import { hasRestrictedCourseAccess } from '../services/courseAccessService';

const AutomatedCourseDetailPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<AutomatedCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      try {
        const data = await fetchAutomatedCourse(courseId);
        const resolvedCourse = data || buildAutomatedCourseFromPrebuilt(courseId);
        setCourse(resolvedCourse);

        if (resolvedCourse && user) {
          const allowed = await hasRestrictedCourseAccess({
            userId: user.uid,
            role: user.role,
            courseId,
            sourceType: 'automated',
            isPremiumCourse: resolvedCourse.priceType === 'paid'
          });
          setHasAccess(allowed);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error('Failed to load automated course:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [courseId, user]);

  const handleEnroll = async () => {
    if (!course || !courseId) return;
    if (!user) {
      navigate('/login', { replace: true, state: { from: `/automated/${courseId}` } });
      return;
    }

    if (!hasAccess) {
      return;
    }

    const targetPath = user.role === 'student' ? `/student/courses/${courseId}` : `/teacher/courses/${courseId}`;
    navigate(targetPath, { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f2b]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#0a0f2b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Course Not Found</h1>
          <Link to="/courses" className="text-primary-400 hover:text-primary-300">Back to Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-slate-900 to-[#0a0f2b]">
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <LogoLink showText={false} compact />
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/courses" className="text-slate-300 hover:text-white transition-colors flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" /> Courses
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-8">
          <div className="flex items-center gap-3 text-slate-300 mb-4">
            <span className="px-3 py-1 rounded-full bg-primary-500/20 text-primary-200 text-xs uppercase tracking-widest">
              Automated Premium
            </span>
            <span className="text-xs uppercase tracking-widest">{course.level}</span>
          </div>
          <h1 className="text-4xl font-black text-white mb-4">{course.title}</h1>
          <p className="text-slate-300 text-lg mb-8">{course.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-primary-400" />
              <span>Language: {course.language}</span>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary-400" />
              <span>Access: {course.accessDurationDays} days</span>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-primary-400" />
              <span>Age range: {course.ageRange || 'All ages'}</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-primary-400" />
              <span>Price: {course.priceType === 'free' ? 'Free' : `$${course.price}`}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <button
              onClick={handleEnroll}
              disabled={course.priceType === 'paid' && !!user && !hasAccess}
              className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-white font-semibold hover:from-primary-400 hover:to-accent-400 transition"
            >
              {!user ? 'Login to Check Access' : hasAccess ? 'Open Course' : 'Access Managed by Admin'}
            </button>
            {hasAccess && (
              <Link
                to={user?.role === 'student' ? `/student/courses/${course.id}` : `/teacher/courses/${course.id}`}
                className="px-6 py-3 border border-white/10 rounded-full text-slate-200 hover:text-white hover:border-white/30 transition"
              >
                Open Course Player
              </Link>
            )}
          </div>
          {course.priceType === 'paid' ? (
            <p className="text-sm text-slate-400 mt-6">
              Premium automated course access is now controlled by academy administrators. Existing active subscriptions still work, and assigned students or teachers will see the course in their dashboards.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
};

export default AutomatedCourseDetailPage;
