
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
  isError: boolean;
  errorMessage: string | null;
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
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPictureId, setCurrentPictureId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'usePictureData',
    operation: 'fetchPictureData'
  });

  useEffect(() => {
    if (!pictureId) {
      // Clear data if no picture ID is provided
      setSelectedImage(null);
      setCurrentPictureId(null);
      setAnalysisData(null);
      setIsError(false);
      setErrorMessage(null);
      return;
    }
    
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    
    const fetchPictureData = async () => {
      try {
        console.log(`Fetching data for picture ID: ${pictureId}`);
        
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error("Request timed out")), 10000);
        });
        
        const fetchPromise = supabase
          .from("pictures")
          .select("*")
          .eq("id", pictureId)
          .single();
          
        // Race between fetch and timeout
        const { data, error } = await Promise.race([
          fetchPromise,
          timeoutPromise.then(() => {
            throw new Error("Request timed out");
          })
        ]) as any;

        if (error) throw error;
        
        console.log(`Picture data retrieved:`, data);
        
        // Transform the raw data to PictureData with proper typing
        const pictureData: PictureData = {
          ...data,
          analysis_data: data.analysis_data 
            ? transformAnalysisData(data.analysis_data as Json[]) 
            : null
        };
        
        setSelectedImage(pictureData.image_url);
        setCurrentPictureId(pictureData.id);
        
        // If analysis data exists, set it
        if (pictureData.analysis_data && Array.isArray(pictureData.analysis_data) && pictureData.analysis_data.length > 0) {
          console.log("Setting analysis data:", pictureData.analysis_data);
          setAnalysisData(pictureData.analysis_data);
        } else {
          console.log("No analysis data found for this picture");
          setAnalysisData(null);
        }
      } catch (err: any) {
        setIsError(true);
        setErrorMessage(err?.message || "Failed to load picture data");
        
        // Use the error handling utility for proper error logging and display
        handleError(err, {
          fallbackMessage: "Failed to load picture data",
          additionalData: { pictureId }
        });
        
        // Make sure to clear any partial data
        setSelectedImage(null);
        setAnalysisData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPictureData();
  }, [pictureId, handleError]);

  return {
    isLoading,
    isError,
    errorMessage,
    selectedImage,
    currentPictureId,
    analysisData,
    setSelectedImage,
    setCurrentPictureId,
    setAnalysisData
  };
};
