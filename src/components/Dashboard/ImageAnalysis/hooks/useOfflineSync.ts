
import { useEffect } from "react";
import { useOfflineMode } from "@/hooks/useOfflineMode";

interface UseOfflineSyncProps {
  isOnline: boolean;
  pendingUploads: number;
  syncOfflineImages: () => Promise<void>;
  refetchPictures: () => void;
}

/**
 * Hook to manage offline synchronization for images
 */
export const useOfflineSync = ({
  isOnline,
  pendingUploads,
  syncOfflineImages,
  refetchPictures
}: UseOfflineSyncProps) => {
  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && pendingUploads > 0) {
      // Convert the Promise<number> to Promise<void> by ignoring the return value
      syncOfflineImages().then(() => {
        refetchPictures();
      });
    }
  }, [isOnline, pendingUploads, syncOfflineImages, refetchPictures]);
};
