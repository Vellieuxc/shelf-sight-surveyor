
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

    setIsAnalyzing(true);
    
    try {
      console.log("Starting image analysis for pictureId:", currentPictureId);
      console.log("Image URL:", selectedImage);
      
      // Increase timeout for complex images to 3 minutes
      const data = await analyzeShelfImage(selectedImage, currentPictureId, {
        timeout: 180000, // 3 minutes
        retryCount: 3
      });
      
      if (Array.isArray(data) && data.length > 0) {
        console.log("Analysis completed successfully with", data.length, "items");
        setAnalysisData(data);
        
        // Call the onAnalysisComplete callback if provided
        if (onAnalysisComplete) {
          console.log("Calling onAnalysisComplete callback with data");
          onAnalysisComplete(data);
        }
        
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${data.length} items on the shelf.`,
        });
      } else {
        console.error("No items detected in the image or invalid response format");
        throw new Error("No items detected in the image");
      }
    } catch (error) {
      console.error("Analysis error details:", error);
      handleError(error, {
        fallbackMessage: "Failed to analyze image. Please try again.",
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
