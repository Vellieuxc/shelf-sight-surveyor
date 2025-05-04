
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { Picture } from "@/types";
import { transformAnalysisData } from "@/utils/dataTransformers";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { StoreContent, StoreHeader, DialogsContainer, useImageHandlers } from "./components";

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

  if (storeLoading) {
    return <div>Loading store details...</div>;
  }

  if (storeError) {
    handleError(storeError, {
      fallbackMessage: "Failed to load store details",
      operation: "fetchStore",
      additionalData: { storeId }
    });
    return <div>Error loading store</div>;
  }

  if (!store) {
    return <div>Store not found</div>;
  }

  // Determine if the project is closed
  const isProjectClosed = store.projects?.is_closed ?? false;

  return (
    <div className="space-y-8">
      <StoreHeader 
        store={store} 
        onSynthesizeStore={handleSynthesizeStore}
      />
      
      <StoreContent 
        store={store}
        pictures={pictures}
        storeId={storeId}
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
