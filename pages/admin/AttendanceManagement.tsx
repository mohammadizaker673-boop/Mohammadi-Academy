import React, { useEffect, useState } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, where, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { AttendanceRecord, AttendanceStatus } from '../../types/attendance.types';
import { Calendar, Search, Filter, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';

const AttendanceManagement: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [filteredAttendance, setFilteredAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState<AttendanceStatus | 'all'>('all');

  useEffect(() => {
    fetchAttendance();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterDate, filterStatus, attendance]);

  const fetchAttendance = async () => {
    try {
      const attendanceQuery = query(collection(db, 'attendance'), orderBy('date', 'desc'));
      const snapshot = await getDocs(attendanceQuery);
      const attendanceData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as AttendanceRecord[];
      setAttendance(attendanceData);
      setFilteredAttendance(attendanceData);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...attendance];

    if (searchTerm) {
      filtered = filtered.filter(record =>
        record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.teacherName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterDate) {
      filtered = filtered.filter(record => record.date === filterDate);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(record => record.status === filterStatus);
    }

    setFilteredAttendance(filtered);
  };

  const getStatusIcon = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'absent':
        return <XCircle className="text-red-400" size={20} />;
      case 'late':
        return <Clock className="text-orange-400" size={20} />;
      case 'excused':
        return <AlertCircle className="text-blue-400" size={20} />;
    }
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    const styles = {
      present: 'bg-green-500/10 text-green-400 border-green-500/20',
      absent: 'bg-red-500/10 text-red-400 border-red-500/20',
      late: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      excused: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${styles[status]}`}>
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const stats = {
    total: attendance.length,
    present: attendance.filter(r => r.status === 'present').length,
    absent: attendance.filter(r => r.status === 'absent').length,
    late: attendance.filter(r => r.status === 'late').length,
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
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black text-white mb-2">Attendance Management</h1>
        <p className="text-white">Track and manage student attendance records</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Total Records</p>
              <p className="text-2xl font-black text-white">{stats.total}</p>
            </div>
            <Calendar className="text-primary-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Present</p>
              <p className="text-2xl font-black text-green-400">{stats.present}</p>
            </div>
            <CheckCircle className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Absent</p>
              <p className="text-2xl font-black text-red-400">{stats.absent}</p>
            </div>
            <XCircle className="text-red-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white">Late</p>
              <p className="text-2xl font-black text-orange-400">{stats.late}</p>
            </div>
            <Clock className="text-orange-400" size={32} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white" size={20} />
          <input
            type="text"
            placeholder="Search by student or teacher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-primary-500/50"
          />
        </div>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
          className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as AttendanceStatus | 'all')}
          className="px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
        >
          <option value="all">All Status</option>
          <option value="present">Present</option>
          <option value="absent">Absent</option>
          <option value="late">Late</option>
          <option value="excused">Excused</option>
        </select>
      </div>

      {/* Attendance Table */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Student</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Teacher</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Lesson Topic</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <Calendar className="mx-auto text-white mb-4" size={48} />
                    <p className="text-white">No attendance records found</p>
                  </td>
                </tr>
              ) : (
                filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{new Date(record.date).toLocaleDateString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-white">{record.studentName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{record.teacherName}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{record.lessonTopic || '-'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{record.notes || '-'}</p>
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

export default AttendanceManagement;
