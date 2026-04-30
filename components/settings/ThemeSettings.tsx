/**
 * Theme Settings Component
 * Manage colors, fonts, dark mode, and visual appearance
 */

import React, { useState, useEffect } from 'react';
import { Palette, Save, AlertCircle } from 'lucide-react';
import { SystemSettings } from '../../types/settings.types';
import { updateSystemSettings } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface ThemeSettingsProps {
  settings: SystemSettings;
  onSettingsChange: (settings: SystemSettings) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

const ThemeSettings: React.FC<ThemeSettingsProps> = ({
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
        await updateSystemSettings(localSettings, user.uid, user.email || '', 'Updated theme settings');
      }
      await onSave();
      setSaveMessage({ type: 'success', text: 'Theme settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save theme settings. Please try again.' });
      console.error('Error saving theme settings:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Main Colors */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <Palette className="text-primary-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Theme Settings</h2>
        </div>

        {saveMessage && (
          <div
            className={`p-4 rounded-lg flex items-center gap-3 mb-6 ${
              saveMessage.type === 'success'
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            <AlertCircle size={20} />
            <span>{saveMessage.text}</span>
          </div>
        )}

        {/* Default Theme */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-300 mb-2">Default Theme</label>
          <select
            value={localSettings.defaultTheme}
            onChange={(e) => handleInputChange('defaultTheme', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
          >
            <option value="light">Light Mode</option>
            <option value="dark">Dark Mode</option>
            <option value="system">System Default</option>
          </select>
        </div>

        {/* Allow Theme Toggle */}
        <div className="mb-6 flex items-center gap-3">
          <input
            type="checkbox"
            id="allowThemeToggle"
            checked={localSettings.allowUserThemeToggle}
            onChange={(e) => handleInputChange('allowUserThemeToggle', e.target.checked)}
            className="w-5 h-5 text-primary-500 rounded"
          />
          <label htmlFor="allowThemeToggle" className="text-slate-300 font-medium">
            Allow users to toggle between light and dark mode
          </label>
        </div>

        {/* Primary Colors */}
        <h3 className="text-lg font-bold text-white mt-8 mb-4">Brand Colors</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Primary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localSettings.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localSettings.primaryColor}
                onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Secondary Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localSettings.secondaryColor}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localSettings.secondaryColor}
                onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Accent Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                value={localSettings.accentColor}
                onChange={(e) => handleInputChange('accentColor', e.target.value)}
                className="w-12 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={localSettings.accentColor}
                onChange={(e) => handleInputChange('accentColor', e.target.value)}
                className="flex-1 px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
              />
            </div>
          </div>
        </div>

        {/* Status Colors */}
        <h3 className="text-lg font-bold text-white mb-4">Status Colors</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { key: 'successColor', label: 'Success' },
            { key: 'errorColor', label: 'Error' },
            { key: 'warningColor', label: 'Warning' },
            { key: 'infoColor', label: 'Info' }
          ].map(({ key, label }) => (
            <div key={key}>
              <label className="block text-sm font-semibold text-slate-300 mb-2">{label}</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={localSettings[key as keyof SystemSettings] as string}
                  onChange={(e) => handleInputChange(key, e.target.value)}
                  className="w-10 h-10 rounded cursor-pointer"
                />
              </div>
            </div>
          ))}
        </div>

        {/* UI Components */}
        <h3 className="text-lg font-bold text-white mb-4">UI Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Button Style</label>
            <select
              value={localSettings.buttonStyle}
              onChange={(e) => handleInputChange('buttonStyle', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="filled">Filled</option>
              <option value="outlined">Outlined</option>
              <option value="ghost">Ghost</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Button Border Radius</label>
            <select
              value={localSettings.buttonRadius}
              onChange={(e) => handleInputChange('buttonRadius', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="sharp">Sharp</option>
              <option value="rounded">Rounded</option>
              <option value="pill">Pill</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Card Shadow</label>
            <select
              value={localSettings.cardShadowStyle}
              onChange={(e) => handleInputChange('cardShadowStyle', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="none">None</option>
              <option value="subtle">Subtle</option>
              <option value="medium">Medium</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Hover Effects</label>
            <select
              value={localSettings.hoverEffects}
              onChange={(e) => handleInputChange('hoverEffects', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="subtle">Subtle</option>
              <option value="medium">Medium</option>
              <option value="bold">Bold</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Animation Speed</label>
            <select
              value={localSettings.animationSpeed}
              onChange={(e) => handleInputChange('animationSpeed', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="disabled">Disabled</option>
              <option value="slow">Slow</option>
              <option value="normal">Normal</option>
              <option value="fast">Fast</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">Input Field Style</label>
            <select
              value={localSettings.inputFieldStyle}
              onChange={(e) => handleInputChange('inputFieldStyle', e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white"
            >
              <option value="outlined">Outlined</option>
              <option value="filled">Filled</option>
              <option value="underline">Underline</option>
            </select>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-lg hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
        >
          <Save size={20} />
          {isSaving ? 'Saving...' : 'Save Theme Settings'}
        </button>
      </div>
    </div>
  );
};

export default ThemeSettings;
