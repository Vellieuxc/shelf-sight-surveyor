
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { uploadFile as uploadStorageFile, UploadOptions } from "@/utils/storage/fileUtils";

interface StorageOptions extends UploadOptions {
  useShadcnToast?: boolean;
}

/**
 * Hook for interacting with Supabase storage
 */
export function useSupabaseStorage(options: StorageOptions = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'storage',
    componentName: 'useSupabaseStorage'
  });
  
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
      // Use the utility function for uploading
      const publicUrl = await uploadStorageFile(file, {
        ...options,
        customPath,
        onError: (error) => {
          handleError(error, {
            fallbackMessage: "Failed to upload file",
            operation: 'uploadFile',
            additionalData: { 
              fileName: file.name,
              fileSize: file.size,
              bucket: options.bucket || 'pictures'
            },
            useShadcnToast: options.useShadcnToast
          });
          
          options.onError?.(error);
        }
      });
      
      if (publicUrl) {
        toast({
          title: "Upload Successful", 
          description: "File uploaded successfully!"
        });
      }
      
      return publicUrl;
      
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to upload file",
        operation: 'uploadFile',
        additionalData: { 
          fileName: file.name,
          fileSize: file.size,
          bucket: options.bucket || 'pictures'
        },
        useShadcnToast: options.useShadcnToast
      });
      
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  return {
    isUploading,
    uploadFile
  };
}
