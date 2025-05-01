
import React from "react";

export const AnalysisEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
      <p>No analysis results yet</p>
      <p className="text-sm">Upload and analyze an image to see results</p>
    </div>
  );
};
