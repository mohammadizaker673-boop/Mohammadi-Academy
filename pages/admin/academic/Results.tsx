import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Award, TrendingUp, TrendingDown, Users, BookOpen, Filter, Search } from 'lucide-react';

interface Result {
  id: string;
  studentId: string;
  studentName: string;
  examId: string;
  examTitle: string;
  course: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'pass' | 'fail';
  submittedAt: string;
}

export default function Results() {
  const [results, setResults] = useState<Result[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExam, setFilterExam] = useState('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pass' | 'fail'>('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resultsSnap, examsSnap] = await Promise.all([
        getDocs(collection(db, 'results')),
        getDocs(collection(db, 'exams')),
      ]);

      setResults(
        resultsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Result[]
      );

      setExams(examsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGrade = (percentage: number): string => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B';
    if (percentage >= 60) return 'C';
    if (percentage >= 50) return 'D';
    return 'F';
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch =
      result.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = filterExam === 'all' || result.examId === filterExam;
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    return matchesSearch && matchesExam && matchesStatus;
  });

  const getStats = () => {
    const totalStudents = new Set(results.map((r) => r.studentId)).size;
    const passCount = results.filter((r) => r.status === 'pass').length;
    const avgPercentage =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.percentage, 0) / results.length)
        : 0;
    return { totalStudents, passCount, avgPercentage, totalResults: results.length };
  };

  const stats = getStats();

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
        <h1 className="text-4xl font-black text-white mb-2">Exam Results</h1>
        <p className="text-white">View and analyze student performance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-500/10 rounded-xl">
              <Users className="text-primary-400" size={24} />
            </div>
            <div>
              <p className="text-white text-sm">Students Tested</p>
              <p className="text-2xl font-black text-white">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <TrendingUp className="text-green-400" size={24} />
            </div>
            <div>
              <p className="text-white text-sm">Pass Rate</p>
              <p className="text-2xl font-black text-white">
                {stats.totalResults > 0 ? Math.round((stats.passCount / stats.totalResults) * 100) : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent-500/10 rounded-xl">
              <Award className="text-accent-400" size={24} />
            </div>
            <div>
              <p className="text-white text-sm">Avg Score</p>
              <p className="text-2xl font-black text-white">{stats.avgPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-xl">
              <BookOpen className="text-orange-400" size={24} />
            </div>
            <div>
              <p className="text-white text-sm">Total Results</p>
              <p className="text-2xl font-black text-white">{stats.totalResults}</p>
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
              placeholder="Search by student or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="px-4 py-3 bg-slate-900 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Exams</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as 'all' | 'pass' | 'fail')}
            className="px-4 py-3 bg-slate-900 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Student</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Exam</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Course</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Marks</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Percentage</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Grade</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <tr key={result.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-white">{result.studentName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{result.examTitle}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{result.course}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {result.marksObtained}/{result.totalMarks}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2 max-w-[80px]">
                          <div
                            className={`h-2 rounded-full ${
                              result.percentage >= 50
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500'
                                : 'bg-gradient-to-r from-red-500 to-orange-500'
                            }`}
                            style={{ width: `${result.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-white">{result.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.grade === 'A+' || result.grade === 'A'
                            ? 'bg-green-500/10 text-green-400'
                            : result.grade === 'B' || result.grade === 'C'
                            ? 'bg-yellow-500/10 text-yellow-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {result.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.status === 'pass'
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        {result.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-400">
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <Award className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-white mb-2">No Results Found</h3>
                    <p className="text-slate-400">
                      {searchTerm || filterExam !== 'all' || filterStatus !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Results will appear here once exams are completed'}
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
