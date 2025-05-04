
import React, { createContext, useContext } from 'react';
import { AppSettingsContextType } from './types';
import { useAppSettingsState } from './useAppSettings';

const AppSettingsContext = createContext<AppSettingsContextType | undefined>(undefined);

export const AppSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const appSettingsState = useAppSettingsState();
  
  return (
    <AppSettingsContext.Provider value={appSettingsState}>
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const context = useContext(AppSettingsContext);
  if (context === undefined) {
    throw new Error('useAppSettings must be used within an AppSettingsProvider');
  }
  return context;
};
