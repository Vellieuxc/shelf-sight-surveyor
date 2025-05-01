
import React from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";

interface PictureGridProps {
  pictures: Picture[];
  onDeletePicture: (pictureId: string) => void;
}

const PictureGrid: React.FC<PictureGridProps> = ({ 
  pictures, 
  onDeletePicture
}) => {
  if (pictures.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground mb-4">No pictures uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pictures.map((picture) => (
        <PictureCard
          key={picture.id}
          picture={picture}
          onDelete={onDeletePicture}
        />
      ))}
    </div>
  );
};

export default PictureGrid;
