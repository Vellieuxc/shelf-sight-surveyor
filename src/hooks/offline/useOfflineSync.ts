
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from '@/hooks/use-toast';
import { OfflineImage } from './types';
import { useOfflineStorage } from './useOfflineStorage';

// Constants
const BUCKET_NAME = 'pictures';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingUploads, setPendingUploads] = useState<number>(0);
  const { toast } = useToast();
  const { 
    db, 
    isInitialized, 
    getPendingImages, 
    updateOfflineImage,
    countPendingUploads 
  } = useOfflineStorage();
  
  // Set up online/offline listeners
  useEffect(() => {
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
  
  // Update pending uploads count
  useEffect(() => {
    if (isInitialized) {
      const updatePendingCount = async () => {
        const count = await countPendingUploads();
        setPendingUploads(count);
      };
      
      updatePendingCount();
    }
  }, [isInitialized, countPendingUploads]);
  
  // Import the necessary function for storage verification
  async function verifyPicturesBucketExists() {
    try {
      // Check if the 'pictures' bucket exists
      const { data, error } = await supabase.storage.getBucket(BUCKET_NAME);
      
      if (error || !data) {
        // Create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) throw createError;
        
        // Configure bucket to allow public access to objects
        const { error: updateError } = await supabase.storage.updateBucket(BUCKET_NAME, {
          public: true,
        });
        
        if (updateError) throw updateError;
      }
    } catch (error) {
      console.error('Error verifying pictures bucket:', error);
      throw error;
    }
  }
  
  // Sync offline images
  const syncOfflineImages = async (): Promise<number> => {
    if (!db || !isOnline) return 0;

    const pendingImages = await getPendingImages();
    const unuploadedImages = pendingImages.filter(img => !img.uploaded);
    
    let successCount = 0;
    
    for (const image of unuploadedImages) {
      try {
        await verifyPicturesBucketExists();
        
        // Process file for upload
        const fileExt = image.fileName.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `stores/${image.storeId}/${fileName}`;
        
        // Upload image to storage
        const { error: uploadError } = await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, image.file);
        
        if (uploadError) throw uploadError;
        
        // Get the public URL
        const { data: publicUrlData } = supabase.storage
          .from(BUCKET_NAME)
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
        
        // Mark as uploaded in local DB
        await updateOfflineImage(image.id, { uploaded: true });
        
        successCount++;
      } catch (error) {
        console.error("Failed to sync offline image:", error);
      }
    }
    
    // Update pending count after sync
    const newCount = await countPendingUploads();
    setPendingUploads(newCount);
    
    if (successCount > 0) {
      toast({
        title: "Sync Complete",
        description: `Successfully uploaded ${successCount} offline ${successCount === 1 ? 'image' : 'images'}.`,
      });
    }
    
    return successCount;
  };

  return {
    isOnline,
    pendingUploads,
    syncOfflineImages
  };
}
