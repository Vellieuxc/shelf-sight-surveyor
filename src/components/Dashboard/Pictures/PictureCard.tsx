
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import PictureAnalysisBadge from "./PictureAnalysisBadge";
import PictureMetadata from "./PictureMetadata";
import OptimizedImage from "@/components/common/OptimizedImage";
import { createDeepEqualityFn } from "@/utils/performance/componentOptimization";

interface PictureCardProps {
  id: string;
  image_url: string;
  analysis_data: any[] | null;
  created_at: string;
  onClick: () => void;
}

const PictureCard: React.FC<PictureCardProps> = ({ 
  id, 
  image_url, 
  analysis_data, 
  created_at, 
  onClick 
}) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-md" 
      onClick={onClick}
    >
      <CardContent className="p-0 relative">
        {/* Use OptimizedImage instead of regular img for better performance */}
        <div className="relative aspect-square overflow-hidden">
          <OptimizedImage
            src={image_url}
            alt={`Picture ${id}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <PictureAnalysisBadge hasAnalysisData={!!analysis_data} />
        </div>
        <div className="p-3">
          <PictureMetadata date={created_at} id={id} />
        </div>
      </CardContent>
    </Card>
  );
};

// Use performance optimization with deep equality comparison to prevent unnecessary re-renders
export default React.memo(PictureCard, createDeepEqualityFn(['onClick']));
