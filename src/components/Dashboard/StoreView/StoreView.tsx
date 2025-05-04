
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import StoreHeader from "@/components/Dashboard/StoreHeader";
import PictureUpload from "@/components/Dashboard/PictureUpload";
import { StorePicturesSection } from "@/components/Dashboard/Pictures";
import { supabase } from "@/integrations/supabase/client";
import { CameraDialog, UploadDialog } from "@/components/Dashboard/Dialogs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useOfflineMode } from "@/hooks/useOfflineMode";
import OfflineStatus from "@/components/OfflineStatus";
import OfflineImagesList from "@/components/Dashboard/OfflineImagesList";
import { AnalysisData } from "@/types";

const StoreView: React.FC = () => {
  const { storeId } = useParams<{ storeId: string }>();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const { pendingUploads, isOnline, syncOfflineImages } = useOfflineMode();

  // Check user permissions
  const isConsultant = profile?.role === "consultant";
  const isBoss = profile?.role === "boss";
  
  // Fetch store data
  const { data: store, isLoading: storeLoading } = useQuery({
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
    data: pictures = [], 
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
      
      // Transform the analysis_data to ensure it's an array of AnalysisData objects
      return data.map(picture => ({
        ...picture,
        analysis_data: Array.isArray(picture.analysis_data) ? picture.analysis_data : []
      }));
    },
    enabled: !!storeId
  });
  
  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingUploads > 0) {
      syncOfflineImages().then(() => {
        refetchPictures();
      });
    }
  }, [isOnline, pendingUploads]);
  
  // Handle file upload from user's device
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // setSelectedFile(file);
      
      try {
        // const previewUrl = await createImagePreview(file);
        // setImagePreview(previewUrl);
      } catch (error) {
        console.error("Failed to create preview:", error);
        toast({
          title: "Preview Error",
          description: "Failed to create image preview", 
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle image captured from camera
  const handleCaptureFromCamera = (file: File, previewUrl: string) => {
    // setSelectedFile(file);
    // setImagePreview(previewUrl);
    setIsCameraDialogOpen(false);
    setIsUploadDialogOpen(true);
  };
  
  // Handle image upload to Supabase
  const handleUpload = async () => {
    // if (!selectedFile || !user) {
    //   toast({
    //     title: "Upload Error",
    //     description: "Missing file or user information",
    //     variant: "destructive"
    //   });
    //   return;
    // }
    
    // setIsUploading(true);
    
    try {
      // if (!isOnline) {
      //   // Save the image locally if offline
      //   await captureOfflineImage(
      //     storeId, 
      //     selectedFile,
      //     selectedFile.name
      //   );
        
      //   toast({
      //     title: "Saved Offline", 
      //     description: "Picture saved locally and will be uploaded when you're online."
      //   });
      //   setIsUploadDialogOpen(false);
      //   setSelectedFile(null);
      //   setImagePreview(null);
      //   refetchPictures();
      //   return;
      // }
      
      // If online, proceed with normal upload flow
      // await verifyPicturesBucketExists();
      
      // Upload the file to Supabase Storage
      // const fileExt = selectedFile.name.split('.').pop();
      // const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      // const filePath = `stores/${storeId}/${fileName}`;
      
      // Create a storage object
      // const { error: uploadError } = await supabase.storage
      //   .from('pictures')
      //   .upload(filePath, selectedFile);
      
      // if (uploadError) {
      //   console.error("Storage upload error:", uploadError);
      //   throw new Error(`Failed to upload image: ${uploadError.message}`);
      // }
      
      // Get the public URL
      // const { data: publicUrlData } = supabase.storage
      //   .from('pictures')
      //   .getPublicUrl(filePath);
      
      // if (!publicUrlData || !publicUrlData.publicUrl) {
      //   throw new Error("Failed to get public URL for uploaded image");
      // }
      
      // Save picture metadata to database
      // const { error: dbError } = await supabase
      //   .from("pictures")
      //   .insert({
      //     store_id: storeId,
      //     uploaded_by: user.id,
      //     image_url: publicUrlData.publicUrl,
      //     analysis_data: []
      //   });
      
      // if (dbError) throw dbError;
      
      // toast({
      //   title: "Upload Successful", 
      //   description: "Picture uploaded successfully!"
      // });
      // setIsUploadDialogOpen(false);
      // setSelectedFile(null);
      // setImagePreview(null);
      // refetchPictures();
      
    } catch (error: any) {
      console.error("Error uploading picture:", error.message);
      toast({
        title: "Upload Failed",
        description: `Failed to upload picture: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      // setIsUploading(false);
    }
  };

  if (!storeId) {
    return <div>Store ID is required</div>;
  }

  if (storeLoading) {
    return <div>Loading store details...</div>;
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
        onSynthesizeStore={() => console.log("Synthesize store")}
      />
      
      <OfflineStatus className="mt-4" />
      
      {/* Offline images list */}
      <OfflineImagesList 
        storeId={storeId} 
        onSyncComplete={refetchPictures}
      />
      
      {/* Store pictures section */}
      <StorePicturesSection
        pictures={pictures}
        onUploadClick={() => setIsUploadDialogOpen(true)}
        onCaptureClick={() => setIsCameraDialogOpen(true)}
        isProjectClosed={isProjectClosed}
        isConsultant={isConsultant}
        isBoss={isBoss}
      />
      
      {/* Upload and camera dialogs */}
      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        selectedFile={null}
        imagePreview={null}
        isUploading={false}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />
      
      <CameraDialog
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
        onCapture={handleCaptureFromCamera}
      />
    </div>
  );
};

export default StoreView;
