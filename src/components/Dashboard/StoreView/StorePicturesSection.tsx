
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";
import { Picture } from "@/types";
import PictureGrid from "../PictureGrid";
import EmptyStoresState from "../EmptyStoresState";
import { useToast } from "@/hooks/use-toast";

interface StorePicturesSectionProps {
  pictures: Picture[];
  onUploadClick: () => void;
  onCaptureClick: () => void;
}

const StorePicturesSection: React.FC<StorePicturesSectionProps> = ({
  pictures,
  onUploadClick,
  onCaptureClick
}) => {
  const { toast } = useToast();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Store Pictures</h2>
        <div className="flex gap-2">
          <Button
            onClick={onUploadClick}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Plus size={16} />
            <span>Upload</span>
          </Button>
          <Button
            onClick={onCaptureClick}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <Camera size={16} />
            <span>Capture</span>
          </Button>
        </div>
      </div>

      {pictures.length === 0 ? (
        <EmptyStoresState
          onAddStore={onUploadClick}
        />
      ) : (
        <PictureGrid 
          pictures={pictures} 
          onDeletePicture={(id) => {
            // Placeholder for delete functionality
            toast({
              title: "Delete picture",
              description: "This feature is coming soon.",
            });
          }}
        />
      )}
    </div>
  );
};

export default StorePicturesSection;
