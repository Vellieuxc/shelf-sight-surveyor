
import { useState } from "react";
import { AnalysisData } from "@/types";
import { analyzeShelfImage } from "@/services/analysisService";
import { useToast } from "@/hooks/use-toast";
import { useAnalysisCache } from "@/hooks/use-analysis-cache";
import { supabase } from "@/integrations/supabase/client";

interface UseImageAnalyzerProps {
  selectedImage: string | null;
  currentPictureId: string | null;
  onAnalysisComplete?: (data: AnalysisData[]) => void;
}

export const useImageAnalyzer = ({ 
  selectedImage, 
  currentPictureId,
  onAnalysisComplete
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
        console.log("Starting image analysis", { imageUrl: selectedImage, imageId: currentPictureId });
        const result = await analyzeShelfImage(selectedImage, currentPictureId, {
          includeConfidence: true,
          retryCount: 5,
          timeout: 180000, // 3 minutes timeout for larger images
        });
        
        console.log("Analysis result received", { resultLength: result?.length });
        setAnalysisData(result);
        
        // If this is an existing picture, update its analysis data in the database
        if (currentPictureId) {
          try {
            console.log("Updating picture analysis data in database", { pictureId: currentPictureId });
            const { error } = await supabase
              .from('pictures')
              .update({ analysis_data: result })
              .eq('id', currentPictureId);
              
            if (error) throw error;
            console.log("Successfully updated analysis data in database");
          } catch (err) {
            console.error("Failed to update analysis data in database:", err);
          }
        }
        
        // Call callback if provided
        if (onAnalysisComplete) {
          onAnalysisComplete(result);
        }
        
        return result;
      } catch (error: any) {
        console.error("Analysis failed:", error);
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
      console.log("Triggering image analysis");
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
