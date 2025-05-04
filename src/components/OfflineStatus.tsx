
import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { Wifi, WifiOff, Upload } from 'lucide-react';

interface OfflineStatusProps {
  showSync?: boolean;
  className?: string;
}

const OfflineStatus: React.FC<OfflineStatusProps> = ({ showSync = true, className = "" }) => {
  const { isOnline, pendingUploads, syncOfflineImages } = useOfflineMode();
  
  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline && pendingUploads > 0) {
      syncOfflineImages();
    }
  }, [isOnline, pendingUploads, syncOfflineImages]);
  
  if (isOnline && pendingUploads === 0) {
    return null;
  }
  
  return (
    <div className={`flex items-center gap-2 rounded-md p-2 ${isOnline ? 'bg-amber-50 text-amber-800' : 'bg-red-50 text-red-800'} ${className}`}>
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm">
            {pendingUploads} pending {pendingUploads === 1 ? 'upload' : 'uploads'}
          </span>
          {showSync && pendingUploads > 0 && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-7 ml-auto"
              onClick={() => syncOfflineImages()}
            >
              <Upload className="h-3 w-3 mr-1" />
              Sync now
            </Button>
          )}
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm">
            You're offline. {pendingUploads > 0 ? `${pendingUploads} ${pendingUploads === 1 ? 'image' : 'images'} will sync when online.` : ''}
          </span>
        </>
      )}
    </div>
  );
};

export default OfflineStatus;
