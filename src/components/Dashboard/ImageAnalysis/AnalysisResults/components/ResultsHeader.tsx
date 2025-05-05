
import React from "react";
import { CardTitle } from "@/components/ui/card";
import { ActionButtons } from "./ActionButtons";
import { AnalysisData } from "@/types";

interface ResultsHeaderProps {
  analysisData: AnalysisData[] | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  showRawJson: boolean;
  editMode: boolean;
  toggleViewMode: () => void;
  setEditMode: (edit: boolean) => void;
  saveChanges: () => void;
  cancelChanges: () => void;
  onExportToExcel: () => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  analysisData,
  isLoading,
  isAnalyzing,
  showRawJson,
  editMode,
  toggleViewMode,
  setEditMode,
  saveChanges,
  cancelChanges,
  onExportToExcel
}) => {
  return (
    <>
      <CardTitle>Analysis Results</CardTitle>
      <div className="flex gap-2">
        {analysisData && !isLoading && !isAnalyzing && (
          <ActionButtons 
            showRawJson={showRawJson}
            editMode={editMode}
            onToggleViewMode={toggleViewMode}
            onEditClick={() => setEditMode(true)}
            onSaveChanges={saveChanges}
            onCancelChanges={cancelChanges}
            onExportToExcel={onExportToExcel}
          />
        )}
      </div>
    </>
  );
};
