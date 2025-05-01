import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Camera, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Picture, Store } from "@/types";
import StoreHeader from "../StoreHeader";
import PictureGrid from "../PictureGrid";
import EmptyStoresState from "../EmptyStoresState";
import UploadDialog from "../UploadDialog";
import CameraDialog from "../CameraDialog";
import StoreAccessControl from "./StoreAccessControl";
import StoreActions from "./StoreActions";

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
  
  const handleFileUpload = async (file: File) => {
    if (!store) return;
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `stores/${store.id}/${fileName}`;
      
      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('pictures')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('pictures')
        .getPublicUrl(filePath);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // Add record to database
      const { error: dbError } = await supabase
        .from('pictures')
        .insert([
          {
            store_id: store.id,
            image_url: imageUrl,
            uploaded_by: userId,
          },
        ]);
      
      if (dbError) throw dbError;
      
      toast({
        title: "Upload successful",
        description: "The image has been uploaded successfully.",
      });
      
      // Force a page reload to refresh the pictures list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  // FIX: Corrected the function signature to match what CameraDialog expects
  const handleCapture = async (file: File, preview: string) => {
    await handleFileUpload(file);
  };

  // Handle the case when store is null
  if (!store && !isLoading) {
    return (
      <div className="container py-6">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold mb-2">Store not found</h2>
          <p className="text-muted-foreground mb-4">
            The store you're looking for doesn't exist or you don't have access to it.
          </p>
          <Link to="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !store) {
    return (
      <div className="container py-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center justify-between">
        <Link to={`/dashboard/projects/${store.project_id}/stores`}>
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Stores</span>
          </Button>
        </Link>
        
        <StoreAccessControl 
          storeId={store.id} 
          currentUserId={userId} 
        />
      </div>

      <Card className="p-6">
        <StoreHeader 
          store={store}
          onSynthesizeStore={() => {
            toast({
              title: "Synthesizing store data",
              description: "This feature is coming soon.",
            });
          }}
        />
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Store Pictures</h2>
          <div className="flex gap-2">
            <Button
              onClick={() => setIsUploadDialogOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Plus size={16} />
              <span>Upload</span>
            </Button>
            <Button
              onClick={() => setIsCameraDialogOpen(true)}
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <Camera size={16} />
              <span>Capture</span>
            </Button>
          </div>
        </div>

        {pictures.length === 0 ? (
          // FIX: Updated to use onAddStore prop that EmptyStoresState expects
          <EmptyStoresState
            onAddStore={() => setIsUploadDialogOpen(true)}
          />
        ) : (
          <PictureGrid 
            pictures={pictures} 
            onDeletePicture={(id) => {
              // Placeholder for delete functionality
              toast({
                title: "Delete picture",
                description: "This feature is coming soon.",
              });
            }}
          />
        )}
      </div>

      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
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
