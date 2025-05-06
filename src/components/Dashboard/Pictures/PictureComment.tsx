
import React, { useCallback } from "react";
import CommentForm from "./CommentForm";
import CommentsList from "./CommentsList";
import { useComments } from "./hooks/useComments";

interface PictureCommentProps {
  pictureId: string;
}

const PictureComment: React.FC<PictureCommentProps> = ({ pictureId }) => {
  const { comments, isLoading, error, refreshComments } = useComments(pictureId);

  const handleCommentAdded = useCallback(() => {
    console.log("Comment added, refreshing comments list");
    refreshComments();
  }, [refreshComments]);

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
