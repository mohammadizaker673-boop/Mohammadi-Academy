import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Calendar, CheckCircle, XCircle, Clock, FileCheck, TrendingUp, AlertCircle, Download } from 'lucide-react';

interface AttendanceRecord {
  id: string;
  date: string;
  courseName: string;
  subject: string;
  status: 'present' | 'absent' | 'late' | 'leave';
  markedAt?: string;
}

export default function MyAttendance() {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Mock student ID - should come from auth context
  const studentId = 'current-student-id';

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    try {
      const attendanceSnap = await getDocs(collection(db, 'attendance'));
      
      const records: AttendanceRecord[] = [];
      attendanceSnap.docs.forEach(doc => {
        const data = doc.data();
        const studentRecord = data.students?.find((s: any) => s.studentId === studentId);
        
        if (studentRecord) {
          records.push({
            id: doc.id,
            date: data.date,
            courseName: data.courseName,
            subject: data.subject,
            status: studentRecord.status,
            markedAt: studentRecord.markedAt,
          });
        }
      });

      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthRecords = () => {
    return attendanceRecords.filter(record => {
      const date = new Date(record.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });
  };

  const getStats = () => {
    const monthRecords = getMonthRecords();
    const total = monthRecords.length;
    const present = monthRecords.filter(r => r.status === 'present').length;
    const absent = monthRecords.filter(r => r.status === 'absent').length;
    const late = monthRecords.filter(r => r.status === 'late').length;
    const leave = monthRecords.filter(r => r.status === 'leave').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, leave, percentage };
  };

  const getTodayStatus = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.find(r => r.date === today);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present': return <CheckCircle className="text-green-600" size={20} />;
      case 'absent': return <XCircle className="text-red-600" size={20} />;
      case 'late': return <Clock className="text-yellow-600" size={20} />;
      case 'leave': return <FileCheck className="text-blue-600" size={20} />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'present': 'bg-green-100 text-green-700',
      'absent': 'bg-red-100 text-red-700',
      'late': 'bg-yellow-100 text-yellow-700',
      'leave': 'bg-blue-100 text-blue-700',
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-700';
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  const stats = getStats();
  const todayStatus = getTodayStatus();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="text-primary-500" size={32} />
          My Attendance
        </h1>
        <p className="text-gray-600 mt-2">Track your class attendance and performance</p>
      </div>

      {/* Today's Status */}
      {todayStatus ? (
        <div className={`rounded-xl p-6 border-2 ${
          todayStatus.status === 'present' ? 'bg-green-50 border-green-200' :
          todayStatus.status === 'absent' ? 'bg-red-50 border-red-200' :
          todayStatus.status === 'late' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
              {getStatusIcon(todayStatus.status)}
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900">Today's Status</h3>
              <p className="text-gray-600">{todayStatus.courseName} - {todayStatus.subject}</p>
            </div>
            <span className={`px-4 py-2 rounded-lg text-lg font-bold ${getStatusBadge(todayStatus.status)}`}>
              {todayStatus.status.toUpperCase()}
            </span>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-gray-400" size={40} />
            <div>
              <h3 className="text-lg font-bold text-gray-900">No Class Today</h3>
              <p className="text-gray-600">Your attendance has not been marked yet</p>
            </div>
          </div>
        </div>
      )}

      {/* Month Selector */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex gap-4">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-gray-900"
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index}>{month}</option>
            ))}
          </select>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 text-gray-900"
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-sm text-gray-600 mb-2">Total Classes</p>
          <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-green-50 rounded-xl shadow p-6">
          <p className="text-sm text-green-600 mb-2">Present</p>
          <p className="text-3xl font-bold text-green-700">{stats.present}</p>
        </div>
        <div className="bg-red-50 rounded-xl shadow p-6">
          <p className="text-sm text-red-600 mb-2">Absent</p>
          <p className="text-3xl font-bold text-red-700">{stats.absent}</p>
        </div>
        <div className="bg-yellow-50 rounded-xl shadow p-6">
          <p className="text-sm text-yellow-600 mb-2">Late</p>
          <p className="text-3xl font-bold text-yellow-700">{stats.late}</p>
        </div>
        <div className="bg-blue-50 rounded-xl shadow p-6">
          <p className="text-sm text-blue-600 mb-2">Leave</p>
          <p className="text-3xl font-bold text-blue-700">{stats.leave}</p>
        </div>
        <div className={`rounded-xl shadow p-6 ${
          stats.percentage >= 75 ? 'bg-green-50' :
          stats.percentage >= 50 ? 'bg-yellow-50' :
          'bg-red-50'
        }`}>
          <p className={`text-sm mb-2 ${
            stats.percentage >= 75 ? 'text-green-600' :
            stats.percentage >= 50 ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            Attendance %
          </p>
          <p className={`text-3xl font-bold ${
            stats.percentage >= 75 ? 'text-green-700' :
            stats.percentage >= 50 ? 'text-yellow-700' :
            'text-red-700'
          }`}>
            {stats.percentage}%
          </p>
        </div>
      </div>

      {/* Attendance Alert */}
      {stats.percentage < 75 && stats.total > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="text-red-600 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-red-900 mb-1">Low Attendance Warning</h3>
              <p className="text-red-700 text-sm">
                Your attendance is {stats.percentage}%. Minimum required is 75%. 
                Please attend regularly to maintain good standing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900">
            Attendance History - {monthNames[selectedMonth]} {selectedYear}
          </h3>
        </div>
        
        {getMonthRecords().length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subject</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Marked At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {getMonthRecords().map(record => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className="font-medium text-gray-900">
                        {new Date(record.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{record.courseName}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-600 text-sm">{record.subject}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${getStatusBadge(record.status)}`}>
                          {getStatusIcon(record.status)}
                          {record.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {record.markedAt ? new Date(record.markedAt).toLocaleTimeString('en-US', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Calendar className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Attendance Records</h3>
            <p className="text-gray-600">No attendance has been marked for this month</p>
          </div>
        )}
      </div>

      {/* Performance Insight */}
      {stats.total > 0 && (
        <div className="bg-gradient-to-r from-sky-50 to-blue-50 rounded-xl p-6 border border-sky-200">
          <div className="flex items-start gap-4">
            <TrendingUp className="text-primary-600 mt-1" size={24} />
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Performance Insight</h3>
              <p className="text-gray-700 text-sm">
                You attended <strong>{stats.present} out of {stats.total}</strong> classes this month.
                {stats.percentage >= 75 ? (
                  <span className="text-green-600"> Great job! Keep it up! 🎉</span>
                ) : stats.percentage >= 50 ? (
                  <span className="text-yellow-600"> Try to improve your attendance. 💪</span>
                ) : (
                  <span className="text-red-600"> Your attendance needs immediate attention. ⚠️</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
