
import { useToast } from "@/hooks/use-toast";
import { analyzeShelfImage } from "@/services/analysis";
import { AnalysisData } from "@/types";
import { useErrorHandling } from "@/hooks";

interface UseAnalysisProcessOptions {
  onComplete?: (data: AnalysisData[]) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for processing image analysis
 */
export function useAnalysisProcess(options: UseAnalysisProcessOptions = {}) {
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'api',
    componentName: 'AnalysisProcess',
    operation: 'analyzeImage'
  });
  
  const { onComplete, onError } = options;
  
  /**
   * Process the image analysis
   */
  const processAnalysis = async (
    image: string,
    imageId: string
  ): Promise<AnalysisData[] | null> => {
    if (!image || !imageId) {
      toast({
        title: "Analysis Error",
        description: "Missing image or identification information",
        variant: "destructive",
      });
      return null;
    }
    
    try {
      console.log("Analyzing image ID:", imageId);
      
      // Use the refactored analysis service
      const analysisResults = await analyzeShelfImage(image, imageId);
      
      console.log("Analysis results:", analysisResults);
      
      // Call the onComplete callback if provided
      onComplete?.(analysisResults);
      
      return analysisResults;
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Error analyzing image. Please try again.",
        additionalData: { imageId },
        useShadcnToast: true
      });
      
      onError?.(error);
      return null;
    }
  };
  
  return {
    processAnalysis
  };
}
