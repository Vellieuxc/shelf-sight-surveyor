
import React from "react";
import { Info } from "lucide-react";

interface PictureAnalysisBadgeProps {
  hasAnalysis: boolean;
}

const PictureAnalysisBadge: React.FC<PictureAnalysisBadgeProps> = ({ hasAnalysis }) => {
  if (!hasAnalysis) return null;
  
  return (
    <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
      <Info size={10} />
      Analyzed
    </span>
  );
};

export default PictureAnalysisBadge;
