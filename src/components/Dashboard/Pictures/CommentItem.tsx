
import React, { memo } from "react";
import { format, formatDistanceToNow } from "date-fns";
import { Comment } from "./types";

interface CommentItemProps {
  comment: Comment;
}

// Use memo to prevent unnecessary re-renders
const CommentItem: React.FC<CommentItemProps> = memo(({ comment }) => {
  const commentDate = new Date(comment.created_at);
  const formattedDate = format(commentDate, "PPP");
  const timeAgo = formatDistanceToNow(commentDate, { addSuffix: true });
  
  return (
    <div className="border rounded-md p-3 bg-muted/40 hover:bg-muted/60 transition-colors">
      <div className="flex justify-between items-start">
        <p className="text-xs font-medium">{comment.user_name || "Unknown User"}</p>
        <div 
          className="text-xs text-muted-foreground cursor-help"
          title={formattedDate}
        >
          {timeAgo}
        </div>
      </div>
      <p className="text-sm mt-1 whitespace-pre-line">{comment.content}</p>
    </div>
  );
});

CommentItem.displayName = "CommentItem";

export default CommentItem;
