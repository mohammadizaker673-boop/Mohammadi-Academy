import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { BookOpen, TrendingUp, Award, User, Search, Filter } from 'lucide-react';

interface StudentProgress {
  id: string;
  fullName: string;
  email: string;
  currentCourse: string;
  progress: {
    currentSurah: string;
    currentAyah: number;
    memorizedSurahs: string[];
    completionPercentage: number;
  };
  studentType: 'online' | 'offline';
  enrollmentDate: string;
}

export default function ProgressRecords() {
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'online' | 'offline'>('all');

  useEffect(() => {
    fetchStudentProgress();
  }, []);

  const fetchStudentProgress = async () => {
    try {
      const studentsSnap = await getDocs(collection(db, 'students'));
      const studentsData = studentsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as StudentProgress[];

      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching student progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || student.studentType === filterType;
    return matchesSearch && matchesType;
  });

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-400 bg-green-500/10';
    if (percentage >= 50) return 'text-yellow-400 bg-yellow-500/10';
    return 'text-red-400 bg-red-500/10';
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
        <h1 className="text-4xl font-black text-white mb-2">Student Progress Records</h1>
        <p className="text-white">Track and monitor student learning progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-xl">
              <User className="text-primary-400" size={24} />
            </div>
            <div>
              <p className="text-white text-sm">Total Students</p>
              <p className="text-2xl font-black text-white">{students.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <Award className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-white text-sm">Avg Completion</p>
              <p className="text-2xl font-black text-white">
                {students.length > 0
                  ? Math.round(
                      students.reduce((sum, s) => sum + (s.progress?.completionPercentage || 0), 0) /
                        students.length
                    )
                  : 0}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-500/10 rounded-xl">
              <BookOpen className="text-accent-400" size={24} />
            </div>
            <div>
              <p className="text-white text-sm">Total Surahs Memorized</p>
              <p className="text-2xl font-black text-white">
                {students.reduce((sum, s) => sum + (s.progress?.memorizedSurahs?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-slate-400" size={20} />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as 'all' | 'online' | 'offline')}
              className="px-4 py-3 bg-slate-900 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="all">All Types</option>
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Current Surah</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Memorized</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Completion</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider">Type</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-white">{student.fullName}</p>
                        <p className="text-xs text-slate-400">{student.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{student.currentCourse || 'Not assigned'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <BookOpen className="text-primary-400" size={16} />
                        <p className="text-sm text-white">
                          {student.progress?.currentSurah || 'Not started'}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Award className="text-accent-400" size={16} />
                        <p className="text-sm text-white">
                          {student.progress?.memorizedSurahs?.length || 0} Surahs
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 max-w-[100px]">
                          <div
                            className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all"
                            style={{ width: `${student.progress?.completionPercentage || 0}%` }}
                          ></div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getProgressColor(student.progress?.completionPercentage || 0)}`}>
                          {student.progress?.completionPercentage || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                        student.studentType === 'online'
                          ? 'bg-primary-500/10 text-primary-400'
                          : 'bg-accent-500/10 text-accent-400'
                      }`}>
                        {student.studentType}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <TrendingUp className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-white mb-2">No Students Found</h3>
                    <p className="text-slate-400">
                      {searchTerm ? 'Try adjusting your search or filter' : 'No students have been enrolled yet'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
