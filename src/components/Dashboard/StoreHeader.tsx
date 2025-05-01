
import React from "react";
import { Store } from "@/types";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface StoreHeaderProps {
  store: Store;
  onSynthesizeStore: () => void;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ store, onSynthesizeStore }) => {
  return (
    <div className="mb-8">
      {store.store_image && (
        <div className="w-full h-48 mb-6 rounded-lg overflow-hidden">
          <img 
            src={store.store_image} 
            alt={`${store.name} store`} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <span className="mr-2">{store.type}</span>
            <span>•</span>
            <span className="ml-2">{store.address}</span>
          </div>
        </div>
        
        <Button onClick={onSynthesizeStore} className="whitespace-nowrap">
          <Sparkles className="mr-2 h-4 w-4" />
          Synthesize Data
        </Button>
      </div>
    </div>
  );
};

export default StoreHeader;
