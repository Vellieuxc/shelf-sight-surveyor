
import { useState, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { OfflineImage, IDBStore } from './types';
import { useToast } from '@/hooks/use-toast';

export function useOfflineStorage(): IDBStore & {
  getPendingImages: (storeId?: string) => Promise<OfflineImage[]>;
  getImageById: (id: string) => Promise<OfflineImage | undefined>;
  saveOfflineImage: (image: Omit<OfflineImage, 'id' | 'timestamp'>) => Promise<string>;
  updateOfflineImage: (id: string, updates: Partial<OfflineImage>) => Promise<boolean>;
  deleteOfflineImage: (id: string) => Promise<boolean>;
  countPendingUploads: () => Promise<number>;
} {
  const [db, setDb] = useState<IDBPDatabase | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Initialize IndexedDB
  const initialize = async (): Promise<IDBPDatabase | null> => {
    try {
      const database = await openDB('shelf-sight-db', 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains('offline-images')) {
            const store = db.createObjectStore('offline-images', { keyPath: 'id' });
            store.createIndex('byStoreId', 'storeId');
            store.createIndex('byUploadStatus', 'uploaded');
            store.createIndex('byTimestamp', 'timestamp');
          }
        }
      });
      
      setDb(database);
      setIsInitialized(true);
      return database;
    } catch (error) {
      console.error("Failed to initialize IndexedDB:", error);
      toast({
        title: "Offline Storage Error",
        description: "Failed to initialize offline storage. Some features may not work properly.",
        variant: "destructive"
      });
      return null;
    }
  };
  
  useEffect(() => {
    initialize();
  }, []);

  // Get all pending images
  const getPendingImages = async (storeId?: string): Promise<OfflineImage[]> => {
    if (!db) return [];
    
    try {
      if (storeId) {
        return await db.getAllFromIndex('offline-images', 'byStoreId', storeId);
      } else {
        return await db.getAll('offline-images');
      }
    } catch (error) {
      console.error("Failed to get pending images:", error);
      return [];
    }
  };
  
  // Get specific image by ID
  const getImageById = async (id: string): Promise<OfflineImage | undefined> => {
    if (!db) return undefined;
    
    try {
      return await db.get('offline-images', id);
    } catch (error) {
      console.error(`Failed to get offline image with ID ${id}:`, error);
      return undefined;
    }
  };
  
  // Save offline image
  const saveOfflineImage = async (
    image: Omit<OfflineImage, 'id' | 'timestamp'>
  ): Promise<string> => {
    if (!db) throw new Error("Database not initialized");
    
    const id = `offline-${Math.random().toString(36).substring(2, 15)}`;
    
    const offlineImage: OfflineImage = {
      ...image,
      id,
      timestamp: Date.now(),
    };
    
    await db.add('offline-images', offlineImage);
    return id;
  };
  
  // Update offline image
  const updateOfflineImage = async (
    id: string,
    updates: Partial<OfflineImage>
  ): Promise<boolean> => {
    if (!db) return false;
    
    try {
      const image = await db.get('offline-images', id);
      if (!image) return false;
      
      await db.put('offline-images', { 
        ...image,
        ...updates
      });
      
      return true;
    } catch (error) {
      console.error(`Failed to update offline image with ID ${id}:`, error);
      return false;
    }
  };
  
  // Delete an offline image
  const deleteOfflineImage = async (id: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      await db.delete('offline-images', id);
      return true;
    } catch (error) {
      console.error(`Failed to delete offline image with ID ${id}:`, error);
      return false;
    }
  };
  
  // Count pending uploads
  const countPendingUploads = async (): Promise<number> => {
    if (!db) return 0;
    try {
      // Use IDBKeyRange.only with a value of 0 (false)
      return await db.count('offline-images', IDBKeyRange.only(0));
    } catch (error) {
      console.error("Failed to count pending uploads:", error);
      return 0;
    }
  };
  
  return {
    db,
    isInitialized,
    initialize,
    getPendingImages,
    getImageById,
    saveOfflineImage,
    updateOfflineImage,
    deleteOfflineImage,
    countPendingUploads
  };
}
