
import { useState, useEffect } from 'react';
import { AppSettings, AppSettingsContextType } from './types';

// Default settings values
const defaultSettings: AppSettings = {
  theme: 'system',
  autoSync: true,
  notificationsEnabled: true,
  imageQuality: 'medium',
};

// Local storage key
const SETTINGS_STORAGE_KEY = 'app_settings';

export function useAppSettingsState(): AppSettingsContextType {
  // Initialize state with default values or from storage if available
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as Partial<AppSettings>;
        return { ...defaultSettings, ...parsedSettings };
      } catch (e) {
        console.error('Failed to parse stored settings:', e);
        return defaultSettings;
      }
    }
    return defaultSettings;
  });

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  // Update settings with partial values
  const updateSettings = (updatedSettings: Partial<AppSettings>) => {
    setSettings(prevSettings => ({ ...prevSettings, ...updatedSettings }));
  };

  // Reset settings to defaults
  const resetSettings = () => {
    setSettings(defaultSettings);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
  };
}
