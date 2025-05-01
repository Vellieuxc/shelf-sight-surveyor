
import React from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";

interface PictureGridProps {
  pictures: Picture[];
  onDeletePicture: (id: string) => void;
  allowEditing?: boolean;
}

const PictureGrid: React.FC<PictureGridProps> = ({ pictures, onDeletePicture, allowEditing = true }) => {
  if (pictures.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No pictures available</p>
        <p className="text-sm text-muted-foreground">Upload some pictures to analyze this store</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pictures.map((picture) => (
        <PictureCard 
          key={picture.id} 
          picture={picture} 
          onDelete={() => onDeletePicture(picture.id)}
          allowDelete={allowEditing}
        />
      ))}
    </div>
  );
};

export default PictureGrid;
