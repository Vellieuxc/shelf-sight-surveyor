
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store, Picture } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { transformAnalysisData } from "@/utils/dataTransformers";
import StoreHeader from "./StoreHeader";
import PictureGrid from "./PictureGrid";
import PictureUpload from "./PictureUpload";

interface StoreViewProps {
  storeId: string;
}

const StoreView: React.FC<StoreViewProps> = ({ storeId }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProjectClosed, setIsProjectClosed] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const isConsultant = profile?.role === "consultant";
  const isCrew = profile?.role === "crew";

  const fetchStoreAndPictures = async () => {
    try {
      // Fetch store info
      const { data: storeData, error: storeError } = await supabase
        .from("stores")
        .select("*, projects:project_id(is_closed)")
        .eq("id", storeId)
        .single();

      if (storeError) throw storeError;
      
      // For crew users, check if they created this store
      if (isCrew && profile && storeData.created_by !== profile.id) {
        toast.error("You don't have access to this store");
        navigate("/dashboard");
        return;
      }
      
      setStore(storeData);
      
      // Check if the project is closed
      if (storeData?.projects) {
        setIsProjectClosed(!!storeData.projects.is_closed);
      }

      // Fetch pictures for this store - for crew users, only fetch pictures they uploaded
      let picturesQuery = supabase
        .from("pictures")
        .select("*")
        .eq("store_id", storeId);
        
      // If user is crew, filter to only show their pictures
      if (isCrew && profile) {
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
      toast.error("Failed to load store data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreAndPictures();
  }, [storeId]);

  const handleDeletePicture = async (pictureId: string) => {
    if (isProjectClosed && !isConsultant) {
      toast.error("Cannot delete pictures in a closed project");
      return;
    }
    
    if (!confirm("Are you sure you want to delete this picture?")) return;
    
    try {
      const { error } = await supabase
        .from("pictures")
        .delete()
        .eq("id", pictureId);
      
      if (error) throw error;
      
      // Update pictures state
      setPictures(pictures.filter(pic => pic.id !== pictureId));
      
      toast.success("Picture deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting picture:", error.message);
      toast.error("Failed to delete picture");
    }
  };

  const handleSynthesizeStore = () => {
    if (isProjectClosed && !isConsultant) {
      toast.error("Cannot synthesize data in a closed project");
      return;
    }
    
    toast.info("Synthesizing store data...");
    // This would be implemented later - placeholder for now
  };

  if (isLoading) {
    return <div className="container px-4 py-8">Loading store data...</div>;
  }

  if (!store) {
    return (
      <div className="container px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Store not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <StoreHeader 
        store={store} 
        onSynthesizeStore={handleSynthesizeStore} 
      />

      <div className="flex justify-end mb-6">
        {(!isProjectClosed || isConsultant) && (
          <PictureUpload 
            storeId={storeId} 
            onPictureUploaded={fetchStoreAndPictures} 
          />
        )}
        {isProjectClosed && !isConsultant && (
          <div className="text-sm text-muted-foreground">
            This project is closed. Contact a consultant to make changes.
          </div>
        )}
      </div>

      <PictureGrid 
        pictures={pictures}
        onDeletePicture={handleDeletePicture}
        allowEditing={!isProjectClosed || isConsultant}
      />
    </div>
  );
};

export default StoreView;
