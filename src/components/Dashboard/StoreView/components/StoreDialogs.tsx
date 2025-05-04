
import React from "react";
import { UploadDialog, CameraDialog } from "../../Dialogs";

interface StoreDialogsProps {
  isUploadDialogOpen: boolean;
  setIsUploadDialogOpen: (open: boolean) => void;
  isCameraDialogOpen: boolean;
  setIsCameraDialogOpen: (open: boolean) => void;
  selectedFile: File | null;
  imagePreview: string | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: () => void;
  onCaptureImage: (file: File, previewUrl: string) => void;
}

const StoreDialogs: React.FC<StoreDialogsProps> = ({
  isUploadDialogOpen,
  setIsUploadDialogOpen,
  isCameraDialogOpen,
  setIsCameraDialogOpen,
  selectedFile,
  imagePreview,
  isUploading,
  onFileChange,
  onUpload,
  onCaptureImage,
}) => {
  return (
    <>
      <UploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        selectedFile={selectedFile}
        imagePreview={imagePreview}
        isUploading={isUploading}
        onFileChange={onFileChange}
        onUpload={onUpload}
      />

      <CameraDialog
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
        onCapture={onCaptureImage}
      />
    </>
  );
};

export default StoreDialogs;
