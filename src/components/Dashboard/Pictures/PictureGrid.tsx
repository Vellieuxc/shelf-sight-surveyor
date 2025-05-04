
import React from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";

interface PictureGridProps {
  pictures: Picture[];
  onDeletePicture: (id: string) => void;
  allowEditing?: boolean;
  creatorMap?: Record<string, string>;
}

const PictureGrid: React.FC<PictureGridProps> = ({ 
  pictures, 
  onDeletePicture, 
  allowEditing = true,
  creatorMap = {} 
}) => {
  if (pictures.length === 0) {
    return (
      <div className="text-center p-4 sm:p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No pictures available</p>
        <p className="text-sm text-muted-foreground">Upload some pictures to analyze this store</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {pictures.map((picture) => (
        <PictureCard 
          key={picture.id} 
          picture={picture} 
          onDelete={() => onDeletePicture(picture.id)}
          allowDelete={allowEditing}
          createdByName={creatorMap[picture.uploaded_by]}
        />
      ))}
    </div>
  );
};

export default PictureGrid;
