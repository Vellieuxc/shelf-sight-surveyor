
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedFile: File | null;
  imagePreview: string | null;
  isUploading: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUpload: (file?: File) => void | Promise<void>;
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onOpenChange,
  selectedFile,
  imagePreview,
  isUploading,
  onFileChange,
  onUpload
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Upload Picture</DialogTitle>
          <DialogDescription>
            Upload a new picture for this store.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {imagePreview && (
            <div className="relative w-full h-40 mb-2">
              <img 
                src={imagePreview}
                alt="Preview" 
                className="w-full h-full object-contain bg-muted rounded-md"
              />
            </div>
          )}
          <div className="grid gap-2">
            <input
              id="picture"
              name="picture"
              type="file"
              accept="image/*"
              onChange={onFileChange}
              className="cursor-pointer block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-primary file:text-primary-foreground
                hover:file:bg-primary/90"
            />
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => onUpload(selectedFile || undefined)}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadDialog;
