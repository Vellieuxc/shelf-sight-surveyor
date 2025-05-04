
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createImagePreview, validateImageSize, validateImageType } from "@/utils/imageUtils";
import { useErrorHandling } from "@/hooks/use-error-handling";

export interface ImageUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  onError?: (message: string) => void;
  onSuccess?: (file: File, preview: string) => void;
}

export function useImageUpload(options: ImageUploadOptions = {}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'storage',
    componentName: 'useImageUpload'
  });

  const { 
    maxSizeMB = 10, 
    allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    onError,
    onSuccess
  } = options;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!validateImageType(file, allowedTypes)) {
        const message = `Invalid file type. Allowed: ${allowedTypes.join(', ')}`;
        toast({ title: "Error", description: message, variant: "destructive" });
        onError?.(message);
        return;
      }
      
      // Validate file size
      if (!validateImageSize(file, maxSizeMB)) {
        const message = `File size must be less than ${maxSizeMB}MB`;
        toast({ title: "Error", description: message, variant: "destructive" });
        onError?.(message);
        return;
      }
      
      try {
        const previewUrl = await createImagePreview(file);
        setSelectedFile(file);
        setImagePreview(previewUrl);
        onSuccess?.(file, previewUrl);
      } catch (error) {
        handleError(error, {
          fallbackMessage: "Failed to create image preview", 
          operation: "createImagePreview",
          additionalData: { fileName: file.name }
        });
        onError?.("Failed to create image preview");
      }
    }
  };
  
  const handleCaptureFromCamera = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setImagePreview(previewUrl);
    onSuccess?.(file, previewUrl);
  };
  
  const resetFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  return {
    selectedFile,
    imagePreview,
    isUploading,
    setIsUploading,
    handleFileChange,
    handleCaptureFromCamera,
    resetFile
  };
}
