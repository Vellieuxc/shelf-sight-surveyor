import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisData } from "@/types";
import { useErrorHandling } from "@/hooks";
import { Json } from "@/integrations/supabase/types";
import { ensureAnalysisDataType } from "@/services/analysis/transformers";

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

/**
 * Hook to fetch and manage picture data from Supabase
 */
export const usePictureData = (pictureId: string | null): UsePictureDataReturn => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPictureId, setCurrentPictureId] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const isMounted = useRef(true);
  const hasLoaded = useRef(false);
  
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'PictureData',
    operation: 'fetchPictureData'
  });

  useEffect(() => {
    // Set up cleanup function for component unmount
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // Reset the loaded state when pictureId changes
    if (pictureId !== currentPictureId) {
      hasLoaded.current = false;
    }
    
    if (!pictureId) {
      // Clear data if no picture ID is provided
      setSelectedImage(null);
      setCurrentPictureId(null);
      setAnalysisData(null);
      setIsError(false);
      setErrorMessage(null);
      return;
    }
    
    // Prevent duplicate fetches for the same pictureId
    if (hasLoaded.current && pictureId === currentPictureId) {
      return;
    }
    
    // Set loading state and prepare to fetch data
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);
    
    const fetchPictureData = async () => {
      try {
        console.log(`Fetching data for picture ID: ${pictureId}`);
        
        // Execute the fetch with improved error handling
        const { data, error } = await supabase
          .from("pictures")
          .select("*")
          .eq("id", pictureId)
          .maybeSingle();
          
        if (error) {
          throw error;
        }
        
        if (!data) {
          throw new Error("Picture not found");
        }
        
        // Don't update state if component has unmounted
        if (!isMounted.current) return;
        
        console.log(`Picture data retrieved:`, data);
        
        // Transform the raw data to PictureData with proper typing
        const pictureData: PictureData = {
          ...data,
          analysis_data: data.analysis_data 
            ? ensureAnalysisDataType(data.analysis_data as Json[]) 
            : null
        };
        
        // Mark that we've successfully loaded the data
        hasLoaded.current = true;
        
        // Set states with data
        setSelectedImage(pictureData.image_url);
        setCurrentPictureId(pictureData.id);
        
        // If analysis data exists, set it
        if (pictureData.analysis_data && Array.isArray(pictureData.analysis_data) && pictureData.analysis_data.length > 0) {
          setAnalysisData(pictureData.analysis_data);
        } else {
          setAnalysisData(null);
        }
        
        setIsLoading(false);
      } catch (error) {
        // Don't update state if component has unmounted
        if (!isMounted.current) return;
        
        const errorMsg = error instanceof Error ? error.message : "An unknown error occurred";
        console.error("Error fetching picture data:", error);
        
        setIsError(true);
        setErrorMessage(errorMsg);
        setIsLoading(false);
        
        handleError(error, {
          fallbackMessage: "Failed to load picture data",
          operation: "fetchPictureData",
          additionalData: { pictureId }
        });
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
