
import React from "react";
import { format } from "date-fns";
import { CardDescription } from "@/components/ui/card";
import { User } from "lucide-react";

interface MetadataSectionProps {
  createdAt: string;
  creator?: string | null;
}

const MetadataSection: React.FC<MetadataSectionProps> = ({ createdAt, creator }) => {
  const uploadDate = new Date(createdAt);
  const formattedDate = format(uploadDate, "MMM d, yyyy 'at' h:mm a");
  
  return (
    <CardDescription className="p-2 text-xs sm:text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <time dateTime={uploadDate.toISOString()}>
          {formattedDate}
        </time>
        
        {creator && (
          <>
            <span className="hidden sm:inline-block">&bull;</span>
            <span className="flex items-center gap-1">
              <User size={14} className="inline" /> {creator}
            </span>
          </>
        )}
      </div>
    </CardDescription>
  );
};

export default React.memo(MetadataSection);
