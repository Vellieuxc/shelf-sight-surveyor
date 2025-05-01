
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import { Store } from "@/types";

interface StoreCardProps {
  store: Store;
  onSelect?: (storeId: string) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onSelect }) => {
  return (
    <Card className="card-shadow overflow-hidden">
      {store.store_image && (
        <div className="h-40 overflow-hidden">
          <img 
            src={store.store_image} 
            alt={store.name} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-lg">{store.name}</CardTitle>
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin size={16} className="shrink-0 mt-0.5" />
          <span>{store.address}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-sm">
          <div className="flex items-center justify-between mb-1">
            <span className="text-muted-foreground">Type:</span>
            <span>{store.type}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Pictures:</span>
            <span>0</span>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => onSelect && onSelect(store.id)}
        >
          View Store
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StoreCard;
