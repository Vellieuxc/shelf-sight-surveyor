
import React from "react";
import { UploadDialog, CameraDialog } from "../../Dialogs";

interface DialogsContainerProps {
  isUploadDialogOpen: boolean;
  setIsUploadDialogOpen: (isOpen: boolean) => void;
  isCameraDialogOpen: boolean;
  setIsCameraDialogOpen: (isOpen: boolean) => void;
  selectedFile: File | null;
  imagePreview: string | null;
  isUploading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleUpload: () => Promise<void>;
  handleCaptureFromCamera: (file: File, previewUrl: string) => void;
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
