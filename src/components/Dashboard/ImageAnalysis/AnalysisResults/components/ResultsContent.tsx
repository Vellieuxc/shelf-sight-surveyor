
import React from "react";
import { AnalysisData } from "@/types";
import { AnalysisResultsTable } from "../AnalysisResultsTable";
import { AnalysisLoadingState } from "../AnalysisLoadingState";
import { AnalysisEmptyState } from "../AnalysisEmptyState";
import { JsonView } from "./JsonView";

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
  
  // Display the full JSON output from the edge function
  return (
    <div className="w-full">
      <JsonView data={analysisData} />
    </div>
  );
};
