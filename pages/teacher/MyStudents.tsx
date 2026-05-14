import { useState, useEffect } from 'react';
import { getTeacherByUserId, getStudents, getAttendanceByStudentId } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { Users, Search, BookOpen, TrendingUp, Calendar, Mail, Phone } from 'lucide-react';
import BackButton from '../../components/BackButton';

interface Student {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  currentCourse: string;
  enrollmentDate: string;
  status: string;
  guardianName?: string;
  guardianPhone?: string;
}

interface StudentProgress {
  studentId: string;
  attendanceRate: number;
  averageScore: number;
  totalLessons: number;
}

const MyStudents = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherData, setTeacherData] = useState<any>(null);
  const [progressData, setProgressData] = useState<Map<string, StudentProgress>>(new Map());

  useEffect(() => {
    if (user?.email) {
      fetchTeacherAndStudents();
    }
  }, [user]);

  useEffect(() => {
    const filtered = students.filter(student =>
      student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.currentCourse.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchTerm, students]);

  const fetchTeacherAndStudents = async () => {
    try {
      const teacher = await getTeacherByUserId(user!.uid);
      if (teacher) {
        setTeacherData(teacher);
        // Load all students then filter by assignedTeacherId
        const allStudents = await getStudents();
        const myStudents = allStudents.filter(s => s.assignedTeacherId === teacher.id) as unknown as Student[];
        setStudents(myStudents);
        setFilteredStudents(myStudents);
        // Fetch attendance-based progress for each student
        const progressMap = new Map<string, StudentProgress>();
        for (const student of myStudents) {
          const progress = await fetchStudentProgress(student.id);
          progressMap.set(student.id, progress);
        }
        setProgressData(progressMap);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentProgress = async (studentId: string): Promise<StudentProgress> => {
    try {
      const records = await getAttendanceByStudentId(studentId);
      const presentCount = records.filter(r => r.status === 'present').length;
      const attendanceRate = records.length > 0 ? (presentCount / records.length) * 100 : 0;
      return { studentId, attendanceRate: Math.round(attendanceRate), averageScore: 0, totalLessons: records.length };
    } catch (error) {
      console.error('Error fetching student progress:', error);
      return {
        studentId,
        attendanceRate: 0,
        averageScore: 0,
        totalLessons: 0,
      };
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">My Students</h1>
          <p className="text-white">{students.length} total students assigned to you</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={20} />
        <input
          type="text"
          placeholder="Search students by name, email, or course..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-primary-500/50"
        />
      </div>

      {/* Students Grid */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((student) => {
            const progress = progressData.get(student.id);
            return (
              <div
                key={student.id}
                className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:border-primary-500/30 transition-all"
              >
                {/* Student Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xl font-black">
                      {student.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-black text-white truncate">{student.fullName}</h3>
                    <p className="text-sm text-white/60 truncate">{student.email}</p>
                    <span className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-bold ${
                      student.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {student.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Student Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-white">
                    <BookOpen size={16} className="text-primary-400 flex-shrink-0" />
                    <span className="truncate">{student.currentCourse || 'No course assigned'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Phone size={16} className="text-accent-400 flex-shrink-0" />
                    <span className="truncate">{student.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white">
                    <Calendar size={16} className="text-green-400 flex-shrink-0" />
                    <span className="truncate">Enrolled: {new Date(student.enrollmentDate).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Progress Stats */}
                {progress && (
                  <div className="border-t border-white/10 pt-4 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Attendance</span>
                        <span className="text-white font-bold">{progress.attendanceRate}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-400 transition-all"
                          style={{ width: `${progress.attendanceRate}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/60">Average Score</span>
                        <span className="text-white font-bold">{progress.averageScore}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            progress.averageScore >= 70 ? 'bg-blue-400' : 'bg-yellow-400'
                          }`}
                          style={{ width: `${progress.averageScore}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-white/60">
                      <TrendingUp size={16} className="text-accent-400" />
                      <span>{progress.totalLessons} exams completed</span>
                    </div>
                  </div>
                )}

                {/* Guardian Info (if available) */}
                {student.guardianName && (
                  <div className="border-t border-white/10 mt-4 pt-4">
                    <p className="text-xs text-white/60 mb-1">Guardian</p>
                    <p className="text-sm font-bold text-white">{student.guardianName}</p>
                    {student.guardianPhone && (
                      <p className="text-xs text-white/60">{student.guardianPhone}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
          <Users className="mx-auto text-white/20 mb-4" size={64} />
          <h3 className="text-xl font-black text-white mb-2">No Students Found</h3>
          <p className="text-white/60">
            {searchTerm
              ? 'No students match your search criteria'
              : 'No students have been assigned to you yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyStudents;
