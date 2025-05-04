
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

export interface EmptyPicturesStateProps {
  onAddPicture?: () => void;
}

const EmptyPicturesState: React.FC<EmptyPicturesStateProps> = ({ onAddPicture }) => {
  return (
    <div className="border-2 border-dashed rounded-lg p-8 text-center flex flex-col items-center justify-center min-h-[300px] space-y-4">
      <div className="bg-muted h-16 w-16 rounded-full flex items-center justify-center">
        <Upload className="text-muted-foreground h-8 w-8" />
      </div>
      <h3 className="text-lg font-medium">No pictures yet</h3>
      <p className="text-sm text-muted-foreground">
        Take or upload pictures of this store to analyze its shelves
      </p>
      
      {onAddPicture && (
        <Button onClick={onAddPicture} className="mt-4">
          Upload a picture
        </Button>
      )}
    </div>
  );
};

export default EmptyPicturesState;
