/**
 * Course Settings Component
 * Configure default course parameters
 */

import React, { useState, useEffect } from 'react';
import { GraduationCap, Save, AlertCircle } from 'lucide-react';
import { SystemSettings } from '../../types/settings.types';
import { updateSystemSettings } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface CourseSettingsProps {
  settings: SystemSettings;
  onSettingsChange: (settings: SystemSettings) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

const CourseSettings: React.FC<CourseSettingsProps> = ({
  settings,
  onSettingsChange,
  onSave,
  isSaving = false
}) => {
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleInputChange = (field: string, value: any) => {
    const updated = { ...localSettings };
    const keys = field.split('.');
    let current: any = updated;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
    setLocalSettings(updated as SystemSettings);
  };

  const handleSave = async () => {
    try {
      setSaveMessage(null);
      onSettingsChange(localSettings);
      if (user) {
        await updateSystemSettings(localSettings, user.uid, user.email || '', 'Updated course settings');
      }
      await onSave();
      setSaveMessage({ type: 'success', text: 'Course settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save course settings. Please try again.' });
      console.error('Error saving course settings:', error);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="text-primary-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Course Settings</h2>
      </div>

      {saveMessage && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 ${
            saveMessage.type === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          <AlertCircle size={20} />
          <span>{saveMessage.text}</span>
        </div>
      )}

      {/* Basic Defaults */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Default Course Parameters</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Default Duration (days)</label>
            <input
              type="number"
              value={localSettings.courseDefaults.defaultDurationDays}
              onChange={(e) => handleInputChange('courseDefaults.defaultDurationDays', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Default Access Duration (days)</label>
            <input
              type="number"
              value={localSettings.courseDefaults.defaultAccessDurationDays}
              onChange={(e) => handleInputChange('courseDefaults.defaultAccessDurationDays', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Default Level</label>
            <select
              value={localSettings.courseDefaults.defaultLevel}
              onChange={(e) => handleInputChange('courseDefaults.defaultLevel', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Default Price ($)</label>
            <input
              type="number"
              step="0.01"
              value={localSettings.courseDefaults.defaultPrice}
              onChange={(e) => handleInputChange('courseDefaults.defaultPrice', parseFloat(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Passing Grade (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={localSettings.courseDefaults.passingGradePercent}
              onChange={(e) => handleInputChange('courseDefaults.passingGradePercent', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Completion Threshold (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={localSettings.courseDefaults.completionThresholdPercent}
              onChange={(e) => handleInputChange('courseDefaults.completionThresholdPercent', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Max Students Per Class</label>
            <input
              type="number"
              value={localSettings.courseDefaults.maxStudentsPerClass}
              onChange={(e) => handleInputChange('courseDefaults.maxStudentsPerClass', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Default Lesson Duration (min)</label>
            <input
              type="number"
              value={localSettings.courseDefaults.defaultLessonDurationMinutes}
              onChange={(e) => handleInputChange('courseDefaults.defaultLessonDurationMinutes', parseInt(e.target.value))}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            />
          </div>
        </div>
      </div>

      {/* Learning Path */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Learning Path & Assessment</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.courseDefaults.requireSequentialLessons}
              onChange={(e) => handleInputChange('courseDefaults.requireSequentialLessons', e.target.checked)}
              className="w-5 h-5 text-primary-500 rounded"
            />
            <span className="text-slate-300">Require Sequential Lesson Completion</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.courseDefaults.allowLessonRetakes}
              onChange={(e) => handleInputChange('courseDefaults.allowLessonRetakes', e.target.checked)}
              className="w-5 h-5 text-primary-500 rounded"
            />
            <span className="text-slate-300">Allow Lesson Retakes</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.courseDefaults.showCorrectAnswersImmediately}
              onChange={(e) => handleInputChange('courseDefaults.showCorrectAnswersImmediately', e.target.checked)}
              className="w-5 h-5 text-primary-500 rounded"
            />
            <span className="text-slate-300">Show Correct Answers Immediately</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.courseDefaults.showScoreToStudent}
              onChange={(e) => handleInputChange('courseDefaults.showScoreToStudent', e.target.checked)}
              className="w-5 h-5 text-primary-500 rounded"
            />
            <span className="text-slate-300">Show Score to Student</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Quiz Attempts Allowed</label>
            <select
              value={
                localSettings.courseDefaults.quizAttemptsAllowed === 'unlimited'
                  ? 'unlimited'
                  : localSettings.courseDefaults.quizAttemptsAllowed
              }
              onChange={(e) =>
                handleInputChange(
                  'courseDefaults.quizAttemptsAllowed',
                  e.target.value === 'unlimited' ? 'unlimited' : parseInt(e.target.value)
                )
              }
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="unlimited">Unlimited</option>
              <option value="1">1 attempt</option>
              <option value="2">2 attempts</option>
              <option value="3">3 attempts</option>
              <option value="5">5 attempts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Certificates */}
      <div className="pt-6 border-t border-slate-700">
        <h3 className="text-lg font-bold text-white mb-4">Certificates</h3>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.courseDefaults.enableCertificates}
              onChange={(e) => handleInputChange('courseDefaults.enableCertificates', e.target.checked)}
              className="w-5 h-5 text-primary-500 rounded"
            />
            <span className="text-slate-300">Enable Certificates</span>
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={localSettings.courseDefaults.autoIssueCertificate}
              onChange={(e) => handleInputChange('courseDefaults.autoIssueCertificate', e.target.checked)}
              className="w-5 h-5 text-primary-500 rounded"
            />
            <span className="text-slate-300">Auto-issue Certificate on Completion</span>
          </label>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-lg hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
      >
        <Save size={20} />
        {isSaving ? 'Saving...' : 'Save Course Settings'}
      </button>
    </div>
  );
};

export default CourseSettings;
