
import React, { memo } from "react";
import PictureComment from "../PictureComment";
import { useCommentCount } from "../hooks/useCommentCount";

interface CommentsSectionProps {
  showComments: boolean;
  pictureId: string;
  className?: string;
}

const CommentsSection: React.FC<CommentsSectionProps> = memo(({
  showComments,
  pictureId,
  className = ""
}) => {
  // Get comment count for this picture
  const { count } = useCommentCount(pictureId);
  
  // Don't render anything if comments are not shown
  if (!showComments) return null;
  
  return (
    <div className={`p-3 pt-0 border-t ${className}`} data-testid="comments-section">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">
          Comments {count !== undefined && `(${count})`}
        </h3>
      </div>
      <PictureComment pictureId={pictureId} />
    </div>
  );
});

CommentsSection.displayName = "CommentsSection";

export default CommentsSection;
