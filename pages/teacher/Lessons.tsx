import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Search, Filter, Clock, FileText, CheckCircle } from 'lucide-react';
import BackButton from '../../components/BackButton';
import { Link } from 'react-router-dom';
import {
  canJoinLiveClass,
  listTeacherLiveClassSessions,
  upsertLiveClassSession,
  type LiveClassSession,
} from '../../services/liveClassService';

interface Lesson {
  id: string;
  title: string;
  description: string;
  courseName: string;
  duration: number;
  order: number;
  objectives: string[];
  materials: string[];
  videoUrl?: string;
}

interface Course {
  id: string;
  name: string;
  title: string;
}

const Lessons = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [teacherData, setTeacherData] = useState<any>(null);
  const [teacherSessions, setTeacherSessions] = useState<LiveClassSession[]>([]);
  const [scheduleDrafts, setScheduleDrafts] = useState<Record<string, { startsAt: string; duration: string }>>({});
  const [savingSessionByLesson, setSavingSessionByLesson] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (user?.email) {
      fetchTeacherAndLessons();
    }
  }, [user]);

  useEffect(() => {
    let filtered = lessons;

    if (searchTerm) {
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lesson.courseName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCourse !== 'all') {
      filtered = filtered.filter(lesson => lesson.courseName === selectedCourse);
    }

    setFilteredLessons(filtered);
  }, [searchTerm, selectedCourse, lessons]);

  const fetchTeacherAndLessons = async () => {
    try {
      // Fetch teacher data
      const teachersQuery = query(
        collection(db, 'teachers'),
        where('email', '==', user?.email)
      );
      const teachersSnap = await getDocs(teachersQuery);
      
      if (!teachersSnap.empty) {
        const teacher = { id: teachersSnap.docs[0].id, ...teachersSnap.docs[0].data() };
        setTeacherData(teacher);

        const sessions = await listTeacherLiveClassSessions(teacher.id);
        setTeacherSessions(sessions);

        // Fetch all courses
        const coursesSnap = await getDocs(collection(db, 'courses'));
        const coursesList: Course[] = coursesSnap.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.data().title,
          title: doc.data().title || doc.data().name,
          ...doc.data()
        }));
        setCourses(coursesList);

        // Fetch lessons
        const lessonsQuery = query(
          collection(db, 'lessons'),
          orderBy('order', 'asc')
        );
        const lessonsSnap = await getDocs(lessonsQuery);
        const lessonsList: Lesson[] = lessonsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Lesson));
        
        setLessons(lessonsList);
        setFilteredLessons(lessonsList);
      }
    } catch (error) {
      console.error('Error fetching lessons:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton to="/teacher" label="← Back to Dashboard" variant="secondary" />
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">My Lessons</h1>
        <p className="text-white">{filteredLessons.length} lessons available</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={20} />
          <input
            type="text"
            placeholder="Search lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary-500/50"
          />
        </div>

        {/* Course Filter */}
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={20} />
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50 appearance-none"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.name || course.title}>
                {course.title || course.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lessons Grid */}
      {filteredLessons.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredLessons.map((lesson) => (
            <div
              key={lesson.id}
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary-500/30 transition-all"
            >
              {(() => {
                const now = Date.now();
                const lessonSessions = teacherSessions
                  .filter((session) => session.lessonId === lesson.id)
                  .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime());
                const upcomingSession = lessonSessions.find((session) => new Date(session.endsAt).getTime() >= now) || null;
                const draft = scheduleDrafts[lesson.id] || { startsAt: '', duration: '45' };

                const handleSaveSession = async () => {
                  if (!teacherData?.id || !user?.uid) return;
                  if (!draft.startsAt) return;

                  const startsAtIso = new Date(draft.startsAt).toISOString();
                  const durationMinutes = Number(draft.duration || 45);
                  const endsAtIso = new Date(new Date(draft.startsAt).getTime() + durationMinutes * 60 * 1000).toISOString();

                  setSavingSessionByLesson((prev) => ({ ...prev, [lesson.id]: true }));
                  try {
                    await upsertLiveClassSession({
                      teacherId: teacherData.id,
                      teacherUserId: user.uid,
                      lessonId: lesson.id,
                      lessonTitle: lesson.title,
                      courseName: lesson.courseName,
                      startsAt: startsAtIso,
                      endsAt: endsAtIso,
                    });

                    const sessions = await listTeacherLiveClassSessions(teacherData.id);
                    setTeacherSessions(sessions);
                  } catch (saveError) {
                    console.error('Failed to schedule class session:', saveError);
                  } finally {
                    setSavingSessionByLesson((prev) => ({ ...prev, [lesson.id]: false }));
                  }
                };

                return (
                  <>
              {/* Lesson Header */}
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-primary-500/10 rounded-xl flex-shrink-0">
                  <BookOpen className="text-primary-400" size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-white/60 bg-accent-500/10 px-2 py-1 rounded-full">
                      Lesson {lesson.order}
                    </span>
                    <span className="text-xs font-bold text-white/60">
                      {lesson.courseName}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-white mb-1">{lesson.title}</h3>
                  <p className="text-sm text-white/60 line-clamp-2">{lesson.description}</p>
                </div>
              </div>

              {/* Duration */}
              <div className="flex items-center gap-2 text-sm text-white mb-4">
                <Clock size={16} className="text-green-400" />
                <span>{lesson.duration} minutes</span>
              </div>

              {/* Objectives */}
              {lesson.objectives && lesson.objectives.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <CheckCircle size={16} className="text-blue-400" />
                    Learning Objectives
                  </h4>
                  <ul className="space-y-1">
                    {lesson.objectives.slice(0, 3).map((objective, index) => (
                      <li key={index} className="text-sm text-white/60 pl-4 relative before:content-['•'] before:absolute before:left-0">
                        {objective}
                      </li>
                    ))}
                    {lesson.objectives.length > 3 && (
                      <li className="text-sm text-primary-400 pl-4">
                        +{lesson.objectives.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Materials */}
              {lesson.materials && lesson.materials.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-white mb-2 flex items-center gap-2">
                    <FileText size={16} className="text-yellow-400" />
                    Materials
                  </h4>
                  <ul className="space-y-1">
                    {lesson.materials.slice(0, 2).map((material, index) => (
                      <li key={index} className="text-sm text-white/60 pl-4 relative before:content-['•'] before:absolute before:left-0">
                        {material}
                      </li>
                    ))}
                    {lesson.materials.length > 2 && (
                      <li className="text-sm text-primary-400 pl-4">
                        +{lesson.materials.length - 2} more
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Video Link */}
              {lesson.videoUrl && (
                <div className="border-t border-white/10 pt-4">
                  <a
                    href={lesson.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg font-bold hover:from-primary-400 hover:to-accent-400 transition-all text-sm"
                  >
                    <BookOpen size={16} />
                    View Lesson
                  </a>
                </div>
              )}

              <div className="mt-4 border-t border-white/10 pt-4 space-y-3">
                <h4 className="text-sm font-bold text-white">Live Class Session</h4>

                {upcomingSession ? (
                  <div className="bg-primary-500/10 border border-primary-500/30 rounded-xl p-3 text-sm">
                    <p className="text-primary-200 font-semibold">Scheduled: {new Date(upcomingSession.startsAt).toLocaleString()}</p>
                    <p className="text-slate-300 mt-1">Ends: {new Date(upcomingSession.endsAt).toLocaleTimeString()}</p>
                    <div className="mt-3 flex gap-2">
                      {canJoinLiveClass(upcomingSession) ? (
                        <Link
                          to={`/class/${upcomingSession.id}`}
                          className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-xs"
                        >
                          Start / Join Live Class
                        </Link>
                      ) : (
                        <span className="px-3 py-2 bg-slate-700 text-slate-200 rounded-lg font-bold text-xs">
                          Join opens 15 min before start
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No live class scheduled yet for this lesson.</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    type="datetime-local"
                    value={draft.startsAt}
                    onChange={(e) =>
                      setScheduleDrafts((prev) => ({
                        ...prev,
                        [lesson.id]: { ...draft, startsAt: e.target.value },
                      }))
                    }
                    className="px-3 py-2 bg-slate-900/70 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                  />
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={draft.duration}
                    onChange={(e) =>
                      setScheduleDrafts((prev) => ({
                        ...prev,
                        [lesson.id]: { ...draft, duration: e.target.value },
                      }))
                    }
                    className="px-3 py-2 bg-slate-900/70 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500"
                    placeholder="Duration (minutes)"
                  />
                </div>
                <button
                  onClick={handleSaveSession}
                  disabled={!draft.startsAt || savingSessionByLesson[lesson.id]}
                  className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 disabled:opacity-50 text-white rounded-lg text-sm font-bold"
                >
                  {savingSessionByLesson[lesson.id] ? 'Saving...' : 'Schedule / Update Session'}
                </button>
              </div>
                  </>
                );
              })()}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <BookOpen className="mx-auto text-white/20 mb-4" size={64} />
          <h3 className="text-xl font-black text-white mb-2">No Lessons Found</h3>
          <p className="text-white/60">
            {searchTerm || selectedCourse !== 'all'
              ? 'No lessons match your filters'
              : 'No lessons have been created yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default Lessons;
