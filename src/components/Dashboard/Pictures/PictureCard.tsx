
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import PictureAnalysisBadge from "./PictureAnalysisBadge";
import PictureMetadata from "./PictureMetadata";
import OptimizedImage from "@/components/common/OptimizedImage";
import { createDeepEqualityFn } from "@/utils/performance/componentOptimization";
import { DesktopFooter, MobileFooter, CommentsSection } from "./CardComponents";
import { useAuth } from "@/contexts/auth";

interface PictureCardProps {
  id: string;
  image_url: string;
  analysis_data: any[] | null;
  created_at: string;
  onClick: () => void;
  storeId?: string;
  allowDelete?: boolean;
  onDelete?: () => void;
}

const PictureCard: React.FC<PictureCardProps> = ({ 
  id, 
  image_url, 
  analysis_data, 
  created_at, 
  onClick,
  storeId = "",
  allowDelete = true,
  onDelete = () => {}
}) => {
  // State for comments visibility
  const [showComments, setShowComments] = useState(false);
  
  // Get user profile to check role
  const { profile } = useAuth();
  const isConsultantOrBoss = profile?.role === "consultant" || profile?.role === "boss";
  
  // Toggle comments visibility
  const toggleComments = () => {
    setShowComments(!showComments);
  };
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-200 hover:shadow-md"
    >
      <CardContent className="p-0 relative">
        {/* Image container with click handler */}
        <div 
          className="relative aspect-square overflow-hidden cursor-pointer" 
          onClick={onClick}
        >
          <OptimizedImage
            src={image_url}
            alt={`Picture ${id}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <PictureAnalysisBadge hasAnalysis={!!analysis_data} />
        </div>
        
        <div className="p-3">
          <PictureMetadata createdAt={created_at} exactDate={created_at} />
        </div>
        
        {/* Mobile footer with buttons (visible on small screens only) */}
        <MobileFooter
          pictureId={id}
          storeId={storeId}
          imageUrl={image_url}
          createdAt={created_at}
          showComments={showComments}
          toggleComments={toggleComments}
          allowDelete={allowDelete}
          onDelete={onDelete}
        />
        
        {/* Desktop footer with buttons (visible on larger screens) */}
        <DesktopFooter
          pictureId={id}
          storeId={storeId}
          imageUrl={image_url}
          createdAt={created_at}
          showComments={showComments}
          toggleComments={toggleComments}
          allowDelete={allowDelete}
          buttonSize="default"
          iconSize={18}
          onDelete={onDelete}
        />
        
        {/* Comments section (shown when showComments is true) */}
        <CommentsSection 
          showComments={showComments} 
          pictureId={id} 
          className="border-t"
        />
      </CardContent>
    </Card>
  );
};

// Use performance optimization with deep equality comparison to prevent unnecessary re-renders
export default React.memo(PictureCard, createDeepEqualityFn(['onClick', 'onDelete']));
