
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Plus } from "lucide-react";
import { Picture } from "@/types";
import PictureGrid from "./PictureGrid";
import PictureGridSkeleton from "./PictureGridSkeleton";
import EmptyPicturesState from "./EmptyPicturesState";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { picturesService } from "@/services/api/pictures";
import { useErrorHandling } from "@/hooks/use-error-handling";

interface StorePicturesSectionProps {
  pictures: Picture[];
  isLoading?: boolean;
  onUploadClick: () => void;
  onCaptureClick: () => void;
  onPictureDeleted?: () => void; // New callback for picture deletion
  isProjectClosed?: boolean;
  isConsultant?: boolean;
  isBoss?: boolean;
}

const StorePicturesSection: React.FC<StorePicturesSectionProps> = ({
  pictures,
  isLoading = false,
  onUploadClick,
  onCaptureClick,
  onPictureDeleted,
  isProjectClosed = false,
  isConsultant = false,
  isBoss = false
}) => {
  const { toast } = useToast();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [deletingPictureId, setDeletingPictureId] = useState<string | null>(null);
  const { handleError } = useErrorHandling({
    source: 'ui',
    componentName: 'StorePicturesSection'
  });
  
  // Determine permissions from props or use auth context
  const userIsConsultant = isConsultant || profile?.role === "consultant";
  const userIsBoss = isBoss || profile?.role === "boss";
  const canModify = !isProjectClosed || userIsConsultant || userIsBoss;

  const handleDeletePicture = async (id: string) => {
    if (deletingPictureId) return; // Prevent multiple simultaneous deletions
    
    setDeletingPictureId(id);
    
    try {
      // No need to call API directly here, the DeletePictureDialog 
      // component handles the API call and shows confirmation
      
      // Notify parent component to refresh the pictures list
      if (onPictureDeleted) {
        onPictureDeleted();
      }
      
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to delete picture",
        operation: "deletePicture",
        additionalData: { pictureId: id }
      });
    } finally {
      setDeletingPictureId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">Store Pictures</h2>
        {canModify && (
          <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
            <Button
              onClick={onUploadClick}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-1 flex-1 sm:flex-auto justify-center"
            >
              <Plus size={16} />
              <span className={isMobile ? "text-sm" : ""}>
                {isMobile ? "Upload" : "Upload a picture"}
              </span>
            </Button>
            <Button
              onClick={onCaptureClick}
              variant="outline"
              size={isMobile ? "sm" : "default"}
              className="flex items-center gap-1 flex-1 sm:flex-auto justify-center"
            >
              <Camera size={16} />
              <span className={isMobile ? "text-sm" : ""}>
                {isMobile ? "Capture" : "Take a picture"}
              </span>
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <PictureGridSkeleton count={9} />
      ) : pictures.length === 0 ? (
        <EmptyPicturesState
          onAddPicture={canModify ? onUploadClick : undefined}
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
