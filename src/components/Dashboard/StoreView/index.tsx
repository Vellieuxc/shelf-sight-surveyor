
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
          
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
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
          <div className="md:col-span-1" ref={summaryRef}>
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
