
import React from "react";
import { useNavigate } from "react-router-dom";
import { Store } from "@/types";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Store as StoreIcon, MapPin, Trash } from "lucide-react";
import { useAuth } from "@/contexts/auth";

interface StoreCardProps {
  store: Store;
  onSelect?: (storeId: string) => void;
  onDeleteStore?: (storeId: string) => void;
  projectClosed?: boolean;
}

const StoreCard: React.FC<StoreCardProps> = ({ 
  store, 
  onSelect, 
  onDeleteStore,
  projectClosed = false
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isConsultant = profile?.role === "consultant";
  const canEditStore = !projectClosed || isConsultant;
  
  const handleStoreClick = () => {
    if (onSelect) {
      onSelect(store.id);
    } else {
      navigate(`/dashboard/stores/${store.id}`);
    }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDeleteStore) {
      onDeleteStore(store.id);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col" onClick={handleStoreClick}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-lg truncate">{store.name}</h3>
            <p className="text-muted-foreground text-sm truncate">{store.address}</p>
          </div>
          <Badge className="whitespace-nowrap">{store.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-0 flex-1">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <span className="text-muted-foreground truncate">{store.country}</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <StoreIcon className="h-3.5 w-3.5" />
          <span className="hidden xs:inline">View Details</span>
        </Button>
        {canEditStore && onDeleteStore && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleDeleteClick}
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash className="h-3.5 w-3.5" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default StoreCard;
