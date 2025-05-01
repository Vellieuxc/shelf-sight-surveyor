
import React from "react";

interface AnalysisLoadingStateProps {
  message: string;
}

export const AnalysisLoadingState: React.FC<AnalysisLoadingStateProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center h-60">
      <div className="animate-pulse text-muted-foreground">
        {message}
      </div>
    </div>
  );
};
