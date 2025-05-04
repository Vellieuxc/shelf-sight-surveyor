
import { useState, useEffect } from 'react';
import { openDB, IDBPDatabase } from 'idb';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export interface OfflineImage {
  id: string;
  storeId: string;
  file: Blob;
  fileName: string;
  previewUrl: string;
  timestamp: number;
  uploaded: boolean;
  meta: {
    uploadedBy?: string;
    originalName?: string;
  };
}

export interface OfflineStore {
  db: IDBPDatabase | null;
  isOnline: boolean;
  pendingUploads: number;
  captureOfflineImage: (storeId: string, imageBlob: Blob, fileName: string) => Promise<string>;
  syncOfflineImages: () => Promise<number>;
  getPendingImages: (storeId?: string) => Promise<OfflineImage[]>;
  getImageById: (id: string) => Promise<OfflineImage | undefined>;
  deleteOfflineImage: (id: string) => Promise<boolean>;
}

export function useOfflineMode(): OfflineStore {
  const [db, setDb] = useState<IDBPDatabase | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingUploads, setPendingUploads] = useState<number>(0);
  const { toast } = useToast();
  
  // Initialize IndexedDB
  useEffect(() => {
    const initDB = async () => {
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
        
        // Count pending uploads - use IDBKeyRange.only with a value of 0 (false)
        const count = await database.count('offline-images', IDBKeyRange.only(0));
        setPendingUploads(count);
      } catch (error) {
        console.error("Failed to initialize IndexedDB:", error);
        toast({
          title: "Offline Storage Error",
          description: "Failed to initialize offline storage. Some features may not work properly.",
          variant: "destructive"
        });
      }
    };
    
    initDB();
    
    // Set up online/offline listeners
    const handleOnline = () => {
      setIsOnline(true);
      toast({
        title: "You're back online",
        description: "Your device is now connected to the internet."
      });
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      toast({
        title: "You're offline",
        description: "Your device is currently offline. Pictures will be saved locally and uploaded when you reconnect.",
        duration: 5000
      });
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);
  
  // Capture image offline
  const captureOfflineImage = async (storeId: string, imageBlob: Blob, fileName: string): Promise<string> => {
    if (!db) throw new Error("Database not initialized");
    
    const id = `offline-${uuidv4()}`;
    const previewUrl = URL.createObjectURL(imageBlob);
    
    // Get current user ID if available
    const user = (await supabase.auth.getUser()).data.user;
    
    const offlineImage: OfflineImage = {
      id,
      storeId,
      file: imageBlob,
      fileName,
      previewUrl,
      timestamp: Date.now(),
      uploaded: false,
      meta: {
        uploadedBy: user?.id,
        originalName: fileName
      }
    };
    
    await db.add('offline-images', offlineImage);
    setPendingUploads(prev => prev + 1);
    
    return id;
  };
  
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
  
  // Delete an offline image
  const deleteOfflineImage = async (id: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      await db.delete('offline-images', id);
      
      // Update pending uploads count - use IDBKeyRange.only with 0 (false)
      const count = await db.count('offline-images', IDBKeyRange.only(0));
      setPendingUploads(count);
      
      return true;
    } catch (error) {
      console.error(`Failed to delete offline image with ID ${id}:`, error);
      return false;
    }
  };
  
  // Sync offline images
  const syncOfflineImages = async (): Promise<number> => {
    if (!db || !isOnline) return 0;
    
    const tx = db.transaction('offline-images', 'readwrite');
    const store = tx.objectStore('offline-images');
    // Use IDBKeyRange.only with 0 (false) instead of boolean
    const pendingImages = await store.index('byUploadStatus').getAll(0);
    
    let successCount = 0;
    
    for (const image of pendingImages) {
      try {
        await verifyPicturesBucketExists();
        
        // Process file for upload
        const fileExt = image.fileName.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `stores/${image.storeId}/${fileName}`;
        
        // Upload image to storage
        const { error: uploadError } = await supabase.storage
          .from('pictures')
          .upload(filePath, image.file);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from('pictures')
          .getPublicUrl(filePath);
        
        const imageUrl = publicUrlData.publicUrl;
        
        // Add record to database
        const { error: dbError } = await supabase
          .from('pictures')
          .insert([
            {
              store_id: image.storeId,
              image_url: imageUrl,
              uploaded_by: image.meta.uploadedBy,
            },
          ]);
        
        if (dbError) throw dbError;
        
        // Mark as uploaded in local DB - use 1 instead of true
        await store.put({
          ...image,
          uploaded: 1
        });
        
        successCount++;
      } catch (error) {
        console.error("Failed to sync offline image:", error);
      }
    }
    
    setPendingUploads(pendingUploads - successCount);
    
    if (successCount > 0) {
      toast({
        title: "Sync Complete",
        description: `Successfully uploaded ${successCount} offline ${successCount === 1 ? 'image' : 'images'}.`,
      });
    }
    
    return successCount;
  };

  // Import the necessary function for storage verification
  async function verifyPicturesBucketExists() {
    try {
      // Check if the 'pictures' bucket exists
      const { data, error } = await supabase.storage.getBucket('pictures');
      
      if (error || !data) {
        // Create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket('pictures', {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) throw createError;
        
        // Configure bucket to allow public access to objects
        const { error: updateError } = await supabase.storage.updateBucket('pictures', {
          public: true,
        });
        
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error verifying pictures bucket:', error);
      throw error;
    }
  }
  
  return {
    db,
    isOnline,
    pendingUploads,
    captureOfflineImage,
    syncOfflineImages,
    getPendingImages,
    getImageById,
    deleteOfflineImage
  };
}
