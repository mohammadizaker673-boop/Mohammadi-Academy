/**
 * Quran Tajweed Learning Platform
 * Complete learning system for Quran with proper Tajweed rules
 * Features: Progressive lessons, pronunciation training, practice exercises, assessments, teacher support
 */

import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import BackButton from '../../components/BackButton';
import QuranTajweedService, { TAJWEED_RULES, MAKHARAJ_LESSONS } from '../../services/quranTajweedService';
import {
  TajweedStudentProgress,
  TajweedLesson,
  TeacherNote
} from '../../types/quran-tajweed.types';
import {
  BookOpen,
  Mic,
  CheckCircle,
  MessageSquare,
  Award,
  BarChart3,
  ChevronRight,
  Volume2,
  Target,
  User,
  Clock,
  Zap
} from 'lucide-react';

// Lazy load modules
const TajweedLessonsModule = lazy(() => import('../../components/tajweed/TajweedLessonsModule'));
const TajweedPracticeModule = lazy(() => import('../../components/tajweed/TajweedPracticeModule'));
const TajweedPronunciationModule = lazy(() => import('../../components/tajweed/TajweedPronunciationModule'));
const TajweedAssessmentModule = lazy(() => import('../../components/tajweed/TajweedAssessmentModule'));
const TeacherSupportChat = lazy(() => import('../../components/tajweed/TeacherSupportChat'));

