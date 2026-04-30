import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { BookOpen, Save, Plus, Trash2 } from 'lucide-react';

interface CoursePageContent {
  pageTitle: string;
  pageSubtitle: string;
  heroImage: string;
  introText: string;
  highlightedCourses: string[];
}

export default function CoursesPageCMS() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [content, setContent] = useState<CoursePageContent>({
    pageTitle: 'Our Courses',
    pageSubtitle: 'Explore our comprehensive Quranic education programs',
    heroImage: '/courses-hero.jpg',
    introText: 'Choose from our wide range of courses designed for all age groups and skill levels.',
    highlightedCourses: [],
  });

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const docRef = doc(db, 'cms', 'coursespage');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setContent(docSnap.data() as CoursePageContent);
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
      await setDoc(doc(db, 'cms', 'coursespage'), {
        ...content,
        updatedAt: new Date().toISOString(),
      });
      alert('Courses page content saved successfully!');
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error saving content. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addHighlightedCourse = () => {
    setContent({
      ...content,
      highlightedCourses: [...content.highlightedCourses, ''],
    });
  };

  const removeHighlightedCourse = (index: number) => {
    const newCourses = content.highlightedCourses.filter((_, i) => i !== index);
    setContent({ ...content, highlightedCourses: newCourses });
  };

  const updateHighlightedCourse = (index: number, value: string) => {
    const newCourses = [...content.highlightedCourses];
    newCourses[index] = value;
    setContent({ ...content, highlightedCourses: newCourses });
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
          <h1 className="text-4xl font-black text-white mb-2">Courses Page CMS</h1>
          <p className="text-white">Manage your courses page content</p>
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

      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
          <BookOpen size={24} className="text-primary-400" />
          Page Header
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-white mb-2">Page Title</label>
            <input
              type="text"
              value={content.pageTitle}
              onChange={(e) => setContent({ ...content, pageTitle: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-white mb-2">Page Subtitle</label>
            <input
              type="text"
              value={content.pageSubtitle}
              onChange={(e) => setContent({ ...content, pageSubtitle: e.target.value })}
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
          <div>
            <label className="block text-sm font-bold text-white mb-2">Introduction Text</label>
            <textarea
              rows={4}
              value={content.introText}
              onChange={(e) => setContent({ ...content, introText: e.target.value })}
              className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
            />
          </div>
        </div>
      </div>

      {/* Highlighted Courses */}
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-white">Highlighted Courses (IDs)</h2>
          <button
            onClick={addHighlightedCourse}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-400 text-white rounded-lg font-bold transition-colors"
          >
            <Plus size={16} />
            Add Course ID
          </button>
        </div>
        <div className="space-y-3">
          {content.highlightedCourses.length > 0 ? (
            content.highlightedCourses.map((courseId, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={courseId}
                  onChange={(e) => updateHighlightedCourse(index, e.target.value)}
                  placeholder="Enter course ID"
                  className="flex-1 px-4 py-2 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:border-primary-500/50"
                />
                <button
                  onClick={() => removeHighlightedCourse(index)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))
          ) : (
            <p className="text-slate-400 text-center py-4">No highlighted courses added yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
