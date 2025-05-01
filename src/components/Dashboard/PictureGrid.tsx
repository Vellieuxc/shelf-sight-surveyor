
import React from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";
import { Button } from "@/components/ui/button";
import { Camera } from "lucide-react";

interface PictureGridProps {
  pictures: Picture[];
  onDeletePicture: (pictureId: string) => void;
  onUploadClick: () => void;
}

const PictureGrid: React.FC<PictureGridProps> = ({ pictures, onDeletePicture, onUploadClick }) => {
  if (pictures.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground">No pictures uploaded yet.</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onUploadClick}
        >
          <Camera size={16} className="mr-2" />
          Upload First Picture
        </Button>
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
