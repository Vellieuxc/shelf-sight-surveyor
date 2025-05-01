
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyStoresStateProps {
  onAddStore: () => void;
}

const EmptyStoresState: React.FC<EmptyStoresStateProps> = ({ onAddStore }) => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground">No stores found. Create one?</p>
      <Button 
        variant="outline" 
        className="mt-4"
        onClick={onAddStore}
      >
        <Plus size={16} className="mr-2" />
        Add New Store
      </Button>
    </div>
  );
};

export default EmptyStoresState;
