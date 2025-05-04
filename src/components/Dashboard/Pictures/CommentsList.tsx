
import React from "react";
import CommentItem from "./CommentItem";

interface Comment {
  id: string;
  picture_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
}

const CommentsList: React.FC<CommentsListProps> = ({ comments, isLoading }) => {
  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading comments...</p>;
  }
  
  if (comments.length === 0) {
    return <p className="text-sm text-muted-foreground">No comments yet</p>;
  }
  
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentsList;
