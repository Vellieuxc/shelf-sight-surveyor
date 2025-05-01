
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useImageUpload, useImageAnalyzer, useDataExport, usePictureData } from "./hooks";

export const useImageAnalysis = (storeId?: string) => {
  const [searchParams] = useSearchParams();
  const pictureId = searchParams.get("pictureId");
  
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
  
  return {
    selectedImage,
    isAnalyzing,
    isLoading,
    analysisData,
    currentPictureId,
    handleImageUpload,
    handleResetImage,
    handleAnalyzeImage,
    handleExportToExcel: exportToExcel
  };
};
