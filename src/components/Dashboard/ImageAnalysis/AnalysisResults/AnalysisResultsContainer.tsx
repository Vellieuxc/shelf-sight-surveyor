
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
 * Container component that manages the Analysis Results section
 * 
 * This component follows the container/presenter pattern, handling business logic
 * while delegating rendering to presenter components.
 * 
 * @param props Component properties
 * @returns React component
 */
const AnalysisResultsContainer: React.FC<AnalysisResultsContainerProps> = (props) => {
  // This component is designed as a container that provides data and functions
  // to the presentation components. If additional state management or data
  // processing is needed in the future, it would be added here.

  // Pass all props through to the card component
  return <AnalysisResultsCard {...props} />;
};

export default AnalysisResultsContainer;
