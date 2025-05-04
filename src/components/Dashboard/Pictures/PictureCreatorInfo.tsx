
import React from "react";

interface PictureCreatorInfoProps {
  creator: string;
}

const PictureCreatorInfo: React.FC<PictureCreatorInfoProps> = ({ creator }) => {
  return (
    <div className="truncate">
      <span className="font-medium">By:</span> {creator || "Unknown"}
    </div>
  );
};

export default PictureCreatorInfo;
