
import React from "react";
import { AnalysisData } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ResultsContent } from "./components/ResultsContent";
import { ActionButtons } from "./components/ActionButtons";
import { useAnalysisEditor } from "./hooks/useAnalysisEditor";

interface AnalysisResultsContainerProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisData: AnalysisData[] | null;
  onExportToExcel: () => void;
  onUpdateAnalysisData?: (updatedData: AnalysisData[]) => void;
}

const AnalysisResultsContainer: React.FC<AnalysisResultsContainerProps> = ({
  isLoading,
  isAnalyzing,
  analysisData,
  onExportToExcel,
  onUpdateAnalysisData,
}) => {
  const {
    editMode,
    editableData,
    showRawJson,
    handleInputChange,
    saveChanges,
    cancelChanges,
    toggleViewMode,
    setEditMode
  } = useAnalysisEditor(analysisData, onUpdateAnalysisData);

  return (
    <Card className="card-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
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
      </CardHeader>
      <CardContent>
        <ResultsContent
          isLoading={isLoading}
          isAnalyzing={isAnalyzing}
          analysisData={analysisData}
          editableData={editableData}
          editMode={editMode}
          showRawJson={showRawJson}
          onInputChange={handleInputChange}
        />
      </CardContent>
      {analysisData && (
        <CardFooter className="flex justify-between">
          {/* This footer is now handled by ActionButtons */}
        </CardFooter>
      )}
    </Card>
  );
};

export default AnalysisResultsContainer;
