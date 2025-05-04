
import React from "react";
import { StorePicturesSection } from "../../Pictures";
import { Picture, Store } from "@/types";
import OfflineStatus from "@/components/OfflineStatus";
import OfflineImagesList from "@/components/Dashboard/OfflineImagesList";

interface StoreContentProps {
  store: Store;
  pictures: Picture[];
  storeId: string;
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
  isProjectClosed,
  isConsultant,
  isBoss,
  onUploadClick,
  onCaptureClick,
  refetchPictures
}) => {
  return (
    <div className="space-y-8">
      <OfflineStatus className="mt-4" />
      
      {/* Offline images list */}
      <OfflineImagesList 
        storeId={storeId} 
        onSyncComplete={refetchPictures}
      />
      
      {/* Store pictures section */}
      <StorePicturesSection
        pictures={pictures}
        onUploadClick={onUploadClick}
        onCaptureClick={onCaptureClick}
        isProjectClosed={isProjectClosed}
        isConsultant={isConsultant}
        isBoss={isBoss}
      />
    </div>
  );
};

export default StoreContent;
