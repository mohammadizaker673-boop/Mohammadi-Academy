/**
 * Branding Settings Component
 * Manage organization identity, logo, colors, and social links
 */

import React, { useState, useEffect } from 'react';
import { Building2, Globe, Mail, Phone, MapPin, Save, AlertCircle } from 'lucide-react';
import { SystemSettings } from '../../types/settings.types';
import { updateSystemSettings } from '../../services/settingsService';
import { useAuth } from '../../contexts/AuthContext';

interface BrandingSettingsProps {
  settings: SystemSettings;
  onSettingsChange: (settings: SystemSettings) => void;
  onSave: () => Promise<void>;
  isSaving?: boolean;
}

const BrandingSettings: React.FC<BrandingSettingsProps> = ({
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

  const handleSocialLinkChange = (platform: string, value: string) => {
    setLocalSettings({
      ...localSettings,
      socialLinks: {
        ...localSettings.socialLinks,
        [platform]: value
      }
    });
  };

  const handleSave = async () => {
    try {
      setSaveMessage(null);
      onSettingsChange(localSettings);
      if (user) {
        await updateSystemSettings(localSettings, user.uid, user.email || '', 'Updated branding settings');
      }
      await onSave();
      setSaveMessage({ type: 'success', text: 'Branding settings saved successfully!' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'Failed to save branding settings. Please try again.' });
      console.error('Error saving branding settings:', error);
    }
  };

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="text-primary-400" size={24} />
        <h2 className="text-2xl font-bold text-white">Branding Settings</h2>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organization Name */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Organization Name *</label>
          <input
            type="text"
            value={localSettings.organizationName}
            onChange={(e) => handleInputChange('organizationName', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Mohammadi Academy"
          />
        </div>

        {/* Tagline */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">Tagline / Motto</label>
          <input
            type="text"
            value={localSettings.organizationTagline}
            onChange={(e) => handleInputChange('organizationTagline', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="e.g., Excellence in Islamic Education"
          />
        </div>

        {/* Contact Email */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Mail className="inline mr-2" size={16} />
            Contact Email
          </label>
          <input
            type="email"
            value={localSettings.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="info@academy.com"
          />
        </div>

        {/* Contact Phone */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Phone className="inline mr-2" size={16} />
            Contact Phone
          </label>
          <input
            type="tel"
            value={localSettings.contactPhone}
            onChange={(e) => handleInputChange('contactPhone', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="+93-"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <MapPin className="inline mr-2" size={16} />
            Address
          </label>
          <input
            type="text"
            value={localSettings.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Kabul, Afghanistan"
          />
        </div>

        {/* Website URL */}
        <div>
          <label className="block text-sm font-semibold text-slate-300 mb-2">
            <Globe className="inline mr-2" size={16} />
            Website URL
          </label>
          <input
            type="url"
            value={localSettings.websiteUrl}
            onChange={(e) => handleInputChange('websiteUrl', e.target.value)}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="https://academy.com"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-slate-300 mb-2">Organization Description</label>
          <textarea
            value={localSettings.organizationDescription}
            onChange={(e) => handleInputChange('organizationDescription', e.target.value)}
            rows={4}
            className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Brief description for SEO and public display..."
          />
        </div>
      </div>

      {/* Social Links */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4">Social Media Links</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['facebook', 'instagram', 'twitter', 'youtube', 'linkedin', 'whatsapp'].map((platform) => (
            <div key={platform}>
              <label className="block text-sm font-semibold text-slate-300 mb-2 capitalize">
                {platform}
              </label>
              <input
                type="url"
                value={localSettings.socialLinks[platform as keyof typeof localSettings.socialLinks] || ''}
                onChange={(e) => handleSocialLinkChange(platform, e.target.value)}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder={`https://${platform}.com/...`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isSaving}
        className="w-full md:w-auto px-8 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white font-bold rounded-lg hover:from-primary-400 hover:to-accent-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center"
      >
        <Save size={20} />
        {isSaving ? 'Saving...' : 'Save Branding Settings'}
      </button>
    </div>
  );
};

export default BrandingSettings;
