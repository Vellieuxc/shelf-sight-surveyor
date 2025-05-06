
import React from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { AnalysisData } from "@/types";
import { ResultsContent } from "./components/ResultsContent";
import { ResultsHeader } from "./components/ResultsHeader";
import { useAnalysisEditor } from "./hooks/useAnalysisEditor";

interface AnalysisResultsCardProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisData: any | null;
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

  // Determine if we have the structured format
  const hasStructuredFormat = analysisData && 
    (analysisData.shelves || 
    (analysisData.metadata && analysisData.metadata.total_items));

  return (
    <Card className="card-shadow h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <ResultsHeader 
          analysisData={analysisData}
          isLoading={isLoading}
          isAnalyzing={isAnalyzing}
          showRawJson={showRawJson}
          editMode={editMode}
          toggleViewMode={hasStructuredFormat ? toggleViewMode : undefined}
          setEditMode={setEditMode}
          saveChanges={saveChanges}
          cancelChanges={cancelChanges}
          onExportToExcel={onExportToExcel}
        />
      </CardHeader>
      <CardContent className="overflow-hidden">
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
    </Card>
  );
};

export default AnalysisResultsCard;
