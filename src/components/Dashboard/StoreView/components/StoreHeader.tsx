
import React from "react";
import { Store } from "@/types";
import StoreHeaderComponent from "../../StoreHeader";

interface StoreHeaderProps {
  store: Store;
  onSynthesizeStore: () => void;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ store, onSynthesizeStore }) => {
  return (
    <div className="mb-6">
      <StoreHeaderComponent 
        store={store} 
        onSynthesizeStore={onSynthesizeStore}
      />
    </div>
  );
};

export default StoreHeader;
