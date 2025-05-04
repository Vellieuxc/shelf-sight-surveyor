
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisData } from "@/types";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { Json } from "@/integrations/supabase/types";
import { transformAnalysisData } from "@/utils/dataTransformers";

interface PictureData {
  id: string;
  image_url: string;
  analysis_data: AnalysisData[] | null;
  store_id: string;
  created_at: string;
  uploaded_by: string;
  last_edited_at?: string | null;
  last_edited_by?: string | null;
}

interface UsePictureDataReturn {
  isLoading: boolean;
  selectedImage: string | null;
  currentPictureId: string | null;
  analysisData: AnalysisData[] | null;
  setSelectedImage: React.Dispatch<React.SetStateAction<string | null>>;
  setCurrentPictureId: React.Dispatch<React.SetStateAction<string | null>>;
  setAnalysisData: React.Dispatch<React.SetStateAction<AnalysisData[] | null>>;
}

export const usePictureData = (pictureId: string | null): UsePictureDataReturn => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPictureId, setCurrentPictureId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const { handleError, runSafely } = useErrorHandling({
    source: 'database',
    componentName: 'usePictureData',
    operation: 'fetchPictureData'
  });

  useEffect(() => {
    if (pictureId) {
      setIsLoading(true);
      
      const fetchPictureData = async () => {
        const { data, error } = await runSafely(async () => {
          const { data, error } = await supabase
            .from("pictures")
            .select("*")
            .eq("id", pictureId)
            .single();

          if (error) throw error;
          
          // Transform the raw data to PictureData with proper typing
          const pictureData: PictureData = {
            ...data,
            analysis_data: data.analysis_data 
              ? transformAnalysisData(data.analysis_data as Json[]) 
              : null
          };
          
          return pictureData;
        }, {
          fallbackMessage: "Failed to load picture data",
          additionalData: { pictureId }
        });

        if (!error && data) {
          setSelectedImage(data.image_url);
          setCurrentPictureId(data.id);
          
          // If analysis data exists, set it
          if (data.analysis_data && Array.isArray(data.analysis_data) && data.analysis_data.length > 0) {
            setAnalysisData(data.analysis_data as AnalysisData[]);
          } else {
            setAnalysisData(null);
          }
        }
        
        setIsLoading(false);
      };

      fetchPictureData();
    }
  }, [pictureId, runSafely]);

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
