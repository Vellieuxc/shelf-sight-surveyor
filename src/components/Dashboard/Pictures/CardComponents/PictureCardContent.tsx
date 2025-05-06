
import React from "react";
import { format } from "date-fns";
import PictureAnalysisBadge from "../PictureAnalysisBadge";
import { CardContent } from "@/components/ui/card";

interface PictureCardContentProps {
  imageUrl: string;
  createdAt: string;
  hasAnalysis: boolean;
  onImageLoad: () => void;
  imageLoaded: boolean;
}

const PictureCardContent: React.FC<PictureCardContentProps> = ({
  imageUrl,
  createdAt,
  hasAnalysis,
  onImageLoad,
  imageLoaded
}) => {
  const uploadDate = new Date(createdAt);

  return (
    <CardContent className="p-0 relative aspect-video">
      <div className={`w-full h-full ${!imageLoaded ? "bg-gray-200 animate-pulse" : ""}`}>
        <img 
          src={imageUrl} 
          alt="Store picture" 
          loading="lazy"
          onLoad={onImageLoad}
          className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
        <div className="flex justify-between items-center">
          <span className="text-xs text-white truncate">{format(uploadDate, "MMM d, yyyy")}</span>
          <PictureAnalysisBadge hasAnalysis={hasAnalysis} />
        </div>
      </div>
    </CardContent>
  );
};

export default PictureCardContent;
