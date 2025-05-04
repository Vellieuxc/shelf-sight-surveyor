
import { useState } from 'react';
import { createImagePreview } from "@/utils/imageUtils";
import { useToast } from '@/hooks/use-toast';

interface UseImageProcessingOptions {
  maxSizeMB?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export function useImageProcessing(options: UseImageProcessingOptions = {}) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const { maxSizeMB = 10, maxWidth = 1920, maxHeight = 1080 } = options;
  
  const processImage = async (file: File): Promise<{ processedFile: File, preview: string } | null> => {
    setIsProcessing(true);
    
    try {
      // Check file size
      const fileSizeInMB = file.size / (1024 * 1024);
      if (fileSizeInMB > maxSizeMB) {
        toast({
          title: "File too large",
          description: `Image must be smaller than ${maxSizeMB}MB`,
          variant: "destructive"
        });
        return null;
      }
      
      // Create preview
      const preview = await createImagePreview(file);
      
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
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    const result = await processImage(file);
    
    if (result) {
      setImageFile(result.processedFile);
      setImagePreview(result.preview);
    }
  };

  const resetImage = () => {
    setImageFile(null);
    setImagePreview(null);
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
