
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { analyzeShelfImage } from "@/services/analysis";
import { AnalysisData } from "@/types";
import { handleError } from "@/utils/errors";

interface UseImageAnalyzerOptions {
  selectedImage: string | null;
  currentPictureId: string | null;
  onAnalysisComplete?: (data: AnalysisData[]) => void;
}

/**
 * Hook for handling image analysis functionality
 */
export const useImageAnalyzer = ({
  selectedImage,
  currentPictureId,
  onAnalysisComplete,
}: UseImageAnalyzerOptions) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const { toast } = useToast();

  const handleAnalyzeImage = async () => {
    if (!selectedImage || !currentPictureId) {
      toast({
        title: "Analysis Error",
        description: "Missing image or identification information",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    
    try {
      console.log("Analyzing image ID:", currentPictureId);
      
      // Use the refactored analysis service
      const analysisResults = await analyzeShelfImage(selectedImage, currentPictureId);
      
      console.log("Analysis results:", analysisResults);
      
      setAnalysisData(analysisResults);
      
      // Call the onAnalysisComplete callback if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResults);
      }
      
      toast({
        title: "Analysis Complete",
        description: "Image has been analyzed successfully.",
      });
      
    } catch (error) {
      console.error("Analysis error:", error);
      handleError(error, {
        fallbackMessage: "Error analyzing image. Please try again.",
        context: {
          source: 'api',
          operation: 'analyzeImage',
          additionalData: { imageId: currentPictureId }
        },
        useShadcnToast: true,
        retry: handleAnalyzeImage
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analysisData,
    setAnalysisData,
    handleAnalyzeImage,
  };
};
