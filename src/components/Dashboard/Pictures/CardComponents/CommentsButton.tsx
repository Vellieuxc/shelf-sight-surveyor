
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
  const { count, isLoading } = useCommentCount(pictureId);
  
  const iconSize = size === "sm" ? 16 : 18;
  
  return (
    <Button
      variant="outline"
      size={size}
      onClick={onToggle}
      className={cn(
        "transition-colors", 
        showComments ? "bg-muted" : "",
        className
      )}
      aria-label={showComments ? "Hide comments" : "Show comments"}
    >
      <MessageSquare className="mr-2" size={iconSize} />
      <span className="mr-1">Comments</span>
      {!isLoading && count > 0 && (
        <span className="inline-flex items-center justify-center h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-xs">
          {count}
        </span>
      )}
    </Button>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(CommentsButton);
