
import React from "react";
import { Store, Picture } from "@/types";
import StorePicturesSection from "../../Pictures/StorePicturesSection";
import { useResponsive } from "@/hooks/use-mobile";

interface StoreContentProps {
  store: Store;
  pictures: Picture[];
  storeId: string;
  isLoading: boolean;
  isProjectClosed: boolean;
  isConsultant: boolean;
  isBoss: boolean;
  onUploadClick: () => void;
  onCaptureClick: () => void;
  refetchPictures: () => void;
}

const StoreContent: React.FC<StoreContentProps> = ({
  store,
  pictures,
  storeId,
  isLoading,
  isProjectClosed,
  isConsultant,
  isBoss,
  onUploadClick,
  onCaptureClick,
  refetchPictures
}) => {
  const { isMobile } = useResponsive();
  
  // Determine if the user can add photos based on project status and role
  const canAddPhotos = !isProjectClosed || isConsultant || isBoss;
  
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Pictures Section */}
      <StorePicturesSection
        pictures={pictures}
        isLoading={isLoading}
        onUploadClick={onUploadClick}
        onCaptureClick={onCaptureClick}
        onPictureDeleted={refetchPictures}
        isProjectClosed={isProjectClosed}
        isConsultant={isConsultant}
        isBoss={isBoss}
        storeId={storeId}
      />
    </div>
  );
};

export default StoreContent;
