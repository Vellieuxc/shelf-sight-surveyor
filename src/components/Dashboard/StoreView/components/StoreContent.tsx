
import React, { useRef } from "react";
import { Store, Picture } from "@/types";
import { StorePicturesSection } from "../../Pictures";
import StoreSummary from "../StoreSummary";
import { useIsMobile } from "@/hooks/use-mobile";

interface StoreContentProps {
  store: Store;
  pictures: Picture[];
  isProjectClosed: boolean;
  canViewSummary: boolean;
  isConsultant: boolean;
  isBoss: boolean;
  onUploadClick: () => void;
  onCaptureClick: () => void;
}

const StoreContent: React.FC<StoreContentProps> = ({
  store,
  pictures,
  isProjectClosed,
  canViewSummary,
  isConsultant,
  isBoss,
  onUploadClick,
  onCaptureClick,
}) => {
  const summaryRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
      <div className="lg:col-span-2">
        <StorePicturesSection 
          pictures={pictures}
          onUploadClick={onUploadClick}
          onCaptureClick={onCaptureClick}
          isProjectClosed={isProjectClosed}
          isConsultant={isConsultant}
          isBoss={isBoss}
        />
      </div>

      {canViewSummary && (
        <div className={`${isMobile ? 'mt-6' : ''}`} ref={summaryRef}>
          <StoreSummary store={store} />
        </div>
      )}
    </div>
  );
};

export default StoreContent;
