
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyPicturesStateProps {
  onAddPicture?: () => void;
}

const EmptyPicturesState: React.FC<EmptyPicturesStateProps> = ({ onAddPicture }) => {
  return (
    <div className="text-center p-8 border border-dashed rounded-lg">
      <h3 className="text-lg font-medium mb-2">No Pictures Available</h3>
      <p className="text-muted-foreground mb-4">
        Add pictures to analyze this store's shelf layout and products.
      </p>
      {onAddPicture && (
        <Button onClick={onAddPicture} className="flex items-center gap-2">
          <Plus size={16} />
          <span>Add Picture</span>
        </Button>
      )}
    </div>
  );
};

export default EmptyPicturesState;
