
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { AnalysisData } from "@/types";
import { useSearchParams } from "react-router-dom";

export const useImageAnalysis = (storeId?: string) => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const pictureId = searchParams.get("pictureId");
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const [currentPictureId, setCurrentPictureId] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Load image and analysis data if pictureId is provided
  useEffect(() => {
    if (pictureId) {
      setIsLoading(true);
      const fetchPictureData = async () => {
        try {
          const { data: picture, error } = await supabase
            .from("pictures")
            .select("*")
            .eq("id", pictureId)
            .single();

          if (error) throw error;

          if (picture) {
            setSelectedImage(picture.image_url);
            setCurrentPictureId(picture.id);
            
            // If analysis data exists, set it
            if (picture.analysis_data && Array.isArray(picture.analysis_data) && picture.analysis_data.length > 0) {
              setAnalysisData(picture.analysis_data as AnalysisData[]);
            }
          }
        } catch (error) {
          console.error("Error fetching picture:", error);
          toast({
            title: "Error",
            description: "Failed to load picture data",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchPictureData();
    }
  }, [pictureId, toast]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisData(null);
        setCurrentPictureId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setSelectedImage(null);
    setAnalysisData(null);
    setCurrentPictureId(null);
  };

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

      if (error) {
        console.error("Error analyzing image:", error);
        throw error;
      }
      
      console.log("Response received:", data);
      
      if (data && data.success && data.data) {
        setAnalysisData(data.data);
        toast({
          title: "Analysis Complete",
          description: "Image has been successfully analyzed.",
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
          description: `Attempt ${retryCount + 1} of ${maxRetries}...`,
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

  const handleExportToExcel = () => {
    if (!analysisData) return;

    // Create CSV content
    let csvContent = "SKU Name,Brand,Count,Price,Position,Pre-Promotion Price,Post-Promotion Price,Empty Space %\n";
    
    analysisData.forEach(item => {
      csvContent += [
        `"${item.sku_name || ''}"`,
        `"${item.brand || ''}"`,
        item.sku_count || '',
        item.sku_price || '',
        `"${item.sku_position || ''}"`,
        item.sku_price_pre_promotion || '',
        item.sku_price_post_promotion || '',
        item.empty_space_estimate || ''
      ].join(',') + '\n';
    });
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shelf-analysis-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Analysis data has been exported to CSV.",
    });
  };

  return {
    selectedImage,
    isAnalyzing,
    isLoading,
    analysisData,
    currentPictureId,
    handleImageUpload,
    handleResetImage,
    handleAnalyzeImage,
    handleExportToExcel
  };
};
