import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Image, Plus, Edit2, Trash2, Save, Upload } from 'lucide-react';

interface Media {
  id: string;
  title: string;
  type: 'banner' | 'image' | 'video';
  url: string;
  description: string;
  location: 'homepage' | 'courses' | 'about' | 'contact';
  active: boolean;
  createdAt: string;
}

export default function MediaBannersCMS() {
  const [media, setMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedia, setEditingMedia] = useState<Media | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    type: 'banner' as 'banner' | 'image' | 'video',
    url: '',
    description: '',
    location: 'homepage' as 'homepage' | 'courses' | 'about' | 'contact',
    active: true,
  });

  useEffect(() => {
    fetchMedia();
  }, []);

  const fetchMedia = async () => {
    try {
      const mediaSnap = await getDocs(collection(db, 'media'));
      setMedia(
        mediaSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Media[]
      );
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMedia) {
        await updateDoc(doc(db, 'media', editingMedia.id), {
          ...formData,
          updatedAt: new Date().toISOString(),
        });
      } else {
        await addDoc(collection(db, 'media'), {
          ...formData,
          createdAt: new Date().toISOString(),
        });
      }
      resetForm();
      fetchMedia();
    } catch (error) {
      console.error('Error saving media:', error);
      alert('Error saving media. Please try again.');
    }
  };

  const handleEdit = (item: Media) => {
    setEditingMedia(item);
    setFormData({
      title: item.title,
      type: item.type,
      url: item.url,
      description: item.description,
      location: item.location,
      active: item.active,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;
    try {
      await deleteDoc(doc(db, 'media', id));
      fetchMedia();
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'banner',
      url: '',
      description: '',
      location: 'homepage',
      active: true,
    });
    setEditingMedia(null);
    setShowModal(false);
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
          <h1 className="text-4xl font-black text-white mb-2">Media & Banners</h1>
          <p className="text-white">{media.length} total media items</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg"
        >
          <Plus size={20} />
          Add Media
        </button>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.length > 0 ? (
          media.map((item) => (
            <div
              key={item.id}
              className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden"
            >
              <div className="h-48 bg-slate-700 relative">
                {item.type === 'image' || item.type === 'banner' ? (
                  <img
                    src={item.url || '/placeholder.jpg'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/placeholder.jpg';
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Upload className="text-slate-500" size={48} />
                  </div>
                )}
                <span
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-bold ${
                    item.type === 'banner'
                      ? 'bg-accent-500/90 text-white'
                      : item.type === 'image'
                      ? 'bg-primary-500/90 text-white'
                      : 'bg-green-500/90 text-white'
                  }`}
                >
                  {item.type.toUpperCase()}
                </span>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-black text-white">{item.title}</h3>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.active ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                    }`}
                  >
                    {item.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-3">{item.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 uppercase">{item.location}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="p-2 hover:bg-primary-500/10 text-primary-400 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
            <Image className="mx-auto text-slate-600 mb-4" size={64} />
            <h3 className="text-lg font-semibold text-white mb-2">No Media Found</h3>
            <p className="text-slate-400">Add your first banner or image to get started</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10 rounded-2xl w-full max-w-2xl">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white">
                {editingMedia ? 'Edit Media' : 'Add New Media'}
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
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Type *</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  >
                    <option value="banner">Banner</option>
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Location *</label>
                  <select
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value as any })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  >
                    <option value="homepage">Homepage</option>
                    <option value="courses">Courses</option>
                    <option value="about">About</option>
                    <option value="contact">Contact</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-white mb-2">URL *</label>
                  <input
                    type="url"
                    required
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-white mb-2">Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 accent-sky-500"
                    />
                    <span className="text-white font-bold">Active (Show on website)</span>
                  </label>
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
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-400 hover:to-accent-400 text-white rounded-xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  {editingMedia ? 'Update' : 'Add'} Media
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
