
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
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: (file?: File) => void;
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
        onCapture={handleCaptureFromCamera}
      />
    </>
  );
};

export default DialogsContainer;
