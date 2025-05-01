
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trash2 } from "lucide-react";
import { Picture } from "@/types";
import { useNavigate } from "react-router-dom";

interface PictureCardProps {
  picture: Picture;
  onDelete: (pictureId: string) => void;
}

const PictureCard: React.FC<PictureCardProps> = ({ picture, onDelete }) => {
  const navigate = useNavigate();
  
  const handleAnalyzePicture = (pictureId: string) => {
    navigate(`/dashboard/stores/${picture.store_id}/analyze?pictureId=${pictureId}`);
  };

  return (
    <Card key={picture.id} className="overflow-hidden flex flex-col">
      <div className="relative h-48 bg-muted">
        <img
          src={picture.image_url}
          alt={`Store picture ${picture.id}`}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-muted-foreground">
            {new Date(picture.created_at).toLocaleDateString()}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleAnalyzePicture(picture.id)}
            >
              Analyze
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
              onClick={() => onDelete(picture.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PictureCard;
