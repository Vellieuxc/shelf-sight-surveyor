
import React from "react";
import { Store } from "@/types";
import StoreCard from "../StoreCard";
import StoreCardSkeleton from "../StoreCardSkeleton";
import EmptyStoresState from "../EmptyStoresState";

interface StoresContentProps {
  loading: boolean;
  stores: Store[];
  onAddStore: () => void;
  onDeleteStore: (storeId: string) => void;
  onStoreSelect?: (storeId: string) => void;
  projectClosed: boolean;
}

const StoresContent: React.FC<StoresContentProps> = ({
  loading,
  stores,
  onAddStore,
  onDeleteStore,
  onStoreSelect,
  projectClosed
}) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {[1, 2, 3].map((n) => (
          <StoreCardSkeleton key={n} />
        ))}
      </div>
    );
  }
  
  if (stores.length === 0) {
    return (
      <EmptyStoresState onAddStore={onAddStore} />
    );
  }
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      {stores.map((store) => (
        <StoreCard 
          key={store.id} 
          store={store} 
          onSelect={onStoreSelect}
          onDeleteStore={onDeleteStore}
          projectClosed={projectClosed}
        />
      ))}
    </div>
  );
};

export default StoresContent;
