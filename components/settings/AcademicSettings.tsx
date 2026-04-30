/**
 * Academic Settings Component
 * Configure academic year, semesters, departments, and calendar
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Save, AlertCircle, Plus, X } from 'lucide-react';
import { SystemSettings } from '../../types/settings.types';
import { updateSystemSettings } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface AcademicSettingsProps {
  settings: SystemSettings;
  onSettingsChange: (settings: SystemSettings) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

const AcademicSettings: React.FC<AcademicSettingsProps> = ({
  settings,
  onSettingsChange,
  onSave,
  isSaving = false
}) => {
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [newSemester, setNewSemester] = useState('');
  const [newDepartment, setNewDepartment] = useState('');

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

  const addSemester = () => {
    if (newSemester.trim()) {
      const updated = {
        ...localSettings,
        academic: {
          ...localSettings.academic,
          semesterNames: [...localSettings.academic.semesterNames, newSemester]
        }
      };
      setLocalSettings(updated as SystemSettings);
      setNewSemester('');
    }
  };

  const removeSemester = (index: number) => {
    const updated = {
      ...localSettings,
      academic: {
        ...localSettings.academic,
        semesterNames: localSettings.academic.semesterNames.filter((_, i) => i !== index)
      }
    };
    setLocalSettings(updated as SystemSettings);
  };

  const handleSave = async () => {
    try {
      setSaveMessage(null);
      onSettingsChange(localSettings);
      if (user) {
        await updateSystemSettings(localSettings, user.uid, user.email || '', 'Updated academic settings');
      }
      await onSave();
      setSaveMessage({ type: 'success', text: 'Academic settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save academic settings. Please try again.' });
      console.error('Error saving academic settings:', error);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <BookOpen className="text-primary-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Academic Settings</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Year */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Current Academic Year</label>
          <input
            type="text"
            value={localSettings.academic.currentAcademicYear}
            onChange={(e) => handleInputChange('academic.currentAcademicYear', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            placeholder="e.g., 2025-2026"
          />
        </div>

        {/* Timezone */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Timezone</label>
          <select
            value={localSettings.academic.timezone}
            onChange={(e) => handleInputChange('academic.timezone', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
          >
            <option value="Asia/Kabul">Asia/Kabul (Afghanistan)</option>
            <option value="Asia/Karachi">Asia/Karachi (Pakistan)</option>
            <option value="Asia/Dubai">Asia/Dubai (UAE)</option>
            <option value="Asia/Bangkok">Asia/Bangkok (Thailand)</option>
            <option value="UTC">UTC</option>
          </select>
        </div>

        {/* Semester Start Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Semester Start Date</label>
          <input
            type="date"
            value={new Date(localSettings.academic.semesterStartDate).toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('academic.semesterStartDate', new Date(e.target.value))}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
          />
        </div>

        {/* Semester End Date */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Semester End Date</label>
          <input
            type="date"
            value={new Date(localSettings.academic.semesterEndDate).toISOString().split('T')[0]}
            onChange={(e) => handleInputChange('academic.semesterEndDate', new Date(e.target.value))}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
          />
        </div>

        {/* School Hours */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">School Hours Start</label>
          <input
            type="time"
            value={localSettings.academic.schoolHoursStart}
            onChange={(e) => handleInputChange('academic.schoolHoursStart', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">School Hours End</label>
          <input
            type="time"
            value={localSettings.academic.schoolHoursEnd}
            onChange={(e) => handleInputChange('academic.schoolHoursEnd', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
          />
        </div>
      </div>

      {/* Semesters */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Semester Names</h3>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newSemester}
            onChange={(e) => setNewSemester(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addSemester()}
            className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            placeholder="e.g., Spring 2025"
          />
          <button
            onClick={addSemester}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg flex items-center gap-2"
          >
            <Plus size={20} />
            Add
          </button>
        </div>
        <div className="space-y-2">
          {localSettings.academic.semesterNames.map((semester, index) => (
            <div key={index} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
              <span className="text-white">{semester}</span>
              <button
                onClick={() => removeSemester(index)}
                className="text-red-400 hover:text-red-300"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Enable Departments */}
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="enableDepartments"
          checked={localSettings.academic.enableDepartments}
          onChange={(e) => handleInputChange('academic.enableDepartments', e.target.checked)}
          className="w-5 h-5 text-primary-500 rounded"
        />
        <label htmlFor="enableDepartments" className="text-slate-300 font-medium">
          Enable Departments
        </label>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-lg hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
      >
        <Save size={20} />
        {isSaving ? 'Saving...' : 'Save Academic Settings'}
      </button>
    </div>
  );
};

export default AcademicSettings;
