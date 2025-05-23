
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { Picture } from "@/types";
import { transformAnalysisData } from "@/utils/dataTransformers";
import { useErrorHandling } from "@/hooks";
import { StoreContent, StoreHeader, DialogsContainer, useImageHandlers } from "./components";
import StoreLoading from "./StoreLoading";
import { useResponsive } from "@/hooks/use-mobile";

interface StoreViewProps {
  storeId: string;
}

const StoreView: React.FC<StoreViewProps> = ({ storeId }) => {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const { pendingUploads, isOnline, syncOfflineImages } = useOfflineMode();
  const { handleError } = useErrorHandling({
    source: 'ui',
    componentName: 'StoreView'
  });
  const { isMobile } = useResponsive();

  // Check user permissions
  const isConsultant = profile?.role === "consultant";
  const isBoss = profile?.role === "boss";
  
  // Fetch store data
  const { 
    data: store, 
    isLoading: storeLoading,
    error: storeError
  } = useQuery({
    queryKey: ['store', storeId],
    queryFn: async () => {
      if (!storeId) throw new Error("Store ID is required");
      
      const { data, error } = await supabase
        .from('stores')
        .select('*, projects:project_id(is_closed)')
        .eq('id', storeId)
        .single();
        
      if (error) throw error;
      return data;
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
      if (!storeId) return [];
      
      const { data, error } = await supabase
        .from('pictures')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data;
    },
    enabled: !!storeId
  });
  
  // Transform the pictures data to ensure proper typing
  const pictures: Picture[] = picturesData.map(pic => ({
    ...pic,
    analysis_data: transformAnalysisData(Array.isArray(pic.analysis_data) ? pic.analysis_data : [])
  }));
  
  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingUploads > 0) {
      syncOfflineImages().then(() => {
        refetchPictures();
      });
    }
  }, [isOnline, pendingUploads, refetchPictures]);
  
  // Use the image handlers custom hook
  const {
    selectedFile,
    imagePreview,
    isUploading,
    handleFileChange,
    handleCaptureFromCamera,
    handleUpload
  } = useImageHandlers(storeId, refetchPictures);
  
  // Handle various UI interactions
  const handleSynthesizeStore = () => {
    console.log("Synthesize store");
  };

  const handleUploadClick = () => {
    setIsUploadDialogOpen(true);
  };

  const handleCaptureClick = () => {
    setIsCameraDialogOpen(true);
  };

  const isLoading = storeLoading || picturesLoading;

  if (storeLoading) {
    return <StoreLoading />;
  }

  if (storeError) {
    handleError(storeError, {
      fallbackMessage: "Failed to load store details",
      operation: "fetchStore",
      additionalData: { storeId }
    });
    return <div className="p-4 sm:p-6 text-center text-destructive">
      <h2 className="text-xl font-semibold">Error loading store</h2>
      <p className="text-muted-foreground">Please try refreshing the page.</p>
    </div>;
  }

  if (!store) {
    return <div className="p-4 sm:p-6 text-center">
      <h2 className="text-xl font-semibold">Store not found</h2>
      <p className="text-muted-foreground">The requested store could not be found.</p>
    </div>;
  }

  // Determine if the project is closed
  const isProjectClosed = store.projects?.is_closed ?? false;

  return (
    <div className="space-y-6">
      <StoreHeader 
        store={store} 
        onSynthesizeStore={handleSynthesizeStore}
      />
      
      <StoreContent 
        store={store}
        pictures={pictures}
        storeId={storeId}
        isLoading={picturesLoading}
        isProjectClosed={isProjectClosed}
        isConsultant={isConsultant}
        isBoss={isBoss}
        onUploadClick={handleUploadClick}
        onCaptureClick={handleCaptureClick}
        refetchPictures={refetchPictures}
      />
      
      <DialogsContainer
        isUploadDialogOpen={isUploadDialogOpen}
        setIsUploadDialogOpen={setIsUploadDialogOpen}
        isCameraDialogOpen={isCameraDialogOpen}
        setIsCameraDialogOpen={setIsCameraDialogOpen}
        selectedFile={selectedFile}
        imagePreview={imagePreview}
        isUploading={isUploading}
        handleFileChange={handleFileChange}
        handleUpload={handleUpload}
        handleCaptureFromCamera={handleCaptureFromCamera}
      />
    </div>
  );
};

export default StoreView;
