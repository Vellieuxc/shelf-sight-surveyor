import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useOfflineContext } from "@/contexts/offline";
import { OfflineImage } from "@/hooks/useOfflineMode";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { RefreshCw, Trash2, Upload } from "lucide-react";
import { formatDateToRelative } from "@/utils/formatters";

interface OfflineImagesListProps {
  storeId: string;
  onSyncComplete?: () => void;
}

const OfflineImagesList: React.FC<OfflineImagesListProps> = ({ 
  storeId, 
  onSyncComplete 
}) => {
  const { getPendingImages, syncOfflineImages, deleteOfflineImage, isOnline } = useOfflineContext();
  const [images, setImages] = useState<OfflineImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadImages();
  }, [storeId]);

  const loadImages = async () => {
    setLoading(true);
    const pendingImages = await getPendingImages(storeId);
    setImages(pendingImages.filter(img => !img.uploaded));
    setLoading(false);
  };

  const handleSync = async () => {
    if (!isOnline) return;
    
    setSyncing(true);
    try {
      await syncOfflineImages();
      await loadImages();
      if (onSyncComplete) onSyncComplete();
    } finally {
      setSyncing(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteOfflineImage(id);
    await loadImages();
  };

  if (loading) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        Loading offline images...
      </div>
    );
  }

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Offline Images ({images.length})</h3>
        {isOnline && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSync} 
            disabled={syncing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
            {syncing ? "Syncing..." : "Sync all"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map(image => (
          <Card key={image.id} className="overflow-hidden">
            <div className="aspect-square w-full bg-muted relative">
              <img 
                src={image.previewUrl} 
                alt="Offline store image" 
                className="w-full h-full object-cover"
              />
            </div>
            <CardContent className="p-3">
              <div className="text-sm text-muted-foreground">
                Captured {formatDateToRelative(new Date(image.timestamp))}
              </div>
            </CardContent>
            <CardFooter className="p-3 pt-0 flex justify-between">
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => handleDelete(image.id)}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
              {isOnline && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={async () => {
                    await syncOfflineImages();
                    await loadImages();
                  }}
                >
                  <Upload className="h-4 w-4 mr-1" />
                  Upload
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default OfflineImagesList;
