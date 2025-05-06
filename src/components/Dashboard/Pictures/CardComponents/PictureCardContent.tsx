
import React, { useState } from "react";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useRenderPerformanceMonitor } from "@/utils/performance/renderOptimization";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PictureCardContentProps {
  imageUrl: string;
  createdAt: string;
  hasAnalysis: boolean;
  onImageLoad?: () => void;
  imageLoaded?: boolean;
}

/**
 * Performance-optimized component for rendering the picture card content
 */
const PictureCardContent: React.FC<PictureCardContentProps> = ({
  imageUrl,
  createdAt,
  hasAnalysis,
  onImageLoad,
  imageLoaded = false,
}) => {
  const [isLoaded, setIsLoaded] = useState(imageLoaded);
  
  // Monitor render performance
  useRenderPerformanceMonitor('PictureCardContent');
  
  // Format the creation date
  const displayDate = format(new Date(createdAt), "PPP");
  
  const handleImageLoad = () => {
    setIsLoaded(true);
    if (onImageLoad) onImageLoad();
  };
  
  return (
    <div className="relative">
      {/* Show skeleton loader until image is loaded */}
      {!isLoaded && (
        <div className="absolute inset-0 w-full z-0">
          <Skeleton className="w-full h-[200px] rounded-t-lg" />
        </div>
      )}
      
      {/* Optimized image with lazy loading and placeholder */}
      <div className="w-full h-[200px] overflow-hidden">
        <OptimizedImage
          src={imageUrl}
          alt={`Store picture from ${displayDate}`}
          className="w-full h-full object-cover transition-transform hover:scale-105"
          onLoad={handleImageLoad}
          priority={false}
        />
      </div>
      
      {/* Analysis badge */}
      {hasAnalysis && (
        <div className="absolute top-2 right-2">
          <Badge variant="secondary" className="bg-green-600 text-white hover:bg-green-700">
            Analyzed
          </Badge>
        </div>
      )}
    </div>
  );
};

export default PictureCardContent;
