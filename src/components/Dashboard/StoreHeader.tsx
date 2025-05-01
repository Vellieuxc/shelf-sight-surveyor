
import React from "react";
import { Button } from "@/components/ui/button";
import { Store } from "@/types";
import { useNavigate } from "react-router-dom";
import { LayoutDashboard, Image } from "lucide-react";

interface StoreHeaderProps {
  store: Store;
  onSynthesizeStore: () => void;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ store, onSynthesizeStore }) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold">{store.name}</h1>
        <p className="text-muted-foreground">{store.address}, {store.country}</p>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline"
          onClick={() => navigate(`/dashboard/projects/${store.project_id}/stores`)}
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Back to Stores
        </Button>
        <Button onClick={onSynthesizeStore}>
          <Image className="mr-2 h-4 w-4" />
          Synthesize Store
        </Button>
      </div>
    </div>
  );
};

export default StoreHeader;
