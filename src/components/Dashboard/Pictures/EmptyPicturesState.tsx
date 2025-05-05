
import React from "react";
import { Upload, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyPicturesStateProps {
  onUploadClick: () => void;
  onCaptureClick: () => void;
  canAddPhotos?: boolean;
}

const EmptyPicturesState: React.FC<EmptyPicturesStateProps> = ({
  onUploadClick,
  onCaptureClick,
  canAddPhotos = true
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-muted/30 rounded-lg">
      <div className="mb-4">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium">No pictures yet</h3>
      <p className="mt-1 text-sm text-muted-foreground max-w-md">
        Add pictures of this store to analyze shelf data and insights.
      </p>
      
      {canAddPhotos && (
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={onUploadClick}>
            <Upload className="mr-2 h-4 w-4" />
            Upload a picture
          </Button>
          <Button onClick={onCaptureClick} variant="secondary">
            <Camera className="mr-2 h-4 w-4" />
            Take a picture
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyPicturesState;
