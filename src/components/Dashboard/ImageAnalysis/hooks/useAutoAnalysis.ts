
import { useEffect, useRef } from "react";

interface UseAutoAnalysisProps {
  pictureId: string | null;
  pictureImage: string | null;
  isPictureLoading: boolean;
  pictureAnalysisData: any | null;
  isAnalyzing: boolean;
  handleAnalyzeImage: () => void;
}

/**
 * Hook to automatically trigger analysis for existing images
 */
export const useAutoAnalysis = ({
  pictureId,
  pictureImage,
  isPictureLoading,
  pictureAnalysisData,
  isAnalyzing,
  handleAnalyzeImage
}: UseAutoAnalysisProps) => {
  const analysisComplete = useRef(false);
  
  // Re-enable auto-analysis for existing images
  useEffect(() => {
    const shouldAutoAnalyze = 
      pictureId && 
      pictureImage && 
      !isPictureLoading && 
      !pictureAnalysisData && 
      !isAnalyzing && 
      !analysisComplete.current;
      
    if (shouldAutoAnalyze) {
      console.log("Auto-analyzing existing image...");
      handleAnalyzeImage();
    }
  }, [pictureId, pictureImage, isPictureLoading, pictureAnalysisData, isAnalyzing, handleAnalyzeImage]);

  return {
    analysisComplete
  };
};
