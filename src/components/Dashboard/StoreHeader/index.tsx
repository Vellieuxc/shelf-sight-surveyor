
import React from "react";
import { format } from "date-fns";
import { Store } from "@/types";
import StoreImage from "./StoreImage";
import StoreInfo from "./StoreInfo";
import SynthesizeButton from "./SynthesizeButton";
import { useCreatorInfo } from "./useCreatorInfo";
import { useIsMobile } from "@/hooks/use-mobile";

interface StoreHeaderProps {
  store: Store;
  onSynthesizeStore: () => void;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ store, onSynthesizeStore }) => {
  const { creatorName } = useCreatorInfo(store.created_by);
  const creationDate = format(new Date(store.created_at), "PPP");
  const isMobile = useIsMobile();
  
  return (
    <div className="mb-4 sm:mb-8">
      <StoreImage 
        imageUrl={store.store_image} 
        storeName={store.name} 
      />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4">
        <StoreInfo 
          name={store.name}
          type={store.type}
          address={store.address}
          creationDate={creationDate}
          creatorName={creatorName}
        />
        
        <div className={isMobile ? 'w-full mt-2' : ''}>
          <SynthesizeButton onSynthesizeStore={onSynthesizeStore} className={isMobile ? 'w-full' : ''} />
        </div>
      </div>
    </div>
  );
};

export default StoreHeader;
