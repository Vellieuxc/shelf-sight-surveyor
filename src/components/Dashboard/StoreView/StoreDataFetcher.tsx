
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store, Picture } from "@/types";
import { transformAnalysisData } from "@/utils/dataTransformers";
import { useAuth } from "@/contexts/auth";

interface StoreDataFetcherProps {
  storeId: string;
  userId?: string; // Make userId optional
  onError?: (message: string) => void;
  onLoading?: (loading: boolean) => void;
  children: (data: {
    store: Store | null;
    pictures: Picture[];
    isLoading: boolean;
    isProjectClosed: boolean;
  }) => React.ReactNode;
}

const StoreDataFetcher: React.FC<StoreDataFetcherProps> = ({ 
  storeId, 
  userId,
  children,
  onError,
  onLoading
}) => {
  const [store, setStore] = useState<Store | null>(null);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectClosed, setIsProjectClosed] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();
  const isCrew = profile?.role === "crew";
  const isBoss = profile?.role === "boss";

  const fetchStoreAndPictures = async () => {
    try {
      // Fetch store info
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*, projects:project_id(is_closed)")
        .eq("id", storeId)
        .single();

      if (storeError) throw storeError;
      
      setStore(storeData);
      
      // Check if the project is closed
      if (storeData?.projects) {
        setIsProjectClosed(!!storeData.projects.is_closed);
      }

      // Fetch pictures for this store
      let picturesQuery = supabase
        .from("pictures")
        .select("*")
        .eq("store_id", storeId);
        
      // If user is crew and not boss, filter to only show their pictures
      if (isCrew && !isBoss && profile) {
        picturesQuery = picturesQuery.eq("uploaded_by", profile.id);
      }
      
      const { data: picturesData, error: picturesError } = await picturesQuery
        .order("created_at", { ascending: false });

      if (picturesError) throw picturesError;
      
      // Transform the data to match our Picture type with proper AnalysisData typing
      const transformedPictures: Picture[] = (picturesData || []).map(pic => {
        return {
          id: pic.id,
          store_id: pic.store_id,
          uploaded_by: pic.uploaded_by,
          image_url: pic.image_url,
          created_at: pic.created_at,
          analysis_data: transformAnalysisData(pic.analysis_data as any[])
        };
      });
      
      setPictures(transformedPictures);
    } catch (error: any) {
      console.error("Error fetching data:", error.message);
      if (onError) {
        onError("Failed to load store data");
      } else {
        toast({
          title: "Loading Error",
          description: "Failed to load store data",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
      if (onLoading) {
        onLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchStoreAndPictures();
  }, [storeId]);

  return <>{children({ store, pictures, isLoading, isProjectClosed })}</>;
};

export default StoreDataFetcher;
