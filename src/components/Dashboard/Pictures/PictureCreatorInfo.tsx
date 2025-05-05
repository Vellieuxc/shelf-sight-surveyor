
import React from "react";
import { User } from "lucide-react";

interface PictureCreatorInfoProps {
  creator: string;
}

const PictureCreatorInfo: React.FC<PictureCreatorInfoProps> = ({ creator }) => {
  // Ensure creator is a string and not undefined/null
  const displayName = creator ? creator : "Unknown";
  
  return (
    <div className="truncate">
      <span className="font-medium">By:</span> {displayName}
    </div>
  );
};

export default PictureCreatorInfo;
