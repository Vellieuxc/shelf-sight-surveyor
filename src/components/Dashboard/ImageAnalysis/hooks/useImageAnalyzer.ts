
import { useState } from "react";
import { AnalysisData } from "@/types";
import { analyzeShelfImage } from "@/services/analysisService";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisCache } from "@/hooks/use-analysis-cache";

interface UseImageAnalyzerProps {
  selectedImage: string | null;
  currentPictureId: string | null;
}

export const useImageAnalyzer = ({ 
  selectedImage, 
  currentPictureId 
}: UseImageAnalyzerProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  
  // Create a cache key based on the image URL
  const cacheKey = selectedImage ? `analysis-${selectedImage.split('?')[0]}` : null;

  // Cache the analysis computation
  const { executeComputation: executeCachedAnalysis } = useAnalysisCache(
    cacheKey || '',
    async () => {
      if (!selectedImage || !currentPictureId) {
        throw new Error("No image selected for analysis");
      }
      
      setIsAnalyzing(true);
      
      try {
        const result = await analyzeShelfImage(selectedImage, currentPictureId, {
          includeConfidence: true
        });
        
        setAnalysisData(result);
        return result;
      } catch (error: any) {
        toast({
          title: "Analysis Failed",
          description: error.message || "Could not analyze the image. Please try again.",
          variant: "destructive"
        });
        throw error;
      } finally {
        setIsAnalyzing(false);
      }
    },
    { 
      // Only enable caching if we have an image
      enabled: !!selectedImage,
      // Cache for 30 minutes
      ttl: 30 * 60 * 1000 
    }
  );

  const handleAnalyzeImage = async () => {
    if (!selectedImage || !currentPictureId) {
      toast({
        title: "No Image Selected",
        description: "Please select or upload an image first.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await executeCachedAnalysis();
      toast({
        title: "Analysis Complete",
        description: "The image has been successfully analyzed."
      });
    } catch (error) {
      // Error is already handled in the cache hook
      console.error("Analysis error:", error);
    }
  };

  return {
    isAnalyzing,
    analysisData,
    setAnalysisData,
    handleAnalyzeImage,
  };
};
