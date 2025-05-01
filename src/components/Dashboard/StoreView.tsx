import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Store, Picture } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { transformAnalysisData } from "@/utils/dataTransformers";
import StoreHeader from "./StoreHeader";
import PictureGrid from "./PictureGrid";
import PictureUpload from "./PictureUpload";
import { Microscope } from "lucide-react";

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
  const { toast } = useToast();
  const isConsultant = profile?.role === "consultant";
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
      
      // For crew users who are not bosses, check if they created this store
      if (isCrew && !isBoss && profile && storeData.created_by !== profile.id) {
        toast({
          title: "Access Denied",
          description: "You don't have access to this store",
          variant: "destructive"
        });
        navigate("/dashboard");
        return;
      }
      
      setStore(storeData);
      
      // Check if the project is closed
      if (storeData?.projects) {
        setIsProjectClosed(!!storeData.projects.is_closed);
      }

      // Fetch pictures for this store - for crew users who are not bosses, only fetch pictures they uploaded
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
      toast({
        title: "Loading Error",
        description: "Failed to load store data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreAndPictures();
  }, [storeId]);

  const handleDeletePicture = async (pictureId: string) => {
    if (isProjectClosed && !isConsultant && !isBoss) {
      toast({
        title: "Action Denied",
        description: "Cannot delete pictures in a closed project",
        variant: "destructive"
      });
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
      
      toast({
        title: "Picture Deleted",
        description: "Picture deleted successfully!"
      });
    } catch (error: any) {
      console.error("Error deleting picture:", error.message);
      toast({
        title: "Deletion Error",
        description: "Failed to delete picture",
        variant: "destructive"
      });
    }
  };

  const handleSynthesizeStore = () => {
    if (isProjectClosed && !isConsultant && !isBoss) {
      toast({
        title: "Access Denied",
        description: "Cannot synthesize data in a closed project",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Processing",
      description: "Synthesizing store data..."
    });
    // This would be implemented later - placeholder for now
  };

  const handleAnalyzeStore = () => {
    navigate(`/dashboard/stores/${storeId}/analyze`);
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

      <div className="flex justify-between mb-6">
        <Button variant="outline" onClick={handleAnalyzeStore}>
          <Microscope className="mr-2 h-4 w-4" />
          Analyze Store Data
        </Button>
        
        <div>
          {(!isProjectClosed || isConsultant || isBoss) && (
            <PictureUpload 
              storeId={storeId} 
              onPictureUploaded={fetchStoreAndPictures} 
            />
          )}
          {isProjectClosed && !isConsultant && !isBoss && (
            <div className="text-sm text-muted-foreground">
              This project is closed. Contact a consultant to make changes.
            </div>
          )}
        </div>
      </div>

      <PictureGrid 
        pictures={pictures}
        onDeletePicture={handleDeletePicture}
        allowEditing={!isProjectClosed || isConsultant || isBoss}
      />
    </div>
  );
};

export default StoreView;
