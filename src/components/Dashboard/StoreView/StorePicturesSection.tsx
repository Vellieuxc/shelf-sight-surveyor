
import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";
import { Picture } from "@/types";
import PictureGrid from "../PictureGrid";
import EmptyStoresState from "../EmptyStoresState";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";

interface StorePicturesSectionProps {
  pictures: Picture[];
  onUploadClick: () => void;
  onCaptureClick: () => void;
  isProjectClosed?: boolean;
  isConsultant?: boolean;
  isBoss?: boolean;
}

const StorePicturesSection: React.FC<StorePicturesSectionProps> = ({
  pictures,
  onUploadClick,
  onCaptureClick,
  isProjectClosed = false,
  isConsultant = false,
  isBoss = false
}) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  
  // Determine permissions from props or use auth context
  const userIsConsultant = isConsultant || profile?.role === "consultant";
  const userIsBoss = isBoss || profile?.role === "boss";
  const canModify = !isProjectClosed || userIsConsultant || userIsBoss;

  const handleDeletePicture = (id: string) => {
    // Placeholder for delete functionality
    toast({
      title: "Delete picture",
      description: "This feature is coming soon.",
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Store Pictures</h2>
        {canModify && (
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
        )}
      </div>

      {pictures.length === 0 ? (
        <EmptyStoresState
          onAddStore={canModify ? onUploadClick : undefined}
        />
      ) : (
        <PictureGrid 
          pictures={pictures} 
          onDeletePicture={handleDeletePicture}
          allowEditing={canModify}
        />
      )}
    </div>
  );
};

export default StorePicturesSection;
