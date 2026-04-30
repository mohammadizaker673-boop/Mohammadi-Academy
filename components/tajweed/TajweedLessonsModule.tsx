/**
 * Tajweed Lessons Module
 * Progressive lessons from beginner to advanced levels
 * Features: Lesson structure, Tajweed rules explanation, audio examples, practice ayahs
 */

import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import QuranTajweedService, { TAJWEED_RULES } from '../../services/quranTajweedService';
import { BookOpen, Play, Volume2, ChevronRight, Lock, CheckCircle, Clock, BarChart3 } from 'lucide-react';

interface TajweedLessonsModuleProps {
  level: 'beginner' | 'intermediate' | 'advanced';
  onLessonComplete: (lessonsCompletedNow: number, rulesLearned: string[]) => void;
  onLevelChange: (level: 'beginner' | 'intermediate' | 'advanced') => void;
}

// Sample lessons data
const LESSONS_DATA = {
  beginner: [
    {
      id: 'lesson-1',
      title: 'Introduction to Tajweed',
      titleArabic: 'مقدمة في التجويد',
      description: 'Learn what Tajweed is and why it\'s important',
      duration: 15,
      content: 'Tajweed means to endow something with beauty and goodness. In the context of Quran, Tajweed is the science of recitation which teaches the correct way to recite the Quran.',
      relatedRules: [],
      ayahExample: 'بسم الله الرحمن الرحيم',
      completed: false,
      videoUrl: '#'
    },
    {
      id: 'lesson-2',
      title: 'Noon Sakinah Rules',
      titleArabic: 'أحكام النون الساكنة',
      description: 'Understanding the 4 rules of silent Noon',
      duration: 20,
      content: 'The Noon Sakinah (ن) has 4 rules: Idgham, Ikhfa, Iqlab, and Izhar. Each rule applies when Noon is followed by specific letters.',
      relatedRules: ['noon-sakinah'],
      ayahExample: 'إن هذا لهو القصص الحق',
      completed: false,
      videoUrl: '#'
    },
    {
      id: 'lesson-3',
      title: 'Meem Sakinah Rules',
      titleArabic: 'أحكام الميم الساكنة',
      description: 'Master the rules of silent Meem',
      duration: 20,
      content: 'The Meem Sakinah (م) has 3 rules: Idgham, Ikhfa, and Izhar. Understanding these is crucial for correct recitation.',
      relatedRules: ['meem-sakinah'],
      ayahExample: 'والله يعلم ما في نفوسكم',
      completed: false,
      videoUrl: '#'
    },
    {
      id: 'lesson-4',
      title: 'Basic Madd Rules',
      titleArabic: 'أساسات قواعد المد',
      description: 'Introduction to elongation rules',
      duration: 18,
      content: 'Madd means to elongate a vowel. There are different types of Madd: Natural Madd (2 counts), Necessary Madd (4-6 counts), and Permissible Madd.',
      relatedRules: ['madd-rules'],
      ayahExample: 'الآية، الباب، قال',
      completed: false,
      videoUrl: '#'
    }
  ],
  intermediate: [
    {
      id: 'lesson-5',
      title: 'Advanced Noon Rules',
      titleArabic: 'أحكام النون المتقدمة',
      description: 'Deep dive into complex Noon scenarios',
      duration: 25,
      content: 'Learn about special cases and exceptions in Noon rules, including when Noon appears with specific letter combinations.',
      relatedRules: ['noon-sakinah', 'idgham'],
      ayahExample: 'من يشاء ومن يشاء يضل',
      completed: false,
      videoUrl: '#'
    },
    {
      id: 'lesson-6',
      title: 'Alif Lam Rules',
      titleArabic: 'أحكام اللام الشمسية والقمرية',
      description: 'The definite article rules',
      duration: 20,
      content: 'The Lam in "AL" (ال - the definite article) can be Solar (Shamsiyya) or Lunar (Qamari) with completely different pronunciations.',
      relatedRules: ['alif-lam'],
      ayahExample: 'الحمد لله، الشمس والقمر',
      completed: false,
      videoUrl: '#'
    },
    {
      id: 'lesson-7',
      title: 'Hamza Rules',
      titleArabic: 'أحكام الهمزة',
      description: 'Mastering the glottal stop',
      duration: 25,
      content: 'The Hamza (ء) has special rules for pronunciation. Learn about Hamza at the beginning, middle, and end of words.',
      relatedRules: ['hamza-rules'],
      ayahExample: 'الآية، المؤمنون، قاض',
      completed: false,
      videoUrl: '#'
    },
    {
      id: 'lesson-8',
      title: 'Complex Idgham',
      titleArabic: 'الإدغام المعقد',
      description: 'Advanced assimilation rules',
      duration: 30,
      content: 'Understand the nuanced rules of letter assimilation, including when letters merge completely and when they partially merge.',
      relatedRules: ['idgham'],
      ayahExample: 'يسّ والقرآن الحكيم',
      completed: false,
      videoUrl: '#'
    }
  ],
  advanced: [
    {
      id: 'lesson-9',
      title: 'Rare Tajweed Applications',
      titleArabic: 'تطبيقات التجويد النادرة',
      description: 'Master rare and complex Tajweed scenarios',
      duration: 35,
      content: 'Explore advanced topics including rare letter combinations, special dialects, and master-level recitation techniques.',
      relatedRules: ['idgham', 'madd-rules', 'hamza-rules'],
      ayahExample: 'Complex multi-rule ayahs',
      completed: false,
      videoUrl: '#'
    },
    {
      id: 'lesson-10',
      title: 'Qira\'at Variations',
      titleArabic: 'تنوعات القراءات',
      description: 'Understanding different Quranic reading styles',
      duration: 40,
      content: 'There are 10 recognized readings (Qira\'at) of the Quran. Learn how they differ and when each is appropriate.',
      relatedRules: [],
      ayahExample: 'Various readings of the same ayah',
      completed: false,
      videoUrl: '#'
    },
    {
      id: 'lesson-11',
      title: 'Master Recitation Practice',
      titleArabic: 'ممارسة الإتقان',
      description: 'Apply all rules to full Surah recitation',
      duration: 45,
      content: 'Now apply everything you\'ve learned to reciting complete Surahs with perfect Tajweed.',
      relatedRules: ['noon-sakinah', 'meem-sakinah', 'idgham', 'madd-rules'],
      ayahExample: 'Surah Al-Fatiha, Al-Ikhlas',
      completed: false,
      videoUrl: '#'
    },
    {
      id: 'lesson-12',
      title: 'Certification Preparation',
      titleArabic: 'التحضير للشهادة',
      description: 'Final review and certification test',
      duration: 60,
      content: 'Final comprehensive review of all Tajweed rules learned. Prepare for the certification exam.',
      relatedRules: [],
      ayahExample: 'Comprehensive Quranic passages',
      completed: false,
      videoUrl: '#'
    }
  ]
};

