
import React from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { AnalysisData } from "@/types";
import { ResultsContent } from "./components/ResultsContent";
import { ResultsHeader } from "./components/ResultsHeader";
import { useAnalysisEditor } from "./hooks/useAnalysisEditor";

interface AnalysisResultsCardProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisData: AnalysisData[] | null;
  onExportToExcel: () => void;
  onUpdateAnalysisData?: (updatedData: AnalysisData[]) => void;
}

const AnalysisResultsCard: React.FC<AnalysisResultsCardProps> = ({
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
        <ResultsHeader 
          analysisData={analysisData}
          isLoading={isLoading}
          isAnalyzing={isAnalyzing}
          showRawJson={showRawJson}
          editMode={editMode}
          toggleViewMode={toggleViewMode}
          setEditMode={setEditMode}
          saveChanges={saveChanges}
          cancelChanges={cancelChanges}
          onExportToExcel={onExportToExcel}
        />
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
      {analysisData && <CardFooter className="flex justify-between" />}
    </Card>
  );
};

export default AnalysisResultsCard;
