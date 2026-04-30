import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Homework } from '../../../types/academic.types';
import { ClipboardList, Save } from 'lucide-react';

export default function CreateHomework() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    courseId: '',
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
    assignedTo: [] as string[],
    status: 'active' as Homework['status'],
  });

  useEffect(() => {
    fetchCoursesAndStudents();
  }, []);

  const fetchCoursesAndStudents = async () => {
    try {
      const [coursesSnapshot, studentsSnapshot] = await Promise.all([
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'students')),
      ]);

      setCourses(coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setStudents(studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'homework'), {
        ...formData,
        dueDate: new Date(formData.dueDate),
        createdBy: 'admin', // Replace with actual admin ID from auth
        createdAt: Timestamp.now(),
      });

      alert('Homework created successfully!');
      navigate('/admin/homework');
    } catch (error) {
      console.error('Error creating homework:', error);
      alert('Failed to create homework');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <ClipboardList className="text-primary-500" size={32} />
          Create Homework
        </h1>
        <p className="text-white mt-2">Assign homework to students</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl shadow-lg p-8">
        <div className="grid grid-cols-1 gap-6">
          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Course *
            </label>
            <select
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              required
            >
              <option value="">Select a course</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Homework Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="e.g., Memorize Surah Al-Fatiha"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="Detailed instructions for the homework..."
              required
            />
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Due Date *
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              required
            />
          </div>

          {/* Assign to Students */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Assign to Students *
            </label>
            <div className="border border-white/10 rounded-lg p-4 max-h-48 overflow-y-auto bg-slate-900 text-white">
              {students.map(student => (
                <label key={student.id} className="flex items-center gap-2 mb-2 hover:bg-slate-700 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={formData.assignedTo.includes(student.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, assignedTo: [...formData.assignedTo, student.id] });
                      } else {
                        setFormData({ ...formData, assignedTo: formData.assignedTo.filter(id => id !== student.id) });
                      }
                    }}
                    className="w-4 h-4 text-primary-500"
                  />
                  <span className="text-sm text-white">{student.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-accent-600 transition disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Creating...' : 'Create Homework'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/homework')}
            className="px-6 py-3 border border-white/10 text-white font-semibold rounded-lg hover:bg-slate-700 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
