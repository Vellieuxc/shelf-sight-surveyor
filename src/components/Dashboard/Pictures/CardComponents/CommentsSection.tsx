
import React from "react";
import PictureComment from "../PictureComment";

interface CommentsSectionProps {
  showComments: boolean;
  pictureId: string;
  className?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  showComments,
  pictureId,
  className = ""
}) => {
  // Don't render anything if comments are not shown
  if (!showComments) return null;
  
  return (
    <div className={`p-3 pt-0 border-t ${className}`}>
      <PictureComment pictureId={pictureId} />
    </div>
  );
};

export default CommentsSection;
