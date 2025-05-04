
import React, { useRef } from "react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Store, Picture } from "@/types";
import StoreNotFound from "./StoreNotFound";
import StoreLoading from "./StoreLoading";
import StoreNavigation from "./StoreNavigation";
import { useFileUpload } from "./hooks/useFileUpload";
import { useAuth } from "@/contexts/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import StoreControls from "./components/StoreControls";
import StoreContent from "./components/StoreContent";
import StoreDialogs from "./components/StoreDialogs";
import { useErrorHandling } from "@/hooks/use-error-handling";

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
  const [isUploadDialogOpen, setIsUploadDialogOpen] = React.useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = React.useState(false);
  const { toast } = useToast();
  const { profile } = useAuth();
  const summaryRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const { handleError } = useErrorHandling({ 
    source: 'ui',
    componentName: 'StoreView'
  });
  
  // Check if user is consultant or boss to show the summary
  const canViewSummary = profile?.role === 'consultant' || profile?.role === 'boss';
  const isConsultant = profile?.role === 'consultant';
  const isBoss = profile?.role === 'boss';
  
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

  // Handle synthesizing store data
  const handleSynthesizeStore = () => {
    try {
      if (canViewSummary && store) {
        toast({
          title: "Synthesizing store data",
          description: "Processing store information and analysis data...",
        });
        
        // Scroll to the summary section
        if (summaryRef.current) {
          summaryRef.current.scrollIntoView({ behavior: "smooth" });
          
          // Find the generate summary button and click it programmatically
          const generateButton = summaryRef.current.querySelector('button');
          if (generateButton) {
            setTimeout(() => {
              generateButton.click();
            }, 500);
          }
        }
      }
      else {
        throw new Error("Only consultants and bosses can synthesize store data.");
      }
    } catch (error) {
      handleError(error, { 
        fallbackMessage: "Failed to synthesize store data",
        operation: "synthesizeStore"
      });
    }
  };
  
  // Handle upload button click
  const handleUploadClick = () => {
    setIsUploadDialogOpen(true);
  };
  
  // Handle file upload with dialog close
  const handleProcessUpload = () => {
    handleFileUpload(() => setIsUploadDialogOpen(false));
  };
  
  // Handle camera capture
  const handleCameraCapture = (file: File, previewUrl: string) => {
    try {
      handleCapture(file, previewUrl);
      setIsCameraDialogOpen(false);
      setIsUploadDialogOpen(true);
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to process camera capture",
        operation: "cameraCapture"
      });
    }
  };

  return (
    <div className="container py-6 space-y-6 lg:space-y-8 px-4 sm:px-6">
      <StoreNavigation 
        projectId={store.project_id} 
        storeId={store.id} 
        creatorId={store.created_by} 
        currentUserId={userId} 
      />

      <Card className="p-4 sm:p-6">
        <StoreControls 
          store={store}
          isProjectClosed={isProjectClosed}
          onSynthesizeStore={handleSynthesizeStore}
        />
      </Card>

      <StoreContent 
        store={store}
        pictures={pictures}
        isProjectClosed={isProjectClosed}
        canViewSummary={canViewSummary}
        isConsultant={!!isConsultant}
        isBoss={!!isBoss}
        onUploadClick={handleUploadClick}
        onCaptureClick={() => setIsCameraDialogOpen(true)}
      />

      <StoreDialogs 
        isUploadDialogOpen={isUploadDialogOpen}
        setIsUploadDialogOpen={setIsUploadDialogOpen}
        isCameraDialogOpen={isCameraDialogOpen}
        setIsCameraDialogOpen={setIsCameraDialogOpen}
        selectedFile={selectedFile}
        imagePreview={imagePreview}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onUpload={handleProcessUpload}
        onCaptureImage={handleCameraCapture}
      />
    </div>
  );
};

export default StoreView;
