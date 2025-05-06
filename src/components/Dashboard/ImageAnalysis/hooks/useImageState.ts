
import { useState, useEffect, useCallback } from "react";
import { preloadImage } from "@/utils/performance/imageOptimization";

/**
 * Hook for managing the state of images in the analysis workflow
 * with added security and optimization features
 */
export const useImageState = (
  pictureImage: string | null,
  uploadedImage: string | null,
  picturePictureId: string | null,
  uploadedPictureId: string | null,
  pictureAnalysisData: any | null
) => {
  // Use either the picture data or uploaded image data
  const selectedImage = pictureImage || uploadedImage;
  const currentPictureId = picturePictureId || uploadedPictureId;
  
  // Track image loading status for UI feedback
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  // Use a callback to securely preload the image 
  const securelyPreloadImage = useCallback(async (imageUrl: string) => {
    if (!imageUrl) return;
    
    try {
      setIsImageLoaded(false);
      await preloadImage(imageUrl);
      setIsImageLoaded(true);
    } catch (error) {
      console.error("Error preloading image:", error);
      setIsImageLoaded(true); // Still consider it loaded even if preload fails
    }
  }, []);
  
  // Preload the selected image when it changes
  useEffect(() => {
    if (selectedImage) {
      securelyPreloadImage(selectedImage);
    } else {
      setIsImageLoaded(false);
    }
  }, [selectedImage, securelyPreloadImage]);
  
  // Debug logging effect
  useEffect(() => {
    console.log("Current image state:", {
      selectedImage,
      currentPictureId,
      pictureImage,
      uploadedImage,
      picturePictureId,
      uploadedPictureId,
      analysisData: pictureAnalysisData ? "available" : "none", // Don't log full analysis data
      isImageLoaded
    });
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
