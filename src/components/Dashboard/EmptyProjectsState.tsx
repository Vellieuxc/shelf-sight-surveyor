
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface EmptyProjectsStateProps {
  onCreateClick: () => void;
}

const EmptyProjectsState: React.FC<EmptyProjectsStateProps> = ({ onCreateClick }) => {
  return (
    <div className="bg-muted/50 rounded-lg p-8 text-center">
      <h3 className="text-lg font-medium mb-2">No projects yet</h3>
      <p className="text-muted-foreground mb-4">Create your first project to get started.</p>
      <Button onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" /> Create Project
      </Button>
    </div>
  );
};

export default EmptyProjectsState;
