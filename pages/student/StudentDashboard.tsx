import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStudentByUserId, getTeacherById } from '../../services/db';
import { TRANSLATIONS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Calendar, DollarSign, GraduationCap, TrendingUp, Video, MapPin, Globe } from 'lucide-react';
import { downloadCertificatePdf } from '../../utils/certificatePdf';
import { issueCertificate, listCertificatesForStudent } from '../../services/certificateService';
import { CertificateRecord } from '../../types/certificate.types';
import { AccessiblePremiumCourseCard } from '../../types/course-access.types';
import { listAccessiblePremiumCoursesForUser } from '../../services/courseAccessService';
import {
  canJoinLiveClass,
  listStudentUpcomingLiveClasses,
  type LiveClassSession,
} from '../../services/liveClassService';

interface StudentData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentType: 'online' | 'offline';
  currentCourse: string;
  level: string;
  enrollmentDate: string;
  assignedTeacherId: string | null;
  schedule: {
    days: string[];
    timeSlot: string;
    meetingLink?: string;
  };
  progress: {
    currentSurah: string;
    currentAyah: number;
    memorizedSurahs: string[];
    completionPercentage: number;
  };
  monthlyFee: number;
  status: string;
}

interface TeacherData {
  fullName: string;
  email: string;
  phone: string;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const t = TRANSLATIONS[language]?.dashboard?.student || TRANSLATIONS['en'].dashboard?.student;
  const [student, setStudent] = useState<StudentData | null>(null);
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [premiumCourses, setPremiumCourses] = useState<AccessiblePremiumCourseCard[]>([]);
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [upcomingLiveClasses, setUpcomingLiveClasses] = useState<LiveClassSession[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.documentElement.dir = TRANSLATIONS[language]?.dir || 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Combined single useEffect for all data fetching
  useEffect(() => {
    if (!user) return;
    
    setLoading(true);
    Promise.all([
      fetchStudentData(),
      loadPremiumCourses(),
    ]).catch(err => console.error('Dashboard load error:', err)).finally(() => setLoading(false));
  }, [user]);

  const loadPremiumCourses = async () => {
    if (!user) return;
    try {
      const items = await listAccessiblePremiumCoursesForUser({
        userId: user.uid,
        role: 'student'
      });
      setPremiumCourses(items.slice(0, 6));
    } catch (error) {
      console.error('Failed to load premium courses:', error);
    }
  };

  const fetchStudentData = async () => {
    if (!user) return;

    try {
      const studentData = await getStudentByUserId(user.uid);
      if (studentData) {
        setStudent(studentData as unknown as StudentData);
        if (studentData.assignedTeacherId) {
          getTeacherById(studentData.assignedTeacherId).then(teacherDoc => {
            if (teacherDoc) setTeacher(teacherDoc as unknown as TeacherData);
          }).catch(err => console.error('Failed to load teacher:', err));

          listStudentUpcomingLiveClasses(studentData.assignedTeacherId)
            .then((sessions) => {
              const activeSessions = sessions
                .filter((session) => new Date(session.endsAt).getTime() >= Date.now())
                .slice(0, 4);
              setUpcomingLiveClasses(activeSessions);
            })
            .catch((sessionError) => console.error('Failed to load live classes:', sessionError));
        }
        
        // Lazy load certificates
        loadCertificates(studentData.id).catch(err => console.error('Failed to load certificates:', err));
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  const loadCertificates = async (studentId: string): Promise<void> => {
    try {
      const items = await listCertificatesForStudent(studentId);
      setCertificates(items);
    } catch (error) {
      console.error('Failed to load certificates:', error);
    }
  };

  const handleIssueCertificate = async () => {
    if (!student || !user) return;
    try {
      await issueCertificate({
        userId: user.uid,
        studentId: student.id,
        courseTitle: student.currentCourse || 'Tajweed Foundations',
        achievement: 'Completed with strong recitation accuracy'
      });
      await loadCertificates(student.id);
    } catch (error) {
      console.error('Failed to issue certificate:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <p className="text-white text-xl font-bold mb-2">Student Profile Not Found</p>
          <p className="text-slate-400">Please contact the administrator to set up your profile.</p>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Course',
      value: student.currentCourse || 'Not Assigned',
      subtitle: `${student.level || 'Beginner'} Level`,
      icon: BookOpen,
      gradient: 'from-primary-500 to-accent-400',
      bgGradient: 'from-sky-500/10 to-blue-500/10',
    },
    {
      title: 'Progress',
      value: `${student.progress?.completionPercentage || 0}%`,
      subtitle: `${student.progress?.memorizedSurahs?.length || 0} Surahs memorized`,
      icon: TrendingUp,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-500/10 to-emerald-500/10',
    },
    {
      title: 'Attendance',
      value: '92%',
      subtitle: 'Last 30 days',
      icon: Calendar,
      gradient: 'from-primary-500 to-accent-500',
      bgGradient: 'from-primary-500/10 to-accent-500/10',
    },
    {
      title: 'Monthly Fee',
      value: `$${student.monthlyFee || 0}`,
      subtitle: student.status === 'active' ? 'Paid' : 'Pending',
      icon: DollarSign,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-500/10 to-red-500/10',
    },
  ];

  const completion = student.progress?.completionPercentage || 0;
  const journeySteps = [
    { label: 'Beginner Foundations', threshold: 10 },
    { label: 'Tajweed Mastery', threshold: 40 },
    { label: 'Memorization Track', threshold: 65 },
    { label: 'Tafsir & Meaning', threshold: 85 },
    { label: 'Certification', threshold: 100 }
  ];
  const activeStepIndex = journeySteps.findIndex(step => completion < step.threshold);
  const currentStepIndex = activeStepIndex === -1 ? journeySteps.length - 1 : activeStepIndex;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">{t?.welcome || 'Welcome back'}, {student.fullName}!</h1>
        <p className="text-slate-400">{t?.myProgress || 'Continue your Quran learning journey'}</p>
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
                <h3 className="text-2xl font-black text-white mb-1">{card.value}</h3>
                <p className="text-sm font-bold text-slate-300">{card.title}</p>
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Student Journey */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-black text-white">Student Journey</h2>
            <p className="text-sm text-slate-400">Current stage: {journeySteps[currentStepIndex]?.label}</p>
          </div>
          <span className="text-sm text-primary-300">{completion}% complete</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {journeySteps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isComplete = completion >= step.threshold;
            return (
              <div
                key={step.label}
                className={`rounded-xl border px-4 py-4 text-center ${
                  isActive
                    ? 'border-primary-400 bg-primary-500/10 text-white'
                    : isComplete
                      ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200'
                      : 'border-white/10 bg-white/5 text-slate-300'
                }`}
              >
                <p className="text-xs uppercase tracking-[0.2em]">Step {index + 1}</p>
                <p className="text-sm font-semibold mt-2">{step.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Premium Course Access */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-black text-white">Premium Course Access</h2>
            <p className="text-sm text-slate-400">Assigned and subscribed premium learning paths</p>
          </div>
          <Link to="/courses" className="text-sm text-primary-300 hover:text-primary-200">Browse courses</Link>
        </div>
        {premiumCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {premiumCourses.map(course => (
              <div key={`${course.sourceType}-${course.courseId}`} className="bg-slate-900/60 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-white font-semibold">{course.title}</p>
                  <p className="text-xs text-slate-400 mt-1">{course.category} • {course.accessLabel}</p>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2">{course.description}</p>
                </div>
                <Link
                  to={course.openPath}
                  className="px-3 py-2 rounded-lg bg-primary-500/20 text-primary-200 hover:text-white hover:bg-primary-500/30 transition"
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-slate-400 text-sm">No premium courses are assigned to your dashboard yet.</div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Teacher */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-white mb-6">My Teacher</h2>
          {teacher ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                  <GraduationCap size={32} className="text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{teacher.fullName}</h3>
                  <p className="text-sm text-slate-400">{teacher.email}</p>
                </div>
              </div>
              <div className="space-y-2 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">📞 Phone:</span>
                  <span className="text-white">{teacher.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-slate-400">📧 Email:</span>
                  <span className="text-white">{teacher.email}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-slate-400">No teacher assigned yet</p>
            </div>
          )}
        </div>

        {/* Class Schedule */}
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-white mb-6">Class Schedule</h2>
          {student.schedule?.days?.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
                <Calendar className="text-primary-400" size={24} />
                <div>
                  <p className="text-sm font-bold text-white">
                    {student.schedule?.days?.join(', ') || 'Not scheduled'}
                  </p>
                  <p className="text-xs text-slate-400">{student.schedule?.timeSlot || 'Time not set'}</p>
                </div>
              </div>
              
              {upcomingLiveClasses.length > 0 && (
                <div className="space-y-3">
                  {upcomingLiveClasses.map((session) => (
                    <div key={session.id} className="p-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10 border border-primary-500/20 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Video className="text-primary-400 flex-shrink-0 mt-1" size={20} />
                        <div className="flex-1">
                          <p className="text-sm font-bold text-white mb-1">{session.lessonTitle}</p>
                          <p className="text-xs text-slate-300 mb-3">{new Date(session.startsAt).toLocaleString()} • {session.courseName}</p>
                          {canJoinLiveClass(session) ? (
                            <Link
                              to={`/class/${session.id}`}
                              className="inline-flex px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold"
                            >
                              Join Class Now
                            </Link>
                          ) : (
                            <span className="inline-flex px-3 py-2 bg-slate-700 text-slate-200 rounded-lg text-xs font-bold">
                              Join opens 15 min before class
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 p-4 bg-white/5 rounded-xl">
                {student.studentType === 'online' ? (
                  <>
                    <Globe className="text-accent-400" size={20} />
                    <span className="text-sm text-slate-300">Online Classes</span>
                  </>
                ) : (
                  <>
                    <MapPin className="text-green-400" size={20} />
                    <span className="text-sm text-slate-300">In-Center Classes</span>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="mx-auto text-slate-600 mb-4" size={48} />
              <p className="text-slate-400">No schedule set yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Current Progress */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-white mb-6">Current Progress</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div>
              <p className="text-sm font-bold text-white">Current Surah</p>
              <p className="text-lg text-primary-400">{student.progress?.currentSurah || 'Not started yet'}</p>
            </div>
            <BookOpen className="text-primary-400" size={32} />
          </div>
          
          <div className="p-4 bg-white/5 rounded-xl">
            <p className="text-sm font-bold text-white mb-3">Memorized Surahs</p>
            {student.progress?.memorizedSurahs?.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {student.progress?.memorizedSurahs?.map((surah, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold"
                  >
                    {surah}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 text-sm">No surahs memorized yet. Keep learning!</p>
            )}
          </div>

          <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-bold text-white">Overall Completion</p>
              <p className="text-sm font-bold text-green-400">{student.progress?.completionPercentage || 0}%</p>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
                style={{ width: `${student.progress?.completionPercentage || 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Certificates</h2>
          <button
            type="button"
            onClick={handleIssueCertificate}
            className="px-4 py-2 bg-primary-500/20 text-primary-200 rounded-lg text-xs font-semibold"
          >
            Issue Certificate
          </button>
        </div>

        {certificates.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {certificates.map((cert) => (
              <div key={cert.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="text-xs text-slate-400">Issued {cert.issuedAt.toLocaleDateString()}</p>
                <p className="text-lg font-bold text-white mt-2">{cert.courseTitle}</p>
                <p className="text-xs text-slate-400 mt-2">{cert.achievement}</p>
                <button
                  type="button"
                  onClick={() =>
                    downloadCertificatePdf({
                      studentName: student.fullName,
                      courseTitle: cert.courseTitle,
                      achievement: cert.achievement,
                      issueDate: cert.issuedAt.toLocaleDateString()
                    })
                  }
                  className="mt-3 w-full px-4 py-2 bg-primary-500/20 text-primary-200 rounded-lg text-xs font-semibold"
                >
                  Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-slate-400">Current goal</p>
            <p className="text-lg font-bold text-white mt-2">Tajweed Foundations</p>
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Progress</span>
                <span>45%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                <div className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white/5 rounded-xl border border-white/10">
            <p className="text-sm text-slate-400">Upcoming certificate</p>
            <p className="text-lg font-bold text-white mt-2">Recitation Fluency</p>
            <p className="text-xs text-slate-400 mt-3">Earned after completing 3 milestone assessments.</p>
            <button
              type="button"
              onClick={() =>
                downloadCertificatePdf({
                  studentName: student.fullName,
                  courseTitle: 'Tajweed Foundations',
                  achievement: 'Completed with strong recitation accuracy',
                  issueDate: new Date().toLocaleDateString()
                })
              }
              className="mt-4 w-full px-4 py-2 bg-primary-500/20 text-primary-200 rounded-lg text-xs font-semibold"
            >
              Download Sample Certificate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
