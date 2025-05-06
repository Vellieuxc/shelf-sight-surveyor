
import React from "react";
import PictureComment from "../PictureComment";

interface CommentsSectionProps {
  showComments: boolean;
  pictureId: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = ({
  showComments,
  pictureId
}) => {
  if (!showComments) return null;
  
  return (
    <div className="p-3 pt-0 border-t">
      <PictureComment key={pictureId} pictureId={pictureId} />
    </div>
  );
};

export default CommentsSection;
