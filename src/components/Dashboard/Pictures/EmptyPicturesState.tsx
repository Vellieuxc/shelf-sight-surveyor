
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyPicturesStateProps {
  onUploadClick?: () => void;
  onCaptureClick?: () => void;
  canAddPhotos?: boolean;
}

const EmptyPicturesState: React.FC<EmptyPicturesStateProps> = ({ 
  onUploadClick, 
  onCaptureClick, 
  canAddPhotos = true 
}) => {
  return (
    <div className="text-center p-8 border border-dashed rounded-lg">
      <h3 className="text-lg font-medium mb-2">No Pictures Available</h3>
      <p className="text-muted-foreground mb-4">
        Add pictures to analyze this store's shelf layout and products.
      </p>
      {canAddPhotos && (
        <div className="flex flex-col sm:flex-row gap-2 justify-center">
          {onUploadClick && (
            <Button onClick={onUploadClick} className="flex items-center gap-2">
              <Plus size={16} />
              <span>Upload Picture</span>
            </Button>
          )}
          {onCaptureClick && (
            <Button onClick={onCaptureClick} variant="outline" className="flex items-center gap-2">
              <Plus size={16} />
              <span>Capture Picture</span>
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyPicturesState;
