
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
import StoreActions from "./StoreActions";

interface StoreViewProps {
  store: Store;
  pictures: Picture[];
  isLoading: boolean;
  userId: string;
}

const StoreView: React.FC<StoreViewProps> = ({
  store,
  pictures,
  isLoading,
  userId
}) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const { toast } = useToast();
  
  const handleFileUpload = async (file: File) => {
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
            created_by: userId,
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
  
  const handleCapture = async (imageBlobUrl: string) => {
    try {
      // Convert blob URL to file
      const response = await fetch(imageBlobUrl);
      const blob = await response.blob();
      
      const file = new File([blob], `captured-${Date.now()}.jpeg`, { type: 'image/jpeg' });
      
      await handleFileUpload(file);
      
      toast({
        title: "Image captured",
        description: "The image has been captured successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Capture failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-6 space-y-8">
      <div className="flex items-center justify-between">
        <Link to={`/dashboard/projects/${store.project_id}/stores`}>
          <Button variant="outline" size="sm">
            <ArrowLeft size={16} className="mr-1" />
            <span>Back to Stores</span>
          </Button>
        </Link>
        
        <StoreActions 
          storeId={store.id} 
          creatorId={store.created_by} 
          currentUserId={userId} 
        />
      </div>

      <Card className="p-6">
        <StoreHeader store={store} />
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
          <EmptyStoresState
            title="No pictures yet"
            description="Upload pictures for this store to analyze them."
            showAction={false}
          />
        ) : (
          <PictureGrid pictures={pictures} storeId={store.id} />
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
