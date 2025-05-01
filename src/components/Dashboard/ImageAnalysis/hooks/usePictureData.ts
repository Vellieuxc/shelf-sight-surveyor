
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisData } from "@/types";

export const usePictureData = (pictureId: string | null) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPictureId, setCurrentPictureId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);

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

  return {
    isLoading,
    selectedImage,
    currentPictureId,
    analysisData,
    setSelectedImage,
    setCurrentPictureId,
    setAnalysisData
  };
};
