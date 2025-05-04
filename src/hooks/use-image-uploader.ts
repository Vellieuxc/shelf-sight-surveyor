
import { useState } from "react";
import { useAuth } from "@/contexts/auth";
import { useToast } from "@/hooks/use-toast";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { useImageUpload } from "./use-image-upload";
import { useSupabaseStorage } from "./use-supabase-storage";
import { supabase } from "@/integrations/supabase/client";

interface ImageUploaderOptions {
  storeId: string;
  onPictureUploaded?: () => void;
  maxSizeMB?: number;
}

export function useImageUploader({ storeId, onPictureUploaded, maxSizeMB = 10 }: ImageUploaderOptions) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { isOnline, captureOfflineImage } = useOfflineMode();
  
  // Use the base image upload hook
  const {
    selectedFile,
    imagePreview,
    isUploading,
    setIsUploading,
    handleFileChange,
    handleCaptureFromCamera,
    resetFile
  } = useImageUpload({ 
    maxSizeMB,
    onError: (message) => toast({ 
      title: "Error", 
      description: message, 
      variant: "destructive" 
    })
  });
  
  // Use storage hook with custom options
  const { uploadFile } = useSupabaseStorage({
    bucket: 'pictures',
    folder: `stores/${storeId}`
  });
  
  // Handle the complete upload process
  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast({
        title: "Upload Error",
        description: "Missing file or user information",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Handle offline mode
      if (!isOnline) {
        await captureOfflineImage(
          storeId, 
          selectedFile,
          selectedFile.name
        );
        
        toast({
          title: "Saved Offline", 
          description: "Picture saved locally and will be uploaded when you're online."
        });
        resetFile();
        onPictureUploaded?.();
        return;
      }
      
      // Upload file to Supabase Storage
      const fileUrl = await uploadFile(selectedFile);
      
      if (!fileUrl) {
        throw new Error("Failed to upload file");
      }
      
      // Save picture metadata to database
      const { error: dbError } = await supabase
        .from("pictures")
        .insert({
          store_id: storeId,
          uploaded_by: user.id,
          image_url: fileUrl,
          analysis_data: []
        });
      
      if (dbError) {
        throw dbError;
      }
      
      toast({
        title: "Upload Successful", 
        description: "Picture uploaded successfully!"
      });
      
      resetFile();
      onPictureUploaded?.();
      
    } catch (error) {
      console.error("Error uploading picture:", error);
      toast({
        title: "Upload Error",
        description: "Failed to upload picture. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFile,
    imagePreview,
    isUploading,
    handleFileChange,
    handleCaptureFromCamera,
    handleUpload,
    resetFile
  };
}
