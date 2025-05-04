
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Store, ShoppingBag } from "lucide-react";
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton 
} from "@/components/ui/sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Store as StoreType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

interface StoresListProps {
  projectId: string;
  activeStoreId?: string;
}

const StoresList: React.FC<StoresListProps> = ({ projectId, activeStoreId }) => {
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchStores = async () => {
      if (!projectId) {
        setStores([]);
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log("Fetching stores for project:", projectId);
        
        const { data, error } = await supabase
          .from("stores")
          .select("*")
          .eq("project_id", projectId)
          .order("created_at", { ascending: false });
          
        if (error) throw error;
        console.log("Stores fetched:", data);
        setStores(data || []);
      } catch (error: any) {
        console.error("Error fetching stores:", error);
        toast({
          title: "Error loading stores",
          description: error.message || "Could not load stores",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStores();
  }, [projectId, toast]);
  
  const isStoreActive = (storeId: string) => {
    return activeStoreId === storeId;
  };

  if (!projectId) {
    return null;
  }

  // Determine the max height based on the device
  const maxHeight = isMobile ? "150px" : "calc(50vh - 100px)";

  return (
    <ScrollArea className={`h-auto max-h-[${maxHeight}]`} style={{ maxHeight }}>
      <SidebarMenu>
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            No stores in this project
          </div>
        ) : (
          stores.map((store) => (
            <SidebarMenuItem key={store.id}>
              <SidebarMenuButton asChild isActive={isStoreActive(store.id)}>
                <Link to={`/dashboard/stores/${store.id}`} className="flex items-center truncate w-full">
                  {isStoreActive(store.id) ? <Store size={18} /> : <ShoppingBag size={18} />}
                  <span className="truncate ml-2">{store.name}</span>
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
