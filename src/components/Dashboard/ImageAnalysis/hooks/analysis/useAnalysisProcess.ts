
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
    imageId: string,
    existingData: AnalysisData[] | null = null
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
      
      // Use the analysis service
      const analysisResults = await analyzeShelfImage(image, imageId);
      
      console.log("Analysis results received:", analysisResults ? (Array.isArray(analysisResults) ? analysisResults.length : "object") : "no results");
      
      // If analysis failed but we have existing data, use that instead
      if (!analysisResults && existingData) {
        console.log("Using existing analysis data as fallback");
        
        toast({
          title: "Analysis Notice",
          description: "Using existing analysis data. OCR service unavailable.",
          variant: "default",
        });
        
        // Call the onComplete callback if provided
        onComplete?.(existingData);
        return existingData;
      }
      
      // Call the onComplete callback if provided
      if (analysisResults) {
        onComplete?.(analysisResults);
      }
      
      return analysisResults;
    } catch (error) {
      // If we have existing data, use it as a fallback
      if (existingData) {
        console.log("Error during analysis, using existing data as fallback");
        
        toast({
          title: "Analysis Notice",
          description: "Using existing analysis data. OCR service encountered an error.",
          variant: "default",
        });
        
        onComplete?.(existingData);
        return existingData;
      }
      
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
