
import React from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon, CameraIcon } from "lucide-react";

interface EmptyPicturesStateProps {
  onUploadClick: () => void;
  onCaptureClick: () => void;
  canAddPhotos: boolean;
}

const EmptyPicturesState: React.FC<EmptyPicturesStateProps> = ({
  onUploadClick,
  onCaptureClick,
  canAddPhotos
}) => {
  if (!canAddPhotos) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">No pictures available</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4">
      <p className="text-muted-foreground">No pictures have been uploaded yet</p>
      
      <div className="flex flex-wrap gap-2 justify-center">
        <Button onClick={onUploadClick} className="flex items-center gap-2">
          <ImageIcon className="h-4 w-4" />
          Upload a picture
        </Button>
        
        <Button onClick={onCaptureClick} variant="secondary" className="flex items-center gap-2">
          <CameraIcon className="h-4 w-4" />
          Take a picture
        </Button>
      </div>
    </div>
  );
};

export default EmptyPicturesState;
