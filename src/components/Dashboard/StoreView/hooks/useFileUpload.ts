
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { Store } from "@/types";
import { createImagePreview } from "@/utils/imageUtils";
import { handleStorageError, handleDatabaseError } from "@/utils/errors";
import { useErrorHandling } from "@/hooks/use-error-handling";

export const useFileUpload = (store: Store | null, userId: string) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { isOnline, captureOfflineImage } = useOfflineMode();
  const { runSafely } = useErrorHandling({ source: 'storage', componentName: 'useFileUpload' });

  // Handle file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      try {
        const previewUrl = await createImagePreview(file);
        setImagePreview(previewUrl);
      } catch (error) {
        handleStorageError(error, 'createImagePreview', {
          fallbackMessage: "Failed to create image preview",
          useShadcnToast: true,
          additionalData: { fileName: file.name, fileSize: file.size }
        });
      }
    }
  };
  
  // Handle image captured from camera
  const handleCapture = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setImagePreview(previewUrl);
  };

  // Handle file upload
  const handleFileUpload = async (onSuccess?: () => void) => {
    if (!selectedFile || !userId || !store) {
      toast({
        title: "Upload Error",
        description: "Missing file, user, or store information",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      if (!isOnline) {
        // Save the image locally if offline
        await captureOfflineImage(
          store.id, 
          selectedFile,
          selectedFile.name
        );
        
        toast({
          title: "Saved Offline", 
          description: "Picture saved locally and will be uploaded when you're online."
        });
        setSelectedFile(null);
        setImagePreview(null);
        onSuccess?.();
        return;
      }
      
      // If online, proceed with normal upload flow
      await verifyPicturesBucketExists();
      
      // Upload the file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `stores/${store.id}/${fileName}`;
      
      // Using runSafely to handle storage upload errors
      const { data: uploadResult, error: uploadError } = await runSafely(
        async () => {
          const { error } = await supabase.storage
            .from('pictures')
            .upload(filePath, selectedFile);
            
          if (error) throw error;
          return { filePath };
        },
        { 
          operation: 'uploadFile',
          fallbackMessage: "Failed to upload image to storage",
          showToast: true
        }
      );
      
      if (uploadError || !uploadResult) {
        throw new Error("Failed to upload file to storage");
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('pictures')
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }
      
      // Save picture metadata to database
      const { error: dbError } = await supabase
        .from("pictures")
        .insert({
          store_id: store.id,
          uploaded_by: userId,
          image_url: publicUrlData.publicUrl,
          analysis_data: []
        });
      
      if (dbError) {
        // Using handleDatabaseError for database-specific error handling
        handleDatabaseError(dbError, 'savePictureMetadata', {
          fallbackMessage: "Failed to save picture metadata",
          additionalData: { storeId: store.id, userId }
        });
        return;
      }
      
      toast({
        title: "Upload Successful", 
        description: "Picture uploaded successfully!"
      });
      
      setSelectedFile(null);
      setImagePreview(null);
      onSuccess?.();
      
    } catch (error) {
      console.error("Error uploading picture:", error);
      // Using custom error handler
      handleStorageError(error, 'fileUpload', {
        useShadcnToast: true,
        fallbackMessage: "Failed to upload picture",
        additionalData: { 
          storeId: store?.id, 
          fileName: selectedFile?.name,
          fileSize: selectedFile?.size
        }
      });
    } finally {
      setIsUploading(false);
    }
  };

  // We need to import this function since it's being used above
  // but isn't exported from imageUtils
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
      // Using storage error handler
      handleStorageError(error, 'verifyPicturesBucketExists', { 
        fallbackMessage: "Failed to verify or create pictures storage bucket"
      });
      throw error;
    }
  }
  
  return {
    selectedFile,
    imagePreview,
    isUploading,
    handleFileChange,
    handleFileUpload,
    handleCapture
  };
};
