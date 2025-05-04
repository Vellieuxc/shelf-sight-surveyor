
import React from "react";
import { Store } from "@/types";
import StoreHeader from "../../StoreHeader";
import StoreActions from "../StoreActions";

interface StoreControlsProps {
  store: Store;
  isProjectClosed: boolean;
  onSynthesizeStore: () => void;
  onUploadClick?: () => void;
  onCaptureClick?: () => void;
}

const StoreControls: React.FC<StoreControlsProps> = ({
  store,
  isProjectClosed,
  onSynthesizeStore,
  onUploadClick,
  onCaptureClick
}) => {
  return (
    <>
      <div className="mb-6">
        <StoreHeader 
          store={store}
          onSynthesizeStore={onSynthesizeStore}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <StoreActions 
          storeId={store.id}
          isProjectClosed={isProjectClosed}
          onUploadClick={onUploadClick}
          onCaptureClick={onCaptureClick}
        />
      </div>
    </>
  );
};

export default StoreControls;
