
import { useState } from "react";
import { AnalysisData } from "@/types";

/**
 * Hook for managing the state of image analysis
 */
export function useAnalysisState() {
  // Analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  
  // State management functions
  const startAnalysis = () => setIsAnalyzing(true);
  const completeAnalysis = () => setIsAnalyzing(false);
  
  return {
    isAnalyzing,
    analysisData,
    setAnalysisData,
    startAnalysis,
    completeAnalysis
  };
}
