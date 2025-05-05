
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";
import OfflineStatus from "@/components/OfflineStatus";

interface PictureUploadControlsProps {
  onUploadClick: () => void;
  onCaptureClick: () => void;
  className?: string;
}

const PictureUploadControls: React.FC<PictureUploadControlsProps> = ({
  onUploadClick,
  onCaptureClick,
  className = ""
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <Button onClick={onUploadClick}>
          <Upload className="mr-2 h-4 w-4" />
          Upload a picture
        </Button>
        <Button onClick={onCaptureClick} variant="secondary">
          <Camera className="mr-2 h-4 w-4" />
          Take a picture
        </Button>
      </div>
      
      {/* Offline Status */}
      <OfflineStatus />
    </div>
  );
};

export default PictureUploadControls;
