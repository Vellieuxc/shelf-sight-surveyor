
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { createSafeImageFilename } from "@/utils/imageUtils";

interface StorageOptions {
  bucket?: string;
  folder?: string;
  onUploadSuccess?: (url: string, path: string) => void;
  onUploadError?: (error: unknown) => void;
}

export function useSupabaseStorage(options: StorageOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { handleError, runSafely } = useErrorHandling({
    source: 'storage',
    componentName: 'useSupabaseStorage'
  });
  
  const { 
    bucket = 'pictures', 
    folder = '',
    onUploadSuccess,
    onUploadError
  } = options;

  // Verify bucket exists or create it
  const verifyBucketExists = async (): Promise<boolean> => {
    try {
      // Check if the bucket exists
      const { data, error } = await supabase.storage.getBucket(bucket);
      
      if (error || !data) {
        // Create the bucket if it doesn't exist
        const { error: createError } = await supabase.storage.createBucket(bucket, {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createError) {
          throw createError;
        }
        
        // Configure bucket to allow public access to objects
        const { error: updateError } = await supabase.storage.updateBucket(bucket, {
          public: true,
        });
        
        if (updateError) {
          throw updateError;
        }
      }
      
      return true;
    } catch (error) {
      handleError(error, { 
        fallbackMessage: `Failed to verify or create ${bucket} storage bucket`,
        operation: 'verifyBucketExists'
      });
      return false;
    }
  };
  
  // Upload file to Supabase Storage
  const uploadFile = async (file: File, customPath?: string): Promise<string | null> => {
    if (!file) {
      toast({
        title: "Upload Error",
        description: "No file selected",
        variant: "destructive"
      });
      return null;
    }
    
    setIsUploading(true);
    
    try {
      const bucketExists = await verifyBucketExists();
      if (!bucketExists) {
        throw new Error("Storage bucket not available");
      }
      
      // Generate safe filename and path
      const safeFilename = createSafeImageFilename(file.name);
      const filePath = customPath || 
        (folder ? `${folder}/${safeFilename}` : safeFilename);
      
      // Upload the file
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
      
      if (uploadError) {
        throw uploadError;
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded file");
      }
      
      toast({
        title: "Upload Successful", 
        description: "File uploaded successfully!"
      });
      
      onUploadSuccess?.(publicUrlData.publicUrl, filePath);
      return publicUrlData.publicUrl;
      
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to upload file",
        operation: 'uploadFile',
        additionalData: { 
          fileName: file.name,
          fileSize: file.size,
          bucket
        }
      });
      
      onUploadError?.(error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    isUploading,
    uploadFile,
    verifyBucketExists
  };
}
