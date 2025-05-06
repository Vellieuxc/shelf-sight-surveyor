
import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import CommentItem from "./CommentItem";
import { useErrorHandling } from "@/hooks";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface CommentsListProps {
  comments: any[] | null;
  isLoading: boolean;
  error: Error | null;
}

const CommentsList: React.FC<CommentsListProps> = ({ 
  comments, 
  isLoading, 
  error 
}) => {
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'CommentsList'
  });
  
  // Report error to our centralized error handler
  React.useEffect(() => {
    if (error) {
      handleError(error, {
        fallbackMessage: "Could not load comments",
        operation: "fetchComments",
        showToast: true
      });
    }
  }, [error, handleError]);
  
  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Comments</h3>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-[100px]" />
            </div>
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }
  
  // Show error state with retry option
  if (error) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load comments. Please try again later.
        </AlertDescription>
      </Alert>
    );
  }
  
  console.log("Rendering comments list with:", comments?.length || 0, "comments");
  
  // Show empty state
  if (!comments || comments.length === 0) {
    return (
      <div className="text-muted-foreground text-sm py-4">
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }
  
  // Show comments list
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Comments ({comments.length})</h3>
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </div>
  );
};

export default CommentsList;
