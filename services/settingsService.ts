/**
 * Settings Service
 * Handles all system settings operations with Firestore
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  addDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { SystemSettings, DEFAULT_SETTINGS, SettingsUpdateLog } from '../types/settings.types';

const SETTINGS_COLLECTION = 'systemSettings';
const UPDATE_LOGS_COLLECTION = 'settingsUpdateLogs';
const SETTINGS_DOC_ID = 'default'; // Using a single "default" document for system-wide settings

/**
 * Fetch system settings from Firestore
 * Returns default settings if none exist
 */
export const getSystemSettings = async (): Promise<SystemSettings> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(settingsRef);

    if (docSnap.exists()) {
      const data = docSnap.data() as any;
      // Convert Timestamp objects back to Date
      const convertedData: SystemSettings = {
        ...data,
        academic: {
          ...data.academic,
          semesterStartDate: data.academic?.semesterStartDate?.toDate?.()
            ? data.academic.semesterStartDate.toDate()
            : new Date(data.academic?.semesterStartDate || new Date()),
          semesterEndDate: data.academic?.semesterEndDate?.toDate?.()
            ? data.academic.semesterEndDate.toDate()
            : new Date(data.academic?.semesterEndDate || new Date())
        },
        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate() : new Date(),
        updatedAt: data.updatedAt?.toDate?.() ? data.updatedAt.toDate() : new Date()
      };
      return convertedData;
    }

    // Return default settings if document doesn't exist
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('Error fetching system settings:', error);
    return DEFAULT_SETTINGS;
  }
};

/**
 * Update system settings in Firestore
 */
export const updateSystemSettings = async (
  settings: Partial<SystemSettings>,
  userId: string,
  userEmail: string,
  reason?: string
): Promise<boolean> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    // Prepare settings with proper date handling
    const settingsToSave = {
      ...settings,
      academic: {
        ...settings.academic,
        semesterStartDate: settings.academic?.semesterStartDate
          ? Timestamp.fromDate(new Date(settings.academic.semesterStartDate))
          : Timestamp.now(),
        semesterEndDate: settings.academic?.semesterEndDate
          ? Timestamp.fromDate(new Date(settings.academic.semesterEndDate))
          : Timestamp.now()
      },
      updatedAt: Timestamp.now(),
      updatedBy: userId,
      updatedByUserEmail: userEmail
    };

    // Check if document exists
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
      await updateDoc(settingsRef, settingsToSave);
    } else {
      // Create new document with defaults
      await setDoc(settingsRef, {
        ...DEFAULT_SETTINGS,
        ...settingsToSave,
        createdAt: Timestamp.now()
      });
    }

    // Log the change
    await logSettingsUpdate(settings, userId, userEmail, reason);

    return true;
  } catch (error) {
    console.error('Error updating system settings:', error);
    throw error;
  }
};

/**
 * Update a specific setting value
 */
export const updateSettingField = async (
  fieldPath: string,
  value: any,
  userId: string,
  userEmail: string
): Promise<boolean> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    // Create an object with nested paths for update
    const updateData: any = {
      [`${fieldPath}`]: value,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
      updatedByUserEmail: userEmail
    };

    await updateDoc(settingsRef, updateData);

    // Log the change
    const changes: any = {};
    changes[fieldPath] = value;
    await logSettingsUpdate(changes, userId, userEmail);

    return true;
  } catch (error) {
    console.error('Error updating setting field:', error);
    throw error;
  }
};

/**
 * Log all settings changes for audit trail
 */
export const logSettingsUpdate = async (
  changes: any,
  userId: string,
  userEmail: string,
  reason?: string
): Promise<void> => {
  try {
    // Create individual logs for each changed field
    for (const [key, newValue] of Object.entries(changes)) {
      if (key === 'updatedAt' || key === 'updatedBy' || key === 'updatedByUserEmail' || key === 'createdAt') {
        continue;
      }

      const logRef = collection(db, UPDATE_LOGS_COLLECTION);
      await addDoc(logRef, {
        settingKey: key,
        newValue: newValue,
        updatedBy: userId,
        updatedByEmail: userEmail,
        updatedAt: Timestamp.now(),
        reason: reason || null
      });
    }
  } catch (error) {
    console.error('Error logging settings update:', error);
  }
};

/**
 * Get settings update history
 */
export const getSettingsUpdateHistory = async (
  limit: number = 50
): Promise<SettingsUpdateLog[]> => {
  try {
    const logsRef = collection(db, UPDATE_LOGS_COLLECTION);
    const q = query(logsRef);
    const querySnapshot = await getDocs(q);

    const logs: SettingsUpdateLog[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      logs.push({
        id: doc.id,
        settingKey: data.settingKey,
        oldValue: data.oldValue,
        newValue: data.newValue,
        updatedBy: data.updatedBy,
        updatedByEmail: data.updatedByEmail,
        updatedAt: data.updatedAt?.toDate() || new Date(),
        reason: data.reason
      });
    });

    // Sort by date descending and limit
    return logs.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, limit);
  } catch (error) {
    console.error('Error fetching settings update history:', error);
    return [];
  }
};

