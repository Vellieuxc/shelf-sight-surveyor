
import React from "react";
import { Comment } from "./types";

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const formattedDate = new Date(comment.created_at).toLocaleDateString();
  
  return (
    <div className="border rounded-md p-3 bg-muted/40">
      <div className="flex justify-between items-start">
        <p className="text-xs font-medium">{comment.user_name || "Unknown User"}</p>
        <p className="text-xs text-muted-foreground">{formattedDate}</p>
      </div>
      <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
    </div>
  );
};

export default CommentItem;
