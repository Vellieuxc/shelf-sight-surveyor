
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useImageUpload, useImageAnalyzer, useDataExport, usePictureData } from "./hooks";
import { AnalysisData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageAnalysis = (storeId?: string) => {
  const [searchParams] = useSearchParams();
  const pictureId = searchParams.get("pictureId");
  const { toast } = useToast();
  
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
  
  // Use either the picture data or uploaded image data
  const selectedImage = pictureImage || uploadedImage;
  const currentPictureId = picturePictureId || uploadedPictureId;

  // Debug logs
  useEffect(() => {
    console.log("Current state:", {
      pictureId,
      selectedImage,
      currentPictureId,
      pictureImage,
      uploadedImage,
      picturePictureId,
      uploadedPictureId
    });
  }, [pictureId, selectedImage, currentPictureId, pictureImage, uploadedImage, picturePictureId, uploadedPictureId]);
  
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
      // If we're working with an existing picture, update its analysis data
      if (picturePictureId && pictureId) {
        console.log("Analysis complete for existing picture. Updating state and saving to DB.");
        setPictureAnalysisData(data);
        
        // Save the analysis data to the database
        try {
          console.log("Saving analysis data to database for picture:", pictureId);
          const { error } = await supabase
            .from('pictures')
            .update({ analysis_data: data })
            .eq('id', pictureId);
            
          if (error) {
            console.error("Error saving analysis data:", error);
            throw error;
          }
          
          console.log("Analysis data saved successfully");
          toast({
            title: "Analysis Saved",
            description: "Analysis data has been saved to the database."
          });
        } catch (err) {
          console.error("Failed to save analysis data:", err);
          toast({
            title: "Save Error",
            description: "Failed to save analysis data to database.",
            variant: "destructive"
          });
        }
      } else {
        console.log("Analysis complete for uploaded image");
      }
    }
  });
  
  // Use either the picture analysis data or analysis result
  const analysisData = pictureAnalysisData || analysisResult;
  
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
  };

  // Handle updating analysis data
  const handleUpdateAnalysisData = async (updatedData: AnalysisData[]) => {
    // Update local state
    if (picturePictureId) {
      setPictureAnalysisData(updatedData);
      
      // Update in database
      if (pictureId) {
        try {
          const { error } = await supabase
            .from('pictures')
            .update({ analysis_data: updatedData })
            .eq('id', pictureId);
            
          if (error) throw error;
            
          toast({
            title: "Data Updated",
            description: "Analysis data has been updated and saved successfully."
          });
        } catch (err) {
          console.error("Failed to update analysis data:", err);
          toast({
            title: "Update Failed",
            description: "Failed to save analysis data to database.",
            variant: "destructive"
          });
        }
      }
    } else {
      setAnalysisData(updatedData);
      toast({
        title: "Data Updated",
        description: "Analysis data has been updated successfully."
      });
    }
  };
  
  // Auto-analyze when loading an existing picture without analysis data
  useEffect(() => {
    if (pictureId && pictureImage && !isPictureLoading && !pictureAnalysisData && !isAnalyzing) {
      console.log("Auto-analyzing picture because it has no existing analysis data");
      // Wait a moment to ensure everything is ready
      const timer = setTimeout(() => {
        handleAnalyzeImage();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [pictureId, pictureImage, isPictureLoading, pictureAnalysisData, isAnalyzing, handleAnalyzeImage]);
  
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
