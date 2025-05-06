
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { AnalysisData } from "@/types";
import { analyzeImage } from "@/services/analysis";
import { useErrorHandling } from "@/hooks";
import { useRenderPerformanceMonitor } from "@/utils/performance/renderOptimization";

interface AnalysisProcessOptions {
  onComplete?: (data: AnalysisData[]) => void;
}

/**
 * Hook for handling the analysis process
 */
export function useAnalysisProcess({ onComplete }: AnalysisProcessOptions = {}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'analysis',
    componentName: 'AnalysisProcess'
  });
  
  // Track rendering performance
  useRenderPerformanceMonitor('useAnalysisProcess');
  
  /**
   * Process the image analysis request with error handling and retry logic
   */
  const processAnalysis = useCallback(async (
    imageUrl: string,
    pictureId: string,
    existingAnalysisData?: AnalysisData[] | null
  ): Promise<AnalysisData[] | null> => {
    // Measure performance for analysis process
    const startTime = performance.now();
    
    try {
      setIsProcessing(true);
      
      // Call the analysis service
      console.log(`Starting analysis for picture ${pictureId}`);
      const results = await analyzeImage(imageUrl, pictureId);
      
      console.log(`Analysis complete for picture ${pictureId}`);
      
      // If we have results, call the onComplete callback
      if (results && onComplete) {
        onComplete(results);
      }
      
      // Measure and log processing time
      const processingTime = (performance.now() - startTime) / 1000;
      console.log(`Analysis processing completed in ${processingTime.toFixed(2)}s`);
      
      return results;
    } catch (error) {
      // Handle the error with the error handling utility
      handleError(error, {
        fallbackMessage: "Image analysis failed",
        operation: "processAnalysis",
        additionalData: { pictureId }
      });
      
      // Return existing data as fallback if available
      return existingAnalysisData || null;
    } finally {
      setIsProcessing(false);
    }
  }, [handleError, onComplete]);
  
  return {
    isProcessing,
    processAnalysis
  };
}
