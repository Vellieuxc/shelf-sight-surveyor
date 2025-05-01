
import React from "react";
import { AnalysisData } from "@/types";
import AnalysisResultsContainer from "./AnalysisResultsContainer";

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
  return (
    <AnalysisResultsContainer 
      isLoading={isLoading}
      isAnalyzing={isAnalyzing}
      analysisData={analysisData}
      onExportToExcel={onExportToExcel}
      onUpdateAnalysisData={onUpdateAnalysisData}
    />
  );
};

export default AnalysisResults;
