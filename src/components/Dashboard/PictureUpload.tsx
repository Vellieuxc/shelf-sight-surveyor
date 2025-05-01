import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase, verifyPicturesBucketExists } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Camera, Upload } from "lucide-react";
import CameraDialog from "./CameraDialog";
import UploadDialog from "./UploadDialog";
import { createImagePreview } from "@/utils/imageUtils";

interface PictureUploadProps {
  storeId: string;
  onPictureUploaded: () => void;
}

const PictureUpload: React.FC<PictureUploadProps> = ({ storeId, onPictureUploaded }) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      try {
        const previewUrl = await createImagePreview(file);
        setImagePreview(previewUrl);
      } catch (error) {
        console.error("Failed to create preview:", error);
        toast.error("Failed to create image preview");
      }
    }
  };
  
  const handleCaptureFromCamera = (file: File, previewUrl: string) => {
    setSelectedFile(file);
    setImagePreview(previewUrl);
    setIsCameraDialogOpen(false);
    setIsUploadDialogOpen(true);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) {
      toast.error("Missing file or user information");
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Verify the pictures bucket exists
      await verifyPicturesBucketExists();
      
      // Upload the file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `stores/${storeId}/${fileName}`;
      
      // Create a storage object
      const { error: uploadError } = await supabase.storage
        .from('pictures')
        .upload(filePath, selectedFile);
      
      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        throw new Error(`Failed to upload image: ${uploadError.message}`);
      }
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('pictures')
        .getPublicUrl(filePath);
      
      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Failed to get public URL for uploaded image");
      }
      
      // Save picture metadata to database
      const { error: dbError } = await supabase
        .from("pictures")
        .insert({
          store_id: storeId,
          uploaded_by: user.id,
          image_url: publicUrlData.publicUrl,
          analysis_data: []
        });
      
      if (dbError) throw dbError;
      
      toast.success("Picture uploaded successfully!");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setImagePreview(null);
      onPictureUploaded();
      
    } catch (error: any) {
      console.error("Error uploading picture:", error.message);
      toast.error(`Failed to upload picture: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Picture
        </Button>
        <Button onClick={() => setIsCameraDialogOpen(true)} variant="secondary">
          <Camera className="mr-2 h-4 w-4" />
          Take a Picture
        </Button>
      </div>

      {/* Upload Dialog */}
      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        selectedFile={selectedFile}
        imagePreview={imagePreview}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />

      {/* Camera Dialog */}
      <CameraDialog
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
        onCapture={handleCaptureFromCamera}
      />
    </>
  );
};

export default PictureUpload;
