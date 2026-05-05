import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { BookOpen, Edit, Eye, EyeOff, Rocket, Play } from 'lucide-react';
import { courses as allCourses } from '../../../data/courses';

// Derive predefined courses from the canonical data source
const PREDEFINED_COURSES = allCourses.map(c => ({
  id: c.id,
  name: c.title,
  category: c.category,
}));

interface CourseData {
  id: string;
  name: string;
  category: string;
  description?: string;
  status?: string;
  teacherId?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  lessonsCount?: number;
}

interface AutomatedCourseData {
  id: string;
  title: string;
  category: string;
  description?: string;
  status?: string;
  isActive?: boolean;
  accessDurationDays?: number;
}

export default function CourseList() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [automatedCourses, setAutomatedCourses] = useState<AutomatedCourseData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialCourses = PREDEFINED_COURSES.map(predefined => ({
      id: predefined.id,
      name: predefined.name,
      category: predefined.category,
      description: 'No description yet',
      status: 'draft',
      teacherId: undefined,
      thumbnailUrl: undefined,
      isActive: true,
      lessonsCount: 0
    }));
    setCourses(initialCourses);
    setLoading(false);
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'courses'));
      const coursesMap = new Map();
      
      querySnapshot.docs.forEach(doc => {
        coursesMap.set(doc.id, {
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        });
      });

      // Merge predefined courses with Firestore data
      const mergedCourses = PREDEFINED_COURSES.map(predefined => ({
        id: predefined.id,
        name: predefined.name,
        category: predefined.category,
        description: coursesMap.get(predefined.id)?.description || 'No description yet',
        status: coursesMap.get(predefined.id)?.status || 'draft',
        teacherId: coursesMap.get(predefined.id)?.teacherId,
        thumbnailUrl: coursesMap.get(predefined.id)?.thumbnailUrl,
        isActive: coursesMap.get(predefined.id)?.isActive ?? true,
        lessonsCount: coursesMap.get(predefined.id)?.lessonOutline?.length || 0
      }));
      
      setCourses(mergedCourses);

      const automatedSnapshot = await getDocs(collection(db, 'automated_courses'));
      const automatedList = automatedSnapshot.docs.map(docSnap => {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          title: data.title,
          category: data.category,
          description: data.description || 'No description yet',
          status: data.status || 'draft',
          isActive: data.isActive ?? true,
          accessDurationDays: data.accessDurationDays || 30
        } as AutomatedCourseData;
      });
      setAutomatedCourses(automatedList);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-primary-500" size={32} />
          Edit Courses
        </h1>
        <p className="text-slate-300 mt-2">Manage your predefined academy courses</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-white">Loading courses...</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Interactive Course Systems */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
              <Rocket className="text-primary-400" size={28} />
              Interactive Course Systems
            </h2>
            <p className="text-slate-400 mb-6">Full-featured learning platforms with AI, analytics, and automation</p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Hifz System */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-400/30 rounded-xl p-6 hover:border-green-400/50 transition">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">📖</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white mb-2">Hifz Management System</h3>
                    <p className="text-slate-300 text-sm mb-3">Complete Quran memorization tracking, revision scheduler, weak page detection, and progress analytics</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold">Memorization Tracker</span>
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold">Revision System</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold">Gamification</span>
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-bold">Analytics</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/hifz')}
                    className="flex-1 px-4 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Rocket size={18} />
                    Launch Hifz System
                  </button>
                  <Link
                    to="/admin/courses/details/hifz-quran"
                    className="px-4 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <Eye size={18} />
                    Details
                  </Link>
                </div>
              </div>

              {/* Arabic Learning Platform */}
              <div className="bg-gradient-to-br from-blue-500/10 to-primary-500/10 border-2 border-blue-400/30 rounded-xl p-6 hover:border-blue-400/50 transition">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">🌙</div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-black text-white mb-2">AI-Powered Arabic Platform</h3>
                    <p className="text-slate-300 text-sm mb-3">Interactive lessons, pronunciation training, practice exercises, assessments, and AI feedback (A1-C2)</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold">6 Levels</span>
                      <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold">AI Coach</span>
                      <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-bold">Pronunciation</span>
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-bold">Placement Test</span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => navigate('/learn-arabic')}
                    className="flex-1 px-4 py-3 bg-primary-500 text-white font-bold rounded-lg hover:bg-primary-600 transition-all hover:scale-105 flex items-center justify-center gap-2"
                  >
                    <Rocket size={18} />
                    Launch Arabic Platform
                  </button>
                  <Link
                    to="/admin/courses/details/arabic-language"
                    className="px-4 py-3 bg-white/10 text-white font-bold rounded-lg hover:bg-white/20 transition-all flex items-center gap-2"
                  >
                    <Eye size={18} />
                    Details
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Instructor-Led Courses</h2>
            <div className="grid grid-cols-1 gap-6">
              {courses.map((course) => (
                <div key={course.id} className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-xl hover:border-primary-400/30 transition">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-white">{course.name}</h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            course.status === 'published'
                              ? 'bg-green-500/20 text-green-300'
                              : 'bg-yellow-500/20 text-yellow-300'
                          }`}
                        >
                          {course.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                        {course.isActive ? (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                            <Eye size={12} /> Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                            <EyeOff size={12} /> Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-slate-300 mb-4">{course.description}</p>
                      <div className="flex items-center gap-6 text-sm text-slate-300">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-white">Category:</span> {course.category}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-white">Lessons:</span> {course.lessonsCount}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        to={`/admin/courses/view/${course.id}`}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white hover:bg-slate-600 rounded-lg transition"
                      >
                        <Eye size={18} />
                        View Details
                      </Link>
                      <button
                        onClick={() => navigate(`/admin/courses/edit/${course.id}`)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-500 rounded-lg transition"
                      >
                        <Edit size={18} />
                        Edit Course
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-4">Automated Courses</h2>
            {automatedCourses.length === 0 ? (
              <p className="text-slate-400">No automated courses created yet.</p>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {automatedCourses.map((course) => (
                  <div key={course.id} className="bg-slate-800/80 backdrop-blur-xl border border-white/10 rounded-xl shadow-lg p-6 hover:shadow-xl hover:border-primary-400/30 transition">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-white">{course.title}</h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              course.status === 'published'
                                ? 'bg-green-500/20 text-green-300'
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}
                          >
                            {course.status === 'published' ? 'Published' : 'Draft'}
                          </span>
                          {course.isActive ? (
                            <span className="flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                              <Eye size={12} /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 px-2 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs">
                              <EyeOff size={12} /> Inactive
                            </span>
                          )}
                        </div>
                        <p className="text-slate-300 mb-4">{course.description}</p>
                        <div className="flex items-center gap-6 text-sm text-slate-300">
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-white">Category:</span> {course.category}
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="font-semibold text-white">Access:</span> {course.accessDurationDays} days
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Link
                          to={`/automated/${course.id}`}
                          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white hover:bg-primary-500 rounded-lg transition"
                        >
                          <Eye size={18} />
                          View
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
