/**
 * Settings Context
 * Provides system settings throughout the application
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemSettings, DEFAULT_SETTINGS } from '../types/settings.types';
import { getSystemSettingsWithCache } from '../services/settingsService';

interface SettingsContextType {
  settings: SystemSettings | null;
  loading: boolean;
  updateSettings: (newSettings: SystemSettings) => void;
  refreshSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loadedSettings = await getSystemSettingsWithCache();
        setSettings(loadedSettings);
      } catch (error) {
        console.error('Error loading settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = (newSettings: SystemSettings) => {
    setSettings(newSettings);
  };

  const refreshSettings = async () => {
    try {
      const loadedSettings = await getSystemSettingsWithCache();
      setSettings(loadedSettings);
    } catch (error) {
      console.error('Error refreshing settings:', error);
    }
  };

  return (
    <SettingsContext.Provider
      value={{
        settings: settings || DEFAULT_SETTINGS,
        loading,
        updateSettings,
        refreshSettings
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
};
