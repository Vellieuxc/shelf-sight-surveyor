
import React from "react";
import { Button } from "@/components/ui/button";
import { Code, Edit, Check, X, FileSpreadsheet } from "lucide-react";

interface ActionButtonsProps {
  showRawJson: boolean;
  editMode: boolean;
  onToggleViewMode: () => void;
  onEditClick: () => void;
  onSaveChanges: () => void;
  onCancelChanges: () => void;
  onExportToExcel: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  showRawJson,
  editMode,
  onToggleViewMode,
  onEditClick,
  onSaveChanges,
  onCancelChanges,
  onExportToExcel,
}) => {
  return (
    <>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleViewMode}
        >
          <Code className="mr-2 h-4 w-4" />
          {showRawJson ? "Show Table" : "Show JSON"}
        </Button>
        {!showRawJson && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => editMode ? onSaveChanges() : onEditClick()}
          >
            {editMode ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        )}
      </div>
      <Button 
        variant="outline" 
        className="flex items-center gap-2"
        onClick={onExportToExcel}
      >
        <FileSpreadsheet size={16} />
        Export to Excel
      </Button>
      {editMode && !showRawJson && (
        <Button 
          variant="outline"
          className="flex items-center gap-2"
          onClick={onCancelChanges}
        >
          <X size={16} />
          Cancel
        </Button>
      )}
    </>
  );
};
