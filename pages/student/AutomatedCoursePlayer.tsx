import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { BookOpen, ChevronRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchAutomatedCourse, fetchAutomatedLessons } from '../../services/automatedCourseService';
import { buildAutomatedCourseFromPrebuilt, buildAutomatedLessonsFromPrebuilt } from '../../data/automated-content';
import { AutomatedCourse, AutomatedLesson } from '../../types/automated-course.types';
import { hasRestrictedCourseAccess } from '../../services/courseAccessService';

const AutomatedCoursePlayer: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const [course, setCourse] = useState<AutomatedCourse | null>(null);
  const [lessons, setLessons] = useState<AutomatedLesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<AutomatedLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      if (!courseId) return;
      if (authLoading) return;
      if (!user) {
        navigate('/login', { replace: true, state: { from: location.pathname } });
        return;
      }

      try {
        const courseData = await fetchAutomatedCourse(courseId);
        const lessonData = await fetchAutomatedLessons(courseId);
        const fallbackCourse = buildAutomatedCourseFromPrebuilt(courseId);
        const resolvedCourse = courseData || fallbackCourse;

        if (resolvedCourse) {
          const allowed = await hasRestrictedCourseAccess({
            userId: user.uid,
            role: user.role,
            courseId,
            sourceType: 'automated',
            isPremiumCourse: resolvedCourse.priceType === 'paid'
          });

          if (!allowed) {
            setBlocked(true);
            return;
          }
        }

        const fallbackLessons = buildAutomatedLessonsFromPrebuilt(courseId);
        const resolvedLessons = lessonData.length > 0 ? lessonData : fallbackLessons;

        setCourse(resolvedCourse);
        setLessons(resolvedLessons);
        setActiveLesson(resolvedLessons[0] || null);
      } catch (error) {
        console.error('Failed to load automated course player:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [authLoading, courseId, location.pathname, user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (blocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f2b]">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-3">Access Required</h1>
          <p className="text-slate-300 mb-6">This premium course is only available to users with an active subscription or admin assignment.</p>
          <Link
            to={`/automated/${courseId}`}
            className="px-5 py-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold"
          >
            Go to Course
          </Link>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f2b]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-3">Course Not Found</h1>
          <Link to="/student" className="text-primary-300">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-slate-900 to-[#0a0f2b] p-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[280px,1fr] gap-6">
        <aside className="bg-slate-800/70 border border-slate-700 rounded-2xl p-4">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="text-primary-400" />
            <div>
              <h2 className="text-white font-bold">{course.title}</h2>
              <p className="text-xs text-slate-400">Automated course</p>
            </div>
          </div>
          <div className="space-y-2">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                onClick={() => setActiveLesson(lesson)}
                className={`w-full text-left px-3 py-2 rounded-xl text-sm transition ${
                  activeLesson?.id === lesson.id
                    ? 'bg-primary-500/20 text-white'
                    : 'text-slate-300 hover:bg-white/5'
                }`}
              >
                {lesson.title}
              </button>
            ))}
          </div>
        </aside>

        <main className="bg-slate-800/70 border border-slate-700 rounded-2xl p-6">
          {activeLesson ? (
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-white mb-2">{activeLesson.title}</h1>
                <p className="text-slate-300">{activeLesson.content.summary}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Explanation</h3>
                <p className="text-slate-300">{activeLesson.content.explanation}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Examples</h3>
                <ul className="space-y-2">
                  {activeLesson.content.examples.map((example, index) => (
                    <li key={index} className="flex items-start gap-2 text-slate-300">
                      <ChevronRight className="w-4 h-4 text-primary-400 mt-1" />
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Exercise</h3>
                <p className="text-slate-300">{activeLesson.content.exercise}</p>
              </div>
              <div className="border border-white/10 rounded-xl p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Quick Quiz</h3>
                <p className="text-slate-300 mb-4">{activeLesson.content.quiz.question}</p>
                <div className="space-y-2">
                  {activeLesson.content.quiz.options.map((option, index) => (
                    <div key={index} className="px-4 py-2 rounded-lg bg-slate-900/60 text-slate-300">
                      {option}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-300">No lessons available yet.</div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AutomatedCoursePlayer;
