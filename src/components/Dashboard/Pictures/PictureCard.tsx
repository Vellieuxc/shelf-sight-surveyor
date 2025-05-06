
import React, { useState } from "react";
import { Picture } from "@/types";
import { Card } from "@/components/ui/card";
import { useResponsive } from "@/hooks/use-mobile";
import { useCreatorInfo } from "./hooks/useCreatorInfo";
import PictureCardContent from "./CardComponents/PictureCardContent";
import MetadataSection from "./CardComponents/MetadataSection";
import DesktopFooter from "./CardComponents/DesktopFooter";
import MobileFooter from "./CardComponents/MobileFooter";
import CommentsSection from "./CardComponents/CommentsSection";

interface PictureCardProps {
  picture: Picture;
  onDelete?: () => void;
  allowDelete?: boolean;
  createdByName?: string;
}

const PictureCard: React.FC<PictureCardProps> = ({ 
  picture, 
  onDelete, 
  allowDelete = true, 
  createdByName 
}) => {
  const [showComments, setShowComments] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { isMobile, isTablet } = useResponsive();
  const hasAnalysis = picture.analysis_data && picture.analysis_data.length > 0;
  
  // Responsive button size based on screen size
  const buttonSize = isMobile ? "sm" : "default";
  // Responsive icon size
  const iconSize = isMobile ? 16 : 18;

  // Use the custom hook to fetch creator info
  const { creator } = useCreatorInfo({
    uploadedBy: picture.uploaded_by,
    createdByName
  });

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  return (
    <Card className="overflow-hidden flex flex-col">
      <PictureCardContent
        imageUrl={picture.image_url}
        createdAt={picture.created_at}
        hasAnalysis={hasAnalysis}
        onImageLoad={handleImageLoad}
        imageLoaded={imageLoaded}
      />
      
      <MetadataSection 
        createdAt={picture.created_at}
        creator={creator}
      />
      
      <DesktopFooter
        pictureId={picture.id}
        storeId={picture.store_id}
        imageUrl={picture.image_url}
        createdAt={picture.created_at}
        showComments={showComments}
        toggleComments={toggleComments}
        allowDelete={allowDelete}
        buttonSize={buttonSize}
        iconSize={iconSize}
        onDelete={onDelete}
      />
      
      <MobileFooter
        pictureId={picture.id}
        storeId={picture.store_id}
        imageUrl={picture.image_url}
        createdAt={picture.created_at}
        showComments={showComments}
        toggleComments={toggleComments}
        allowDelete={allowDelete}
        onDelete={onDelete}
      />
      
      <CommentsSection
        showComments={showComments}
        pictureId={picture.id}
      />
    </Card>
  );
};

export default PictureCard;