export const QuranTajweedPlatform: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { isDark } = useTheme();

  // State Management
  const [activeModule, setActiveModule] = useState<
    'lessons' | 'practice' | 'pronunciation' | 'assessment' | 'teacher'
  >('lessons');
  const [studentProgress, setStudentProgress] = useState<TajweedStudentProgress | null>(null);
  const [teacherNotes, setTeacherNotes] = useState<TeacherNote[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  // Initialize student progress on component mount
  useEffect(() => {
    if (user?.id) {
      // In real app, fetch from Firebase
      const progress = QuranTajweedService.initializeStudentProgress(user.id);
      setStudentProgress(progress);

      // Generate initial teacher suggestions
      const suggestions = QuranTajweedService.generateTeacherSuggestions(['Pronunciation'], 0, 12);
      setTeacherNotes(suggestions);
    }
  }, [user]);

  // Update progress from lesson completion
  const handleLessonComplete = (
    lessonsCompletedNow: number,
    rulesLearned: string[]
  ) => {
    if (!studentProgress) return;

    const updatedProgress = QuranTajweedService.updateProgressAfterLesson(
      studentProgress,
      lessonsCompletedNow,
      rulesLearned
    );
    setStudentProgress(updatedProgress);

    // Show notification
    setNotificationMessage('🎉 Lesson completed! Great progress!');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);

    // Check if teacher assistance needed
    if (QuranTajweedService.suggestTeacherAssistance(updatedProgress)) {
      setNotificationMessage('💡 Your teacher is ready to help! Click on "Teacher Support" to connect.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 4000);
    }
  };

  const handlePronunciationFeedback = (score: number) => {
    if (!studentProgress || score < 60) return;

    // Award points for good pronunciation
    setNotificationMessage(`🌟 Great pronunciation! ${Math.round(score)}% accuracy!`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleExerciseComplete = (score: number, passed: boolean) => {
    if (!studentProgress) return;

    const newProgress = { ...studentProgress };
    if (passed) {
      newProgress.exercisesCompleted += 1;
      setNotificationMessage(`✅ Exercise passed! Score: ${score}%`);
    } else {
      setNotificationMessage(`📚 Keep practicing! Score: ${score}%. Try again!`);
    }

    setStudentProgress(newProgress);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleAssessmentComplete = (score: number, level: string) => {
    if (!studentProgress) return;

    const newProgress = { ...studentProgress };
    newProgress.assessmentScores.push({
      assessmentId: `assessment-${Date.now()}`,
      score,
      date: new Date()
    });

    setStudentProgress(newProgress);
    setNotificationMessage(`🏆 Assessment completed! Score: ${score}%`);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleNewMessage = () => {
    setUnreadMessages(prev => prev + 1);
  };

  // Module Components Configuration
  const modules = [
    {
      id: 'lessons',
      label: 'Tajweed Lessons',
      icon: BookOpen,
      description: 'Progressive lessons from beginner to advanced',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'practice',
      label: 'Practice Exercises',
      icon: Target,
      description: 'Interactive exercises for each Tajweed rule',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'pronunciation',
      label: 'Pronunciation Trainer',
      icon: Volume2,
      description: 'Makhraj training with voice recording and feedback',
      color: 'from-green-500 to-green-600'
    },
    {
      id: 'assessment',
      label: 'Assessments',
      icon: Award,
      description: 'Tests and progress evaluations',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'teacher',
      label: 'Teacher Support',
      icon: MessageSquare,
      description: 'Chat with your Tajweed teacher for guidance',
      color: 'from-pink-500 to-pink-600',
      badge: unreadMessages > 0 ? unreadMessages : undefined
    }
  ];

  if (!studentProgress) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-slate-900 to-slate-800' : 'bg-gradient-to-br from-blue-50 to-indigo-100'} flex items-center justify-center`}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-gray-50'}`}>
      {/* Header */}
      <div className={`${isDark ? 'bg-gradient-to-r from-slate-800 to-slate-700' : 'bg-gradient-to-r from-blue-600 to-blue-700'} text-white py-8 px-6`}>
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <BackButton />
            <div className="flex items-center gap-4">
              <User className="w-5 h-5" />
              <span>{user?.displayName || 'Student'}</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold mb-3">🕌 Quran Tajweed Learning</h1>
          <p className="text-blue-100 text-lg">Master the rules of proper Quranic recitation</p>
        </div>
      </div>

      {/* Notification */}
      {showNotification && (
        <div className="fixed top-4 right-4 z-50 animate-bounce">
          <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-blue-50 border-blue-300'} border-l-4 border-blue-500 p-4 rounded-lg shadow-lg`}>
            <p className={`${isDark ? 'text-white' : 'text-gray-800'}`}>{notificationMessage}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Progress Overview Card */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-lg p-6 mb-8 shadow-lg`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
                Your Learning Progress
              </h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Current Level: <span className="font-semibold capitalize">{studentProgress.currentLevel}</span>
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-blue-500 mb-2">
                {studentProgress.overallProgress}%
              </div>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                {studentProgress.lessonsCompleted} of {studentProgress.totalLessons} lessons completed
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className={`w-full ${isDark ? 'bg-slate-700' : 'bg-gray-200'} rounded-full h-4 overflow-hidden`}>
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${studentProgress.overallProgress}%` }}
            ></div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <StatItem
              icon={<BookOpen className="w-5 h-5 text-blue-500" />}
              label="Lessons Done"
              value={studentProgress.lessonsCompleted}
            />
            <StatItem
              icon={<CheckCircle className="w-5 h-5 text-green-500" />}
              label="Rules Learned"
              value={studentProgress.rulesLearned.length}
            />
            <StatItem
              icon={<Volume2 className="w-5 h-5 text-purple-500" />}
              label="Makharaj Mastered"
              value={studentProgress.makhrajsMastered.length}
            />
            <StatItem
              icon={<Zap className="w-5 h-5 text-yellow-500" />}
              label="Exercises Done"
              value={studentProgress.exercisesCompleted}
            />
          </div>
        </div>

        {/* Module Selection Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          {modules.map((module) => (
            <button
              key={module.id}
              onClick={() => setActiveModule(module.id as any)}
              className={`relative group transition-all duration-300 ${
                activeModule === module.id ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              <div className={`h-full rounded-lg p-4 ${
                activeModule === module.id
                  ? `bg-gradient-to-br ${module.color} text-white`
                  : `${isDark ? 'bg-slate-800 text-gray-300' : 'bg-white text-gray-700'} hover:shadow-lg`
              } transition-all duration-300`}>
                <div className="flex flex-col items-center text-center">
                  <module.icon className="w-8 h-8 mb-2" />
                  <h3 className="font-semibold text-sm">{module.label}</h3>
                  <p className="text-xs opacity-80 mt-1">{module.description}</p>
                  {module.badge && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                      {module.badge}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Module Content Area */}
        <div className={`${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg overflow-hidden`}>
          <Suspense
            fallback={
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500"></div>
              </div>
            }
          >
            {activeModule === 'lessons' && (
              <TajweedLessonsModule
                level={selectedLevel}
                onLessonComplete={handleLessonComplete}
                onLevelChange={setSelectedLevel}
              />
            )}

            {activeModule === 'practice' && (
              <TajweedPracticeModule
                level={selectedLevel}
                onExerciseComplete={handleExerciseComplete}
              />
            )}

            {activeModule === 'pronunciation' && (
              <TajweedPronunciationModule
                level={selectedLevel}
                onFeedback={handlePronunciationFeedback}
              />
            )}

            {activeModule === 'assessment' && (
              <TajweedAssessmentModule
                level={selectedLevel}
                onAssessmentComplete={handleAssessmentComplete}
              />
            )}

            {activeModule === 'teacher' && (
              <TeacherSupportChat
                studentId={user?.id || ''}
                studentName={user?.displayName || 'Student'}
                studentProgress={studentProgress}
                onNewMessage={handleNewMessage}
              />
            )}
          </Suspense>
        </div>

        {/* Teacher Notes Section */}
        {teacherNotes.length > 0 && (
          <div className={`mt-8 ${isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'} border rounded-lg p-6 shadow-lg`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2`}>
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Teacher Notes & Suggestions
            </h3>
            <div className="space-y-3">
              {teacherNotes.slice(0, 3).map(note => (
                <div
                  key={note.id}
                  className={`p-4 rounded-lg ${
                    isDark ? 'bg-slate-700' : 'bg-blue-50'
                  } border-l-4 ${
                    note.type === 'encouragement' ? 'border-green-500' : 'border-blue-500'
                  }`}
                >
                  <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {note.topic}
                  </p>
                  <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {note.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper Component for Stats
interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}

const StatItem: React.FC<StatItemProps> = ({ icon, label, value }) => {
  const { isDark } = useTheme();
  return (
    <div className={`${isDark ? 'bg-slate-700' : 'bg-gray-50'} rounded-lg p-4 text-center`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className={`text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>{value}</p>
      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{label}</p>
    </div>
  );
};

export default QuranTajweedPlatform;
