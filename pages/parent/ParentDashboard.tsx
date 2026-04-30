import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, ClipboardList, GraduationCap, MessageSquare, Shield } from 'lucide-react';
import LogoLink from '../../components/LogoLink';
import LanguageSelector from '../../components/LanguageSelector';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { downloadProgressReportPdf } from '../../utils/certificatePdf';
import { AttendanceRecord } from '../../types/attendance.types';

type StudentProfile = {
  id: string;
  fullName: string;
  email: string;
  currentCourse: string;
  level: string;
  progress?: {
    completionPercentage?: number;
    memorizedSurahs?: string[];
  };
  parentEmail?: string;
};

const ParentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [lookupEmail, setLookupEmail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const feedbackNotes = [
    { title: 'Tajweed accuracy improving', note: 'Focused on Makharij this week with clear progress.' },
    { title: 'Memorization habit', note: 'Daily revision schedule recommended after Maghrib.' }
  ];

  useEffect(() => {
    if (user?.email) {
      loadStudentsByParentEmail(user.email);
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadStudentsByParentEmail = async (email: string) => {
    try {
      setLoading(true);
      setStatusMessage('');
      const studentQuery = query(collection(db, 'students'), where('parentEmail', '==', email));
      const studentSnap = await getDocs(studentQuery);
      if (studentSnap.empty) {
        setStudents([]);
        setSelectedStudentId('');
        setStatusMessage('No student linked to this parent email yet.');
        setAttendance([]);
        return;
      }

      const studentList = studentSnap.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      })) as StudentProfile[];
      setStudents(studentList);
      const firstId = studentList[0]?.id || '';
      setSelectedStudentId(firstId);
      if (firstId) {
        await loadAttendance(firstId);
      }
    } catch (error) {
      console.error('Failed to load parent data:', error);
      setStatusMessage('Unable to load parent data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadAttendance(selectedStudentId);
    }
  }, [selectedStudentId]);

  const loadAttendance = async (studentId: string) => {
    const attendanceQuery = query(
      collection(db, 'attendance'),
      where('studentId', '==', studentId),
      orderBy('date', 'desc')
    );
    const attendanceSnap = await getDocs(attendanceQuery);
    const records = attendanceSnap.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() } as AttendanceRecord));
    setAttendance(records.slice(0, 8));
  };

  const attendanceRate = attendance.length
    ? Math.round((attendance.filter(item => item.status === 'present').length / attendance.length) * 100)
    : 0;

  const selectedStudent = students.find(item => item.id === selectedStudentId) || null;
  const reportNotes = attendance
    .map(item => item.notes)
    .filter(Boolean)
    .slice(0, 3) as string[];
  const reportSummary = selectedStudent
    ? `Completion: ${selectedStudent.progress?.completionPercentage || 0}%. Current course: ${selectedStudent.currentCourse || 'Tajweed'}.`
    : 'No student linked yet.';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-slate-900 to-[#0a0f2b]">
      <header className="bg-slate-900/60 border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <LogoLink showText={false} compact />
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <Link to="/" className="text-slate-300 hover:text-white text-sm">Home</Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-white">Linked Student</h2>
              <p className="text-sm text-slate-400">We match by parent email or manual lookup.</p>
              {statusMessage && <p className="text-xs text-amber-300 mt-2">{statusMessage}</p>}
            </div>
            <form
              className="flex flex-col sm:flex-row gap-3"
              onSubmit={(event) => {
                event.preventDefault();
                if (lookupEmail.trim()) {
                  loadStudentsByParentEmail(lookupEmail.trim());
                }
              }}
            >
              <input
                type="email"
                value={lookupEmail}
                onChange={(event) => setLookupEmail(event.target.value)}
                placeholder="Enter parent email"
                className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm"
              />
              <button className="px-4 py-2 bg-primary-500/30 text-primary-100 rounded-xl text-sm font-semibold">
                Link Student
              </button>
            </form>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary-300">Parent Dashboard</p>
            <h1 className="text-4xl font-black text-white mt-3">Student Progress Overview</h1>
            <p className="text-slate-300 mt-2">Track attendance, teacher feedback, monthly reports, and character development.</p>
          </div>
          <Link
            to="/register"
            className="px-5 py-3 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 text-white text-xs font-black uppercase tracking-[0.3em]"
          >
            Enroll Another Child
          </Link>
        </div>

        <div className="bg-slate-800/60 border border-white/10 rounded-2xl p-5">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Linked Students</p>
              <p className="text-sm text-white">
                {selectedStudent ? selectedStudent.fullName : 'No student selected'}
              </p>
            </div>
            <select
              value={selectedStudentId}
              onChange={(event) => setSelectedStudentId(event.target.value)}
              className="px-4 py-2 bg-slate-900 border border-white/10 rounded-xl text-white text-sm"
            >
              <option value="">Select student</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>{student.fullName}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Attendance Rate', value: `${attendanceRate}%`, icon: Calendar },
            { label: 'Current Level', value: selectedStudent?.level || 'Tajweed', icon: GraduationCap },
            { label: 'Memorization', value: `${selectedStudent?.progress?.memorizedSurahs?.length || 0} Surahs`, icon: CheckCircle },
            { label: 'Behavior & Akhlaq', value: 'Excellent', icon: Shield }
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-slate-800/70 border border-white/10 rounded-2xl p-5">
                <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center mb-4">
                  <Icon className="text-primary-300" size={20} />
                </div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
                <p className="text-2xl font-black text-white mt-2">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-800/70 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-black text-white">Attendance Tracker</h2>
              <span className="text-xs text-slate-400">Last 30 days</span>
            </div>
            {loading ? (
              <p className="text-slate-400 text-sm">Loading attendance...</p>
            ) : attendance.length === 0 ? (
              <p className="text-slate-400 text-sm">No attendance records yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {attendance.map((item) => (
                  <div key={item.id} className="bg-slate-900/60 border border-white/10 rounded-xl p-3">
                    <p className="text-xs text-slate-400">{item.date}</p>
                    <p className="text-sm font-semibold text-white mt-1">{item.status}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-6">
            <h2 className="text-xl font-black text-white mb-4">Monthly Report</h2>
            <div className="space-y-3 text-slate-300">
              <p>Focus: Tajweed articulation + revision.</p>
              <p>Next goal: Complete Surah Al-Ikhlas with perfect Qalqalah.</p>
              <p>Teacher rating: 4.8/5</p>
            </div>
            <button
              className="mt-5 w-full px-4 py-3 bg-primary-500/20 text-primary-200 rounded-xl text-sm font-semibold"
              onClick={() =>
                downloadProgressReportPdf({
                  studentName: selectedStudent?.fullName || 'Student',
                  attendanceRate: `${attendanceRate}%`,
                  progressSummary: reportSummary,
                  notes: reportNotes.length > 0 ? reportNotes : ['Teacher notes will appear here once added.'],
                  issueDate: new Date().toLocaleDateString()
                })
              }
            >
              Download PDF Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <ClipboardList className="text-primary-300" size={20} />
              <h2 className="text-xl font-black text-white">Teacher Feedback Notes</h2>
            </div>
            <div className="space-y-4">
              {feedbackNotes.map((note) => (
                <div key={note.title} className="bg-slate-900/60 border border-white/10 rounded-xl p-4">
                  <p className="text-sm font-semibold text-white">{note.title}</p>
                  <p className="text-xs text-slate-400 mt-2">{note.note}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/70 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="text-primary-300" size={20} />
              <h2 className="text-xl font-black text-white">Behavior & Akhlaq</h2>
            </div>
            <div className="space-y-3 text-slate-300">
              <p>Respectful in class, consistent attendance.</p>
              <p>Shows patience during recitation corrections.</p>
              <p>Encouraged to practice daily adab and duas.</p>
            </div>
            <div className="mt-5 bg-slate-900/60 border border-white/10 rounded-xl p-4">
              <p className="text-xs text-slate-400">Next review in 2 weeks</p>
              <p className="text-white font-semibold mt-1">Overall: Excellent</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentDashboard;
