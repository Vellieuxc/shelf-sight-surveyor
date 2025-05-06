
import React from "react";
import CommentForm from "./CommentForm";
import CommentsList from "./CommentsList";
import { useComments } from "./hooks/useComments";

interface PictureCommentProps {
  pictureId: string;
}

const PictureComment: React.FC<PictureCommentProps> = ({ pictureId }) => {
  const { comments, isLoading, addComment, refreshComments } = useComments(pictureId);

  return (
    <div className="mt-4 space-y-4">
      <CommentForm 
        pictureId={pictureId} 
        onCommentAdded={(newComment) => {
          addComment(newComment);
          // Optionally refresh comments to ensure we have the latest data
          // including server-generated IDs
          setTimeout(() => refreshComments(), 500);
        }} 
      />
      
      <div className="space-y-3">
        <CommentsList comments={comments} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default PictureComment;
