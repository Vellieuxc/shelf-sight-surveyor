
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { createImagePreview, validateImageType, validateImageSize } from "@/utils/imageUtils";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { compressImage } from "@/utils/performance/imageOptimization";

export interface OptimizedImageUploadOptions {
  maxSizeMB?: number;
  allowedTypes?: string[];
  maxDimension?: number;
  compressionQuality?: number;
  onError?: (message: string) => void;
  onSuccess?: (file: File, preview: string) => void;
}

export function useOptimizedImageUpload(options: OptimizedImageUploadOptions = {}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'storage',
    componentName: 'useOptimizedImageUpload'
  });

  const { 
    maxSizeMB = 10, 
    allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    maxDimension = 1920,
    compressionQuality = 0.8,
    onError,
    onSuccess
  } = options;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessing(true);
      
      try {
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
        
        // Compress and optimize the image
        const optimizedFile = await compressImage(file, maxDimension, compressionQuality);
        
        // Generate preview from optimized image
        const previewUrl = await createImagePreview(optimizedFile);
        
        // Update state with optimized file
        setSelectedFile(optimizedFile);
        setImagePreview(previewUrl);
        
        // Call success callback
        onSuccess?.(optimizedFile, previewUrl);
        
      } catch (error) {
        handleError(error, {
          fallbackMessage: "Failed to process image", 
          operation: "processImage",
          additionalData: { fileName: file.name }
        });
        onError?.("Failed to process image");
      } finally {
        setIsProcessing(false);
      }
    }
  };
  
  const handleCaptureFromCamera = async (file: File, previewUrl: string) => {
    setIsProcessing(true);
    
    try {
      // Validate file size
      if (!validateImageSize(file, maxSizeMB)) {
        const message = `File size must be less than ${maxSizeMB}MB`;
        toast({ title: "Error", description: message, variant: "destructive" });
        onError?.(message);
        return;
      }
      
      // Compress and optimize the image
      const optimizedFile = await compressImage(file, maxDimension, compressionQuality);
      
      setSelectedFile(optimizedFile);
      setImagePreview(previewUrl);
      onSuccess?.(optimizedFile, previewUrl);
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to process camera image", 
        operation: "processCameraImage"
      });
      onError?.("Failed to process camera image");
    } finally {
      setIsProcessing(false);
    }
  };
  
  const resetFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };

  return {
    selectedFile,
    imagePreview,
    isUploading,
    isProcessing,
    setIsUploading,
    handleFileChange,
    handleCaptureFromCamera,
    resetFile
  };
}
