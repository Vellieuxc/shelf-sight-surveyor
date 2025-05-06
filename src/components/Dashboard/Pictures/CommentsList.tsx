
import React, { memo } from "react";
import CommentItem from "./CommentItem";
import { Comment } from "./types";
import { AlertCircle } from "lucide-react";

interface CommentsListProps {
  comments: Comment[];
  isLoading: boolean;
  error?: Error | null;
}

// Use memo to prevent unnecessary re-renders
const CommentsList: React.FC<CommentsListProps> = memo(({ comments, isLoading, error }) => {
  // Show error state
  if (error) {
    return (
      <div className="p-2 bg-destructive/10 text-destructive rounded-md flex items-center gap-2 text-sm">
        <AlertCircle size={16} />
        <p>Failed to load comments: {error.message || "Unknown error"}</p>
      </div>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="border rounded-md p-3 bg-muted/40 animate-pulse">
            <div className="flex justify-between items-start">
              <div className="h-4 w-24 bg-muted rounded"></div>
              <div className="h-4 w-20 bg-muted rounded"></div>
            </div>
            <div className="h-4 w-full bg-muted rounded mt-2"></div>
            <div className="h-4 w-3/4 bg-muted rounded mt-2"></div>
          </div>
        ))}
      </div>
    );
  }
  
  // Show empty state
  if (comments.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">No comments yet. Be the first to comment!</p>
    );
  }
  
  // Show comments list
  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
});

CommentsList.displayName = "CommentsList";

export default CommentsList;
