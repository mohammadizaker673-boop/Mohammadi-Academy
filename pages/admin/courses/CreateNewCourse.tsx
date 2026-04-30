import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, Timestamp, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../../services/firebase';
import { BookOpen, Save, Plus, X } from 'lucide-react';
import FileUploader from '../../../components/admin/FileUploader';
import { generateAICoursePackage, generateAutomatedCourseContent } from '../../../utils/aiCourseGenerator';
import { AutomatedLesson } from '../../../types/automated-course.types';
import {
  buildAutomatedCourseFromPrebuilt,
  buildAutomatedLessonsFromPrebuilt,
  getPrebuiltCourseContent,
  getPrebuiltCourseMeta,
  prebuiltCourseKeys
} from '../../../data/automated-content';

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

export default function CreateNewCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [showThumbnailUploader, setShowThumbnailUploader] = useState(false);
  const [aiLessonCount, setAiLessonCount] = useState(8);
  const [aiStatus, setAiStatus] = useState('');
  const [aiLessons, setAiLessons] = useState<AutomatedLesson[]>([]);
  const [prebuiltKey, setPrebuiltKey] = useState('');
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceType, setResourceType] = useState<'pdf' | 'audio' | 'document'>('pdf');
  const [resourceUrl, setResourceUrl] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'quran',
    ageGroup: 'all' as 'children' | 'preteens' | 'youth' | 'adults' | 'all',
    ageRange: '',
    languages: [] as string[],
    teacherId: '',
    status: 'draft' as 'draft' | 'published',
    thumbnailUrl: '',
    isActive: true,
    level: 'beginner' as 'beginner' | 'intermediate' | 'advanced' | 'all',
    targetAudience: '',
    duration: '',
    price: 0,
    priceType: 'free' as 'free' | 'paid',
    deliveryType: 'live' as 'live' | 'automated',
    accessDurationDays: 30,
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

  const addToArray = (field: 'mode' | 'materials', value: string) => {
    if (!value.trim()) return;
    setFormData(prev => ({
      ...prev,
      classFormat: {
        ...prev.classFormat,
        [field]: [...prev.classFormat[field], value.trim()]
      }
    }));
    if (field === 'mode') setClassMode('');
    if (field === 'materials') setMaterial('');
  };

  const removeFromArray = (field: 'mode' | 'materials', index: number) => {
    setFormData(prev => ({
      ...prev,
      classFormat: {
        ...prev.classFormat,
        [field]: prev.classFormat[field].filter((_, i) => i !== index)
      }
    }));
  };

  const addRequirement = () => {
    if (!requirement.trim()) return;
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, requirement.trim()]
    }));
    setRequirement('');
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
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
    if (!formData.title.trim()) {
      setAiStatus('Please enter a course title first.');
      return;
    }

    const primaryLanguage = formData.languages[0] || 'english';

    setIsGeneratingAi(true);
    setAiStatus('Generating course content...');

    try {
      const generatedPackage = await generateAICoursePackage({
        title: formData.title.trim(),
        category: formData.category as any,
        level: formData.level,
        ageGroup: formData.ageGroup,
        primaryLanguage,
        lessonCount: aiLessonCount
      });

      const generated = generatedPackage.courseContent;
      const generatedLessons = generatedPackage.lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        order: lesson.order,
        content: lesson.content
      }));

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

      setAiLessons(generatedLessons);
      setLessonHasVideo(false);
      setLessonHasText(true);
      setLessonHasQuiz(true);
      setAiStatus(
        generatedPackage.source === 'ai'
          ? `Generated ${generated.lessonOutline.length} automated lessons with OpenRouter.`
          : `OpenRouter is unavailable, so a local ${generated.lessonOutline.length}-lesson template was generated.`
      );
    } finally {
      setIsGeneratingAi(false);
    }
  };

  const handleLoadPrebuiltCourse = () => {
    if (!prebuiltKey) {
      setAiStatus('Please select a prebuilt course first.');
      return;
    }

    const content = getPrebuiltCourseContent(prebuiltKey);
    const meta = getPrebuiltCourseMeta(prebuiltKey);
    const course = buildAutomatedCourseFromPrebuilt(prebuiltKey);
    const lessons = buildAutomatedLessonsFromPrebuilt(prebuiltKey);

    if (!content || !meta || !course) {
      setAiStatus('Prebuilt course not found.');
      return;
    }

    const generated = generateAutomatedCourseContent({
      title: course.title,
      category: course.category as any,
      level: course.level,
      ageGroup: meta.ageGroup as any,
      primaryLanguage: meta.language,
      lessonCount: lessons.length
    });

    setFormData(prev => ({
      ...prev,
      title: course.title,
      description: content.course.description,
      category: meta.category as any,
      ageGroup: meta.ageGroup as any,
      ageRange: meta.ageRange,
      languages: [meta.language],
      level: course.level,
      targetAudience: meta.targetAudience,
      duration: generated.duration,
      priceType: meta.priceType,
      price: meta.price,
      accessDurationDays: meta.accessDurationDays,
      deliveryType: 'automated',
      requirements: generated.requirements,
      classFormat: {
        ...prev.classFormat,
        duration: generated.classFormat.duration,
        mode: generated.classFormat.mode,
        materials: generated.classFormat.materials
      },
      lessonOutline: lessons.map((lesson) => ({
        id: lesson.id,
        title: lesson.title,
        hasVideo: false,
        hasText: true,
        hasQuiz: true
      }))
    }));

    setAiLessonCount(lessons.length);
    setAiLessons(lessons);
    setAiStatus(`Loaded prebuilt course: ${course.title}.`);
  };

  const handleThumbnailUpload = (url: string) => {
    setFormData(prev => ({ ...prev, thumbnailUrl: url }));
    setShowThumbnailUploader(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const normalizedPrice = formData.priceType === 'free' ? 0 : formData.price;

      if (formData.deliveryType === 'automated') {
        const courseRef = prebuiltKey
          ? doc(db, 'automated_courses', prebuiltKey)
          : doc(collection(db, 'automated_courses'));
        const batch = writeBatch(db);
        const primaryLanguage = formData.languages[0] || 'english';

        batch.set(courseRef, {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          level: formData.level,
          ageGroup: formData.ageGroup,
          ageRange: formData.ageRange,
          language: primaryLanguage,
          price: normalizedPrice,
          priceType: formData.priceType,
          accessDurationDays: formData.accessDurationDays,
          status: formData.status,
          isActive: formData.isActive,
          deliveryType: 'automated',
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
          lessonCount: aiLessons.length
        }, prebuiltKey ? { merge: true } : undefined);

        aiLessons.forEach((lesson) => {
          const lessonRef = doc(courseRef, 'lessons', lesson.id);
          batch.set(lessonRef, {
            title: lesson.title,
            order: lesson.order,
            content: lesson.content,
            createdAt: Timestamp.now()
          });
        });

        await batch.commit();
        alert('Automated course created successfully!');
        navigate('/admin/courses/list');
        return;
      }

      const courseData = {
        ...formData,
        price: normalizedPrice,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        enrolledStudents: 0,
        lessonsCount: 0
      };

      await addDoc(collection(db, 'courses'), courseData);
      alert('Course created successfully!');
      navigate('/admin/courses/list');
    } catch (error) {
      console.error('Error creating course:', error);
      alert('Failed to create course. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BookOpen className="text-primary-500" size={32} />
          Create New Course
        </h1>
        <p className="text-white mt-2">Add a new course to your academy</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl shadow-lg p-8 space-y-6">
        {/* Basic Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-2">Basic Information</h3>
          
          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Course Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="e.g., Advanced Tajweed Mastery"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="Provide a detailed description of the course..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              >
                <option value="quran">Quran Studies</option>
                <option value="arabic">Arabic Language</option>
                <option value="islamic-studies">Islamic Studies</option>
                <option value="science">Science & Discovery</option>
                <option value="information-technology">Information Technology</option>
                <option value="general-knowledge">General Knowledge</option>
                <option value="life-skills">Life Skills</option>
                <option value="digital-skills">Digital Skills</option>
                <option value="language-learning">Language Learning</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value as any })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all">All Levels</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Duration
              </label>
              <input
                type="text"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                placeholder="e.g., 3 months, 6 weeks"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Price (USD)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                placeholder="0"
                min="0"
                disabled={formData.priceType === 'free'}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Age Group
              </label>
              <select
                value={formData.ageGroup}
                onChange={(e) => setFormData({ ...formData, ageGroup: e.target.value as any })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
              >
                <option value="all">All Ages</option>
                <option value="children">Children (5-9)</option>
                <option value="preteens">Pre-Teens (10-14)</option>
                <option value="youth">Youth (15-20)</option>
                <option value="adults">Adults (21+)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Age Range
              </label>
              <input
                type="text"
                value={formData.ageRange}
                onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                placeholder="e.g., 10-14 years"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Price Type
              </label>
              <select
                value={formData.priceType}
                onChange={(e) => setFormData({ ...formData, priceType: e.target.value as 'free' | 'paid' })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
              >
                <option value="free">Free</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="flex items-center gap-3">
              <input
                id="lowBandwidthFriendly"
                type="checkbox"
                checked={formData.lowBandwidthFriendly}
                onChange={(e) => setFormData({ ...formData, lowBandwidthFriendly: e.target.checked })}
                className="h-4 w-4 text-sky-500"
              />
              <label htmlFor="lowBandwidthFriendly" className="text-sm font-semibold text-white">
                Low bandwidth friendly
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Course Type
              </label>
              <select
                value={formData.deliveryType}
                onChange={(e) => setFormData({ ...formData, deliveryType: e.target.value as 'live' | 'automated' })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
              >
                <option value="live">Instructor-led</option>
                <option value="automated">Automated (AI)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Access Duration (days)
              </label>
              <input
                type="number"
                min={1}
                value={formData.accessDurationDays}
                onChange={(e) => setFormData({ ...formData, accessDurationDays: Number(e.target.value) || 30 })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                placeholder="30"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Target Audience
            </label>
            <input
              type="text"
              value={formData.targetAudience}
              onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
              className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="e.g., Adults, Children, Beginners"
            />
          </div>

          <div>
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
        </div>

        {/* Thumbnail */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-2">Course Thumbnail</h3>
          
          {formData.thumbnailUrl ? (
            <div className="relative">
              <img
                src={formData.thumbnailUrl}
                alt="Course thumbnail"
                className="w-full h-64 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => setFormData({ ...formData, thumbnailUrl: '' })}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <X size={20} />
              </button>
            </div>
          ) : (
            <div>
              {showThumbnailUploader ? (
                <FileUploader
                  onUploadComplete={handleThumbnailUpload}
                  accept="image/*"
                  folder="course-thumbnails"
                  fileType="image"
                />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowThumbnailUploader(true)}
                  className="w-full px-4 py-8 border-2 border-dashed bg-slate-900 border-white/10 rounded-lg hover:border-primary-500 text-white hover:text-primary-500 transition text-white text-white"
                >
                  Click to upload course thumbnail
                </button>
              )}
            </div>
          )}
        </div>

        {/* Class Format */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-2">Class Format</h3>
          
          <div>
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
              className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="e.g., 1 hour per session"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Class Modes
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={classMode}
                onChange={(e) => setClassMode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('mode', classMode))}
                className="flex-1 px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                placeholder="e.g., Online via Zoom, In-person"
              />
              <button
                type="button"
                onClick={() => addToArray('mode', classMode)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.classFormat.mode.map((mode, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-sky-100 text-sky-700 rounded-full text-sm flex items-center gap-2"
                >
                  {mode}
                  <button
                    type="button"
                    onClick={() => removeFromArray('mode', index)}
                    className="hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-white mb-2">
              Materials Included
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addToArray('materials', material))}
                className="flex-1 px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
                placeholder="e.g., Textbook PDF, Video Lectures"
              />
              <button
                type="button"
                onClick={() => addToArray('materials', material)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.classFormat.materials.map((mat, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm flex items-center gap-2"
                >
                  {mat}
                  <button
                    type="button"
                    onClick={() => removeFromArray('materials', index)}
                    className="hover:text-red-600"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Requirements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-2">Course Requirements</h3>
          
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={requirement}
              onChange={(e) => setRequirement(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              className="flex-1 px-4 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white"
              placeholder="e.g., Basic Arabic reading ability"
            />
            <button
              type="button"
              onClick={addRequirement}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="space-y-2">
            {formData.requirements.map((req, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg"
              >
                <span className="flex-1 text-sm text-white">{req}</span>
                <button
                  type="button"
                  onClick={() => removeRequirement(index)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

          {/* AI Content Generator */}
          {formData.deliveryType === 'automated' && (
            <div className="space-y-4 border border-white/10 rounded-xl p-4 bg-slate-900/60">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Content Generator</h3>
                  <p className="text-xs text-slate-400">Uses your current title, category, level, and age group. OpenRouter powers the result when configured.</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs text-slate-300">Lessons</label>
                  <input
                    type="number"
                    min={4}
                    max={24}
                    value={aiLessonCount}
                    onChange={(e) => setAiLessonCount(Number(e.target.value) || 8)}
                    disabled={isGeneratingAi}
                    className="w-20 px-3 py-2 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateAiContent}
                    disabled={isGeneratingAi}
                    className="px-4 py-2 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold"
                  >
                    {isGeneratingAi ? 'Generating...' : 'Generate'}
                  </button>
                </div>
              </div>
              {aiStatus && (
                <div className="text-xs text-primary-300">
                  {aiStatus}
                </div>
              )}
            </div>
          )}

        {/* Lesson Outline */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-2">Lesson Outline</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={lessonTitle}
              onChange={(e) => setLessonTitle(e.target.value)}
              className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white"
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
            <div className="space-y-2">
              {formData.lessonOutline.map((lesson, index) => (
                <div key={lesson.id} className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2">
                  <div className="text-sm text-white">
                    {lesson.title} ({lesson.hasVideo ? 'Video' : 'No Video'}, {lesson.hasText ? 'Text' : 'No Text'}, {lesson.hasQuiz ? 'Quiz' : 'No Quiz'})
                  </div>
                  <button type="button" onClick={() => removeLessonOutline(index)} className="text-red-400 hover:text-red-300">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Course Resources */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-2">Course Resources</h3>
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
            <div className="space-y-2">
              {formData.resources.map((resource, index) => (
                <div key={resource.id} className="flex items-center justify-between bg-slate-900/60 border border-white/10 rounded-lg px-4 py-2">
                  <div className="text-sm text-white">
                    {resource.title} ({resource.type.toUpperCase()})
                  </div>
                  <button type="button" onClick={() => removeResource(index)} className="text-red-400 hover:text-red-300">Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white border-b pb-2">Course Status</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Publication Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-4 py-3 border bg-slate-900 border-white/10 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent text-white text-white text-white"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 accent-sky-500"
                />
                <span className="text-sm font-semibold text-white">Course is Active</span>
              </label>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-6 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-lg hover:from-primary-600 hover:to-blue-700 transition font-semibold disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Creating Course...' : 'Create Course'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/courses/list')}
            className="px-6 py-3 border bg-slate-900 border-white/10 text-white rounded-lg hover:bg-slate-900 transition font-semibold text-white text-white text-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
