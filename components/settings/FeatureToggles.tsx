/**
 * Feature Toggles Component
 * Enable/disable major platform features
 */

import React, { useState, useEffect } from 'react';
import { Zap, Save, AlertCircle, Info } from 'lucide-react';
import { SystemSettings } from '../../types/settings.types';
import { updateSystemSettings } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface FeatureToggleItem {
  key: keyof typeof DEFAULT_FEATURES;
  label: string;
  description: string;
  category: string;
}

const DEFAULT_FEATURES = {
  enableLiveClasses: 'Live Classes',
  enableRecordedClasses: 'Recorded Classes',
  enableChatMessaging: 'Chat & Messaging',
  enableDiscussionForum: 'Discussion Forums',
  enableNotifications: 'Notifications',
  enableMobileApp: 'Mobile App',
  enableStudentPortal: 'Student Portal',
  enableTeacherPortal: 'Teacher Portal',
  enableParentPortal: 'Parent Portal',
  enableAdminDashboard: 'Admin Dashboard',
  enableAnalyticsDashboard: 'Analytics Dashboard',
  enableCertificateSystem: 'Certificate System',
  enableMarketplace: 'Marketplace',
  enableFileStorage: 'File Storage',
  enableApiAccess: 'API Access'
};

const FEATURE_DESCRIPTIONS: Record<string, { description: string; category: string }> = {
  enableLiveClasses: {
    category: 'Learning',
    description: 'Allow teachers to conduct live online classes'
  },
  enableRecordedClasses: {
    category: 'Learning',
    description: 'Store and serve recorded class sessions'
  },
  enableChatMessaging: {
    category: 'Communication',
    description: 'Enable real-time chat between students and teachers'
  },
  enableDiscussionForum: {
    category: 'Communication',
    description: 'Enable course discussion forums for collaboration'
  },
  enableNotifications: {
    category: 'Communication',
    description: 'Send notifications to users for important events'
  },
  enableMobileApp: {
    category: 'Access',
    description: 'Offer mobile application access'
  },
  enableStudentPortal: {
    category: 'Portals',
    description: 'Enable dedicated student dashboard and tools'
  },
  enableTeacherPortal: {
    category: 'Portals',
    description: 'Enable dedicated teacher dashboard and tools'
  },
  enableParentPortal: {
    category: 'Portals',
    description: 'Enable parent monitoring and communication'
  },
  enableAdminDashboard: {
    category: 'Admin',
    description: 'Enable administrative control panel'
  },
  enableAnalyticsDashboard: {
    category: 'Admin',
    description: 'Enable analytics and reporting dashboard'
  },
  enableCertificateSystem: {
    category: 'Credentials',
    description: 'Generate and issue completion certificates'
  },
  enableMarketplace: {
    category: 'Monetization',
    description: 'Enable course marketplace functionality'
  },
  enableFileStorage: {
    category: 'Storage',
    description: 'Enable file storage for courses and students'
  },
  enableApiAccess: {
    category: 'Integration',
    description: 'Allow third-party API access'
  }
};

interface FeatureTogglesProps {
  settings: SystemSettings;
  onSettingsChange: (settings: SystemSettings) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

const FeatureToggles: React.FC<FeatureTogglesProps> = ({
  settings,
  onSettingsChange,
  onSave,
  isSaving = false
}) => {
  const { user } = useAuth();
  const [localSettings, setLocalSettings] = useState(settings);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleFeatureToggle = (featureKey: keyof typeof localSettings.features, value: boolean) => {
    setLocalSettings({
      ...localSettings,
      features: {
        ...localSettings.features,
        [featureKey]: value
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaveMessage(null);
      onSettingsChange(localSettings);
      if (user) {
        await updateSystemSettings(localSettings, user.uid, user.email || '', 'Updated feature toggles');
      }
      await onSave();
      setSaveMessage({ type: 'success', text: 'Feature settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save feature settings. Please try again.' });
      console.error('Error saving feature settings:', error);
    }
  };

  // Group features by category
  const categories = new Map<string, FeatureToggleItem[]>();
  Object.entries(DEFAULT_FEATURES).forEach(([key, label]) => {
    const featureInfo = FEATURE_DESCRIPTIONS[key];
    const category = featureInfo.category;
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push({
      key: key as any,
      label,
      description: featureInfo.description,
      category
    });
  });

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Zap className="text-primary-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Feature Toggles</h2>
      </div>

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-start gap-3">
        <Info className="text-blue-400 mt-1 flex-shrink-0" size={20} />
        <div>
          <p className="text-blue-300 text-sm font-medium">Control which features are available on your platform</p>
          <p className="text-blue-300/80 text-xs mt-1">Disabling a feature will hide it from all users immediately</p>
        </div>
      </div>

      {/* Message Display */}
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

      {/* Features by Category */}
      <div className="space-y-4">
        {Array.from(categories.entries()).map(([category, features]) => (
          <div key={category} className="border border-slate-600 rounded-lg overflow-hidden">
            {/* Category Header */}
            <button
              onClick={() => toggleCategory(category)}
              className="w-full px-6 py-4 bg-slate-800/50 hover:bg-slate-800 transition-colors flex items-center justify-between"
            >
              <h3 className="text-lg font-bold text-white">{category}</h3>
              <span className="text-slate-400 text-sm">
                {features.filter((f) => localSettings.features[f.key]).length} / {features.length} enabled
              </span>
            </button>

            {/* Category Features */}
            {expandedCategories.has(category) && (
              <div className="border-t border-slate-600 divide-y divide-slate-600">
                {features.map((feature) => (
                  <div key={feature.key} className="px-6 py-4 bg-slate-800/30 flex items-start justify-between">
                    <div className="flex-1">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={localSettings.features[feature.key]}
                          onChange={(e) => handleFeatureToggle(feature.key, e.target.checked)}
                          className="w-5 h-5 text-primary-500 rounded"
                        />
                        <div>
                          <p className="font-semibold text-white">{feature.label}</p>
                          <p className="text-sm text-slate-400">{feature.description}</p>
                        </div>
                      </label>
                    </div>
                    <span
                      className={`ml-4 px-3 py-1 rounded-full text-xs font-semibold ${
                        localSettings.features[feature.key]
                          ? 'bg-green-500/20 text-green-300'
                          : 'bg-slate-600/30 text-slate-400'
                      }`}
                    >
                      {localSettings.features[feature.key] ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="bg-slate-800/50 rounded-lg p-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-slate-400 text-sm mb-1">Total Features</p>
          <p className="text-2xl font-bold text-white">{Object.keys(DEFAULT_FEATURES).length}</p>
        </div>
        <div>
          <p className="text-slate-400 text-sm mb-1">Enabled Features</p>
          <p className="text-2xl font-bold text-green-400">
            {Object.values(localSettings.features).filter(Boolean).length}
          </p>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-lg hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
      >
        <Save size={20} />
        {isSaving ? 'Saving...' : 'Save Feature Settings'}
      </button>
    </div>
  );
};

export default FeatureToggles;
