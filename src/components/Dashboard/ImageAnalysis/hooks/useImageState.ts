
import { useState, useEffect, useCallback, useMemo } from "react";
import { preloadImage } from "@/utils/performance/imageOptimization";
import { useRenderPerformanceMonitor, useThrottledEventHandler } from "@/utils/performance/renderOptimization";

/**
 * Enhanced hook for managing the state of images in the analysis workflow
 * with improved performance optimizations and security features
 */
export const useImageState = (
  pictureImage: string | null,
  uploadedImage: string | null,
  picturePictureId: string | null,
  uploadedPictureId: string | null,
  pictureAnalysisData: any | null
) => {
  // Track rendering performance of this hook
  useRenderPerformanceMonitor('useImageState');
  
  // Use memoized values to prevent unnecessary re-computations
  const selectedImage = useMemo(() => pictureImage || uploadedImage, [pictureImage, uploadedImage]);
  const currentPictureId = useMemo(() => picturePictureId || uploadedPictureId, [picturePictureId, uploadedPictureId]);
  
  // Track image loading status for UI feedback
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Create a throttled version of the state setter to prevent rapid updates
  const throttledSetIsImageLoaded = useThrottledEventHandler((value: boolean) => {
    setIsImageLoaded(value);
  }, 100);
  
  // Use a callback to securely preload the image 
  const securelyPreloadImage = useCallback(async (imageUrl: string) => {
    if (!imageUrl) return;
    
    try {
      throttledSetIsImageLoaded(false);
      
      // Track preloading performance
      const startTime = performance.now();
      
      // Wait for image to preload
      await preloadImage(imageUrl);
      
      // Log preloading time in development only
      if (process.env.NODE_ENV === 'development') {
        const loadTime = performance.now() - startTime;
        console.debug(`Image preloaded in ${loadTime.toFixed(2)}ms: ${imageUrl.substring(0, 50)}...`);
      }
      
      throttledSetIsImageLoaded(true);
    } catch (error) {
      console.error("Error preloading image:", error);
      throttledSetIsImageLoaded(true); // Still consider it loaded even if preload fails
    }
  }, [throttledSetIsImageLoaded]);
  
  // Preload the selected image when it changes
  useEffect(() => {
    if (selectedImage) {
      securelyPreloadImage(selectedImage);
    } else {
      setIsImageLoaded(false);
    }
  }, [selectedImage, securelyPreloadImage]);
  
  // Debug logging effect - only in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.debug("Image state updated:", {
        selectedImage: selectedImage ? "available" : "none", // Don't log full URL
        currentPictureId,
        hasUploadedImage: !!uploadedImage,
        hasPictureImage: !!pictureImage,
        hasPictureId: !!picturePictureId || !!uploadedPictureId,
        hasAnalysisData: !!pictureAnalysisData,
        isImageLoaded
      });
    }
  }, [
    selectedImage, currentPictureId, pictureImage, uploadedImage, 
    picturePictureId, uploadedPictureId, pictureAnalysisData, isImageLoaded
  ]);

  return {
    selectedImage,
    currentPictureId,
    isImageLoaded
  };
};
