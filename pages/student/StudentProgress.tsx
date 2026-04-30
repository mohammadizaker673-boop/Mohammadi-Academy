import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { BookOpen, Award, TrendingUp, CheckCircle, Clock, Target } from 'lucide-react';
import BackButton from '../../components/BackButton';

interface ProgressRecord {
  id: string;
  lessonTitle: string;
  courseName: string;
  completedAt: string;
  score?: number;
  status: 'completed' | 'in-progress' | 'not-started';
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  courseName: string;
}

const StudentProgress = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [studentData, setStudentData] = useState<any>(null);
  const [stats, setStats] = useState({
    totalLessons: 0,
    completedLessons: 0,
    averageScore: 0,
    attendanceRate: 0,
    currentStreak: 0,
  });

  useEffect(() => {
    if (user?.email) {
      fetchStudentProgress();
    }
  }, [user]);

  const fetchStudentProgress = async () => {
    try {
      // Fetch student data
      const studentsQuery = query(
        collection(db, 'students'),
        where('email', '==', user?.email)
      );
      const studentsSnap = await getDocs(studentsQuery);
      
      if (!studentsSnap.empty) {
        const student = { id: studentsSnap.docs[0].id, ...studentsSnap.docs[0].data() };
        setStudentData(student);

        // Fetch progress records (from results collection)
        const resultsQuery = query(
          collection(db, 'results'),
          where('studentId', '==', student.id),
          orderBy('examDate', 'desc')
        );
        const resultsSnap = await getDocs(resultsQuery);
        const results: ProgressRecord[] = resultsSnap.docs.map(doc => ({
          id: doc.id,
          lessonTitle: doc.data().examTitle || 'Exam',
          courseName: doc.data().courseName || 'N/A',
          completedAt: doc.data().examDate,
          score: doc.data().percentage || 0,
          status: 'completed',
        }));
        setProgressRecords(results);

        // Fetch attendance records
        const attendanceQuery = query(
          collection(db, 'attendance'),
          where('studentId', '==', student.id),
          orderBy('date', 'desc')
        );
        const attendanceSnap = await getDocs(attendanceQuery);
        const attendance: AttendanceRecord[] = attendanceSnap.docs.map(doc => ({
          id: doc.id,
          date: doc.data().date,
          status: doc.data().status,
          courseName: doc.data().courseName || 'N/A',
        }));
        setAttendanceRecords(attendance);

        // Calculate statistics
        const totalLessons = results.length;
        const completedLessons = results.filter(r => r.status === 'completed').length;
        const averageScore = totalLessons > 0
          ? results.reduce((sum, r) => sum + (r.score || 0), 0) / totalLessons
          : 0;
        
        const presentCount = attendance.filter(a => a.status === 'present').length;
        const attendanceRate = attendance.length > 0
          ? (presentCount / attendance.length) * 100
          : 0;

        // Calculate current streak
        let streak = 0;
        const sortedAttendance = [...attendance].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        for (const record of sortedAttendance) {
          if (record.status === 'present') {
            streak++;
          } else {
            break;
          }
        }

        setStats({
          totalLessons,
          completedLessons,
          averageScore: Math.round(averageScore),
          attendanceRate: Math.round(attendanceRate),
          currentStreak: streak,
        });
      }
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 80) return 'text-blue-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 60) return 'text-orange-400';
    return 'text-red-400';
  };

  const getGradeLetter = (score: number) => {
    if (score >= 90) return 'A+';
    if (score >= 85) return 'A';
    if (score >= 80) return 'B+';
    if (score >= 75) return 'B';
    if (score >= 70) return 'C+';
    if (score >= 65) return 'C';
    if (score >= 60) return 'D';
    return 'F';
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
      <BackButton to="/student" label="← Back to Dashboard" variant="secondary" />
      
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">My Progress</h1>
        <p className="text-white">Track your learning journey and achievements</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <BookOpen className="text-blue-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-white/60">Total Lessons</p>
              <p className="text-2xl font-black text-white">{stats.totalLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <CheckCircle className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-white/60">Completed</p>
              <p className="text-2xl font-black text-white">{stats.completedLessons}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-500/10 rounded-xl">
              <Award className="text-accent-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-white/60">Average Score</p>
              <p className="text-2xl font-black text-white">{stats.averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/10 rounded-xl">
              <Target className="text-yellow-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-white/60">Attendance</p>
              <p className="text-2xl font-black text-white">{stats.attendanceRate}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <TrendingUp className="text-orange-400" size={24} />
            </div>
            <div>
              <p className="text-sm text-white/60">Current Streak</p>
              <p className="text-2xl font-black text-white">{stats.currentStreak} days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Info */}
      {studentData && (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <h2 className="text-2xl font-black text-white mb-4">Student Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-white/60">Current Course</p>
              <p className="text-lg font-bold text-white">{studentData.currentCourse || 'Not Assigned'}</p>
            </div>
            <div>
              <p className="text-sm text-white/60">Enrollment Date</p>
              <p className="text-lg font-bold text-white">
                {studentData.enrollmentDate ? new Date(studentData.enrollmentDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm text-white/60">Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${
                studentData.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {studentData.status || 'Active'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Exam Results */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-black text-white">Recent Exam Results</h2>
        </div>
        <div className="overflow-x-auto">
          {progressRecords.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Exam</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {progressRecords.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{record.lessonTitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{record.courseName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {new Date(record.completedAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${
                              (record.score || 0) >= 70 ? 'bg-green-400' : 'bg-red-400'
                            }`}
                            style={{ width: `${record.score || 0}%` }}
                          />
                        </div>
                        <span className={`text-sm font-bold ${getGradeColor(record.score || 0)}`}>
                          {record.score}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-lg font-black ${getGradeColor(record.score || 0)}`}>
                        {getGradeLetter(record.score || 0)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-white/60">
              No exam results yet. Keep learning!
            </div>
          )}
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-2xl font-black text-white">Recent Attendance</h2>
        </div>
        <div className="overflow-x-auto">
          {attendanceRecords.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Date</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Course</th>
                  <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {attendanceRecords.slice(0, 10).map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {new Date(record.date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{record.courseName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        record.status === 'present'
                          ? 'bg-green-500/10 text-green-400'
                          : record.status === 'late'
                          ? 'bg-yellow-500/10 text-yellow-400'
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-white/60">
              No attendance records yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentProgress;
