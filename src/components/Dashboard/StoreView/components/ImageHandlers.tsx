
import React from "react";
import { useImageUploader } from "@/hooks/use-image-uploader";

export interface ImageHandlersHook {
  selectedFile: File | null;
  imagePreview: string | null;
  isUploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleCaptureFromCamera: (file: File, previewUrl: string) => void;
  handleUpload: () => Promise<void>;
}

export const useImageHandlers = (storeId: string, refetchPictures: () => void): ImageHandlersHook => {
  // We're now just re-exporting the useImageUploader hook with the required parameters
  return useImageUploader({ 
    storeId, 
    onPictureUploaded: refetchPictures
  });
};
