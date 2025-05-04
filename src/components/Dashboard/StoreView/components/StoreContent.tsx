
import React, { useState } from "react";
import { Picture, Store } from "@/types";
import StorePicturesSection from "../../StorePicturesSection";
import StoreSummary from "../StoreSummary";
import { useAuth } from "@/contexts/auth";

interface StoreContentProps {
  store: Store;
  pictures: Picture[];
  storeId: string;
  isLoading?: boolean;
  isProjectClosed: boolean;
  isConsultant: boolean;
  isBoss: boolean;
  onUploadClick: () => void;
  onCaptureClick: () => void;
  refetchPictures: () => Promise<unknown>;
}

const StoreContent: React.FC<StoreContentProps> = ({
  store,
  pictures,
  storeId,
  isLoading = false,
  isProjectClosed,
  isConsultant,
  isBoss,
  onUploadClick,
  onCaptureClick,
  refetchPictures
}) => {
  const { profile } = useAuth();
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2">
        <StorePicturesSection
          pictures={pictures}
          isLoading={isLoading}
          onUploadClick={onUploadClick}
          onCaptureClick={onCaptureClick}
          isProjectClosed={isProjectClosed}
          isConsultant={isConsultant}
          isBoss={isBoss}
        />
      </div>
      <div>
        <StoreSummary store={store} />
      </div>
    </div>
  );
};

export default StoreContent;
