
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useImageUpload, useImageAnalyzer, useDataExport, usePictureData } from "./hooks";
import { AnalysisData } from "@/types";
import { useToast } from "@/hooks/use-toast";

export const useImageAnalysis = (storeId?: string) => {
  const [searchParams] = useSearchParams();
  const pictureId = searchParams.get("pictureId");
  const { toast } = useToast();
  
  // Load picture data if pictureId is provided
  const { 
    isLoading,
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
  
  // Use either the picture data or uploaded image data
  const selectedImage = pictureImage || uploadedImage;
  const currentPictureId = picturePictureId || uploadedPictureId;
  
  // Image analysis functionality
  const {
    isAnalyzing,
    analysisData: analysisResult,
    setAnalysisData,
    handleAnalyzeImage
  } = useImageAnalyzer({ 
    selectedImage, 
    currentPictureId 
  });
  
  // Use either the picture analysis data or analysis result
  const analysisData = pictureAnalysisData || analysisResult;
  
  // Data export functionality
  const { handleExportToExcel } = useDataExport();
  
  // Wrap the export function to use our local analysisData
  const exportToExcel = () => handleExportToExcel(analysisData);

  // Handle updating analysis data
  const handleUpdateAnalysisData = (updatedData: AnalysisData[]) => {
    // Update local state
    if (picturePictureId) {
      setPictureAnalysisData(updatedData);
    } else {
      setAnalysisData(updatedData);
    }

    toast({
      title: "Data Updated",
      description: "Analysis data has been updated successfully."
    });
  };
  
  return {
    selectedImage,
    isAnalyzing,
    isLoading,
    analysisData,
    currentPictureId,
    handleImageUpload,
    handleResetImage,
    handleAnalyzeImage,
    handleExportToExcel: exportToExcel,
    handleUpdateAnalysisData
  };
};
