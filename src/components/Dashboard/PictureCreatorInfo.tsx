
import React from "react";
import { User } from "lucide-react";

interface PictureCreatorInfoProps {
  creator: string;
}

const PictureCreatorInfo: React.FC<PictureCreatorInfoProps> = ({ creator }) => {
  // Ensure creator is a string and not undefined/null
  const displayName = creator && creator.trim() ? creator : "Unknown";
  
  return (
    <div className="flex items-center gap-1 mt-1">
      <User size={12} />
      <span className="text-xs">By: {displayName}</span>
    </div>
  );
};

export default PictureCreatorInfo;
