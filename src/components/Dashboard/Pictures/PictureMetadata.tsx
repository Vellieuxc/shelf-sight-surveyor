
import React from "react";
import { format } from "date-fns";

interface PictureMetadataProps {
  createdAt: string;
  exactDate: string;
}

const PictureMetadata: React.FC<PictureMetadataProps> = ({ createdAt, exactDate }) => {
  const uploadDate = new Date(createdAt);
  const timeAgo = getTimeAgo(uploadDate);
  
  return (
    <div className="mb-1" title={exactDate}>
      <span className="font-medium">Uploaded:</span> {timeAgo}
    </div>
  );
};

// Helper function to calculate relative time
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  return format(date, 'MMM d, yyyy');
}

export default PictureMetadata;
