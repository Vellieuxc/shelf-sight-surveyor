
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Picture, Store } from "@/types";
import { transformAnalysisData } from "@/utils/dataTransformers";
import { Json } from "@/integrations/supabase/types";

interface StoreWithProject extends Store {
  projects: {
    is_closed: boolean;
  };
}

interface RawPictureData {
  id: string;
  image_url: string;
  analysis_data: Json[] | null;
  store_id: string;
  created_at: string;
  uploaded_by: string;
  last_edited_at?: string | null;
  last_edited_by?: string | null;
}

interface UseStoreDataProps {
  storeId: string;
  onError?: (message: string) => void;
  onLoading?: (loading: boolean) => void;
}

interface UseStoreDataReturn {
  store: StoreWithProject | null;
  pictures: Picture[];
  isLoading: boolean;
  isProjectClosed: boolean;
  refetchPictures: () => Promise<unknown>;
}

export const useStoreData = ({ storeId, onError, onLoading }: UseStoreDataProps): UseStoreDataReturn => {
  // Fetch store data
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('stores')
          .select('*, projects:project_id(is_closed)')
          .eq('id', storeId)
          .single();
          
        if (error) throw error;
        return data as StoreWithProject;
      } catch (error: any) {
        onError?.(error.message || "Failed to fetch store data");
        return null;
      }
    },
    enabled: !!storeId
  });
  
  // Fetch pictures
  const { 
    data: picturesData = [], 
    isLoading: picturesLoading,
    refetch: refetchPictures
  } = useQuery({
    queryKey: ['pictures', storeId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('pictures')
          .select('*')
          .eq('store_id', storeId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data as RawPictureData[];
      } catch (error: any) {
        onError?.(error.message || "Failed to fetch pictures");
        return [] as RawPictureData[];
      }
    },
    enabled: !!storeId
  });
  
  // Transform the pictures data to ensure proper typing
  const pictures: Picture[] = picturesData.map(pic => ({
    ...pic,
    analysis_data: transformAnalysisData(Array.isArray(pic.analysis_data) ? pic.analysis_data : [])
  }));
  
  // Determine loading state
  const isLoading = storeLoading || picturesLoading;
  
  // Call onLoading callback when loading state changes
  if (onLoading) {
    onLoading(isLoading);
  }
  
  // Determine if the project is closed
  const isProjectClosed = store?.projects?.is_closed ?? false;
  
  return { 
    store, 
    pictures, 
    isLoading, 
    isProjectClosed, 
    refetchPictures 
  };
};
