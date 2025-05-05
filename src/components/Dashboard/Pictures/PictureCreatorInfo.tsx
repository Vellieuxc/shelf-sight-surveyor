
import React from "react";
import { User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PictureCreatorInfoProps {
  creator: string;
}

const PictureCreatorInfo: React.FC<PictureCreatorInfoProps> = ({ creator }) => {
  // Ensure creator is a string and not undefined/null
  const displayName = creator && creator.trim() ? creator : "Unknown";
  
  return (
    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="flex items-center">
            <User size={12} className="mr-1" />
            <span className="truncate max-w-[120px]">{displayName}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Created by: {displayName}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default PictureCreatorInfo;
