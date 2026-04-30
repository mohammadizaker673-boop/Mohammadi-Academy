import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { UserPlus, Save } from 'lucide-react';

export default function AddTeacher() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    qualification: '',
    specialization: 'quran' as 'quran' | 'arabic' | 'islamic-studies' | 'other',
    experience: '',
    salary: '',
    joiningDate: new Date().toISOString().split('T')[0],
    status: 'active' as 'active' | 'inactive',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addDoc(collection(db, 'teachers'), {
        ...formData,
        experience: Number(formData.experience),
        salary: Number(formData.salary),
        joiningDate: new Date(formData.joiningDate),
        createdAt: Timestamp.now(),
      });

      alert('Teacher added successfully!');
      navigate('/admin/teachers');
    } catch (error) {
      console.error('Error adding teacher:', error);
      alert('Failed to add teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <UserPlus className="text-primary-500" size={32} />
          Add New Teacher
        </h1>
        <p className="text-white mt-2">Register a new teacher to the academy</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl shadow-lg p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Teacher Name */}
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-white mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="e.g., Sheikh Abdullah"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Email *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="teacher@example.com"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Phone *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="+1234567890"
              required
            />
          </div>

          {/* Qualification */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Qualification *
            </label>
            <input
              type="text"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="e.g., MA Islamic Studies"
              required
            />
          </div>

          {/* Specialization */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Specialization *
            </label>
            <select
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value as any })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              required
            >
              <option value="quran">Quran</option>
              <option value="arabic">Arabic Language</option>
              <option value="islamic-studies">Islamic Studies</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Experience (Years) *
            </label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="5"
              min="0"
              required
            />
          </div>

          {/* Salary */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Salary (USD) *
            </label>
            <input
              type="number"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="1000"
              min="0"
              required
            />
          </div>

          {/* Joining Date */}
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Joining Date *
            </label>
            <input
              type="date"
              value={formData.joiningDate}
              onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
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
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
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
            {loading ? 'Adding...' : 'Add Teacher'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/teachers')}
            className="px-6 py-3 border bg-slate-900 border-white/10 text-white font-semibold rounded-lg hover:bg-slate-700 transition text-white text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
