import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, ChevronUp, ChevronDown, Video, FileText, Music, Save, X } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import FileUploader from '../../../components/admin/FileUploader';
import MediaPicker from '../../../components/admin/MediaPicker';

interface Lesson {
  id: string;
  courseId: string;
  title: string;
  lessonNumber: number;
  content: string;
  videoUrl?: string;
  pdfUrl?: string;
  audioUrl?: string;
  homework?: string;
  quiz?: string;
  orderIndex: number;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

const PREDEFINED_COURSES = [
  { id: 'quran-tajweed', name: 'Quran with Tajweed' },
  { id: 'noorani-qaida', name: 'Noorani Qaida & Prayer' },
  { id: 'hifz-quran', name: 'Hifz-ul-Quran' },
  { id: 'quran-tafsir', name: 'Quran Translation & Tafsir' },
  { id: 'arabic-language', name: 'Arabic Language Course' },
  { id: 'islamic-studies', name: 'Islamic Studies & Fiqh' },
  { id: 'kids-general-knowledge', name: 'General Knowledge for Kids' },
  { id: 'kids-manners-character', name: 'Manners & Character (Kids)' },
  { id: 'preteens-math-for-life', name: 'Math for Life' },
  { id: 'preteens-digital-basics', name: 'Digital Basics & Online Safety' },
  { id: 'youth-career-awareness', name: 'Career Awareness & CV Basics' },
  { id: 'youth-financial-literacy', name: 'Financial Literacy (Halal Income)' },
  { id: 'adult-small-business', name: 'Small Business Basics' },
  { id: 'adult-agriculture-basics', name: 'Agriculture & Livestock Basics' },
  { id: 'adult-family-health', name: 'Family Health & First Aid' }
];

export default function LessonsManager() {
  const [selectedCourse, setSelectedCourse] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [showMediaPicker, setShowMediaPicker] = useState<{ type: 'video' | 'pdf' | 'audio' | null }>({ type: null });

  const [formData, setFormData] = useState({
    title: '',
    lessonNumber: 1,
    content: '',
    videoUrl: '',
    pdfUrl: '',
    audioUrl: '',
    homework: '',
    quiz: '',
    status: 'draft' as 'draft' | 'published'
  });

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons();
    }
  }, [selectedCourse]);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const q = query(
        collection(db, 'lessons'),
        where('courseId', '==', selectedCourse),
        orderBy('orderIndex', 'asc')
      );
      const snapshot = await getDocs(q);
      
      const lessonsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date()
      })) as Lesson[];
      
      setLessons(lessonsData);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      alert('Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingLesson) {
        await updateDoc(doc(db, 'lessons', editingLesson.id), {
          ...formData,
          updatedAt: Timestamp.now()
        });
        alert('Lesson updated successfully!');
      } else {
        await addDoc(collection(db, 'lessons'), {
          ...formData,
          courseId: selectedCourse,
          orderIndex: lessons.length,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        });
        alert('Lesson created successfully!');
      }
      
      resetForm();
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert('Failed to save lesson');
    }
  };

  const handleEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setFormData({
      title: lesson.title,
      lessonNumber: lesson.lessonNumber,
      content: lesson.content,
      videoUrl: lesson.videoUrl || '',
      pdfUrl: lesson.pdfUrl || '',
      audioUrl: lesson.audioUrl || '',
      homework: lesson.homework || '',
      quiz: lesson.quiz || '',
      status: lesson.status
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    
    try {
      await deleteDoc(doc(db, 'lessons', id));
      alert('Lesson deleted successfully!');
      fetchLessons();
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert('Failed to delete lesson');
    }
  };

  const moveLesson = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= lessons.length) return;

    const newLessons = [...lessons];
    [newLessons[index], newLessons[newIndex]] = [newLessons[newIndex], newLessons[index]];

    try {
      await Promise.all(
        newLessons.map((lesson, idx) =>
          updateDoc(doc(db, 'lessons', lesson.id), { orderIndex: idx })
        )
      );
      setLessons(newLessons);
    } catch (error) {
      console.error('Error reordering lessons:', error);
      alert('Failed to reorder lessons');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      lessonNumber: lessons.length + 1,
      content: '',
      videoUrl: '',
      pdfUrl: '',
      audioUrl: '',
      homework: '',
      quiz: '',
      status: 'draft'
    });
    setEditingLesson(null);
    setShowForm(false);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-primary-500" size={32} />
          Lessons Manager
        </h1>
        <p className="text-white mt-2">Create and manage lessons for each course</p>
      </div>

      {/* Course Selector */}
      <div className="bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
        <label className="block text-sm font-semibold text-white mb-2">
          Select Course *
        </label>
        <select
          value={selectedCourse}
          onChange={(e) => {
            setSelectedCourse(e.target.value);
            setShowForm(false);
            resetForm();
          }}
          className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
        >
          <option value="">Choose a course...</option>
          {PREDEFINED_COURSES.map(course => (
            <option key={course.id} value={course.id}>{course.name}</option>
          ))}
        </select>
      </div>

      {selectedCourse && (
        <>
          {/* Add Lesson Button */}
          {!showForm && (
            <div className="mb-6">
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-accent-600 transition"
              >
                <Plus size={20} />
                Add New Lesson
              </button>
            </div>
          )}

          {/* Lesson Form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl shadow-lg p-8 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {editingLesson ? 'Edit Lesson' : 'Create New Lesson'}
                </h2>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-2 text-white hover:text-white hover:bg-gray-100 rounded-lg transition"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lesson Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Lesson Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="e.g., Arabic Letters - Alif to Yaa"
                    required
                  />
                </div>

                {/* Lesson Number */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Lesson Number *
                  </label>
                  <input
                    type="number"
                    value={formData.lessonNumber}
                    onChange={(e) => setFormData({ ...formData, lessonNumber: Number(e.target.value) })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    min="1"
                    required
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>

                {/* Content */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Lesson Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="Enter the lesson content, explanations, and instructions..."
                    required
                  />
                </div>

                {/* Video Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Lesson Video
                  </label>
                  {formData.videoUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Video className="text-green-600" size={20} />
                      <span className="text-sm text-white flex-1">Video attached</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, videoUrl: '' })}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker({ type: 'video' })}
                        className="px-4 py-2 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition text-white text-white text-white"
                      >
                        Choose from Library
                      </button>
                    </div>
                  )}
                </div>

                {/* PDF Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    PDF Material
                  </label>
                  {formData.pdfUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <FileText className="text-green-600" size={20} />
                      <span className="text-sm text-white flex-1">PDF attached</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, pdfUrl: '' })}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker({ type: 'pdf' })}
                        className="px-4 py-2 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition text-white text-white text-white"
                      >
                        Choose from Library
                      </button>
                    </div>
                  )}
                </div>

                {/* Audio Upload */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Audio Recitation
                  </label>
                  {formData.audioUrl ? (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Music className="text-green-600" size={20} />
                      <span className="text-sm text-white flex-1">Audio attached</span>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, audioUrl: '' })}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setShowMediaPicker({ type: 'audio' })}
                        className="px-4 py-2 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition text-white text-white text-white"
                      >
                        Choose from Library
                      </button>
                    </div>
                  )}
                </div>

                {/* Homework */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Homework
                  </label>
                  <textarea
                    value={formData.homework}
                    onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="Assign homework for this lesson..."
                  />
                </div>

                {/* Quiz */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-white mb-2">
                    Quiz/Questions
                  </label>
                  <textarea
                    value={formData.quiz}
                    onChange={(e) => setFormData({ ...formData, quiz: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                    placeholder="Add quiz questions or assessment..."
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-accent-600 transition"
                >
                  <Save size={20} />
                  {editingLesson ? 'Update Lesson' : 'Create Lesson'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 border bg-slate-900 border-white/10 text-white font-semibold rounded-lg hover:bg-slate-900 transition text-white text-white text-white"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Lessons List */}
          <div className="bg-slate-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">
                Lessons ({lessons.length})
              </h2>
            </div>

            {loading ? (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-white mt-4">Loading lessons...</p>
              </div>
            ) : lessons.length === 0 ? (
              <div className="p-12 text-center">
                <BookOpen className="mx-auto text-white mb-4" size={48} />
                <p className="text-white">No lessons yet. Create your first lesson!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {lessons.map((lesson, index) => (
                  <div key={lesson.id} className="p-6 hover:bg-slate-900 transition text-white">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2 py-1 bg-sky-100 text-sky-700 text-xs font-bold rounded">
                            Lesson {lesson.lessonNumber}
                          </span>
                          <span className={`px-2 py-1 text-xs font-bold rounded ${
                            lesson.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-white'
                          }`}>
                            {lesson.status}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-white">{lesson.title}</h3>
                        <p className="text-sm text-white mt-1 line-clamp-2">{lesson.content}</p>
                        
                        <div className="flex items-center gap-4 mt-3 text-xs text-white">
                          {lesson.videoUrl && <span className="flex items-center gap-1"><Video size={14} /> Video</span>}
                          {lesson.pdfUrl && <span className="flex items-center gap-1"><FileText size={14} /> PDF</span>}
                          {lesson.audioUrl && <span className="flex items-center gap-1"><Music size={14} /> Audio</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 ml-4">
                        <button
                          onClick={() => moveLesson(index, 'up')}
                          disabled={index === 0}
                          className="p-2 text-white hover:bg-gray-200 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronUp size={20} />
                        </button>
                        <button
                          onClick={() => moveLesson(index, 'down')}
                          disabled={index === lessons.length - 1}
                          className="p-2 text-white hover:bg-gray-200 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <ChevronDown size={20} />
                        </button>
                        <button
                          onClick={() => handleEdit(lesson)}
                          className="p-2 text-primary-600 hover:bg-sky-50 rounded-lg transition"
                        >
                          <Edit size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(lesson.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Media Picker Modal */}
      {showMediaPicker.type && (
        <MediaPicker
          isOpen={true}
          fileType={showMediaPicker.type}
          onClose={() => setShowMediaPicker({ type: null })}
          onSelect={(url) => {
            if (showMediaPicker.type === 'video') {
              setFormData({ ...formData, videoUrl: url });
            } else if (showMediaPicker.type === 'pdf') {
              setFormData({ ...formData, pdfUrl: url });
            } else if (showMediaPicker.type === 'audio') {
              setFormData({ ...formData, audioUrl: url });
            }
            setShowMediaPicker({ type: null });
          }}
        />
      )}
    </div>
  );
}
