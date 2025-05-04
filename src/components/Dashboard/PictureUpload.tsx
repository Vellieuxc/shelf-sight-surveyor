
import React, { useState } from "react";
import { UploadDialog, CameraDialog } from "./Dialogs";
import { useImageUploader } from "@/hooks/use-image-uploader";
import PictureUploadControls from "./Pictures/PictureUploadControls";

interface PictureUploadProps {
  storeId: string;
  onPictureUploaded: () => void;
}

const PictureUpload: React.FC<PictureUploadProps> = ({ storeId, onPictureUploaded }) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  
  const {
    selectedFile,
    imagePreview,
    isUploading,
    handleFileChange,
    handleCaptureFromCamera,
    handleUpload
  } = useImageUploader({ storeId, onPictureUploaded });

  const openUploadDialog = () => {
    setIsUploadDialogOpen(true);
  };

  const openCameraDialog = () => {
    setIsCameraDialogOpen(true);
  };
  
  const handleCaptureImage = (file: File, previewUrl: string) => {
    handleCaptureFromCamera(file, previewUrl);
    setIsCameraDialogOpen(false);
    setIsUploadDialogOpen(true);
  };

  return (
    <>
      <PictureUploadControls 
        onUploadClick={openUploadDialog}
        onCaptureClick={openCameraDialog}
      />

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
        onCapture={handleCaptureImage}
      />
    </>
  );
};

export default PictureUpload;
