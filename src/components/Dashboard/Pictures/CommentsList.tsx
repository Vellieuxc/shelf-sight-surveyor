
import React from "react";
import CommentItem from "./CommentItem";
import { Comment } from "./types";

interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
}

const CommentsList: React.FC<CommentsListProps> = ({ comments, isLoading }) => {
  // Show loading state
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading comments...</p>;
  }
  
  // Show empty state
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet</p>;
  }
  
  // Show comments list
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentsList;
