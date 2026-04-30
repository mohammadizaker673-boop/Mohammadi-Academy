import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Announcement } from '../../../types/communication.types';
import { MessageSquare, Plus, Bell } from 'lucide-react';

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    targetAudience: 'all' as Announcement['targetAudience'],
    priority: 'medium' as Announcement['priority'],
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'announcements'));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        publishedAt: doc.data().publishedAt?.toDate(),
      })) as Announcement[];
      setAnnouncements(data.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()));
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'announcements'), {
        ...formData,
        publishedAt: Timestamp.now(),
        createdBy: 'admin',
        status: 'published',
      });

      alert('Announcement published successfully!');
      setShowForm(false);
      setFormData({ title: '', content: '', targetAudience: 'all', priority: 'medium' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      alert('Failed to publish announcement');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <MessageSquare className="text-primary-500" size={32} />
            Announcements
          </h1>
          <p className="text-white mt-2">Broadcast messages to students and teachers</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-accent-600 transition"
        >
          <Plus size={20} />
          New Announcement
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-white mb-4">Create New Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                placeholder="Announcement title"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Message *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                placeholder="Your announcement message..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Target Audience *
                </label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as any })}
                  className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                >
                  <option value="all">All</option>
                  <option value="students">Students Only</option>
                  <option value="teachers">Teachers Only</option>
                  <option value="parents">Parents Only</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-accent-600 transition"
              >
                Publish
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-3 border bg-slate-900 border-white/10 text-white font-semibold rounded-lg hover:bg-slate-900 transition text-white text-white text-white"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
          <p className="mt-4 text-white">Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 rounded-xl shadow">
          <Bell className="mx-auto text-white" size={48} />
          <p className="mt-4 text-white">No announcements yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div key={announcement.id} className="bg-slate-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-2">{announcement.title}</h3>
                  <p className="text-white">{announcement.content}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    announcement.priority === 'high'
                      ? 'bg-red-100 text-red-700'
                      : announcement.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {announcement.priority}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-white">
                <span className="flex items-center gap-1">
                  <Bell size={14} />
                  {announcement.targetAudience}
                </span>
                <span>
                  {announcement.publishedAt.toLocaleDateString()} at {announcement.publishedAt.toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
