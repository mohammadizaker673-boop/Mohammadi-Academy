import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { BookOpen, Save, Image as ImageIcon } from 'lucide-react';
import FileUploader from '../../../components/admin/FileUploader';
import { generateAICoursePackage } from '../../../utils/aiCourseGenerator';
import { courses } from '../../../data/courses';

type LessonOutlineItem = {
  id: string;
  title: string;
  hasVideo?: boolean;
  hasText?: boolean;
  hasQuiz?: boolean;
};

type CourseResource = {
  id: string;
  title: string;
  type: 'pdf' | 'audio' | 'document';
  url: string;
};

const PREDEFINED_COURSES = [
  { id: 'quran-tajweed', name: 'Quran with Tajweed', category: 'quran' },
  { id: 'noorani-qaida', name: 'Noorani Qaida & Prayer', category: 'quran' },
  { id: 'hifz-quran', name: 'Hifz-ul-Quran', category: 'quran' },
  { id: 'quran-tafsir', name: 'Quran Translation & Tafsir', category: 'quran' },
  { id: 'arabic-language', name: 'Arabic Language Course', category: 'arabic' },
  { id: 'islamic-studies', name: 'Islamic Studies & Fiqh', category: 'islamic-studies' },
  { id: 'kids-general-knowledge', name: 'General Knowledge for Kids', category: 'general-knowledge' },
  { id: 'kids-manners-character', name: 'Manners & Character (Kids)', category: 'life-skills' },
  { id: 'preteens-math-for-life', name: 'Math for Life', category: 'life-skills' },
  { id: 'preteens-digital-basics', name: 'Digital Basics & Online Safety', category: 'digital-skills' },
  { id: 'youth-career-awareness', name: 'Career Awareness & CV Basics', category: 'life-skills' },
  { id: 'youth-financial-literacy', name: 'Financial Literacy (Halal Income)', category: 'life-skills' },
  { id: 'adult-small-business', name: 'Small Business Basics', category: 'life-skills' },
  { id: 'adult-agriculture-basics', name: 'Agriculture & Livestock Basics', category: 'life-skills' },
  { id: 'adult-family-health', name: 'Family Health & First Aid', category: 'life-skills' },
  { id: 'kids-science-explorers', name: 'Science Explorers (Kids)', category: 'science' },
  { id: 'youth-stem-lab', name: 'STEM Lab Foundations', category: 'science' },
  { id: 'youth-it-foundations', name: 'IT Foundations', category: 'information-technology' },
  { id: 'adult-digital-productivity', name: 'Digital Productivity for Adults', category: 'information-technology' }
];

