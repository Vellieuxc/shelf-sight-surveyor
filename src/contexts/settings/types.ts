
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  autoSync: boolean;
  notificationsEnabled: boolean;
  imageQuality: 'low' | 'medium' | 'high';
}

export type AppSettingsContextType = {
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  resetSettings: () => void;
};
