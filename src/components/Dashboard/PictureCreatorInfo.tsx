
import React from "react";
import { User } from "lucide-react";

interface PictureCreatorInfoProps {
  creator: string;
}

const PictureCreatorInfo: React.FC<PictureCreatorInfoProps> = ({ creator }) => {
  if (!creator) return null;
  
  return (
    <div className="flex items-center gap-1 mt-1">
      <User size={12} />
      <span>By: {creator}</span>
    </div>
  );
};

export default PictureCreatorInfo;
