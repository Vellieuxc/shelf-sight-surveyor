
import React from 'react';
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCommentCount } from "../hooks/useCommentCount";

interface CommentsButtonProps {
  showComments: boolean;
  onToggle: () => void;
  pictureId: string;
  size?: "sm" | "default";
  className?: string;
}

const CommentsButton: React.FC<CommentsButtonProps> = ({
  showComments,
  onToggle,
  pictureId,
  size = "default",
  className
}) => {
  const { count, isLoading, refreshCount } = useCommentCount(pictureId);
  
  const iconSize = size === "sm" ? 16 : 18;
  
  console.log(`CommentsButton rendering for picture ${pictureId}, count: ${count}, isLoading: ${isLoading}`);
  
  return (
    <Button
      variant="outline"
      size={size}
      onClick={() => {
        // When toggling comments on, refresh the count to ensure it's up to date
        if (!showComments) {
          refreshCount();
        }
        onToggle();
      }}
      className={cn(
        "transition-colors", 
        showComments ? "bg-muted" : "",
        className
      )}
      aria-label={showComments ? "Hide comments" : "Show comments"}
      data-testid="comments-button"
    >
      <MessageSquare className="mr-2" size={iconSize} />
      <span className="mr-1">Comments</span>
      {!isLoading && count !== undefined && count > 0 && (
        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs">
          {count}
        </span>
      )}
    </Button>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(CommentsButton);
