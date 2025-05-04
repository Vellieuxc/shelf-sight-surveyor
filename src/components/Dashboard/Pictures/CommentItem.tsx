
import React from "react";

interface Comment {
  id: string;
  user_name?: string;
  created_at: string;
  content: string;
}

interface CommentItemProps {
  comment: Comment;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  return (
    <div className="border rounded-md p-3 bg-muted/40">
      <div className="flex justify-between items-start">
        <p className="text-xs font-medium">{comment.user_name || "Unknown User"}</p>
        <p className="text-xs text-muted-foreground">
          {new Date(comment.created_at).toLocaleDateString()}
        </p>
      </div>
      <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
    </div>
  );
};

export default CommentItem;
