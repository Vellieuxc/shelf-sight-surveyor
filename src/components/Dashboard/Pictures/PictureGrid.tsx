
import React from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";

interface PictureGridProps {
  pictures: Picture[];
  onPictureDeleted: () => void;
  allowDelete?: boolean;
}

const PictureGrid: React.FC<PictureGridProps> = ({ 
  pictures, 
  onPictureDeleted, 
  allowDelete = true 
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {pictures.map((picture) => (
        <PictureCard 
          key={picture.id} 
          picture={picture}
          onDelete={onPictureDeleted}
          allowDelete={allowDelete}
        />
      ))}
    </div>
  );
};

export default PictureGrid;
