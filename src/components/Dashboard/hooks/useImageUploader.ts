
import { useState } from "react";
import { supabase, verifyPicturesBucketExists } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { createImagePreview } from "@/utils/imageUtils";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { handleStorageError } from "@/utils/errors";

export function useImageUploader(storeId: string, onPictureUploaded: () => void) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isOnline, captureOfflineImage } = useOfflineMode();
  const { handleError, runSafely } = useErrorHandling({
    source: 'storage',
    componentName: 'useImageUploader'
  });

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
          additionalData: { fileName: file.name }
        });
      }
    }
  };
  
  const handleCaptureFromCamera = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setImagePreview(previewUrl);
  };

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
      if (!isOnline) {
        // Save the image locally if offline
        await captureOfflineImage(
          storeId, 
          selectedFile,
          selectedFile.name
        );
        
        toast({
          title: "Saved Offline", 
          description: "Picture saved locally and will be uploaded when you're online."
        });
        resetState();
        onPictureUploaded();
        return;
      }
      
      // If online, proceed with normal upload flow
      await runSafely(async () => {
        await verifyPicturesBucketExists();
        
        // Upload the file to Supabase Storage
        const fileExt = selectedFile.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `stores/${storeId}/${fileName}`;
        
        // Create a storage object
        const { error: uploadError } = await supabase.storage
          .from('pictures')
          .upload(filePath, selectedFile);
        
        if (uploadError) {
          throw uploadError;
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
            store_id: storeId,
            uploaded_by: user.id,
            image_url: publicUrlData.publicUrl,
            analysis_data: []
          });
        
        if (dbError) {
          throw dbError;
        }
        
        return { success: true };
      }, {
        operation: 'uploadPicture',
        fallbackMessage: "Failed to upload picture",
        additionalData: { storeId, fileName: selectedFile.name }
      });
      
      toast({
        title: "Upload Successful", 
        description: "Picture uploaded successfully!"
      });
      resetState();
      onPictureUploaded();
      
    } catch (error) {
      handleStorageError(error, 'fileUpload', {
        useShadcnToast: true,
        fallbackMessage: "Failed to upload picture",
        additionalData: { 
          storeId, 
          fileName: selectedFile?.name,
          fileSize: selectedFile?.size
        }
      });
    } finally {
      setIsUploading(false);
    }
  };

  const resetState = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  return {
    selectedFile,
    imagePreview,
    isUploading,
    handleFileChange,
    handleCaptureFromCamera,
    handleUpload,
    resetState
  };
}
