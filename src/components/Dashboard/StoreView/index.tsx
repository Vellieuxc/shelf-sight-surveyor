
import React, { useState, useRef } from "react";
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
import StoreSummary from "./StoreSummary";
import { useFileUpload } from "./hooks/useFileUpload";
import { useAuth } from "@/contexts/auth";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const { profile } = useAuth();
  const summaryRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // Check if user is consultant or boss to show the summary
  const canViewSummary = profile?.role === 'consultant' || profile?.role === 'boss';
  
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
      toast({
        title: "Permission denied",
        description: "Only consultants and bosses can synthesize store data.",
        variant: "destructive",
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
        <StoreHeader 
          store={store}
          onSynthesizeStore={handleSynthesizeStore}
        />
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <StoreActions 
          storeId={store.id}
          isProjectClosed={isProjectClosed}
          onAnalyze={() => {}}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        <div className="lg:col-span-2">
          <StorePicturesSection 
            pictures={pictures}
            onUploadClick={() => setIsUploadDialogOpen(true)}
            onCaptureClick={() => setIsCameraDialogOpen(true)}
            isProjectClosed={isProjectClosed}
            isConsultant={profile?.role === 'consultant'}
            isBoss={profile?.role === 'boss'}
          />
        </div>

        {canViewSummary && (
          <div className={`${isMobile ? 'mt-6' : ''}`} ref={summaryRef}>
            <StoreSummary store={store} />
          </div>
        )}
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
