
import React from "react";
import { UploadDialog, CameraDialog } from "../../Dialogs";

interface DialogsContainerProps {
  isUploadDialogOpen: boolean;
  setIsUploadDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isCameraDialogOpen: boolean;
  setIsCameraDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  selectedFile: File | null;
  imagePreview: string | null;
  isUploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleUpload: () => Promise<void>;
  handleCaptureFromCamera: (file: File, preview: string) => void;
}

const DialogsContainer: React.FC<DialogsContainerProps> = ({
  isUploadDialogOpen,
  setIsUploadDialogOpen,
  isCameraDialogOpen,
  setIsCameraDialogOpen,
  selectedFile,
  imagePreview,
  isUploading,
  handleFileChange,
  handleUpload,
  handleCaptureFromCamera
}) => {
  // This function will handle camera capture and open the upload dialog automatically
  const handleCaptureImage = (file: File, previewUrl: string) => {
    handleCaptureFromCamera(file, previewUrl);
    // Close camera dialog
    setIsCameraDialogOpen(false);
    // Open upload dialog to confirm the upload
    setIsUploadDialogOpen(true);
  };

  return (
    <>
      <UploadDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        selectedFile={selectedFile}
        imagePreview={imagePreview}
        isUploading={isUploading}
        onFileChange={handleFileChange}
        onUpload={handleUpload}
      />
      
      <CameraDialog 
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
        onCapture={handleCaptureImage}
      />
    </>
  );
};

export default DialogsContainer;
