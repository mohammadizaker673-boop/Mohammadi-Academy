import React, { useState, useEffect } from 'react';
import { TRANSLATIONS } from '../../constants';
import { useLanguage } from '../../contexts/LanguageContext';
import { Feature } from '../../types';
import { Trash2, Edit2, Plus } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const AdminFeaturesPage: React.FC = () => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const t = TRANSLATIONS[language];
  
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'text' as 'video' | 'image' | 'text',
    mediaUrl: '',
    content: '',
  });

  // Load features from localStorage
  useEffect(() => {
    loadFeatures();
  }, []);

  const loadFeatures = () => {
    try {
      const stored = localStorage.getItem('academy_features');
      if (stored) {
        setFeatures(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading features:', error);
    }
  };

  const saveFeatures = (updatedFeatures: Feature[]) => {
    try {
      localStorage.setItem('academy_features', JSON.stringify(updatedFeatures));
      setFeatures(updatedFeatures);
    } catch (error) {
      console.error('Error saving features:', error);
    }
  };

  const handleAddFeature = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      type: 'text',
      mediaUrl: '',
      content: '',
    });
    setIsModalOpen(true);
  };

  const handleEditFeature = (feature: Feature) => {
    setEditingId(feature.id);
    setFormData({
      title: feature.title,
      description: feature.description,
      type: feature.type,
      mediaUrl: feature.mediaUrl || '',
      content: feature.content || '',
    });
    setIsModalOpen(true);
  };

  const handleDeleteFeature = (id: string) => {
    if (confirm('Are you sure you want to delete this feature?')) {
      const updated = features.filter(f => f.id !== id);
      saveFeatures(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    let updated: Feature[];

    if (editingId) {
      // Update existing feature
      updated = features.map(f =>
        f.id === editingId
          ? {
              ...f,
              ...formData,
              updatedAt: new Date(),
            }
          : f
      );
    } else {
      // Add new feature
      const newFeature: Feature = {
        id: Date.now().toString(),
        ...formData,
        publishDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      updated = [newFeature, ...features];
    }

    saveFeatures(updated);
    setIsModalOpen(false);
    setFormData({
      title: '',
      description: '',
      type: 'text',
      mediaUrl: '',
      content: '',
    });
  };

  const isRTL = language === 'ar' || language === 'fa' || language === 'ps';

  return (
    <div className={`min-h-screen bg-slate-900 text-slate-100 ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold mb-2">{t.features.title}</h1>
            <p className="text-slate-400">{t.features.subtitle}</p>
          </div>
          <button
            onClick={handleAddFeature}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            {t.features.addFeature}
          </button>
        </div>

        {/* Features Table */}
        <div className="bg-slate-800 rounded-lg overflow-hidden">
          {features.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold">{t.features.featureTitle}</th>
                    <th className="px-6 py-3 text-left font-semibold">{t.features.featureType}</th>
                    <th className="px-6 py-3 text-left font-semibold">{t.features.publishDate}</th>
                    <th className="px-6 py-3 text-left font-semibold">{t.dashboard.common.edit}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {features.map((feature) => (
                    <tr key={feature.id} className="hover:bg-slate-700 transition">
                      <td className="px-6 py-4">{feature.title}</td>
                      <td className="px-6 py-4">
                        <span className="inline-block px-3 py-1 bg-primary-500/20 text-primary-300 text-sm rounded-full">
                          {feature.type === 'video' && t.features.video}
                          {feature.type === 'image' && t.features.image}
                          {feature.type === 'text' && t.features.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">{formatDate(feature.publishDate)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleEditFeature(feature)}
                            className="text-primary-400 hover:text-primary-300 transition"
                            title={t.dashboard.common.edit}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFeature(feature.id)}
                            className="text-red-400 hover:text-red-300 transition"
                            title={t.dashboard.common.delete}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">{t.features.noFeatures}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-slate-800 rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="p-6 border-b border-slate-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingId ? t.features.editFeature : t.features.addFeature}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold mb-2">{t.features.featureTitle} *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold mb-2">{t.features.featureDescription} *</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:border-primary-500 focus:outline-none min-h-24"
                  required
                />
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold mb-2">{t.features.featureType} *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'video' | 'image' | 'text' })}
                  className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="text">{t.features.text}</option>
                  <option value="image">{t.features.image}</option>
                  <option value="video">{t.features.video}</option>
                </select>
              </div>

              {/* Media URL (for video/image) */}
              {(formData.type === 'video' || formData.type === 'image') && (
                <div>
                  <label className="block text-sm font-semibold mb-2">{t.features.mediaUrl}</label>
                  <input
                    type="url"
                    placeholder={formData.type === 'video' ? 'https://youtube.com/watch?v=...' : 'https://example.com/image.jpg'}
                    value={formData.mediaUrl}
                    onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:border-primary-500 focus:outline-none"
                  />
                </div>
              )}

              {/* Content (for text) */}
              {formData.type === 'text' && (
                <div>
                  <label className="block text-sm font-semibold mb-2">Content</label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white focus:border-primary-500 focus:outline-none min-h-32"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2 border border-slate-600 rounded hover:bg-slate-700 transition"
                >
                  {t.dashboard.common.cancel}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 rounded transition"
                >
                  {t.dashboard.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
