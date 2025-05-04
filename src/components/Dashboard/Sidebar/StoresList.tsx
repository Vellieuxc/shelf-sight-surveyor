
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Store, ShoppingBag } from "lucide-react";
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Store as StoreType } from "@/types";

interface StoresListProps {
  activeStoreId?: string;
}

const StoresList: React.FC<StoresListProps> = ({ activeStoreId }) => {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("stores")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10);
          
        if (error) throw error;
        setStores(data || []);
      } catch (error) {
        console.error("Error fetching stores:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStores();
  }, []);
  
  const isStoreActive = (storeId: string) => {
    return activeStoreId === storeId;
  };

  return (
    <ScrollArea className="h-[200px]">
      <SidebarMenu>
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">No recent stores</div>
        ) : (
          stores.map((store) => (
            <SidebarMenuItem key={store.id}>
              <SidebarMenuButton asChild isActive={isStoreActive(store.id)}>
                <Link to={`/dashboard/stores/${store.id}`}>
                  {isStoreActive(store.id) ? <Store /> : <ShoppingBag />}
                  <span className="truncate">{store.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </ScrollArea>
  );
};

export default StoresList;
