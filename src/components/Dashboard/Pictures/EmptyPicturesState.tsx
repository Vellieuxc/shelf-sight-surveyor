
import React from "react";
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
    <div className="flex flex-col items-center justify-center py-10">
      <p className="text-muted-foreground mb-3">No pictures have been uploaded yet</p>
    </div>
  );
};

export default EmptyPicturesState;
