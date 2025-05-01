
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisData } from "@/types";

interface UseImageAnalyzerProps {
  selectedImage: string | null;
  currentPictureId: string | null;
}

export const useImageAnalyzer = ({ selectedImage, currentPictureId }: UseImageAnalyzerProps) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setRetryCount(0);
    
    try {
      console.log("Starting image analysis...");
      // Call the Edge Function to analyze the image
      const { data, error } = await supabase.functions.invoke('analyze-shelf-image', {
        body: {
          imageUrl: selectedImage,
          imageId: currentPictureId || 'new-image'
        }
      });

      if (error) throw error;
      
      console.log("Response received:", data);
      
      if (data && data.success && data.data) {
        setAnalysisData(data.data);
        toast({
          title: "Analysis Complete",
          description: "Image has been successfully analyzed."
        });

        // If we have a pictureId, update the analysis data in the database
        if (currentPictureId) {
          console.log("Updating analysis data in database for picture ID:", currentPictureId);
          const { error: updateError } = await supabase
            .from("pictures")
            .update({
              analysis_data: data.data,
              last_edited_at: new Date().toISOString(),
              last_edited_by: (await supabase.auth.getUser()).data.user?.id
            })
            .eq("id", currentPictureId);

          if (updateError) {
            console.error("Error updating analysis data:", updateError);
            toast({
              title: "Warning",
              description: "Analysis completed but failed to save results to database.",
              variant: "destructive"
            });
          }
        }
      } else {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from analysis function");
      }
    } catch (error: any) {
      console.error("Error analyzing image:", error);

      // Check if we should retry
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1);
        console.log(`Retrying analysis... Attempt ${retryCount + 1} of ${maxRetries}`);
        
        toast({
          title: "Retrying Analysis",
          description: `Attempt ${retryCount + 1} of ${maxRetries}...`
        });
        
        // Wait a moment before retrying
        setTimeout(() => {
          handleAnalyzeImage();
        }, 2000);
        return;
      }
      
      toast({
        title: "Analysis Failed",
        description: "There was an issue connecting to the analysis service. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analysisData,
    setAnalysisData,
    handleAnalyzeImage
  };
};
