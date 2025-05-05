
import { useState, useEffect } from "react";

/**
 * Hook for managing the state of images in the analysis workflow
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

  // Debug logging effect
  useEffect(() => {
    console.log("Current image state:", {
      selectedImage,
      currentPictureId,
      pictureImage,
      uploadedImage,
      picturePictureId,
      uploadedPictureId,
      analysisData: pictureAnalysisData || "none"
    });
  }, [selectedImage, currentPictureId, pictureImage, uploadedImage, picturePictureId, uploadedPictureId, pictureAnalysisData]);

  return {
    selectedImage,
    currentPictureId
  };
};
