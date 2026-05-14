import React, { useState, useEffect } from 'react';
import { getStudents, createAttendanceRecords, getAllAttendance } from '../../services/db';
import { CheckCircle, XCircle, Clock, FileCheck, Users, Download, Search, Calendar, BookOpen, RefreshCw, Save, AlertCircle } from 'lucide-react';
import BackButton from '../../components/BackButton';

interface Student {
  id: string;
  fullName: string;
  email: string;
  photo?: string;
  rollNumber?: string;
  currentCourse?: string;
}

interface AttendanceRecord {
  id?: string;
  date: string;
  courseId: string;
  courseName: string;
  teacherId: string;
  teacherName: string;
  subject: string;
  classType: 'online' | 'offline';
  students: {
    studentId: string;
    studentName: string;
    status: 'present' | 'absent' | 'late' | 'leave';
    notes?: string;
    markedAt?: string;
  }[];
  totalStudents: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  leaveCount: number;
  createdAt?: any;
  updatedAt?: any;
}

export default function Attendance() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [step, setStep] = useState<'select' | 'mark' | 'saved'>('select');
  
  const [classInfo, setClassInfo] = useState({
    courseId: '',
    courseName: '',
    date: new Date().toISOString().split('T')[0],
    subject: '',
    classType: 'offline' as 'online' | 'offline',
    teacherId: 'teacher123', // From auth context
    teacherName: 'Current Teacher', // From auth context
  });

  const [attendance, setAttendance] = useState<{[key: string]: {
    status: 'present' | 'absent' | 'late' | 'leave';
    notes?: string;
  }}>({});

  const [savedRecordId, setSavedRecordId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsData, attendanceData] = await Promise.all([
        getStudents(),
        getAllAttendance(),
      ]);
      setStudents(studentsData as unknown as Student[]);
      setAttendanceRecords(attendanceData as unknown as AttendanceRecord[]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartClass = () => {
    if (!classInfo.courseId || !classInfo.subject) {
      alert('Please select course and enter subject');
      return;
    }

    // Initialize attendance for all students
    const initialAttendance: typeof attendance = {};
    filteredStudents.forEach(student => {
      initialAttendance[student.id] = { status: 'absent' }; // Default to absent
    });
    setAttendance(initialAttendance);
    setStep('mark');
  };

  const handleMarkStatus = (studentId: string, status: 'present' | 'absent' | 'late' | 'leave') => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], status }
    }));
  };

  const handleMarkAll = (status: 'present' | 'absent') => {
    const updatedAttendance: typeof attendance = {};
    filteredStudents.forEach(student => {
      updatedAttendance[student.id] = { status };
    });
    setAttendance(updatedAttendance);
  };

  const handleReset = () => {
    if (confirm('Reset all attendance marks?')) {
      const resetAttendance: typeof attendance = {};
      filteredStudents.forEach(student => {
        resetAttendance[student.id] = { status: 'absent' };
      });
      setAttendance(resetAttendance);
    }
  };

  const handleSaveAttendance = async () => {
    if (Object.keys(attendance).length === 0) {
      alert('No attendance data to save');
      return;
    }

    setSaving(true);
    try {
      const attendanceData: AttendanceRecord = {
        date: classInfo.date,
        courseId: classInfo.courseId,
        courseName: classInfo.courseName,
        teacherId: classInfo.teacherId,
        teacherName: classInfo.teacherName,
        subject: classInfo.subject,
        classType: classInfo.classType,
        students: Object.entries(attendance).map(([studentId, data]) => {
          const student = students.find(s => s.id === studentId);
          const attendanceData = data as { status: 'present' | 'absent' | 'late' | 'leave'; notes?: string };
          return {
            studentId,
            studentName: student?.fullName || '',
            status: attendanceData.status,
            notes: attendanceData.notes,
            markedAt: new Date().toISOString(),
          };
        }),
        totalStudents: Object.keys(attendance).length,
        presentCount: Object.values(attendance).filter((a: any) => a.status === 'present').length,
        absentCount: Object.values(attendance).filter((a: any) => a.status === 'absent').length,
        lateCount: Object.values(attendance).filter((a: any) => a.status === 'late').length,
        leaveCount: Object.values(attendance).filter((a: any) => a.status === 'leave').length,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      if (savedRecordId) {
        // For Supabase we always insert new rows; update not needed for this batch
      }
      const rows = Object.entries(attendance).map(([studentId, data]) => {
        const student = students.find(s => s.id === studentId);
        const att = data as { status: 'present' | 'absent' | 'late' | 'leave'; notes?: string };
        return {
          studentId,
          studentName: student?.fullName || '',
          teacherId: classInfo.teacherId || undefined,
          teacherName: classInfo.teacherName,
          date: classInfo.date,
          status: att.status as 'present' | 'absent' | 'late' | 'excused' | 'leave',
          lessonTopic: classInfo.subject,
          notes: att.notes ?? '',
          courseId: classInfo.courseId,
          courseName: classInfo.courseName,
          classType: classInfo.classType,
        };
      });
      await createAttendanceRecords(rows);
      setSavedRecordId('saved');
      alert('Attendance saved successfully!');

      setStep('saved');
      fetchData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const handleNewClass = () => {
    setStep('select');
    setAttendance({});
    setSavedRecordId(null);
    setClassInfo({
      ...classInfo,
      courseId: '',
      courseName: '',
      subject: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleEditAttendance = () => {
    setStep('mark');
  };

  const handleExportToExcel = () => {
    const rows = filteredStudents.map((student) => {
      const record = attendance[student.id] as { status?: string; notes?: string } | undefined;
      return {
        date: classInfo.date,
        course: classInfo.courseName,
        subject: classInfo.subject,
        studentName: student.fullName,
        rollNumber: student.rollNumber || '',
        email: student.email,
        status: record?.status || 'absent',
        notes: record?.notes || ''
      };
    });

    if (rows.length === 0) {
      alert('No attendance rows available to export.');
      return;
    }

    const escapeCsv = (value: string) => `"${String(value).replace(/"/g, '""')}"`;
    const header = ['Date', 'Course', 'Subject', 'Student Name', 'Roll Number', 'Email', 'Status', 'Notes'];
    const csvLines = [
      header.join(','),
      ...rows.map((row) => [
        row.date,
        row.course,
        row.subject,
        row.studentName,
        row.rollNumber,
        row.email,
        row.status,
        row.notes,
      ].map(escapeCsv).join(','))
    ];

    const csvContent = csvLines.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `attendance-${classInfo.date || 'export'}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const filteredStudents = students.filter(student => {
    if (!classInfo.courseId) return false;
    // Match by course title (courseName) since students store course title in currentCourse field
    // Also check both title and name fields for compatibility
    const matchesCourse = student.currentCourse === classInfo.courseName || 
                         student.currentCourse === courses.find(c => c.id === classInfo.courseId)?.name;
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (student.rollNumber && student.rollNumber.includes(searchTerm));
    return matchesCourse && matchesSearch;
  });

  const getStatusStats = () => {
    const present = Object.values(attendance).filter((a: any) => a.status === 'present').length;
    const absent = Object.values(attendance).filter((a: any) => a.status === 'absent').length;
    const late = Object.values(attendance).filter((a: any) => a.status === 'late').length;
    const leave = Object.values(attendance).filter((a: any) => a.status === 'leave').length;
    return { present, absent, late, leave };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  // Step 1: Select Class
  if (step === 'select') {
    return (
      <div className="space-y-6">
        <BackButton to="/admin" label="← Back to Dashboard" variant="secondary" />
        
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <FileCheck className="text-primary-500" size={32} />
              Attendance System
            </h1>
            <p className="text-white mt-2">Professional daily attendance tracking</p>
          </div>
        </div>

        {/* Class Setup Card */}
        <div className="bg-slate-800 rounded-2xl shadow-lg p-8 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-primary-600" size={40} />
            </div>
            <h2 className="text-2xl font-bold text-white">Open Class for Attendance</h2>
            <p className="text-white mt-2">Select class details to begin marking attendance</p>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Date *</label>
              <input
                type="date"
                value={classInfo.date}
                onChange={(e) => setClassInfo({ ...classInfo, date: e.target.value })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Select Course *</label>
              <select
                value={classInfo.courseId}
                onChange={(e) => {
                  const course = courses.find(c => c.id === e.target.value);
                  console.log('Selected course:', course);
                  setClassInfo({
                    ...classInfo,
                    courseId: e.target.value,
                    courseName: course?.title || course?.name || '',
                  });
                }}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              >
                <option value="">Choose a course</option>
                {courses.filter(course => course.id !== '7imoNeIDNR2MjHvnQS40').map(course => (
                  <option key={course.id} value={course.id}>
                    {course.title || course.name || 'Unnamed Course'}
                  </option>
                ))}
              </select>
              {courses.length === 0 && (
                <p className="text-red-400 text-sm mt-2">No courses found. Please create courses first.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Subject/Topic *</label>
              <input
                type="text"
                value={classInfo.subject}
                onChange={(e) => setClassInfo({ ...classInfo, subject: e.target.value })}
                placeholder="e.g., Surah Al-Fatiha - Tajweed Rules"
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">Class Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={classInfo.classType === 'offline'}
                    onChange={() => setClassInfo({ ...classInfo, classType: 'offline' })}
                    className="w-4 h-4 accent-sky-500"
                  />
                  <span className="text-white font-medium">Offline Class</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={classInfo.classType === 'online'}
                    onChange={() => setClassInfo({ ...classInfo, classType: 'online' })}
                    className="w-4 h-4 accent-sky-500"
                  />
                  <span className="text-white font-medium">Online Class</span>
                </label>
              </div>
            </div>

            {classInfo.courseId && (
              <div className="bg-sky-50 rounded-lg p-4 border border-sky-200">
                <p className="text-sm font-semibold text-white">Students in this class:</p>
                <p className="text-3xl font-bold text-primary-600 mt-2">
                  {students.filter(s => s.currentCourse === classInfo.courseName).length}
                </p>
              </div>
            )}

            <button
              onClick={handleStartClass}
              className="w-full px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold text-lg"
            >
              Start Taking Attendance
            </button>
          </div>
        </div>

        {/* Recent Attendance Records */}
        <div className="bg-slate-800 rounded-xl shadow p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Attendance Records</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Course</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Present</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-white uppercase">Absent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {attendanceRecords.slice(0, 10).map(record => (
                  <tr key={record.id} className="hover:bg-slate-900 text-white">
                    <td className="px-4 py-3 text-sm text-white">{record.date}</td>
                    <td className="px-4 py-3 text-sm text-white">{record.courseName}</td>
                    <td className="px-4 py-3 text-sm text-white">{record.subject}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-white">{record.totalStudents}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-semibold">{record.presentCount}</td>
                    <td className="px-4 py-3 text-sm text-red-600 font-semibold">{record.absentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Mark Attendance
  if (step === 'mark') {
    const stats = getStatusStats();
    
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-slate-800 rounded-xl shadow p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{classInfo.courseName}</h1>
              <p className="text-white mt-1">
                {classInfo.subject} • {classInfo.date} • {classInfo.classType.toUpperCase()}
              </p>
            </div>
            <button
              onClick={() => setStep('select')}
              className="px-4 py-2 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition text-white text-white text-white"
            >
              Change Class
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-slate-900 rounded-lg p-4 text-white">
              <p className="text-sm text-white">Total Students</p>
              <p className="text-2xl font-bold text-white">{filteredStudents.length}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600">Present</p>
              <p className="text-2xl font-bold text-green-700">{stats.present}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4">
              <p className="text-sm text-red-600">Absent</p>
              <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4">
              <p className="text-sm text-yellow-600">Late</p>
              <p className="text-2xl font-bold text-yellow-700">{stats.late}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600">Leave</p>
              <p className="text-2xl font-bold text-blue-700">{stats.leave}</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-800 rounded-xl shadow p-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleMarkAll('present')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              <CheckCircle size={18} />
              Mark All Present
            </button>
            <button
              onClick={() => handleMarkAll('absent')}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
            >
              <XCircle size={18} />
              Mark All Absent
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition text-white text-white text-white"
            >
              <RefreshCw size={18} />
              Reset
            </button>
            <div className="flex-1 relative ml-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white" size={18} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student..."
                className="w-full pl-10 pr-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              />
            </div>
          </div>
        </div>

        {/* Student List */}
        <div className="bg-slate-800 rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Roll No</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-white uppercase">Email</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase">Mark Attendance</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-white uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredStudents.map((student, index) => {
                  const status = attendance[student.id]?.status || 'absent';
                  return (
                    <tr key={student.id} className="hover:bg-slate-900 text-white">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-white">{student.fullName}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white">{student.rollNumber || '-'}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-white">{student.email}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleMarkStatus(student.id, 'present')}
                            className={`p-2 rounded-lg transition ${
                              status === 'present'
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-white hover:bg-green-100 hover:text-green-600'
                            }`}
                            title="Present"
                          >
                            <CheckCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleMarkStatus(student.id, 'absent')}
                            className={`p-2 rounded-lg transition ${
                              status === 'absent'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-100 text-white hover:bg-red-100 hover:text-red-600'
                            }`}
                            title="Absent"
                          >
                            <XCircle size={20} />
                          </button>
                          <button
                            onClick={() => handleMarkStatus(student.id, 'late')}
                            className={`p-2 rounded-lg transition ${
                              status === 'late'
                                ? 'bg-yellow-500 text-white'
                                : 'bg-gray-100 text-white hover:bg-yellow-100 hover:text-yellow-600'
                            }`}
                            title="Late"
                          >
                            <Clock size={20} />
                          </button>
                          <button
                            onClick={() => handleMarkStatus(student.id, 'leave')}
                            className={`p-2 rounded-lg transition ${
                              status === 'leave'
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 text-white hover:bg-blue-100 hover:text-blue-600'
                            }`}
                            title="Leave Approved"
                          >
                            <FileCheck size={20} />
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            status === 'present' ? 'bg-green-100 text-green-700' :
                            status === 'absent' ? 'bg-red-100 text-red-700' :
                            status === 'late' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {status.toUpperCase()}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="bg-slate-800 rounded-xl shadow p-6">
          <div className="flex gap-4">
            <button
              onClick={handleSaveAttendance}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold text-lg disabled:opacity-50"
            >
              <Save size={24} />
              {saving ? 'Saving...' : savedRecordId ? 'Update Attendance' : 'Save Attendance'}
            </button>
            <button
              onClick={() => setStep('select')}
              className="px-6 py-4 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition font-semibold text-white text-white text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Saved Confirmation
  if (step === 'saved') {
    const stats = getStatusStats();
    
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-slate-800 rounded-2xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-green-600" size={40} />
            </div>
            <h2 className="text-3xl font-bold text-white">Attendance Saved Successfully!</h2>
            <p className="text-white mt-2">Daily attendance record has been created</p>
          </div>

          {/* Attendance Summary */}
          <div className="bg-slate-900 rounded-xl p-6 mb-6 text-white">
            <h3 className="font-bold text-white mb-4">Attendance Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-white">Date:</span>
                <span className="font-semibold text-white">{classInfo.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Course:</span>
                <span className="font-semibold text-white">{classInfo.courseName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Subject:</span>
                <span className="font-semibold text-white">{classInfo.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white">Class Type:</span>
                <span className="font-semibold text-white">{classInfo.classType.toUpperCase()}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-sm text-green-600 mb-1">Present</p>
              <p className="text-3xl font-bold text-green-700">{stats.present}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <p className="text-sm text-red-600 mb-1">Absent</p>
              <p className="text-3xl font-bold text-red-700">{stats.absent}</p>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <p className="text-sm text-yellow-600 mb-1">Late</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.late}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-600 mb-1">Leave</p>
              <p className="text-3xl font-bold text-blue-700">{stats.leave}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleEditAttendance}
              className="w-full px-6 py-3 border border-primary-500 text-primary-600 rounded-lg hover:bg-sky-50 transition font-semibold"
            >
              Edit Attendance
            </button>
            <button
              onClick={handleNewClass}
              className="w-full px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold"
            >
              Take Attendance for Another Class
            </button>
            <button
              onClick={handleExportToExcel}
              className="w-full px-6 py-3 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition font-semibold flex items-center justify-center gap-2 text-white text-white text-white"
            >
              <Download size={20} />
              Export to Excel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
