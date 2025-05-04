
import React from "react";

interface PictureAnalysisBadgeProps {
  hasAnalysis: boolean;
}

const PictureAnalysisBadge: React.FC<PictureAnalysisBadgeProps> = ({ hasAnalysis }) => {
  if (!hasAnalysis) return null;
  
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30">
      Analyzed
    </span>
  );
};

export default PictureAnalysisBadge;
