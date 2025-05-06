
import React from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";
import EmptyPicturesState from "./EmptyPicturesState";

interface PictureGridProps {
  pictures: Picture[];
  onPictureDeleted: () => void;
  allowDelete?: boolean;
  creatorMap?: Record<string, string>;
  onUploadClick?: () => void;
  onCaptureClick?: () => void;
  storeId?: string;
}

const PictureGrid: React.FC<PictureGridProps> = ({ 
  pictures, 
  onPictureDeleted, 
  allowDelete = true,
  creatorMap = {},
  onUploadClick = () => {},
  onCaptureClick = () => {},
  storeId = ""
}) => {
  if (pictures.length === 0) {
    return (
      <EmptyPicturesState
        canAddPhotos={allowDelete}
        onUploadClick={onUploadClick}
        onCaptureClick={onCaptureClick}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {pictures.map((picture) => (
        <PictureCard 
          key={picture.id}
          id={picture.id}
          image_url={picture.image_url}
          analysis_data={picture.analysis_data}
          created_at={picture.created_at}
          storeId={storeId}
          allowDelete={allowDelete}
          onDelete={onPictureDeleted}
          onClick={() => {
            // Handle click event, could navigate to a detail view
            console.log(`Picture clicked: ${picture.id}`);
          }}
        />
      ))}
    </div>
  );
};

export default PictureGrid;
