import React, { useEffect, useState } from 'react';
import { getTeacherByUserId, getStudents, createAttendanceRecords } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceStatus } from '../../types/attendance.types';
import { Teacher } from '../../types/teacher.types';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import BackButton from '../../components/BackButton';

interface Student {
  id: string;
  fullName: string;
  email: string;
  currentCourse: string;
}

interface AttendanceEntry {
  studentId: string;
  status: AttendanceStatus;
  lessonTopic: string;
  notes: string;
}

const TeacherAttendance: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceEntry>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTeacherAndStudents();
  }, [user]);

  const fetchTeacherAndStudents = async () => {
    if (!user) return;

    try {
      const teacherRecord = await getTeacherByUserId(user.uid);
      if (teacherRecord) {
        setTeacher(teacherRecord as unknown as Teacher);
        if (teacherRecord.assignedStudentIds?.length) {
          const allStudents = await getStudents();
          const assignedStudents = allStudents
            .filter(s => teacherRecord.assignedStudentIds.includes(s.id)) as unknown as Student[];
          setStudents(assignedStudents);
          const initialAttendance: Record<string, AttendanceEntry> = {};
          assignedStudents.forEach(student => {
            initialAttendance[student.id] = { studentId: student.id, status: 'present', lessonTopic: '', notes: '' };
          });
          setAttendance(initialAttendance);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAttendance = (studentId: string, field: keyof AttendanceEntry, value: any) => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  const handleSubmitAttendance = async () => {
    if (!teacher) return;

    setSubmitting(true);
    try {
      const rows = Object.values(attendance).map((entry: AttendanceEntry) => {
        const student = students.find(s => s.id === entry.studentId);
        return {
          studentId: entry.studentId,
          studentName: student?.fullName ?? '',
          teacherId: (teacher as any).id,
          teacherName: (teacher as any).fullName,
          date: selectedDate,
          status: entry.status as 'present' | 'absent' | 'late' | 'excused' | 'leave',
          lessonTopic: entry.lessonTopic || '',
          notes: entry.notes || '',
        };
      });
      await createAttendanceRecords(rows);
      alert('Attendance recorded successfully!');
    } catch (error) {
      console.error('Error submitting attendance:', error);
      alert('Error recording attendance. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusButton = (studentId: string, status: AttendanceStatus, icon: React.ReactNode, label: string, colorClass: string) => {
    const isSelected = attendance[studentId]?.status === status;
    return (
      <button
        onClick={() => updateAttendance(studentId, 'status', status)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
          isSelected
            ? `${colorClass} shadow-lg scale-105`
            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
        }`}
      >
        {icon}
        {label}
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (students.length === 0) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <div className="text-center">
          <CalendarIcon className="mx-auto text-slate-600 mb-4" size={64} />
          <p className="text-white text-xl font-bold mb-2">No Students Assigned</p>
          <p className="text-slate-400">Contact the administrator to get students assigned to you.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <BackButton to="/teacher" label="← Back to Dashboard" variant="secondary" />
      
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Mark Attendance</h1>
          <p className="text-slate-400">Record attendance for your students</p>
        </div>
        <div className="flex items-center gap-4">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
          />
          <button
            onClick={handleSubmitAttendance}
            disabled={submitting}
            className="px-6 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Attendance'}
          </button>
        </div>
      </div>

      {/* Attendance Form */}
      <div className="space-y-4">
        {students.map((student) => (
          <div
            key={student.id}
            className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Student Info */}
              <div className="lg:w-1/4">
                <h3 className="text-xl font-bold text-white mb-1">{student.fullName}</h3>
                <p className="text-sm text-slate-400">{student.email}</p>
                <p className="text-sm text-slate-500 mt-1">{student.currentCourse}</p>
              </div>

              {/* Status Buttons */}
              <div className="lg:w-3/4 space-y-4">
                <div className="flex flex-wrap gap-2">
                  {getStatusButton(
                    student.id,
                    'present',
                    <CheckCircle size={18} />,
                    'Present',
                    'bg-green-500 text-white'
                  )}
                  {getStatusButton(
                    student.id,
                    'absent',
                    <XCircle size={18} />,
                    'Absent',
                    'bg-red-500 text-white'
                  )}
                  {getStatusButton(
                    student.id,
                    'late',
                    <Clock size={18} />,
                    'Late',
                    'bg-orange-500 text-white'
                  )}
                  {getStatusButton(
                    student.id,
                    'excused',
                    <AlertCircle size={18} />,
                    'Excused',
                    'bg-blue-500 text-white'
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Lesson topic (optional)"
                    value={attendance[student.id]?.lessonTopic || ''}
                    onChange={(e) => updateAttendance(student.id, 'lessonTopic', e.target.value)}
                    className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50"
                  />
                  <input
                    type="text"
                    placeholder="Notes (optional)"
                    value={attendance[student.id]?.notes || ''}
                    onChange={(e) => updateAttendance(student.id, 'notes', e.target.value)}
                    className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-primary-500/50"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeacherAttendance;
