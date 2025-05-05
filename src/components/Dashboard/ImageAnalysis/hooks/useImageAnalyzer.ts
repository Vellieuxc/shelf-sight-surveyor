
import { useToast } from "@/hooks/use-toast";
import { AnalysisData } from "@/types";
import { useAnalysisProcess, useAnalysisState } from "./analysis";

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
  const { toast } = useToast();
  
  // Use extracted hooks for state and process management
  const {
    isAnalyzing,
    analysisData,
    setAnalysisData,
    startAnalysis,
    completeAnalysis
  } = useAnalysisState();
  
  const { processAnalysis } = useAnalysisProcess({
    onComplete: (data) => {
      onAnalysisComplete?.(data);
      
      toast({
        title: "Analysis Complete",
        description: "Image has been analyzed successfully.",
      });
    }
  });

  const handleAnalyzeImage = async () => {
    if (!selectedImage || !currentPictureId) {
      toast({
        title: "Analysis Error",
        description: "Missing image or identification information",
        variant: "destructive",
      });
      return;
    }

    startAnalysis();
    
    try {
      // Show analysis toast
      toast({
        title: "Analysis Started",
        description: "Your image is being analyzed...",
      });
      
      // Analyze the image directly
      const results = await processAnalysis(selectedImage, currentPictureId);
      
      if (results) {
        setAnalysisData(results);
        
        toast({
          title: "Analysis Complete",
          description: `Analyzed ${results.length} items in image`,
        });
      } else {
        console.log("No results returned from processAnalysis");
        
        toast({
          title: "Analysis Issue",
          description: "No items were detected in the image",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      completeAnalysis();
    }
  };

  return {
    isAnalyzing,
    analysisData,
    setAnalysisData,
    handleAnalyzeImage,
  };
};
