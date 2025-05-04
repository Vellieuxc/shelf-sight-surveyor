
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyPicturesStateProps {
  onAddPicture?: () => void;
  message?: string;
}

const EmptyPicturesState: React.FC<EmptyPicturesStateProps> = ({ 
  onAddPicture,
  message = "No pictures available. Add some?"
}) => {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg">
      <p className="text-muted-foreground">{message}</p>
      {onAddPicture && (
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={onAddPicture}
        >
          <Plus size={16} className="mr-2" />
          Upload a picture
        </Button>
      )}
    </div>
  );
};

export default EmptyPicturesState;