export default function EditCourse() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseCategory, setCourseCategory] = useState('quran');
  const [showThumbnailUploader, setShowThumbnailUploader] = useState(false);
  const [aiLessonCount, setAiLessonCount] = useState(12);
  const [aiStatus, setAiStatus] = useState('');
  const [saveNote, setSaveNote] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<'pdf' | 'audio' | 'document'>('pdf');
  const [resourceUrl, setResourceUrl] = useState('');
  
  const [formData, setFormData] = useState({
    description: '',
    teacherId: '',
    status: 'draft' as 'draft' | 'published',
    thumbnailUrl: '',
    isActive: true,
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'all',
    ageGroup: 'all' as 'children' | 'preteens' | 'youth' | 'adults' | 'all',
    ageRange: '',
    languages: [] as string[],
    targetAudience: '',
    priceType: 'free' as 'free' | 'paid',
    price: 0,
    lowBandwidthFriendly: true,
    classFormat: {
      duration: '',
      mode: [] as string[],
      materials: [] as string[]
    },
    requirements: [] as string[],
    lessonOutline: [] as LessonOutlineItem[],
    resources: [] as CourseResource[]
  });

  const [classMode, setClassMode] = useState('');
  const [material, setMaterial] = useState('');
  const [requirement, setRequirement] = useState('');
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonHasVideo, setLessonHasVideo] = useState(true);
  const [lessonHasText, setLessonHasText] = useState(true);
  const [lessonHasQuiz, setLessonHasQuiz] = useState(true);

  const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
    new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('timeout')), ms);
      promise
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });


  useEffect(() => {
    if (id) {
      loadCourseData();
    }
  }, [id]);

  const loadCourseData = async () => {
    try {
      setLoadingData(true);
      
      // Find course name from predefined list
      const course = PREDEFINED_COURSES.find(c => c.id === id);
      if (!course) {
        alert('Invalid course ID');
        navigate('/admin/courses/list');
        return;
      }
      
      setCourseName(course.name);
      setCourseCategory(course.category);

      const fallback = courses.find(item => item.id === id);
      if (fallback) {
        setFormData({
          description: fallback.description || '',
          teacherId: '',
          status: 'draft',
          thumbnailUrl: '',
          isActive: true,
          level: fallback.level || 'beginner',
          ageGroup: fallback.ageGroup || 'all',
          ageRange: fallback.ageRange || '',
          languages: fallback.languages || [],
          targetAudience: fallback.targetAudience || '',
          priceType: fallback.priceType || 'free',
          price: fallback.pricing?.[0]?.pricePerMonth || 0,
          lowBandwidthFriendly: fallback.lowBandwidthFriendly ?? true,
          classFormat: fallback.classFormat || {
            duration: '',
            mode: [],
            materials: []
          },
          requirements: fallback.requirements || [],
          lessonOutline: fallback.lessonOutline || [],
          resources: []
        });
      }

      setLoadingData(false);
      
      // Load existing data from Firestore (if any)
      const docRef = doc(db, 'courses', id!);
      const docSnap = await withTimeout(getDoc(docRef), 4000);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFormData({
          description: data.description || '',
          teacherId: data.teacherId || '',
          status: data.status || 'draft',
          thumbnailUrl: data.thumbnailUrl || '',
          isActive: data.isActive ?? true,
          level: data.level || 'beginner',
          ageGroup: data.ageGroup || 'all',
          ageRange: data.ageRange || '',
          languages: data.languages || [],
          targetAudience: data.targetAudience || '',
          priceType: data.priceType || 'free',
          price: data.price || 0,
          lowBandwidthFriendly: data.lowBandwidthFriendly ?? true,
          classFormat: data.classFormat || {
            duration: '',
            mode: [],
            materials: []
          },
          requirements: data.requirements || [],
          lessonOutline: data.lessonOutline || [],
          resources: data.resources || []
        });
      }
    } catch (error) {
      console.error('Error loading course:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const addClassMode = () => {
    if (classMode.trim()) {
      setFormData({
        ...formData,
        classFormat: {
          ...formData.classFormat,
          mode: [...formData.classFormat.mode, classMode.trim()]
        }
      });
      setClassMode('');
    }
  };

  const removeClassMode = (index: number) => {
    setFormData({
      ...formData,
      classFormat: {
        ...formData.classFormat,
        mode: formData.classFormat.mode.filter((_, i) => i !== index)
      }
    });
  };

  const addMaterial = () => {
    if (material.trim()) {
      setFormData({
        ...formData,
        classFormat: {
          ...formData.classFormat,
          materials: [...formData.classFormat.materials, material.trim()]
        }
      });
      setMaterial('');
    }
  };

  const removeMaterial = (index: number) => {
    setFormData({
      ...formData,
      classFormat: {
        ...formData.classFormat,
        materials: formData.classFormat.materials.filter((_, i) => i !== index)
      }
    });
  };

  const addRequirement = () => {
    if (requirement.trim()) {
      setFormData({
        ...formData,
        requirements: [...formData.requirements, requirement.trim()]
      });
      setRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData({
      ...formData,
      requirements: formData.requirements.filter((_, i) => i !== index)
    });
  };

  const toggleLanguage = (lang: string) => {
    setFormData(prev => {
      const exists = prev.languages.includes(lang);
      return {
        ...prev,
        languages: exists ? prev.languages.filter(item => item !== lang) : [...prev.languages, lang]
      };
    });
  };

  const addLessonOutline = () => {
    if (!lessonTitle.trim()) return;
    const newLesson: LessonOutlineItem = {
      id: Date.now().toString(),
      title: lessonTitle.trim(),
      hasVideo: lessonHasVideo,
      hasText: lessonHasText,
      hasQuiz: lessonHasQuiz
    };
    setFormData(prev => ({
      ...prev,
      lessonOutline: [...prev.lessonOutline, newLesson]
    }));
    setLessonTitle('');
    setLessonHasVideo(true);
    setLessonHasText(true);
    setLessonHasQuiz(true);
  };

  const removeLessonOutline = (index: number) => {
    setFormData(prev => ({
      ...prev,
      lessonOutline: prev.lessonOutline.filter((_, i) => i !== index)
    }));
  };

  const addResource = () => {
    if (!resourceTitle.trim() || !resourceUrl) return;
    const newResource: CourseResource = {
      id: Date.now().toString(),
      title: resourceTitle.trim(),
      type: resourceType,
      url: resourceUrl
    };
    setFormData(prev => ({
      ...prev,
      resources: [...prev.resources, newResource]
    }));
    setResourceTitle('');
    setResourceUrl('');
  };

  const removeResource = (index: number) => {
    setFormData(prev => ({
      ...prev,
      resources: prev.resources.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateAiContent = async () => {
    const primaryLanguage = formData.languages[0] || 'arabic';

    setIsGeneratingAi(true);
    setAiStatus('Generating course plan...');

    try {
      const generatedPackage = await generateAICoursePackage({
        title: courseName || 'Course',
        category: courseCategory as any,
        level: formData.level,
        ageGroup: formData.ageGroup,
        primaryLanguage,
        lessonCount: aiLessonCount
      });

      const generated = generatedPackage.courseContent;

      setFormData(prev => ({
        ...prev,
        description: generated.description,
        targetAudience: generated.targetAudience,
        ageRange: generated.ageRange,
        duration: generated.duration,
        requirements: generated.requirements,
        classFormat: {
          ...prev.classFormat,
          duration: generated.classFormat.duration,
          mode: generated.classFormat.mode,
          materials: generated.classFormat.materials
        },
        lessonOutline: generated.lessonOutline
      }));

      setLessonHasVideo(false);
      setLessonHasText(true);
      setLessonHasQuiz(true);
      setAiStatus(
        generatedPackage.source === 'ai'
          ? `Generated ${generated.lessonOutline.length} AI lessons for ${courseName} with OpenRouter.`
          : `OpenRouter is unavailable, so a local ${generated.lessonOutline.length}-lesson template was generated for ${courseName}.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSaveNote('Saving...');
    let slowTimer: ReturnType<typeof setTimeout> | null = null;
    slowTimer = setTimeout(() => {
      setSaveNote('Still saving... please wait.');
    }, 2000);

    try {
      const payload = {
        ...formData,
        price: formData.priceType === 'free' ? 0 : formData.price,
        updatedAt: Timestamp.now()
      };
      await setDoc(doc(db, 'courses', id!), payload, { merge: true });

      alert('Course updated successfully!');
      navigate('/admin/courses/list');
    } catch (error) {
      console.error('Error updating course:', error);
      alert('Save failed. Please check your connection and try again.');
    } finally {
      if (slowTimer) {
        clearTimeout(slowTimer);
      }
      setSaveNote('');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <BookOpen className="text-primary-500" size={32} />
            Edit Course: {courseName}
          </h1>
          {id && (
            <Link
              to={`/admin/courses/view/${id}`}
              className="px-4 py-2 border border-white/10 text-white rounded-lg hover:bg-slate-800 transition"
            >
              Back to details
            </Link>
          )}
        </div>
        <p className="text-white mt-2">Update course information and settings</p>
      </div>

      {loadingData ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white mt-4">Loading course data...</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl shadow-lg p-8">
          {saveNote && (
            <div className="mb-4 text-xs text-slate-300">
              {saveNote}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Course Title - Read Only */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">
                Course Name (Read Only)
              </label>
              <input
                type="text"
                value={courseName}
                disabled
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg bg-slate-900 text-white cursor-not-allowed text-white text-white text-white"
              />
              <p className="text-xs text-white mt-1">Course name cannot be changed</p>
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                placeholder="Describe the course objectives, outcomes, and prerequisites..."
                required
              />
            </div>

            {/* Target Audience */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">
                Target Audience
              </label>
              <input
                type="text"
                value={formData.targetAudience}
                onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                placeholder="e.g., Beginners with no prior knowledge, Adults, Children ages 7-12"
              />
            </div>

            {/* Age Group */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Age Group
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as any })}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
              >
                <option value="all">All Ages</option>
                <option value="children">Children (5-9)</option>
                <option value="preteens">Pre-Teens (10-14)</option>
                <option value="youth">Youth (15-20)</option>
                <option value="adults">Adults (21+)</option>
              </select>
            </div>

            {/* Age Range */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Age Range
              </label>
              <input
                type="text"
                value={formData.ageRange}
                onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                placeholder="e.g., 10-14 years"
              />
            </div>

            {/* Price Type */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Price Type
              </label>
              <select
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value as 'free' | 'paid' })}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Price (USD)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                placeholder="0"
                min="0"
                disabled={formData.priceType === 'free'}
              />
            </div>

            {/* Languages */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">Languages</label>
              <div className="flex flex-wrap gap-4">
                {['dari', 'persian', 'pashto', 'english', 'arabic', 'urdu'].map(lang => (
                  <label key={lang} className="flex items-center gap-2 text-sm text-white">
                    <input
                      type="checkbox"
                      checked={formData.languages.includes(lang)}
                      onChange={() => toggleLanguage(lang)}
                      className="h-4 w-4 text-sky-500"
                    />
                    {lang === 'dari' ? 'Dari (Persian)' : lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            {/* Low bandwidth */}
            <div className="md:col-span-2 flex items-center gap-3">
              <input
                id="lowBandwidthFriendlyEdit"
                type="checkbox"
                checked={formData.lowBandwidthFriendly}
                onChange={(e) => setFormData({ ...formData, lowBandwidthFriendly: e.target.checked })}
                className="h-4 w-4 text-sky-500"
              />
              <label htmlFor="lowBandwidthFriendlyEdit" className="text-sm font-semibold text-white">
                Low bandwidth friendly
              </label>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Course Level *
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as typeof formData.level })}
                className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                required
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all">All Levels</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Status *
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })}
                className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
                required
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            {/* Active Status */}
            <div className="md:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-sky-500"
                />
                <span className="text-sm font-semibold text-white">
                  Course is active and visible to students
                </span>
              </label>
            </div>

            {/* Thumbnail */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-white mb-2">
                Course Thumbnail
              </label>
              {formData.thumbnailUrl ? (
                <div className="space-y-3">
                  <img
                    src={formData.thumbnailUrl}
                    alt="Course thumbnail"
                    className="w-full h-48 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Remove Thumbnail
                  </button>
                </div>
              ) : showThumbnailUploader ? (
                <div className="space-y-3">
                  <FileUploader
                    fileType="image"
                    folder="courses"
                    onUploadComplete={(url) => {
                      setFormData({ ...formData, thumbnailUrl: url });
                      setShowThumbnailUploader(false);
                    }}
                    maxFiles={1}
                  />
                  <button
                    type="button"
                    onClick={() => setShowThumbnailUploader(false)}
                    className="text-sm text-white hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowThumbnailUploader(true)}
                  className="flex items-center gap-2 px-4 py-2 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-700 transition text-white text-white"
                >
                  <ImageIcon size={18} />
                  Upload Thumbnail
                </button>
              )}
            </div>
          </div>

        {/* Class Format Section */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Class Format</h3>
          
          {/* Duration */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Class Duration
            </label>
            <input
              type="text"
              value={formData.classFormat.duration}
              onChange={(e) => setFormData({
                ...formData,
                classFormat: { ...formData.classFormat, duration: e.target.value }
              })}
              className="w-full px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="e.g., 45-60 minutes per session"
            />
          </div>

          {/* Mode */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Class Mode
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={classMode}
                onChange={(e) => setClassMode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addClassMode())}
                className="flex-1 px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                placeholder="e.g., One-on-One, Group Classes"
              />
              <button
                type="button"
                onClick={addClassMode}
                className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.classFormat.mode.map((mode, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm"
                >
                  {mode}
                  <button
                    type="button"
                    onClick={() => removeClassMode(idx)}
                    className="text-primary-500 hover:text-sky-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Materials */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Learning Materials
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMaterial())}
                className="flex-1 px-4 py-3 bg-slate-900 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                placeholder="e.g., Digital Mushaf, Tajweed charts"
              />
              <button
                type="button"
                onClick={addMaterial}
                className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.classFormat.materials.map((mat, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                >
                  {mat}
                  <button
                    type="button"
                    onClick={() => removeMaterial(idx)}
                    className="text-purple-500 hover:text-purple-700"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements Section */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Course Requirements</h3>
          
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-2">
              Requirements
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                className="flex-1 px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                placeholder="e.g., Must be able to read Arabic script"
              />
              <button
                type="button"
                onClick={addRequirement}
                className="px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition"
              >
                Add
              </button>
            </div>
            <div className="space-y-2">
              {formData.requirements.map((req, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-900 rounded-lg text-white"
                >
                  <span className="text-white">{req}</span>
                  <button
                    type="button"
                    onClick={() => removeRequirement(idx)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Content Generator */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">AI Lesson Generator</h3>
              <p className="text-xs text-slate-400">Build a full lesson plan automatically. OpenRouter powers the result when configured.</p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs text-slate-300">Lessons</label>
              <input
                type="number"
                min={6}
                max={24}
                value={aiLessonCount}
                onChange={(e) => setAiLessonCount(Number(e.target.value) || 12)}
                disabled={isGeneratingAi}
                className="w-20 px-3 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
              />
              <button
                type="button"
                onClick={handleGenerateAiContent}
                disabled={isGeneratingAi}
                className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold"
              >
                {isGeneratingAi ? 'Generating...' : 'Generate AI Plan'}
              </button>
            </div>
          </div>
          {aiStatus && (
            <div className="text-xs text-primary-300">
              {aiStatus}
            </div>
          )}
        </div>

        {/* Lesson Outline */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Lesson Outline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
              placeholder="Lesson title"
            />
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={lessonHasVideo} onChange={(e) => setLessonHasVideo(e.target.checked)} className="h-4 w-4 text-sky-500" />
                Video
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={lessonHasText} onChange={(e) => setLessonHasText(e.target.checked)} className="h-4 w-4 text-sky-500" />
                Text
              </label>
              <label className="flex items-center gap-2 text-sm text-white">
                <input type="checkbox" checked={lessonHasQuiz} onChange={(e) => setLessonHasQuiz(e.target.checked)} className="h-4 w-4 text-sky-500" />
                Quiz
              </label>
              <button type="button" onClick={addLessonOutline} className="px-3 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-500 transition">
                Add Lesson
              </button>
            </div>
          </div>
          {formData.lessonOutline.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.lessonOutline.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className="flex items-center justify-between p-3 bg-slate-900 rounded-lg text-white"
                >
                  <span className="text-white text-sm">
                    {lesson.title} ({lesson.hasVideo ? 'Video' : 'No Video'}, {lesson.hasText ? 'Text' : 'No Text'}, {lesson.hasQuiz ? 'Quiz' : 'No Quiz'})
                  </span>
                  <button
                    type="button"
                    onClick={() => removeLessonOutline(index)}
                    className="text-red-500 hover:text-red-700 font-bold"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Resources */}
        <div className="mt-8 pt-8 border-t border-white/10">
          <h3 className="text-xl font-bold text-white mb-4">Course Resources</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input
              type="text"
              value={resourceTitle}
              onChange={(e) => setResourceTitle(e.target.value)}
              className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
              placeholder="Resource title (e.g., Tajweed Module 1)"
            />
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value as 'pdf' | 'audio' | 'document')}
              className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
            >
              <option value="pdf">PDF</option>
              <option value="audio">Audio</option>
              <option value="document">Document</option>
            </select>
            <button
              type="button"
              onClick={addResource}
              className="px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              disabled={!resourceUrl || !resourceTitle.trim()}
            >
              Add Resource
            </button>
          </div>
          <FileUploader
            fileType={resourceType}
            folder="course-resources"
            accept={resourceType === 'pdf' ? 'application/pdf' : resourceType === 'audio' ? 'audio/*' : '.pdf,.doc,.docx'}
            maxFiles={1}
            onUploadComplete={(url) => setResourceUrl(url)}
            onUploadError={(error) => setAiStatus(error)}
          />
          {resourceUrl && (
            <p className="text-xs text-slate-400">Uploaded resource ready to add.</p>
          )}
          {formData.resources.length > 0 && (
            <div className="mt-4 space-y-2">
              {formData.resources.map((resource, index) => (
                <div key={resource.id} className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2">
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-300 hover:text-primary-200">
                    {resource.title} ({resource.type.toUpperCase()})
                  </a>
                  <button type="button" onClick={() => removeResource(index)} className="text-red-500 hover:text-red-400 font-bold">
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t border-white/10">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-semibold rounded-lg hover:from-primary-600 hover:to-accent-600 transition disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/courses/list')}
            className="px-6 py-3 border bg-slate-900 border-white/10 text-white font-semibold rounded-lg hover:bg-slate-700 transition text-white text-white"
          >
            Cancel
          </button>
        </div>
      </form>
      )}
    </div>
  );
}
