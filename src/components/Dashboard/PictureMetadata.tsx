
import React from "react";
import { Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PictureMetadataProps {
  createdAt: string;
  exactDate: string;
}

const PictureMetadata: React.FC<PictureMetadataProps> = ({ createdAt, exactDate }) => {
  const formattedDate = formatDistanceToNow(new Date(createdAt), { addSuffix: true });
  
  return (
    <div className="flex items-center gap-1" title={exactDate}>
      <Calendar size={12} />
      <span>Created: {formattedDate}</span>
    </div>
  );
};

export default PictureMetadata;
