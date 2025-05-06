
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

interface CommentsButtonProps {
  showComments: boolean;
  onToggle: () => void;
  size?: "sm" | "default";
  className?: string;
  commentCount?: number;
}

const CommentsButton: React.FC<CommentsButtonProps> = ({ 
  showComments, 
  onToggle, 
  size = "default",
  className = "",
  commentCount
}) => {
  const hasComments = typeof commentCount === 'number' && commentCount > 0;
  
  return (
    <Button
      variant={showComments ? "secondary" : "outline"}
      size={size}
      className={className}
      onClick={onToggle}
    >
      <MessageSquare className={`mr-1 ${size === "sm" ? "h-3 w-3" : "h-4 w-4"}`} />
      <span className={size === "sm" ? "text-xs" : ""}>
        {showComments 
          ? "Hide Comments"
          : hasComments 
            ? `Comments (${commentCount})` 
            : "Comments"}
      </span>
    </Button>
  );
};

export default CommentsButton;
