
import React from "react";
import { Button } from "@/components/ui/button";

interface CommentsButtonProps {
  showComments: boolean;
  onToggle: () => void;
  size?: "sm" | "default";
  className?: string;
}

const CommentsButton: React.FC<CommentsButtonProps> = ({ 
  showComments, 
  onToggle, 
  size = "default",
  className = ""
}) => {
  return (
    <Button
      variant="outline"
      size={size}
      className={className}
      onClick={onToggle}
    >
      <span className={size === "sm" ? "text-xs" : ""}>
        {showComments 
          ? (size === "sm" ? "Hide Comments" : "Hide Comments") 
          : (size === "sm" ? "Comments" : "Show Comments")}
      </span>
    </Button>
  );
};

export default CommentsButton;
