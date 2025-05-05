
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

/**
 * Container component that handles state management and passes data to the presentation components
 */
const AnalysisResultsContainer: React.FC<AnalysisResultsContainerProps> = (props) => {
  // This component is a pass-through container that provides data to the presentation components
  // If additional state management or data processing is needed, it would be added here
  return <AnalysisResultsCard {...props} />;
};

export default AnalysisResultsContainer;
