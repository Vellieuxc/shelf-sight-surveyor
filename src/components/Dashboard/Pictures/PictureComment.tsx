
import React from "react";
import CommentForm from "./CommentForm";
import CommentsList from "./CommentsList";
import { useComments } from "./hooks/useComments";

interface PictureCommentProps {
  pictureId: string;
}

const PictureComment: React.FC<PictureCommentProps> = ({ pictureId }) => {
  const { comments, isLoading, error, addComment } = useComments(pictureId);

  // Handler for when a comment is added
  const handleCommentAdded = (newComment: any) => {
    // Add comment to local state immediately
    addComment(newComment);
    // We don't need to manually refresh since we have real-time updates set up now
  };

  return (
    <div className="mt-4 space-y-4">
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
