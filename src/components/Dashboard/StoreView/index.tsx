
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { type ToastAPI } from "@/hooks/use-toast";
import { UserProfile } from "@/contexts/auth/types";
import { supabase } from "@/integrations/supabase/client";
import StoreHeader from "../StoreHeader/index";
import PictureGrid from "../PictureGrid";
import StoreActions from "./StoreActions";
import StoreDataFetcher from "./StoreDataFetcher";
import StoreAccessControl from "./StoreAccessControl";

interface StoreViewProps {
  storeId: string;
  navigate: NavigateFunction;
  toast: ToastAPI;
  user: User | null;
  profile: UserProfile | null;
}

const StoreView: React.FC<StoreViewProps> = ({ storeId, navigate, toast, user, profile }) => {
  const isConsultant = profile?.role === "consultant";
  const isCrew = profile?.role === "crew";
  const isBoss = profile?.role === "boss";

  const handleDeletePicture = async (pictureId: string) => {
    if (!confirm("Are you sure you want to delete this picture?")) return;
    
    try {
      const { error } = await supabase
        .from("pictures")
        .delete()
        .eq("id", pictureId);
      
      if (error) throw error;
      
      toast({
        title: "Picture Deleted",
        description: "Picture deleted successfully!"
      });
      
      // Refresh the data after deletion
      window.location.reload();
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
    toast({
      title: "Processing",
      description: "Synthesizing store data..."
    });
    // This would be implemented later - placeholder for now
  };

  return (
    <StoreDataFetcher storeId={storeId}>
      {({ store, pictures, isLoading, isProjectClosed }) => (
        <StoreAccessControl 
          store={store} 
          isLoading={isLoading} 
          profile={profile}
          navigate={navigate}
          toast={toast}
        >
          <div className="container px-4 py-8">
            {store && (
              <>
                <StoreHeader 
                  store={store} 
                  onSynthesizeStore={handleSynthesizeStore} 
                />
                
                <StoreActions
                  storeId={storeId}
                  isProjectClosed={isProjectClosed}
                  isConsultant={!!isConsultant}
                  isBoss={!!isBoss}
                  onPictureUploaded={() => window.location.reload()}
                  onSynthesizeStore={handleSynthesizeStore}
                />
                
                <PictureGrid 
                  pictures={pictures}
                  onDeletePicture={pictureId => {
                    if (isProjectClosed && !isConsultant && !isBoss) {
                      toast({
                        title: "Action Denied",
                        description: "Cannot delete pictures in a closed project",
                        variant: "destructive"
                      });
                      return;
                    }
                    handleDeletePicture(pictureId);
                  }}
                  allowEditing={!isProjectClosed || isConsultant || isBoss}
                />
              </>
            )}
          </div>
        </StoreAccessControl>
      )}
    </StoreDataFetcher>
  );
};

export default StoreView;
