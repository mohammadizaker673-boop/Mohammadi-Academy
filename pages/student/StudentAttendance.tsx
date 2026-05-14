import React, { useEffect, useState } from 'react';
import { getStudentByUserId, getAttendanceByStudentId } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceRecord } from '../../types/attendance.types';
import { CheckCircle, XCircle, Clock, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import BackButton from '../../components/BackButton';

const StudentAttendance: React.FC = () => {
  const { user } = useAuth();
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [studentId, setStudentId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchStudentIdAndAttendance();
  }, [user]);

  const fetchStudentIdAndAttendance = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const studentRecord = await getStudentByUserId(user.uid);
      if (studentRecord) {
        setStudentId(studentRecord.id);
        const records = await getAttendanceByStudentId(studentRecord.id);
        setAttendance(records);
      }
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'absent':
        return <XCircle className="text-red-400" size={20} />;
      case 'late':
        return <Clock className="text-orange-400" size={20} />;
      case 'excused':
        return <AlertCircle className="text-blue-400" size={20} />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-500/20 text-green-400 border-green-500/30',
      absent: 'bg-red-500/20 text-red-400 border-red-500/30',
      late: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      excused: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    };
    return styles[status as keyof typeof styles] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const filteredAttendance = dateFilter
    ? attendance.filter(record => record.date === dateFilter)
    : attendance;

  const stats = {
    total: attendance.length,
    present: attendance.filter(r => r.status === 'present').length,
    absent: attendance.filter(r => r.status === 'absent').length,
    late: attendance.filter(r => r.status === 'late').length,
  };

  const attendanceRate = stats.total > 0 ? ((stats.present + stats.late) / stats.total * 100).toFixed(1) : 0;

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">My Attendance</h1>
          <p className="text-slate-400">View your attendance history</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
            {attendanceRate}%
          </div>
          <div className="text-sm text-slate-400">Attendance Rate</div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm mb-1">Total Classes</p>
              <p className="text-3xl font-black text-white">{stats.total}</p>
            </div>
            <CalendarIcon className="text-slate-600" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-600/10 backdrop-blur-xl border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm mb-1">Present</p>
              <p className="text-3xl font-black text-white">{stats.present}</p>
            </div>
            <CheckCircle className="text-green-500" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 backdrop-blur-xl border border-red-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm mb-1">Absent</p>
              <p className="text-3xl font-black text-white">{stats.absent}</p>
            </div>
            <XCircle className="text-red-500" size={40} />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm mb-1">Late</p>
              <p className="text-3xl font-black text-white">{stats.late}</p>
            </div>
            <Clock className="text-orange-500" size={40} />
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-4">
          <label className="text-white font-bold">Filter by Date:</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Attendance History */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Attendance History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Teacher</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Lesson Topic</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No attendance records found.
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {record.teacherName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(record.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(record.status)}`}>
                          {record.status.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {record.lessonTopic || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {record.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
