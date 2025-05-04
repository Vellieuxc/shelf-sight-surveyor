
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

    // Set analyzing state but don't actually call the edge function
    setIsAnalyzing(true);
    
    try {
      console.log("Analysis temporarily disabled - just displaying the image");
      console.log("Would have analyzed image ID:", currentPictureId);
      console.log("With image URL:", selectedImage);
      
      // Wait a moment to simulate processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create empty analysis data for display purposes
      const mockData: AnalysisData[] = [];
      
      setAnalysisData(mockData);
      
      // Call the onAnalysisComplete callback if provided
      if (onAnalysisComplete) {
        onAnalysisComplete(mockData);
      }
      
      toast({
        title: "Analysis Disabled",
        description: "Edge function call is currently disabled. Only rendering the image.",
      });
      
    } catch (error) {
      console.error("Analysis simulation error:", error);
      handleError(error, {
        fallbackMessage: "Error in image analysis simulation.",
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
