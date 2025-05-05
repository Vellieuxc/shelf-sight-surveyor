
import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useImageUpload, useImageAnalyzer, useDataExport, usePictureData } from "./hooks";
import { AnalysisData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { useErrorHandling } from "@/hooks";
import { useImageState } from "./hooks/useImageState";
import { useAnalysisDataPersistence } from "./hooks/useAnalysisDataPersistence";
import { useAutoAnalysis } from "./hooks/useAutoAnalysis";
import { useOfflineSync } from "./hooks/useOfflineSync";

/**
 * Main hook for image analysis functionality
 * Coordinates between picture loading, image upload, analysis, and data export
 */
export const useImageAnalysis = (storeId?: string) => {
  const [searchParams] = useSearchParams();
  const pictureId = searchParams.get("pictureId");
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'ui',
    componentName: 'ImageAnalysis',
    operation: 'saveAnalysisData'
  });
  const { pendingUploads, isOnline, syncOfflineImages } = useOfflineMode();
  
  // Load picture data if pictureId is provided
  const { 
    isLoading: isPictureLoading,
    isError: isPictureError,
    errorMessage: pictureErrorMessage,
    selectedImage: pictureImage,
    currentPictureId: picturePictureId,
    analysisData: pictureAnalysisData,
    setSelectedImage,
    setCurrentPictureId,
    setAnalysisData: setPictureAnalysisData
  } = usePictureData(pictureId);
  
  // Image upload functionality
  const {
    selectedImage: uploadedImage,
    currentPictureId: uploadedPictureId,
    handleImageUpload,
    handleResetImage
  } = useImageUpload();

  // Combine image sources using the extracted hook
  const { selectedImage, currentPictureId } = useImageState(
    pictureImage,
    uploadedImage,
    picturePictureId,
    uploadedPictureId,
    pictureAnalysisData
  );

  // Data persistence hook
  const { saveAnalysisData, updateAnalysisData } = useAnalysisDataPersistence({
    pictureId,
    setPictureAnalysisData
  });
  
  // Image analysis functionality
  const {
    isAnalyzing,
    analysisData: analysisResult,
    setAnalysisData,
    handleAnalyzeImage
  } = useImageAnalyzer({ 
    selectedImage, 
    currentPictureId,
    onAnalysisComplete: async (data) => {
      saveAnalysisData(data);
    }
  });

  // Auto analysis for existing images
  const { analysisComplete } = useAutoAnalysis({
    pictureId,
    pictureImage,
    isPictureLoading,
    pictureAnalysisData,
    isAnalyzing,
    handleAnalyzeImage
  });
  
  // Use either the picture analysis data or analysis result
  const analysisData = pictureAnalysisData || analysisResult;
  
  // Handle offline sync
  useOfflineSync({
    isOnline,
    pendingUploads,
    syncOfflineImages,
    refetchPictures: () => {} // This is intentionally empty as refetchPictures is not used in the original code
  });
  
  // Data export functionality
  const { handleExportToExcel } = useDataExport();
  
  // Wrap the export function to use our local analysisData
  const exportToExcel = () => handleExportToExcel(analysisData);

  // Custom reset image to handle both upload and picture scenarios
  const resetImage = () => {
    if (pictureId) {
      // For existing pictures, just clear the analysis results
      setPictureAnalysisData(null);
    } else {
      // For new uploads, reset everything
      handleResetImage();
    }
    // Reset analysis completion flag
    analysisComplete.current = false;
  };

  // Handle updating analysis data
  const handleUpdateAnalysisData = async (updatedData: AnalysisData[]) => {
    // Update local state
    if (picturePictureId) {
      setPictureAnalysisData(updatedData);
      updateAnalysisData(updatedData);
    } else {
      setAnalysisData(updatedData);
      toast({
        title: "Data Updated",
        description: "Analysis data has been updated successfully."
      });
    }
  };
  
  return {
    selectedImage,
    isAnalyzing,
    isLoading: isPictureLoading,
    isError: isPictureError,
    errorMessage: pictureErrorMessage,
    analysisData,
    currentPictureId,
    handleImageUpload,
    handleResetImage: resetImage,
    handleAnalyzeImage,
    handleExportToExcel: exportToExcel,
    handleUpdateAnalysisData
  };
};
