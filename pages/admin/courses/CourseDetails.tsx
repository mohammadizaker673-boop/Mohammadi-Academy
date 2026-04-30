import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { courses } from '../../../data/courses';
import { generateAutomatedCourseContent } from '../../../utils/aiCourseGenerator';
import { BookOpen, CheckCircle, Clock, GraduationCap, Users, Rocket, Play } from 'lucide-react';

type CourseDetailsData = {
  title: string;
  description: string;
  targetAudience: string;
  ageRange: string;
  duration: string;
  requirements: string[];
  resources?: {
    id: string;
    title: string;
    type: 'pdf' | 'audio' | 'document';
    url: string;
  }[];
  classFormat?: {
    duration: string;
    mode: string[];
    materials: string[];
  };
  lessonOutline?: {
    id: string;
    title: string;
    hasVideo?: boolean;
    hasText?: boolean;
    hasQuiz?: boolean;
  }[];
};

const PREDEFINED_COURSES = [
  { id: 'quran-tajweed', name: 'Quran with Tajweed', category: 'quran' },
  { id: 'noorani-qaida', name: 'Noorani Qaida & Prayer', category: 'quran' },
  { id: 'hifz-quran', name: 'Hifz-ul-Quran', category: 'quran' },
  { id: 'quran-tafsir', name: 'Quran Translation & Tafsir', category: 'quran' },
  { id: 'arabic-language', name: 'Arabic Language Course', category: 'arabic' },
  { id: 'islamic-studies', name: 'Islamic Studies & Fiqh', category: 'islamic-studies' },
  { id: 'kids-general-knowledge', name: 'General Knowledge for Kids', category: 'general-knowledge' },
  { id: 'kids-manners-character', name: 'Manners & Character (Kids)', category: 'life-skills' },
  { id: 'preteens-math-for-life', name: 'Math for Life', category: 'life-skills' },
  { id: 'preteens-digital-basics', name: 'Digital Basics & Online Safety', category: 'digital-skills' },
  { id: 'youth-career-awareness', name: 'Career Awareness & CV Basics', category: 'life-skills' },
  { id: 'youth-financial-literacy', name: 'Financial Literacy (Halal Income)', category: 'life-skills' },
  { id: 'adult-small-business', name: 'Small Business Basics', category: 'life-skills' },
  { id: 'adult-agriculture-basics', name: 'Agriculture & Livestock Basics', category: 'life-skills' },
  { id: 'adult-family-health', name: 'Family Health & First Aid', category: 'life-skills' }
];

const CourseDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState<CourseDetailsData | null>(null);

  // Detect if course has an interactive learning system
  const getInteractiveSystem = (courseId: string) => {
    const systems: Record<string, { name: string; path: string; description: string; icon: string }> = {
      'hifz-quran': {
        name: 'Hifz Management System',
        path: '/hifz',
        description: 'Complete Quran memorization tracking, revision scheduler, and progress analytics',
        icon: '📖'
      },
      'arabic-language': {
        name: 'AI-Powered Arabic Learning Platform',
        path: '/learn-arabic',
        description: 'Interactive lessons, pronunciation training, practice exercises, and assessments',
        icon: '🌙'
      }
    };
    return systems[courseId] || null;
  };

  const interactiveSystem = id ? getInteractiveSystem(decodeURIComponent(id)) : null;

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

  useEffect(() => {
    const loadCourse = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      const courseId = decodeURIComponent(id);
      let hadImmediate = false;

      const fallback = courses.find(item => item.id === courseId);
      if (fallback) {
        setCourse({
          title: fallback.title,
          description: fallback.description,
          targetAudience: fallback.targetAudience,
          ageRange: fallback.ageRange,
          duration: fallback.duration,
          requirements: fallback.requirements,
          classFormat: fallback.classFormat,
          lessonOutline: fallback.lessonOutline
        });
        hadImmediate = true;
      }

      const predefined = PREDEFINED_COURSES.find(item => item.id === courseId);
      if (!hadImmediate && predefined) {
        const byTitle = courses.find(item => item.title.toLowerCase() === predefined.name.toLowerCase());
        if (byTitle) {
          setCourse({
            title: byTitle.title,
            description: byTitle.description,
            targetAudience: byTitle.targetAudience,
            ageRange: byTitle.ageRange,
            duration: byTitle.duration,
            requirements: byTitle.requirements,
            classFormat: byTitle.classFormat,
            lessonOutline: byTitle.lessonOutline
          });
          hadImmediate = true;
        }
      }

      if (!hadImmediate && predefined) {
        const generated = generateAutomatedCourseContent({
          title: predefined.name,
          category: predefined.category as any,
          level: 'all',
          ageGroup: 'all',
          primaryLanguage: 'arabic',
          lessonCount: 12
        });
        setCourse({
          title: predefined.name,
          description: generated.description,
          targetAudience: generated.targetAudience,
          ageRange: generated.ageRange,
          duration: generated.duration,
          requirements: generated.requirements,
          classFormat: generated.classFormat,
          lessonOutline: generated.lessonOutline
        });
        hadImmediate = true;
      }

      if (hadImmediate) {
        setLoading(false);
      }

      try {
        const docRef = doc(db, 'courses', courseId);
        const snap = await withTimeout(getDoc(docRef), 4000);

        if (snap.exists()) {
          const data = snap.data();
          setCourse({
            title: data.title || courseId,
            description: data.description || '',
            targetAudience: data.targetAudience || '',
            ageRange: data.ageRange || '',
            duration: data.duration || '',
            requirements: data.requirements || [],
            resources: data.resources || [],
            classFormat: data.classFormat,
            lessonOutline: data.lessonOutline || []
          });
        }
      } catch (error) {
        console.error('Failed to load course details:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20 text-white">
        <p>Course details not found.</p>
        <Link to="/admin/courses/list" className="text-primary-300">Back to courses</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">{course.title}</h1>
          <p className="text-slate-300 max-w-3xl">{course.description}</p>
        </div>
        {id && (
          <Link
            to={`/admin/courses/edit/${id}`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-500 transition"
          >
            Edit Course
          </Link>
        )}
      </div>

      {/* Interactive Course System Access */}
      {interactiveSystem && (
        <div className="bg-gradient-to-r from-primary-500/20 to-blue-500/20 border-2 border-primary-400/50 rounded-xl p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-4xl">{interactiveSystem.icon}</span>
                <div>
                  <h2 className="text-2xl font-black text-white">{interactiveSystem.name}</h2>
                  <p className="text-primary-300 text-sm font-bold">Interactive Learning System Available</p>
                </div>
              </div>
              <p className="text-slate-300 mb-4">{interactiveSystem.description}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate(interactiveSystem.path)}
                  className="px-6 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <Rocket size={20} />
                  Launch System
                </button>
                <button
                  onClick={() => window.open(interactiveSystem.path, '_blank')}
                  className="px-6 py-3 bg-blue-500/20 text-blue-300 font-bold rounded-lg hover:bg-blue-500/30 transition-all border border-blue-400/30 flex items-center gap-2"
                >
                  <Play size={20} />
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800/80 border border-white/10 rounded-xl p-4 text-slate-300 flex items-center gap-3">
          <GraduationCap className="text-primary-400" size={20} />
          <span>{course.targetAudience || 'All learners'}</span>
        </div>
        <div className="bg-slate-800/80 border border-white/10 rounded-xl p-4 text-slate-300 flex items-center gap-3">
          <Users className="text-primary-400" size={20} />
          <span>{course.ageRange || 'All ages'}</span>
        </div>
        <div className="bg-slate-800/80 border border-white/10 rounded-xl p-4 text-slate-300 flex items-center gap-3">
          <Clock className="text-primary-400" size={20} />
          <span>{course.duration || 'Self-paced'}</span>
        </div>
      </div>

      {course.classFormat && (
        <div className="bg-slate-800/80 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <BookOpen className="text-primary-400" size={20} /> Class Format
          </h2>
          <div className="space-y-3 text-slate-300">
            {course.classFormat.duration && <p>Duration: {course.classFormat.duration}</p>}
            {course.classFormat.mode?.length > 0 && <p>Mode: {course.classFormat.mode.join(', ')}</p>}
            {course.classFormat.materials?.length > 0 && <p>Materials: {course.classFormat.materials.join(', ')}</p>}
          </div>
        </div>
      )}

      {course.requirements.length > 0 && (
        <div className="bg-slate-800/80 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Requirements</h2>
          <ul className="space-y-2 text-slate-300">
            {course.requirements.map((req, index) => (
              <li key={index} className="flex items-start gap-2">
                <CheckCircle className="text-primary-400" size={18} />
                <span>{req}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {course.resources && course.resources.length > 0 && (
        <div className="bg-slate-800/80 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Course Resources</h2>
          <div className="space-y-2">
            {course.resources.map((resource) => (
              <a
                key={resource.id}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2 text-sm text-primary-300 hover:text-primary-200"
              >
                <span>{resource.title}</span>
                <span className="text-xs text-slate-400">{resource.type.toUpperCase()}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      {course.lessonOutline && course.lessonOutline.length > 0 && (
        <div className="bg-slate-800/80 border border-white/10 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-white mb-4">Lesson Plan</h2>
          <div className="space-y-2">
            {course.lessonOutline.map((lesson, index) => (
              <div key={lesson.id || index} className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2">
                <span className="text-slate-200 text-sm">{lesson.title}</span>
                <span className="text-xs text-slate-500">
                  {lesson.hasVideo ? 'Video' : 'No Video'}, {lesson.hasText ? 'Text' : 'No Text'}, {lesson.hasQuiz ? 'Quiz' : 'No Quiz'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseDetails;
