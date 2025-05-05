
import { useToast } from "@/hooks/use-toast";
import { AnalysisData } from "@/types";
import { useAnalysisProcess, useAnalysisState } from "./analysis";
import { processNextQueuedAnalysis } from "@/services/analysis/core";

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
      // Show queuing toast
      toast({
        title: "Analysis Started",
        description: "Your image is being queued for analysis...",
      });
      
      // Queue the analysis
      const results = await processAnalysis(selectedImage, currentPictureId);
      
      // Explicitly trigger queue processing
      try {
        await processNextQueuedAnalysis();
        console.log("Queue processing triggered successfully");
      } catch (error) {
        console.error("Error processing queue:", error);
        // Continue anyway since the job is already queued
      }
      
      if (results) {
        setAnalysisData(results);
      } else {
        console.log("No results returned from processAnalysis");
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
