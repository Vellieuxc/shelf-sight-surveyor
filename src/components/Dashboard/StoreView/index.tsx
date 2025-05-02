
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store, Picture } from "@/types";
import StoreHeader from "../StoreHeader";
import UploadDialog from "../UploadDialog";
import CameraDialog from "../CameraDialog";
import StoreNotFound from "./StoreNotFound";
import StoreLoading from "./StoreLoading";
import StoreNavigation from "./StoreNavigation";
import StorePicturesSection from "./StorePicturesSection";
import StoreActions from "./StoreActions";
import { useFileUpload } from "./hooks/useFileUpload";

interface StoreViewProps {
  store: Store | null;
  pictures: Picture[];
  isLoading: boolean;
  isProjectClosed: boolean;
  userId: string;
}

const StoreView: React.FC<StoreViewProps> = ({
  store,
  pictures,
  isLoading,
  isProjectClosed,
  userId
}) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Handle upload functionality
  const { 
    selectedFile, 
    imagePreview, 
    isUploading,
    handleFileChange,
    handleFileUpload,
    handleCapture
  } = useFileUpload(store, userId);

  // Handle not found and loading states
  if (!store && !isLoading) {
    return <StoreNotFound />;
  }

  if (isLoading || !store) {
    return <StoreLoading />;
  }

  const handleSynthesizeStore = () => {
    toast({
      title: "Synthesizing store data",
      description: "This feature is coming soon.",
    });
  };

  return (
    <div className="container py-6 space-y-8">
      <StoreNavigation 
        projectId={store.project_id} 
        storeId={store.id} 
        creatorId={store.created_by} 
        currentUserId={userId} 
      />

      <Card className="p-6">
        <StoreHeader 
          store={store}
          onSynthesizeStore={handleSynthesizeStore}
        />
      </Card>

      <div className="flex justify-between items-start mb-6">
        <StoreActions 
          storeId={store.id}
          isProjectClosed={isProjectClosed}
          onAnalyze={() => {}}
        />
        
        <div className="flex gap-2">
          <StorePicturesSection 
            pictures={pictures}
            onUploadClick={() => setIsUploadDialogOpen(true)}
            onCaptureClick={() => setIsCameraDialogOpen(true)}
            isProjectClosed={isProjectClosed}
            isConsultant={false}
            isBoss={false}
          />
        </div>
      </div>

      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        selectedFile={selectedFile}
        imagePreview={imagePreview}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onUpload={handleFileUpload}
      />

      <CameraDialog
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
        onCapture={handleCapture}
      />
    </div>
  );
};

export default StoreView;
