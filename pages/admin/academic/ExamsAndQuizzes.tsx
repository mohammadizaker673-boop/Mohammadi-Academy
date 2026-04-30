import React, { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Plus, Edit2, Trash2, Clock, FileText, Users, BookOpen, Search } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  course: string;
  type: 'exam' | 'quiz';
  totalMarks: number;
  passingMarks: number;
  duration: number; // in minutes
  date: string;
  status: 'scheduled' | 'ongoing' | 'completed';
  createdAt: string;
}

export default function ExamsAndQuizzes() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'exam' | 'quiz'>('all');
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    type: 'exam' as 'exam' | 'quiz',
    totalMarks: 100,
    passingMarks: 40,
    duration: 60,
    date: '',
    status: 'scheduled' as 'scheduled' | 'ongoing' | 'completed',
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const examsSnap = await getDocs(collection(db, 'exams'));
      const examsData = examsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Exam[];
      setExams(examsData);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExam) {
        await updateDoc(doc(db, 'exams', editingExam.id), {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'exams'), {
          ...formData,
          createdAt: new Date().toISOString(),
        });
      }
      resetForm();
      fetchExams();
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Error saving exam. Please try again.');
    }
  };

  const handleEdit = (exam: Exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title,
      course: exam.course,
      type: exam.type,
      totalMarks: exam.totalMarks,
      passingMarks: exam.passingMarks,
      duration: exam.duration,
      date: exam.date,
      status: exam.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;
    try {
      await deleteDoc(doc(db, 'exams', id));
      fetchExams();
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      course: '',
      type: 'exam',
      totalMarks: 100,
      passingMarks: 40,
      duration: 60,
      date: '',
      status: 'scheduled',
    });
    setEditingExam(null);
    setShowModal(false);
  };

  const filteredExams = exams.filter((exam) => {
    const matchesSearch =
      exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exam.course.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || exam.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/10 text-blue-400';
      case 'ongoing':
        return 'bg-yellow-500/10 text-yellow-400';
      case 'completed':
        return 'bg-green-500/10 text-green-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Exams & Quizzes</h1>
          <p className="text-white">{exams.length} total assessments</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg"
        >
          <Plus size={20} />
          Create Assessment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input
              type="text"
              placeholder="Search exams or quizzes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as 'all' | 'exam' | 'quiz')}
            className="px-4 py-3 bg-slate-900 text-white border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Types</option>
            <option value="exam">Exams</option>
            <option value="quiz">Quizzes</option>
          </select>
        </div>
      </div>

      {/* Exams List */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Title</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Course</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Type</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Marks</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Date</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Status</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredExams.length > 0 ? (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="text-primary-400" size={16} />
                        <p className="text-sm font-bold text-white">{exam.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">{exam.course}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          exam.type === 'exam'
                            ? 'bg-accent-500/10 text-accent-400'
                            : 'bg-primary-500/10 text-primary-400'
                        }`}
                      >
                        {exam.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {exam.totalMarks} ({exam.passingMarks} to pass)
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Clock className="text-slate-400" size={14} />
                        <p className="text-sm text-white">{exam.duration} min</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-white">
                        {new Date(exam.date).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(exam.status)}`}>
                        {exam.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(exam)}
                          className="p-2 hover:bg-primary-500/10 text-primary-400 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <FileText className="mx-auto text-slate-600 mb-4" size={48} />
                    <h3 className="text-lg font-semibold text-white mb-2">No Assessments Found</h3>
                    <p className="text-slate-400">Create your first exam or quiz to get started</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-slate-800 to-slate-900 border-b border-white/10 p-6 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">
                {editingExam ? 'Edit Assessment' : 'Create New Assessment'}
              </h2>
              <button onClick={resetForm} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                <Edit2 className="text-white" size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-white mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                    placeholder="e.g., Surah Al-Baqarah Quiz"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Course *</label>
                  <input
                    type="text"
                    required
                    value={formData.course}
                    onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                    placeholder="e.g., Quran Memorization"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'exam' | 'quiz' })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  >
                    <option value="exam">Exam</option>
                    <option value="quiz">Quiz</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Total Marks *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.totalMarks}
                    onChange={(e) => setFormData({ ...formData, totalMarks: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Passing Marks *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData({ ...formData, passingMarks: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Duration (minutes) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Status *</label>
                  <select
                    required
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as 'scheduled' | 'ongoing' | 'completed',
                      })
                    }
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white rounded-xl font-bold transition-all shadow-lg"
                >
                  {editingExam ? 'Update' : 'Create'} Assessment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
