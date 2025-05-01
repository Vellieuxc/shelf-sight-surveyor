
import React from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";
import { Button } from "@/components/ui/button";
import { Camera, Upload } from "lucide-react";

interface PictureGridProps {
  pictures: Picture[];
  onDeletePicture: (pictureId: string) => void;
  onUploadClick: () => void;
  onCameraClick?: () => void;
}

const PictureGrid: React.FC<PictureGridProps> = ({ 
  pictures, 
  onDeletePicture, 
  onUploadClick,
  onCameraClick 
}) => {
  if (pictures.length === 0) {
    return (
      <div className="col-span-full text-center py-12">
        <p className="text-muted-foreground mb-4">No pictures uploaded yet.</p>
        <div className="flex justify-center gap-2">
          <Button 
            variant="outline" 
            onClick={onUploadClick}
          >
            <Upload size={16} className="mr-2" />
            Upload First Picture
          </Button>
          <Button 
            variant="outline"
            onClick={onCameraClick || onUploadClick}
          >
            <Camera size={16} className="mr-2" />
            Take First Picture
          </Button>
        </div>
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
