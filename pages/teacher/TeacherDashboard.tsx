import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTeacherByUserId, getStudentById } from '../../services/db';
import { TRANSLATIONS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { Users, BookOpen, Calendar, TrendingUp, Clock } from 'lucide-react';
import { AccessiblePremiumCourseCard } from '../../types/course-access.types';
import { listAccessiblePremiumCoursesForUser } from '../../services/courseAccessService';

interface TeacherData {
  id: string;
  fullName: string;
  email: string;
  maxStudents: number;
  currentStudents: number;
  assignedStudentIds: string[];
}

interface StudentData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  currentCourse: string;
  level: string;
  studentType: string;
}

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language]?.dashboard?.teacher || TRANSLATIONS['en'].dashboard?.teacher;
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [premiumCourses, setPremiumCourses] = useState<AccessiblePremiumCourseCard[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dir = TRANSLATIONS[language]?.dir || 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (!user) return;
    
    Promise.all([
      fetchTeacherData(),
      loadPremiumCourses()
    ]).catch(error => console.error('Error fetching teacher dashboard data:', error));
  }, [user]);

  const loadPremiumCourses = async () => {
    if (!user) return;

    try {
      const items = await listAccessiblePremiumCoursesForUser({
        userId: user.uid,
        role: 'teacher'
      });
      setPremiumCourses(items.slice(0, 6));
    } catch (error) {
      console.error('Failed to load teacher premium courses:', error);
    }
  };

  const fetchTeacherData = async () => {
    if (!user) return;

    try {
      const teacherRecord = await getTeacherByUserId(user.uid);
      if (teacherRecord) {
        setTeacher(teacherRecord as unknown as TeacherData);
        if (teacherRecord.assignedStudentIds?.length) {
          const studentPromises = teacherRecord.assignedStudentIds.slice(0, 3).map(id =>
            getStudentById(id).catch(() => null)
          );
          const assignedStudents = (await Promise.all(studentPromises)).filter(Boolean) as StudentData[];
          setStudents(assignedStudents);
        }
      }
    } catch (error) {
      console.error('Error fetching teacher data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Teacher Profile Not Found</p>
          <p className="text-slate-400">Please contact the administrator to set up your profile.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: t?.myStudents || 'My Students',
      value: teacher.currentStudents,
      subtitle: `of ${teacher.maxStudents} max`,
      icon: Users,
      gradient: 'from-primary-500 to-accent-400',
      bgGradient: 'from-sky-500/10 to-blue-500/10',
    },
    {
      title: t?.activeClasses || 'Active Lessons',
      value: students.length,
      subtitle: t?.thisWeek || 'This week',
      icon: BookOpen,
      gradient: 'from-primary-500 to-accent-500',
      bgGradient: 'from-primary-500/10 to-accent-500/10',
    },
    {
      title: t?.attendanceRate || 'Attendance Rate',
      value: '95%',
      subtitle: t?.last30Days || 'Last 30 days',
      icon: Calendar,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
    },
    {
      title: t?.avgProgress || 'Avg. Progress',
      value: '78%',
      subtitle: t?.studentCompletion || 'Student completion',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">{t?.welcome || 'Welcome back'}, {teacher.fullName}!</h1>
        <p className="text-slate-400">Here's an overview of your teaching activities</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="relative group">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.bgGradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
              <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${card.gradient}`}>
                    <Icon className="text-white" size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white mb-1">{card.value}</h3>
                <p className="text-sm font-bold text-slate-300">{card.title}</p>
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">Premium Teaching Access</h2>
            <p className="text-sm text-slate-400">Courses assigned to your teaching dashboard</p>
          </div>
          <Link to="/courses" className="text-sm text-primary-300 hover:text-primary-200">Browse public catalog</Link>
        </div>
        {premiumCourses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-400">No premium courses assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumCourses.map((course) => (
              <div key={`${course.sourceType}-${course.courseId}`} className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="font-bold text-white text-lg">{course.title}</h3>
                  <p className="text-xs text-slate-400 mt-1">{course.category} • {course.accessLabel}</p>
                  <p className="text-sm text-slate-500 mt-3 line-clamp-2">{course.description}</p>
                </div>
                <Link to={course.openPath} className="px-4 py-2 rounded-xl bg-primary-500/20 text-primary-200 hover:text-white hover:bg-primary-500/30 transition whitespace-nowrap">
                  Open
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Students */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-white mb-6">My Students</h2>
        {students.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto text-slate-600 mb-4" size={48} />
            <p className="text-slate-400">No students assigned yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {students.map((student) => (
              <div
                key={student.id}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl p-4 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg">{student.fullName}</h3>
                    <p className="text-sm text-slate-400">{student.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    student.studentType === 'online'
                      ? 'bg-accent-500/10 text-accent-400'
                      : 'bg-green-500/10 text-green-400'
                  }`}>
                    {student.studentType}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <BookOpen size={16} className="text-primary-400" />
                    <span className="text-slate-300">{student.currentCourse}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp size={16} className="text-green-400" />
                    <span className="text-slate-300 capitalize">{student.level} Level</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Today's Schedule */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-white mb-6">Today's Schedule</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-400 flex items-center justify-center">
              <Clock size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white">No lessons scheduled for today</p>
              <p className="text-xs text-slate-400">Check back tomorrow for your schedule</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
