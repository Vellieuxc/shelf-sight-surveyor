
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store } from "@/types";
import { Eye, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

interface StoreCardProps {
  store: Store;
  onDeleteStore?: (storeId: string) => void;
  onSelect?: (storeId: string) => void;
}

const StoreCard: React.FC<StoreCardProps> = ({ store, onDeleteStore, onSelect }) => {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="truncate">{store.name}</CardTitle>
        <CardDescription className="truncate">{store.type}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-sm">
          <p className="truncate">{store.address}</p>
          <p>{store.country}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {onDeleteStore && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDeleteStore(store.id)}
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
        <Button 
          variant="outline" 
          size="sm" 
          asChild
          onClick={onSelect ? () => onSelect(store.id) : undefined}
        >
          <Link to={`/dashboard/stores/${store.id}`}>
            <Eye className="mr-2 h-4 w-4" />
            View Store
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StoreCard;
