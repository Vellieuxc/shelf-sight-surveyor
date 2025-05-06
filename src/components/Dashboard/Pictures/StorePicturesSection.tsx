
import React from "react";
import { Picture } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PictureGrid from "./PictureGrid";
import PictureGridSkeleton from "./PictureGridSkeleton";
import EmptyPicturesState from "./EmptyPicturesState";
import StoreActions from "../StoreView/StoreActions";

interface StorePicturesSectionProps {
  pictures: Picture[];
  isLoading: boolean;
  onUploadClick: () => void;
  onCaptureClick: () => void;
  onPictureDeleted: () => void;
  isProjectClosed?: boolean;
  isConsultant?: boolean;
  isBoss?: boolean;
  storeId: string;
}

const StorePicturesSection: React.FC<StorePicturesSectionProps> = ({
  pictures,
  isLoading,
  onUploadClick,
  onCaptureClick,
  onPictureDeleted,
  isProjectClosed = false,
  isConsultant = false,
  isBoss = false,
  storeId
}) => {
  // Determine if the user can add photos (not closed, or is consultant/boss)
  const canAddPhotos = !isProjectClosed || isConsultant || isBoss;
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold">Store Pictures</CardTitle>
        {canAddPhotos && (
          <StoreActions
            isProjectClosed={isProjectClosed}
            onUploadClick={onUploadClick}
            onCaptureClick={onCaptureClick}
          />
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <PictureGridSkeleton />
        ) : pictures.length > 0 ? (
          <PictureGrid 
            pictures={pictures} 
            onPictureDeleted={onPictureDeleted}
            allowDelete={canAddPhotos}
            onUploadClick={onUploadClick}
            onCaptureClick={onCaptureClick}
            storeId={storeId}
          />
        ) : (
          <EmptyPicturesState 
            onUploadClick={onUploadClick}
            onCaptureClick={onCaptureClick}
            canAddPhotos={canAddPhotos}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StorePicturesSection;
