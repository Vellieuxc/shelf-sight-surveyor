
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
}

const PictureGrid: React.FC<PictureGridProps> = ({ 
  pictures, 
  onPictureDeleted, 
  allowDelete = true,
  creatorMap = {},
  onUploadClick = () => {},
  onCaptureClick = () => {}
}) => {
  if (pictures.length === 0) {
    return (
      <EmptyPicturesState
        canAddPhotos={false}
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
          picture={picture}
          onDelete={onPictureDeleted}
          allowDelete={allowDelete}
          createdByName={creatorMap[picture.uploaded_by]}
        />
      ))}
    </div>
  );
};

export default PictureGrid;
