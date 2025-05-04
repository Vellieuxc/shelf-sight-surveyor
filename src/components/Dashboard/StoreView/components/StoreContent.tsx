
import React from "react";
import { Picture } from "@/types";
import StorePicturesSection from "../../Pictures/StorePicturesSection";

interface Store {
  id: string;
  name: string;
  address: string;
  type: string;
  store_image?: string;
  projects?: {
    is_closed: boolean;
  };
}

interface StoreContentProps {
  store: Store;
  pictures: Picture[];
  storeId: string;
  isLoading?: boolean;
  isProjectClosed?: boolean;
  isConsultant?: boolean;
  isBoss?: boolean;
  onUploadClick: () => void;
  onCaptureClick: () => void;
  refetchPictures: () => void;
}

const StoreContent: React.FC<StoreContentProps> = ({
  store,
  pictures,
  storeId,
  isLoading = false,
  isProjectClosed = false,
  isConsultant = false,
  isBoss = false,
  onUploadClick,
  onCaptureClick,
  refetchPictures
}) => {
  return (
    <div className="space-y-6">
      <StorePicturesSection
        pictures={pictures}
        isLoading={isLoading}
        onUploadClick={onUploadClick}
        onCaptureClick={onCaptureClick}
        onPictureDeleted={refetchPictures}
        isProjectClosed={isProjectClosed}
        isConsultant={isConsultant}
        isBoss={isBoss}
      />
    </div>
  );
};

export default StoreContent;
