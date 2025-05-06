
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { StoreContent, StoreHeader, DialogsContainer, useImageHandlers } from "./components";
import StoreLoading from "./StoreLoading";
import { useStoreData } from "./hooks/useStoreData";

interface StoreViewProps {
  storeId: string;
}

const StoreView: React.FC<StoreViewProps> = ({ storeId }) => {
  const { profile } = useAuth();
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
  
  // Use the custom hook to fetch store and pictures data
  const { 
    store, 
    pictures,
    isLoading,
    isProjectClosed,
    refetchPictures
  } = useStoreData({
    storeId,
    onError: (message) => handleError(new Error(message), {
      fallbackMessage: "Failed to load store data",
      operation: "fetchStore",
      additionalData: { storeId }
    })
  });
  
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

  if (isLoading) {
    return <StoreLoading />;
  }

  if (!store) {
    return <div className="p-4 sm:p-6 text-center">
      <h2 className="text-xl font-semibold">Store not found</h2>
      <p className="text-muted-foreground">The requested store could not be found.</p>
    </div>;
  }

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
        isLoading={isLoading}
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
