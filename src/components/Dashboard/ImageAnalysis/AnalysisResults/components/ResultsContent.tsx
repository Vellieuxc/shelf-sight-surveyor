
import React from "react";
import { AnalysisData } from "@/types";
import { AnalysisResultsTable } from "../AnalysisResultsTable";
import { AnalysisLoadingState } from "../AnalysisLoadingState";
import { AnalysisEmptyState } from "../AnalysisEmptyState";
import { JsonView } from "./JsonView";
import { ShelfInventoryView } from "./ShelfInventoryView";

interface ResultsContentProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisData: any | null;
  editableData: AnalysisData[] | null;
  editMode: boolean;
  showRawJson: boolean;
  onInputChange: (index: number, field: keyof AnalysisData, value: any) => void;
}

export const ResultsContent: React.FC<ResultsContentProps> = ({
  isLoading,
  isAnalyzing,
  analysisData,
  editableData,
  editMode,
  showRawJson,
  onInputChange
}) => {
  if (isLoading) {
    return <AnalysisLoadingState message="Loading data..." />;
  }
  
  if (isAnalyzing) {
    return <AnalysisLoadingState message="Analyzing shelf contents with AI..." />;
  }
  
  if (!analysisData) {
    return <AnalysisEmptyState />;
  }
  
  // Check if the data has the new structured shelf inventory format
  const hasStructuredFormat = analysisData && 
    (analysisData.shelves || 
     (analysisData.metadata && analysisData.metadata.total_items));

  // Display the structured view or full JSON output from the edge function
  return (
    <div className="w-full">
      {hasStructuredFormat && !showRawJson ? (
        <ShelfInventoryView data={analysisData} />
      ) : (
        <JsonView data={analysisData} />
      )}
    </div>
  );
};
