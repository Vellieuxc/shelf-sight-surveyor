
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { analyzeShelfImage } from "@/services/analysisService";
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
      // Add timeout guard
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("Analysis timed out")), 60000); // 60 seconds timeout
      });
      
      // Race between analysis and timeout
      const data = await Promise.race([
        analyzeShelfImage(selectedImage, currentPictureId),
        timeoutPromise
      ]);
      
      if (Array.isArray(data) && data.length > 0) {
        setAnalysisData(data);
        onAnalysisComplete?.(data);
        
        toast({
          title: "Analysis Complete",
          description: `Successfully analyzed ${data.length} items on the shelf.`,
        });
        console.log("Analysis result:", data);
      } else {
        throw new Error("No items detected in the image");
      }
    } catch (error) {
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
      
      console.error("Analysis error:", error);
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
