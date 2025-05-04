
import React from "react";
import { AnalysisData } from "@/types";
import AnalysisResultsContainer from "./AnalysisResultsContainer";
import AnalysisResultsSkeleton from "./AnalysisResultsSkeleton";

interface AnalysisResultsProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisData: AnalysisData[] | null;
  onExportToExcel: () => void;
  onUpdateAnalysisData?: (updatedData: AnalysisData[]) => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  isLoading,
  isAnalyzing,
  analysisData,
  onExportToExcel,
  onUpdateAnalysisData,
}) => {
  if (isLoading) {
    return <AnalysisResultsSkeleton />;
  }
  
  return (
    <AnalysisResultsContainer 
      isLoading={false}
      isAnalyzing={isAnalyzing}
      analysisData={analysisData}
      onExportToExcel={onExportToExcel}
      onUpdateAnalysisData={onUpdateAnalysisData}
    />
  );
};

export default AnalysisResults;
