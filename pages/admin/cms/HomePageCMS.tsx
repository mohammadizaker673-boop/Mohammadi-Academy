import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { Home, Save, Image, Type, FileText } from 'lucide-react';

interface HomePageContent {
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutTitle: string;
  aboutContent: string;
  featuresTitle: string;
  features: { title: string; description: string; icon: string }[];
  statsTitle: string;
  stats: { value: string; label: string }[];
}

export default function HomePageCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<HomePageContent>({
    heroTitle: 'Learn Quran Online with Expert Teachers',
    heroSubtitle: 'Join thousands of students learning the Quran from the comfort of their homes',
    heroImage: '/hero-image.jpg',
    aboutTitle: 'About Mohammadi Academy',
    aboutContent: 'We are dedicated to providing quality Quranic education to students worldwide.',
    featuresTitle: 'Why Choose Us',
    features: [
      { title: 'Expert Teachers', description: 'Qualified and experienced Quran teachers', icon: 'ðŸ‘¨â€ðŸ«' },
      { title: 'Flexible Schedule', description: 'Learn at your own pace and time', icon: 'â°' },
      { title: 'Online & Offline', description: 'Choose your preferred mode of learning', icon: 'ðŸ’»' },
    ],
    statsTitle: 'Our Achievements',
    stats: [
      { value: '1000+', label: 'Students' },
      { value: '50+', label: 'Teachers' },
      { value: '15+', label: 'Countries' },
    ],
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const docRef = doc(db, 'cms', 'homepage');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContent(docSnap.data() as HomePageContent);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'cms', 'homepage'), {
        ...content,
        updatedAt: new Date().toISOString(),
      });
      alert('Homepage content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    } finally {
      setSaving(false);
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
          <h1 className="text-4xl font-black text-white mb-2">Homepage CMS</h1>
          <p className="text-white">Manage your homepage content</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-xl font-bold hover:from-primary-400 hover:to-accent-400 transition-all shadow-lg disabled:opacity-50"
        >
          <Save size={20} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Hero Section */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <Home size={24} className="text-primary-400" />
          Hero Section
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Title</label>
            <input
              type="text"
              value={content.heroTitle}
              onChange={(e) => setContent({ ...content, heroTitle: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Subtitle</label>
            <input
              type="text"
              value={content.heroSubtitle}
              onChange={(e) => setContent({ ...content, heroSubtitle: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Hero Image URL</label>
            <input
              type="text"
              value={content.heroImage}
              onChange={(e) => setContent({ ...content, heroImage: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <FileText size={24} className="text-accent-400" />
          About Section
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Title</label>
            <input
              type="text"
              value={content.aboutTitle}
              onChange={(e) => setContent({ ...content, aboutTitle: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Content</label>
            <textarea
              rows={4}
              value={content.aboutContent}
              onChange={(e) => setContent({ ...content, aboutContent: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <Type size={24} className="text-green-400" />
          Features Section
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Section Title</label>
            <input
              type="text"
              value={content.featuresTitle}
              onChange={(e) => setContent({ ...content, featuresTitle: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>
          {content.features.map((feature, index) => (
            <div key={index} className="p-4 bg-slate-900/30 rounded-xl space-y-3">
              <input
                type="text"
                placeholder="Feature Title"
                value={feature.title}
                onChange={(e) => {
                  const newFeatures = [...content.features];
                  newFeatures[index].title = e.target.value;
                  setContent({ ...content, features: newFeatures });
                }}
                className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
              />
              <textarea
                rows={2}
                placeholder="Feature Description"
                value={feature.description}
                onChange={(e) => {
                  const newFeatures = [...content.features];
                  newFeatures[index].description = e.target.value;
                  setContent({ ...content, features: newFeatures });
                }}
                className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-white mb-6">Statistics Section</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Section Title</label>
            <input
              type="text"
              value={content.statsTitle}
              onChange={(e) => setContent({ ...content, statsTitle: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {content.stats.map((stat, index) => (
              <div key={index} className="p-4 bg-slate-900/30 rounded-xl space-y-3">
                <input
                  type="text"
                  placeholder="Value (e.g., 1000+)"
                  value={stat.value}
                  onChange={(e) => {
                    const newStats = [...content.stats];
                    newStats[index].value = e.target.value;
                    setContent({ ...content, stats: newStats });
                  }}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                />
                <input
                  type="text"
                  placeholder="Label"
                  value={stat.label}
                  onChange={(e) => {
                    const newStats = [...content.stats];
                    newStats[index].label = e.target.value;
                    setContent({ ...content, stats: newStats });
                  }}
                  className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

