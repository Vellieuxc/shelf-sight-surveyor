
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useImageUpload } from './use-image-upload';

interface UseImageProcessingOptions {
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useImageProcessing(options: UseImageProcessingOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { maxSizeMB = 10, maxWidth = 1920, maxHeight = 1080 } = options;
  
  // Use our base image upload hook
  const {
    selectedFile: imageFile,
    imagePreview,
    handleFileChange: baseHandleImageChange,
    resetFile: resetImage
  } = useImageUpload({
    maxSizeMB,
    onSuccess: () => {
      // Additional processing could be added here in the future
    }
  });

  const processImage = async (file: File): Promise<{ processedFile: File, preview: string } | null> => {
    setIsProcessing(true);
    
    try {
      // For now, just delegate to the base hook
      // Future enhancement: Add resizing logic based on maxWidth and maxHeight
      const previewPromise = new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            resolve(e.target.result as string);
          } else {
            reject(new Error("Failed to create image preview"));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const preview = await previewPromise;
      
      return {
        processedFile: file,
        preview
      };
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process image",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    baseHandleImageChange(e);
  };

  return {
    imageFile,
    imagePreview,
    isProcessing,
    handleImageChange,
    processImage,
    resetImage
  };
}
