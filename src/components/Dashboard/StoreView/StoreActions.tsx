
import React from "react";
import { Button } from "@/components/ui/button";
import { PlusIcon, CameraIcon, ImageIcon } from "lucide-react";

interface StoreActionsProps {
  storeId?: string; // Added storeId as an optional prop
  isProjectClosed: boolean;
  onUploadClick?: () => void;
  onCaptureClick?: () => void;
  onAnalyze?: () => void; // Made this optional
}

const StoreActions: React.FC<StoreActionsProps> = ({
  storeId,
  isProjectClosed,
  onUploadClick,
  onCaptureClick,
  onAnalyze
}) => {
  if (isProjectClosed) {
    return null;
  }
  
  return (
    <div className="flex flex-wrap gap-2 mt-4 sm:mt-0">
      {onUploadClick && (
        <Button 
          onClick={onUploadClick}
          className="flex items-center gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          <span>Upload</span>
        </Button>
      )}
      
      {onCaptureClick && (
        <Button
          onClick={onCaptureClick}
          className="flex items-center gap-2"
          variant="secondary"
        >
          <CameraIcon className="h-4 w-4" />
          <span>Take Picture</span>
        </Button>
      )}
    </div>
  );
};

export default StoreActions;