/**
 * Reset settings to defaults
 */
export const resetSettingsToDefaults = async (
  userId: string,
  userEmail: string
): Promise<boolean> => {
  try {
    const settingsRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);

    const settingsToSave = {
      ...DEFAULT_SETTINGS,
      updatedAt: Timestamp.now(),
      updatedBy: userId,
      updatedByUserEmail: userEmail,
      createdAt: Timestamp.now()
    };

    await setDoc(settingsRef, settingsToSave, { merge: false });

    // Log the reset
    await logSettingsUpdate(DEFAULT_SETTINGS, userId, userEmail, 'Reset to default settings');

    return true;
  } catch (error) {
    console.error('Error resetting settings to defaults:', error);
    throw error;
  }
};

/**
 * Export settings as JSON
 */
export const exportSettingsAsJson = async (): Promise<string> => {
  try {
    const settings = await getSystemSettings();
    return JSON.stringify(settings, null, 2);
  } catch (error) {
    console.error('Error exporting settings:', error);
    throw error;
  }
};

/**
 * Import settings from JSON
 */
export const importSettingsFromJson = async (
  jsonData: string,
  userId: string,
  userEmail: string
): Promise<boolean> => {
  try {
    const settings = JSON.parse(jsonData) as SystemSettings;
    await updateSystemSettings(settings, userId, userEmail, 'Imported from JSON');
    return true;
  } catch (error) {
    console.error('Error importing settings:', error);
    throw error;
  }
};

/**
 * Backup settings to a separate collection
 */
export const backupSettings = async (
  userId: string
): Promise<string> => {
  try {
    const settings = await getSystemSettings();
    const backupRef = collection(db, 'settingsBackups');

    const backupData = {
      settings: settings,
      backedUpAt: Timestamp.now(),
      backedUpBy: userId,
      backupName: `Backup - ${new Date().toISOString()}`
    };

    const docRef = await addDoc(backupRef, backupData);
    return docRef.id;
  } catch (error) {
    console.error('Error backing up settings:', error);
    throw error;
  }
};

/**
 * Restore settings from backup
 */
export const restoreSettingsFromBackup = async (
  backupId: string,
  userId: string,
  userEmail: string
): Promise<boolean> => {
  try {
    const backupRef = doc(db, 'settingsBackups', backupId);
    const backupSnap = await getDoc(backupRef);

    if (!backupSnap.exists()) {
      throw new Error('Backup not found');
    }

    const { settings } = backupSnap.data();
    await updateSystemSettings(settings, userId, userEmail, `Restored from backup ${backupId}`);

    return true;
  } catch (error) {
    console.error('Error restoring settings from backup:', error);
    throw error;
  }
};

/**
 * Get all settings backups
 */
export const getAllSettingsBackups = async () => {
  try {
    const backupRef = collection(db, 'settingsBackups');
    const querySnapshot = await getDocs(backupRef);

    const backups: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      backups.push({
        id: doc.id,
        backupName: data.backupName,
        backedUpAt: data.backedUpAt?.toDate() || new Date(),
        backedUpBy: data.backedUpBy
      });
    });

    return backups.sort((a, b) => b.backedUpAt.getTime() - a.backedUpAt.getTime());
  } catch (error) {
    console.error('Error fetching settings backups:', error);
    return [];
  }
};

/**
 * Cache settings in localStorage for faster access
 */
export const cacheSettingsLocally = (settings: SystemSettings): void => {
  try {
    const settingsString = JSON.stringify(settings);
    localStorage.setItem('cachedSystemSettings', settingsString);
    localStorage.setItem('cachedSettingsTimestamp', Date.now().toString());
  } catch (error) {
    console.error('Error caching settings locally:', error);
  }
};

/**
 * Get cached settings from localStorage
 */
export const getCachedSettingsLocally = (): SystemSettings | null => {
  try {
    const cached = localStorage.getItem('cachedSystemSettings');
    const timestamp = localStorage.getItem('cachedSettingsTimestamp');

    if (!cached || !timestamp) {
      return null;
    }

    // Cache for 1 hour
    const cacheAge = Date.now() - parseInt(timestamp);
    if (cacheAge > 60 * 60 * 1000) {
      localStorage.removeItem('cachedSystemSettings');
      localStorage.removeItem('cachedSettingsTimestamp');
      return null;
    }

    return JSON.parse(cached);
  } catch (error) {
    console.error('Error retrieving cached settings:', error);
    return null;
  }
};

/**
 * Get settings with caching support
 */
export const getSystemSettingsWithCache = async (): Promise<SystemSettings> => {
  // Try to get from cache first
  const cached = getCachedSettingsLocally();
  if (cached) {
    return cached;
  }

  // Otherwise fetch from Firestore and cache
  const settings = await getSystemSettings();
  cacheSettingsLocally(settings);
  return settings;
};

/**
 * Clear settings cache
 */
export const clearSettingsCache = (): void => {
  localStorage.removeItem('cachedSystemSettings');
  localStorage.removeItem('cachedSettingsTimestamp');
};
