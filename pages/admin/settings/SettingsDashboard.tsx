/**
 * Settings Dashboard
 * Main hub for managing all system settings
 */

import React, { useState, useEffect } from 'react';
import {
  Settings,
  Building2,
  Palette,
  BookOpen,
  GraduationCap,
  DollarSign,
  Users,
  Bell,
  Lock,
  Zap,
  RotateCcw,
  Download,
  Upload,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../services/supabase';
import {
  getSignupApprovalRequests,
  SignupApprovalRequest,
  updateSignupApprovalStatus,
} from '../../../services/db';
import BackButton from '../../../components/BackButton';
import LogoLink from '../../../components/LogoLink';
import LanguageSelector from '../../../components/LanguageSelector';
import { getSystemSettingsWithCache, updateSystemSettings, resetSettingsToDefaults } from '../../../services/settingsService';
import { SystemSettings, DEFAULT_SETTINGS } from '../../../types/settings.types';
import BrandingSettings from '../../../components/settings/BrandingSettings';
import ThemeSettings from '../../../components/settings/ThemeSettings';
import FeatureToggles from '../../../components/settings/FeatureToggles';
import AcademicSettings from '../../../components/settings/AcademicSettings';
import CourseSettings from '../../../components/settings/CourseSettings';

type SettingTab = 'branding' | 'theme' | 'academic' | 'course' | 'financial' | 'users' | 'communication' | 'security' | 'features';

interface SettingsTab {
  id: SettingTab;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const SETTINGS_TABS: SettingsTab[] = [
  { id: 'branding', label: 'Branding', icon: <Building2 size={20} />, category: 'Identity' },
  { id: 'theme', label: 'Theme & Appearance', icon: <Palette size={20} />, category: 'Appearance' },
  { id: 'academic', label: 'Academic', icon: <BookOpen size={20} />, category: 'Academic' },
  { id: 'course', label: 'Course Defaults', icon: <GraduationCap size={20} />, category: 'Learning' },
  { id: 'financial', label: 'Financial', icon: <DollarSign size={20} />, category: 'Payments' },
  { id: 'users', label: 'User Management', icon: <Users size={20} />, category: 'Users' },
  { id: 'communication', label: 'Communication', icon: <Bell size={20} />, category: 'Communication' },
  { id: 'security', label: 'Security', icon: <Lock size={20} />, category: 'Security' },
  { id: 'features', label: 'Feature Toggles', icon: <Zap size={20} />, category: 'Features' }
];

const SettingsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingTab>('branding');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalMessage, setGlobalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [signupRequests, setSignupRequests] = useState<SignupApprovalRequest[]>([]);
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupProcessingId, setSignupProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await getSystemSettingsWithCache();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        setGlobalMessage({ type: 'error', text: 'Failed to load settings' });
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      loadSignupRequests();
    }
  }, [activeTab]);

  const handleSettingsChange = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate save delay
      setIsSaving(false);
    } catch (error) {
      console.error('Error saving:', error);
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = async () => {
    if (!window.confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      return;
    }

    if (!user) {
      setGlobalMessage({ type: 'error', text: 'User not authenticated' });
      return;
    }

    try {
      setIsSaving(true);
      await resetSettingsToDefaults(user.uid, user.email || '');
      setSettings(DEFAULT_SETTINGS);
      setGlobalMessage({ type: 'success', text: 'Settings reset to defaults successfully!' });
      setTimeout(() => setGlobalMessage(null), 3000);
    } catch (error) {
      console.error('Error resetting settings:', error);
      setGlobalMessage({ type: 'error', text: 'Failed to reset settings' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `settings-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const loadSignupRequests = async () => {
    try {
      setSignupLoading(true);
      const requests = await getSignupApprovalRequests();
      setSignupRequests(requests);
    } catch (error) {
      console.error('Error loading signup requests:', error);
      setGlobalMessage({ type: 'error', text: 'Failed to load signup requests.' });
    } finally {
      setSignupLoading(false);
    }
  };

  const handleSignupDecision = async (
    request: SignupApprovalRequest,
    status: 'approved' | 'rejected'
  ) => {
    try {
      setSignupProcessingId(request.id);
      await updateSignupApprovalStatus(request.id, status);
      setGlobalMessage({
        type: 'success',
        text: `${request.fullName} was ${status === 'approved' ? 'approved' : 'rejected'} successfully.`
      });
      await loadSignupRequests();
    } catch (error) {
      console.error('Error updating signup status:', error);
      setGlobalMessage({ type: 'error', text: 'Failed to update signup request status.' });
    } finally {
      setSignupProcessingId(null);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setGlobalMessage(null);

    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setGlobalMessage({ type: 'error', text: 'Please fill both password fields.' });
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setGlobalMessage({ type: 'error', text: 'New password must be at least 8 characters long.' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setGlobalMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    try {
      setPasswordSaving(true);
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) {
        throw error;
      }

      setPasswordData({ newPassword: '', confirmPassword: '' });
      setGlobalMessage({ type: 'success', text: 'Password updated successfully.' });
      setTimeout(() => setGlobalMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating password:', error);
      setGlobalMessage({ type: 'error', text: error?.message || 'Failed to update password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-slate-900 to-[#0a0f2b] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f2b] via-slate-900 to-[#0a0f2b]">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <LogoLink showText={false} compact />
            <h1 className="text-xl font-bold text-white hidden sm:block">System Settings</h1>
          </div>
          <div className="flex gap-4 items-center">
            <LanguageSelector />
            <BackButton variant="secondary" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Global Message */}
        {globalMessage && (
          <div
            className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              globalMessage.type === 'success'
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}
          >
            <span>{globalMessage.text}</span>
          </div>
        )}

        {/* Top Actions */}
        <div className="mb-8 flex flex-wrap gap-3">
          <button
            onClick={handleExportSettings}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
          >
            <Download size={18} />
            Export Settings
          </button>
          <button
            onClick={handleResetToDefaults}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/30 hover:bg-red-900/50 text-red-300 rounded-lg transition-colors disabled:opacity-50"
          >
            <RotateCcw size={18} />
            Reset to Defaults
          </button>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden mb-4 w-full flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-lg"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              Menu
            </button>

            {/* Navigation */}
            <nav
              className={`bg-slate-900/50 border border-slate-700 rounded-xl p-4 space-y-2 ${
                mobileMenuOpen ? 'block' : 'hidden lg:block'
              }`}
            >
              {SETTINGS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                      : 'text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  {tab.icon}
                  <span className="font-medium">{tab.label}</span>
                  {activeTab === tab.id && <ChevronRight size={16} className="ml-auto" />}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Settings Panel */}
          <div className="lg:col-span-3">
            {activeTab === 'branding' && (
              <BrandingSettings
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'theme' && (
              <ThemeSettings
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'academic' && (
              <AcademicSettings
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'course' && (
              <CourseSettings
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'features' && (
              <FeatureToggles
                settings={settings}
                onSettingsChange={handleSettingsChange}
                onSave={handleSave}
                isSaving={isSaving}
              />
            )}
            {activeTab === 'security' && (
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-white mb-2">Change Admin Password</h2>
                <p className="text-slate-400 mb-6">Update your admin account password while logged in.</p>

                <form onSubmit={handleChangePassword} className="space-y-5 max-w-xl">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">New Password</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
                      minLength={8}
                      required
                      className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                      placeholder="Enter new password"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                      minLength={8}
                      required
                      className="w-full px-4 py-3 bg-slate-800/70 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-primary-500"
                      placeholder="Confirm new password"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="px-5 py-3 bg-primary-600 hover:bg-primary-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {passwordSaving ? 'Updating Password...' : 'Update Password'}
                  </button>
                </form>
              </div>
            )}
            {activeTab === 'users' && (
              <div className="space-y-6">
                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Your Account</h2>
                  <p className="text-slate-400 mb-6">Use this section to find your username and account identity.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/70 border border-slate-600 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Username</p>
                      <p className="text-white font-semibold break-all">{user?.displayName || 'Not set'}</p>
                    </div>
                    <div className="bg-slate-800/70 border border-slate-600 rounded-lg p-4">
                      <p className="text-xs uppercase tracking-wide text-slate-400 mb-2">Email</p>
                      <p className="text-white font-semibold break-all">{user?.email || 'Not set'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6 sm:p-8">
                  <h2 className="text-2xl font-bold text-white mb-2">New Registration Approvals</h2>
                  <p className="text-slate-400 mb-6">Approve or reject newly registered users from here.</p>

                  {signupLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-t-transparent"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-lg border border-slate-700">
                      <table className="w-full">
                        <thead className="bg-slate-800/60 border-b border-slate-700">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Email</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {signupRequests.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                No signup requests found.
                              </td>
                            </tr>
                          ) : (
                            signupRequests.map((request) => (
                              <tr key={request.id} className="border-b border-slate-700/60">
                                <td className="px-4 py-3 text-white">{request.fullName}</td>
                                <td className="px-4 py-3 text-slate-300">{request.email}</td>
                                <td className="px-4 py-3 text-slate-300 capitalize">{request.role}</td>
                                <td className="px-4 py-3">
                                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                                    request.status === 'approved'
                                      ? 'bg-green-500/20 text-green-300'
                                      : request.status === 'rejected'
                                        ? 'bg-red-500/20 text-red-300'
                                        : 'bg-yellow-500/20 text-yellow-300'
                                  }`}>
                                    {request.status}
                                  </span>
                                </td>
                                <td className="px-4 py-3">
                                  {request.status === 'pending' ? (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => handleSignupDecision(request, 'approved')}
                                        disabled={signupProcessingId === request.id}
                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                                      >
                                        Approve
                                      </button>
                                      <button
                                        onClick={() => handleSignupDecision(request, 'rejected')}
                                        disabled={signupProcessingId === request.id}
                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold disabled:opacity-50"
                                      >
                                        Reject
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-slate-400 text-xs">Processed</span>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
            {['financial', 'communication'].includes(activeTab) && (
              <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-12 text-center">
                <Settings className="mx-auto text-slate-400 mb-4" size={48} />
                <h2 className="text-2xl font-bold text-white mb-2">Coming Soon</h2>
                <p className="text-slate-400">
                  {SETTINGS_TABS.find((tab) => tab.id === activeTab)?.label} settings will be available in the next
                  update.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsDashboard;
