
import { useState } from "react";
import { AnalysisData } from "@/types";

/**
 * Hook to manage the state of image analysis
 */
export function useAnalysisState() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  
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
