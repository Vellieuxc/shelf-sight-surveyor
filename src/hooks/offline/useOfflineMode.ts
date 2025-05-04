
import { v4 as uuidv4 } from 'uuid';
import { supabase } from "@/integrations/supabase/client";
import { useOfflineStorage } from './useOfflineStorage';
import { useOfflineSync } from './useOfflineSync';
import { OfflineImage } from './types';

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
  const { 
    db,
    getPendingImages,
    getImageById,
    saveOfflineImage,
    deleteOfflineImage
  } = useOfflineStorage();
  
  const {
    isOnline, 
    pendingUploads,
    syncOfflineImages
  } = useOfflineSync();
  
  // Capture image offline
  const captureOfflineImage = async (storeId: string, imageBlob: Blob, fileName: string): Promise<string> => {
    // Get current user ID if available
    const user = (await supabase.auth.getUser()).data.user;
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(imageBlob);
    
    return await saveOfflineImage({
      storeId,
      file: imageBlob,
      fileName,
      previewUrl,
      uploaded: false,
      meta: {
        uploadedBy: user?.id,
        originalName: fileName
      }
    });
  };
  
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

// Re-export the types for easier imports
export type { OfflineImage } from './types';
