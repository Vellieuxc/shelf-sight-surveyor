
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { createImagePreview } from "@/utils/imageUtils";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { useErrorHandling } from "@/hooks/use-error-handling";

export interface ImageHandlersHook {
  selectedFile: File | null;
  imagePreview: string | null;
  isUploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleCaptureFromCamera: (file: File, previewUrl: string) => void;
  handleUpload: () => Promise<void>;
}

export const useImageHandlers = (storeId: string, refetchPictures: () => void): ImageHandlersHook => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const { isOnline, captureOfflineImage } = useOfflineMode();
  const { handleError } = useErrorHandling({
    source: 'storage',
    componentName: 'ImageHandlers'
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      try {
        const previewUrl = await createImagePreview(file);
        setImagePreview(previewUrl);
      } catch (error) {
        handleError(error, {
          fallbackMessage: "Failed to create image preview", 
          operation: "createImagePreview",
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
        setSelectedFile(null);
        setImagePreview(null);
        refetchPictures();
        return;
      }
      
      // For now, this is a stub - actual upload logic will be handled elsewhere
      toast({
        title: "Upload functionality",
        description: "This is a stub for the upload functionality.",
      });
      
      // Reset state after upload
      setSelectedFile(null);
      setImagePreview(null);
      
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to upload picture",
        operation: "uploadPicture",
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

  return {
    selectedFile,
    imagePreview,
    isUploading,
    handleFileChange,
    handleCaptureFromCamera,
    handleUpload
  };
};
