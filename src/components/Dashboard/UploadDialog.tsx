
import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// This file is deprecated and has been moved to src/components/Dashboard/Dialogs/UploadDialog.tsx
// Redirecting imports to the new location for backward compatibility
import { default as CurrentUploadDialog } from "./Dialogs/UploadDialog";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFile: File | null;
  imagePreview: string | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (file?: File) => void | Promise<void>;
}

const UploadDialog: React.FC<UploadDialogProps> = (props) => {
  return <CurrentUploadDialog {...props} />;
};

export default UploadDialog;
