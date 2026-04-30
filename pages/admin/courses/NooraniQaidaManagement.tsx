import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Users, BarChart3, Download, Upload, Eye } from 'lucide-react';

interface CourseLesson {
  id: string;
  title: string;
  section: string;
  order: number;
  estimatedTime: number;
  completionRate: number;
  studentCount: number;
  avgQuizScore: number;
}

const AdminNooraniQaidaManagement: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState('all');
  const [lessons, setLessons] = useState<CourseLesson[]>([
    {
      id: 'nq-l1',
      title: 'Arabic Alphabet (Single Letters)',
      section: 'Noorani Qaida',
      order: 1,
      estimatedTime: 15,
      completionRate: 85,
      studentCount: 24,
      avgQuizScore: 78
    },
    {
      id: 'nq-l2',
      title: 'Harakat (Vowel Marks)',
      section: 'Noorani Qaida',
      order: 2,
      estimatedTime: 12,
      completionRate: 72,
      studentCount: 18,
      avgQuizScore: 75
    },
    {
      id: 'tj-l1',
      title: 'Makharij (Articulation Points)',
      section: 'Tajweed',
      order: 1,
      estimatedTime: 18,
      completionRate: 45,
      studentCount: 12,
      avgQuizScore: 68
    },
    {
      id: 'sl-l1',
      title: 'Importance of Salah',
      section: 'Salah',
      order: 1,
      estimatedTime: 10,
      completionRate: 92,
      studentCount: 28,
      avgQuizScore: 85
    }
  ]);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<CourseLesson | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    section: 'Noorani Qaida',
    estimatedTime: 15,
    description: '',
    videoUrl: '',
    audioUrl: '',
    pdfUrl: ''
  });

  const sections = ['all', 'Noorani Qaida', 'Tajweed', 'Salah'];
  const filteredLessons = selectedSection === 'all' ? lessons : lessons.filter(l => l.section === selectedSection);

  const handleAddLesson = () => {
    if (!formData.title) {
      alert('Please enter lesson title');
      return;
    }

    if (editingLesson) {
      setLessons(lessons.map(l => l.id === editingLesson.id ? { ...editingLesson, ...formData as any } : l));
    } else {
      const newLesson: CourseLesson = {
        id: `lesson-${Date.now()}`,
        title: formData.title,
        section: formData.section,
        order: lessons.filter(l => l.section === formData.section).length + 1,
        estimatedTime: formData.estimatedTime,
        completionRate: 0,
        studentCount: 0,
        avgQuizScore: 0
      };
      setLessons([...lessons, newLesson]);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: '',
      section: 'Noorani Qaida',
      estimatedTime: 15,
      description: '',
      videoUrl: '',
      audioUrl: '',
      pdfUrl: ''
    });
    setEditingLesson(null);
    setShowAddLesson(false);
  };

  const handleEditLesson = (lesson: CourseLesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      section: lesson.section,
      estimatedTime: lesson.estimatedTime,
      description: '',
      videoUrl: '',
      audioUrl: '',
      pdfUrl: ''
    });
    setShowAddLesson(true);
  };

  const handleDeleteLesson = (id: string) => {
    if (confirm('Are you sure you want to delete this lesson?')) {
      setLessons(lessons.filter(l => l.id !== id));
    }
  };

  const stats = {
    totalEnrollments: 82,
    completionRate: Math.round(lessons.reduce((sum, l) => sum + l.completionRate, 0) / lessons.length),
    avgQuizScore: Math.round(lessons.reduce((sum, l) => sum + l.avgQuizScore, 0) / lessons.length),
    totalStudents: lessons.reduce((sum, l) => sum + l.studentCount, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black text-white mb-2">Noorani Qaida Course Management</h1>
          <p className="text-white">Manage lessons, track progress, and update content</p>
        </div>
        <button
          onClick={() => setShowAddLesson(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all"
        >
          <Plus size={20} />
          Add Lesson
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Total Enrollments</p>
              <p className="text-3xl font-black text-white">{stats.totalEnrollments}</p>
            </div>
            <Users className="text-primary-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Completion Rate</p>
              <p className="text-3xl font-black text-green-400">{stats.completionRate}%</p>
            </div>
            <BarChart3 className="text-green-400" size={32} />
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Avg Quiz Score</p>
              <p className="text-3xl font-black text-accent-400">{stats.avgQuizScore}%</p>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-400">Active Students</p>
              <p className="text-3xl font-black text-blue-400">{stats.totalStudents}</p>
            </div>
            <Eye className="text-blue-400" size={32} />
          </div>
        </div>
      </div>

      {/* Section Filter */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl p-4">
        <p className="text-white font-bold mb-3">Filter by Section</p>
        <div className="flex flex-wrap gap-2">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setSelectedSection(section)}
              className={`px-4 py-2 rounded-lg font-bold transition ${
                selectedSection === section
                  ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              {section === 'all' ? 'All Sections' : section}
            </button>
          ))}
        </div>
      </div>

      {/* Lessons Table */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Lesson Title</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Section</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Duration</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Students</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Completion</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Avg Score</th>
                <th className="px-6 py-4 text-left text-xs font-black text-white uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLessons.map(lesson => (
                <tr key={lesson.id} className="hover:bg-white/5 transition">
                  <td className="px-6 py-4">
                    <p className="font-bold text-white">{lesson.title}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-xs font-bold">
                      {lesson.section}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-200">{lesson.estimatedTime} min</td>
                  <td className="px-6 py-4 text-sm text-slate-200">{lesson.studentCount}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${lesson.completionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-slate-200 font-bold">{lesson.completionRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-accent-400">{lesson.avgQuizScore}%</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEditLesson(lesson)}
                        className="p-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson.id)}
                        className="p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Lesson Modal */}
      {showAddLesson && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl p-8 max-w-2xl w-full max-h-96 overflow-y-auto">
            <h2 className="text-2xl font-black text-white mb-6">
              {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">Lesson Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  placeholder="e.g., Arabic Alphabet"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Section *</label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                >
                  <option value="Noorani Qaida">Noorani Qaida</option>
                  <option value="Tajweed">Tajweed</option>
                  <option value="Salah">Salah</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Estimated Time (minutes)</label>
                <input
                  type="number"
                  value={formData.estimatedTime}
                  onChange={(e) => setFormData({ ...formData, estimatedTime: parseInt(e.target.value) })}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:outline-none focus:border-primary-500/50"
                  placeholder="Brief lesson description"
                ></textarea>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Video URL</label>
                  <input
                    type="text"
                    value={formData.videoUrl}
                    onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500/50"
                    placeholder="YouTube link"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Audio URL</label>
                  <input
                    type="text"
                    value={formData.audioUrl}
                    onChange={(e) => setFormData({ ...formData, audioUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500/50"
                    placeholder="Audio file link"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-white mb-2">PDF URL</label>
                  <input
                    type="text"
                    value={formData.pdfUrl}
                    onChange={(e) => setFormData({ ...formData, pdfUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-primary-500/50"
                    placeholder="PDF file link"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={handleAddLesson}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-xl hover:from-primary-400 hover:to-accent-400 transition-all"
              >
                {editingLesson ? 'Update Lesson' : 'Add Lesson'}
              </button>
              <button
                onClick={resetForm}
                className="flex-1 px-6 py-3 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminNooraniQaidaManagement;
