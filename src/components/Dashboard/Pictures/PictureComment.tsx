
import React, { useCallback } from "react";
import CommentForm from "./CommentForm";
import CommentsList from "./CommentsList";
import { useComments } from "./hooks/useComments";
import { useCommentCount } from "./hooks/useCommentCount";

interface PictureCommentProps {
  pictureId: string;
}

const PictureComment: React.FC<PictureCommentProps> = ({ pictureId }) => {
  const { comments, isLoading, error, refreshComments } = useComments(pictureId);
  const { refreshCount } = useCommentCount(pictureId);

  const handleCommentAdded = useCallback(() => {
    console.log("Comment added, refreshing comments list and count");
    refreshComments();
    refreshCount(); // This will update the comment count badge
  }, [refreshComments, refreshCount]);

  return (
    <div className="mt-4 space-y-6" data-testid="picture-comment-container">
      <CommentForm 
        pictureId={pictureId} 
        onCommentAdded={handleCommentAdded} 
      />
      
      <CommentsList 
        comments={comments} 
        isLoading={isLoading}
        error={error}
      />
    </div>
  );
};

export default PictureComment;
