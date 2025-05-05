
import React from "react";
import { AnalysisData } from "@/types";
import AnalysisResultsCard from "./AnalysisResultsCard";

interface AnalysisResultsContainerProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisData: AnalysisData[] | null;
  onExportToExcel: () => void;
  onUpdateAnalysisData?: (updatedData: AnalysisData[]) => void;
}

const AnalysisResultsContainer: React.FC<AnalysisResultsContainerProps> = (props) => {
  return <AnalysisResultsCard {...props} />;
};

export default AnalysisResultsContainer;
