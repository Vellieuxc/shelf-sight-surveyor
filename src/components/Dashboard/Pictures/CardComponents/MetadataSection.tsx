
import React from "react";
import PictureMetadata from "../PictureMetadata";
import PictureCreatorInfo from "../PictureCreatorInfo";
import { format } from "date-fns";

interface MetadataSectionProps {
  createdAt: string;
  creator: string;
}

const MetadataSection: React.FC<MetadataSectionProps> = ({
  createdAt,
  creator
}) => {
  const uploadDate = new Date(createdAt);
  const exactDate = format(uploadDate, "PPP");
  
  return (
    <div className="p-2 text-xs text-muted-foreground">
      <PictureMetadata createdAt={createdAt} exactDate={exactDate} />
      <PictureCreatorInfo creator={creator} />
    </div>
  );
};

export default MetadataSection;
