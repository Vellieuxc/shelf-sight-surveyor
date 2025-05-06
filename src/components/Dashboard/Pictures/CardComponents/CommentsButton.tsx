
import React from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useCommentCount } from "../hooks/useCommentCount";

interface CommentsButtonProps {
  showComments: boolean;
  onToggle: () => void;
  pictureId: string; // Add pictureId prop
  size?: "sm" | "default";
  className?: string;
}

const CommentsButton: React.FC<CommentsButtonProps> = ({ 
  showComments, 
  onToggle, 
  pictureId, // Use the pictureId prop
  size = "default",
  className = ""
}) => {
  // Use the hook to get the actual comment count
  const { count, isLoading } = useCommentCount(pictureId);
  
  const hasComments = typeof count === 'number' && count > 0;
  
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
          : isLoading
            ? "Comments"
            : hasComments 
              ? `Comments (${count})` 
              : "Comments"}
      </span>
    </Button>
  );
};

export default CommentsButton;