export const TajweedLessonsModule: React.FC<TajweedLessonsModuleProps> = ({
  level,
  onLessonComplete,
  onLevelChange
}) => {
  const { isDark } = useTheme();
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);

  const lessons = LESSONS_DATA[level];
  const selectedLessonData = selectedLesson ? lessons.find(l => l.id === selectedLesson) : null;

  const handleCompleteLesson = () => {
    if (!selectedLesson) return;

    const lesson = lessons.find(l => l.id === selectedLesson);
    if (!lesson) return;

    setCompletedLessons([...completedLessons, selectedLesson]);

    // Notify parent
    onLessonComplete(completedLessons.length + 1, lesson.relatedRules);

    // Auto-select next uncompleted lesson
    const nextLesson = lessons.find(l => !completedLessons.includes(l.id) && l.id !== selectedLesson);
    if (nextLesson) {
      setSelectedLesson(nextLesson.id);
    }
  };

  const handleLevelChange = (newLevel: 'beginner' | 'intermediate' | 'advanced') => {
    onLevelChange(newLevel);
    setSelectedLesson(null);
    setCompletedLessons([]);
  };

  return (
    <div className={`${isDark ? 'bg-slate-800' : 'bg-white'} rounded-lg`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-slate-700 border-slate-600' : 'bg-blue-50 border-blue-200'} border-b p-6`}>
        <h2 className={`text-2xl font-bold mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <BookOpen className="w-6 h-6 text-blue-500" />
          Tajweed Lessons - {level.charAt(0).toUpperCase() + level.slice(1)}
        </h2>

        {/* Level Selector */}
        <div className="flex gap-2">
          {(['beginner', 'intermediate', 'advanced'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => handleLevelChange(lvl)}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                level === lvl
                  ? 'bg-blue-500 text-white shadow-lg'
                  : `${isDark ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`
              }`}
            >
              {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Lessons List */}
        <div className="lg:col-span-1">
          <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-4`}>
            <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Lessons ({completedLessons.length}/{lessons.length})
            </h3>

            <div className="space-y-2">
              {lessons.map((lesson, idx) => {
                const isCompleted = completedLessons.includes(lesson.id);
                const isSelected = selectedLesson === lesson.id;

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(lesson.id)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      isSelected
                        ? `${isDark ? 'bg-blue-600' : 'bg-blue-500'} text-white`
                        : `${isDark ? 'bg-slate-600 hover:bg-slate-500' : 'bg-white hover:bg-gray-100'} ${isDark ? 'text-gray-200' : 'text-gray-700'}`
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isCompleted ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                      )}
                      <span className="font-semibold flex-1 truncate">Lesson {idx + 1}</span>
                      <Clock className="w-4 h-4 opacity-60" />
                      <span className="text-xs opacity-70">{lesson.duration}m</span>
                    </div>
                    <p className="text-xs opacity-80 truncate">{lesson.title}</p>
                  </button>
                );
              })}
            </div>

            {/* Progress Stats */}
            <div className={`mt-6 p-4 rounded-lg ${isDark ? 'bg-slate-600' : 'bg-blue-50'} border ${isDark ? 'border-slate-500' : 'border-blue-200'}`}>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-4 h-4 text-blue-500" />
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Progress</span>
              </div>
              <div className={`w-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full h-3 mb-2`}>
                <div
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all"
                  style={{ width: `${(completedLessons.length / lessons.length) * 100}%` }}
                ></div>
              </div>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {Math.round((completedLessons.length / lessons.length) * 100)}% Complete
              </p>
            </div>
          </div>
        </div>

        {/* Lesson Content */}
        <div className="lg:col-span-2">
          {selectedLessonData ? (
            <div>
              <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-6 mb-4`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                      {selectedLessonData.title}
                    </h3>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {selectedLessonData.titleArabic}
                    </p>
                  </div>
                  {completedLessons.includes(selectedLesson!) && (
                    <CheckCircle className="w-8 h-8 text-green-500" />
                  )}
                </div>

                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {selectedLessonData.description}
                </p>

                {/* Learning Objectives */}
                <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800">
                  <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>What You'll Learn:</h4>
                  <ul className="space-y-2">
                    <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-blue-500 font-bold mt-1">•</span>
                      <span>Understanding {selectedLessonData.title.toLowerCase()}</span>
                    </li>
                    <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-blue-500 font-bold mt-1">•</span>
                      <span>Practical application with Quranic examples</span>
                    </li>
                    <li className={`flex items-start gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      <span className="text-blue-500 font-bold mt-1">•</span>
                      <span>Master pronunciation and articulation</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Lesson Content */}
              <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-6 mb-4`}>
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Lesson Content</h4>
                <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed mb-4`}>
                  {selectedLessonData.content}
                </p>

                {/* Example Ayah */}
                <div className={`p-4 rounded-lg ${isDark ? 'bg-slate-600 border-slate-500' : 'bg-white border-gray-200'} border`}>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Example from Quran:</p>
                  <p className="text-right text-lg font-arabic leading-relaxed mb-2">
                    {selectedLessonData.ayahExample}
                  </p>
                  <button className="flex items-center gap-2 text-blue-500 hover:text-blue-600 font-semibold text-sm">
                    <Volume2 className="w-4 h-4" />
                    Listen to Audio
                  </button>
                </div>
              </div>

              {/* Related Tajweed Rules */}
              {selectedLessonData.relatedRules.length > 0 && (
                <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-6 mb-4`}>
                  <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>Related Tajweed Rules</h4>
                  <div className="space-y-2">
                    {selectedLessonData.relatedRules.map(ruleId => {
                      const rule = TAJWEED_RULES.find(r => r.id === ruleId);
                      return rule ? (
                        <div key={rule.id} className={`p-3 rounded-lg ${isDark ? 'bg-slate-600' : 'bg-white'} border ${isDark ? 'border-slate-500' : 'border-gray-200'}`}>
                          <p className={`font-semibold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{rule.name}</p>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{rule.definition}</p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCompleteLesson}
                  disabled={completedLessons.includes(selectedLesson!)}
                  className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                    completedLessons.includes(selectedLesson!)
                      ? `${isDark ? 'bg-gray-700 text-gray-500' : 'bg-gray-300 text-gray-600'} cursor-not-allowed`
                      : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-lg'
                  }`}
                >
                  <CheckCircle className="w-5 h-5" />
                  {completedLessons.includes(selectedLesson!) ? 'Completed' : 'Mark as Complete'}
                </button>

                <button className={`flex-1 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                  isDark ? 'bg-slate-600 text-gray-300 hover:bg-slate-500' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}>
                  <Play className="w-5 h-5" />
                  Watch Video Lesson
                </button>
              </div>
            </div>
          ) : (
            <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-12 text-center`}>
              <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Select a lesson to begin
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TajweedLessonsModule;
