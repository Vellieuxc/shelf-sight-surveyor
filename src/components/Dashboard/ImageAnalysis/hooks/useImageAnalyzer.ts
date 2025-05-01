
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

  // Function to save analysis results to the database
  const saveAnalysisToDatabase = async (data: AnalysisData[]) => {
    if (!currentPictureId) return;
    
    console.log("Updating analysis data in database for picture ID:", currentPictureId);
    const { error: updateError } = await supabase
      .from("pictures")
      .update({
        analysis_data: data,
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
  };

  const analyzeImageWithRetry = async (attempt = 0): Promise<boolean> => {
    try {
      console.log(`Analysis attempt ${attempt + 1} of ${maxRetries + 1}`);
      
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
        
        // Save results to database if we have a picture ID
        if (currentPictureId) {
          await saveAnalysisToDatabase(data.data);
        }
        
        toast({
          title: "Analysis Complete",
          description: "Image has been successfully analyzed."
        });
        
        return true;
      } else {
        console.error("Invalid response format:", data);
        throw new Error("Invalid response format from analysis function");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      return false;
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    setRetryCount(0);
    
    try {
      console.log("Starting image analysis...");
      
      // Try initial analysis
      const success = await analyzeImageWithRetry(0);
      
      // If not successful, attempt retries
      if (!success) {
        let retryAttempt = 0;
        let retrySuccess = false;
        
        while (retryAttempt < maxRetries && !retrySuccess) {
          retryAttempt++;
          setRetryCount(retryAttempt);
          
          toast({
            title: "Retrying Analysis",
            description: `Attempt ${retryAttempt + 1} of ${maxRetries + 1}...`
          });
          
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          retrySuccess = await analyzeImageWithRetry(retryAttempt);
          
          if (retrySuccess) break;
        }
        
        if (!retrySuccess) {
          toast({
            title: "Analysis Failed",
            description: "There was an issue connecting to the analysis service. Please try again later.",
            variant: "destructive"
          });
        }
      }
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
