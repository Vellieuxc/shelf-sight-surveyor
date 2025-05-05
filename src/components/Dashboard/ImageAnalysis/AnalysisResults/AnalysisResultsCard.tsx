
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

  return (
    <Card className="card-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <ResultsHeader 
          analysisData={analysisData}
          isLoading={isLoading}
          isAnalyzing={isAnalyzing}
          showRawJson={true} // Always show JSON view
          editMode={false} // Disable edit mode
          toggleViewMode={() => {}} // No-op since we're always in JSON view
          setEditMode={() => {}} // No-op since editing is disabled
          saveChanges={() => {}} // No-op since editing is disabled
          cancelChanges={() => {}} // No-op since editing is disabled
          onExportToExcel={onExportToExcel}
        />
      </CardHeader>
      <CardContent>
        <ResultsContent
          isLoading={isLoading}
          isAnalyzing={isAnalyzing}
          analysisData={analysisData}
          editableData={editableData}
          editMode={false} // Disable edit mode
          showRawJson={true} // Always show JSON view
          onInputChange={handleInputChange}
        />
      </CardContent>
      {analysisData && <CardFooter className="flex justify-between" />}
    </Card>
  );
};

export default AnalysisResultsCard;
