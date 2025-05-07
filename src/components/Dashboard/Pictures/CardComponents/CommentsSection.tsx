
import React, { memo, useEffect } from "react";
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
  const { count, refreshCount } = useCommentCount(pictureId);
  
  // Refresh comment count whenever comments section becomes visible
  useEffect(() => {
    if (showComments) {
      refreshCount();
    }
  }, [showComments, refreshCount]);
  
  console.log(`CommentsSection - Picture ID: ${pictureId}, Show: ${showComments}, Count: ${count}`);
  
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
