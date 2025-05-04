
import React, { createContext, useContext, useEffect } from 'react';
import { useOfflineMode, OfflineStore, OfflineImage } from '@/hooks/useOfflineMode';
import { useToast } from '@/hooks/use-toast';

type OfflineContextType = OfflineStore;

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const offlineStore = useOfflineMode();
  const { toast } = useToast();

  // Set up online/offline notifications
  useEffect(() => {
    const handleOnline = () => {
      toast({
        title: "You're back online",
        description: "Your device is now connected to the internet."
      });
    };
    
    const handleOffline = () => {
      toast({
        title: "You're offline",
        description: "Your device is currently offline. Pictures will be saved locally and uploaded when you reconnect.",
        duration: 5000
      });
    };
    
    // Only add listeners if they aren't already set in useOfflineMode
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (offlineStore.isOnline && offlineStore.pendingUploads > 0) {
      offlineStore.syncOfflineImages();
    }
  }, [offlineStore.isOnline, offlineStore.pendingUploads]);
  
  return (
    <OfflineContext.Provider value={offlineStore}>
      {children}
    </OfflineContext.Provider>
  );
};

export const useOfflineContext = () => {
  const context = useContext(OfflineContext);
  if (context === undefined) {
    throw new Error('useOfflineContext must be used within an OfflineProvider');
  }
  return context;
};
