
import React from "react";
import { Picture, Store } from "@/types";
import { useStoreData } from "./hooks/useStoreData";

interface StoreDataFetcherProps {
  storeId: string;
  onError?: (message: string) => void;
  onLoading?: (loading: boolean) => void;
  children: (data: StoreDataProps) => React.ReactNode;
}

interface StoreDataProps {
  store: Store | null;
  pictures: Picture[];
  isLoading: boolean;
  isProjectClosed: boolean;
}

const StoreDataFetcher: React.FC<StoreDataFetcherProps> = ({ 
  storeId, 
  children,
  onError,
  onLoading
}) => {
  const { store, pictures, isLoading, isProjectClosed } = useStoreData({
    storeId,
    onError,
    onLoading
  });

  return <>{children({ store, pictures, isLoading, isProjectClosed })}</>;
};

export default StoreDataFetcher;
