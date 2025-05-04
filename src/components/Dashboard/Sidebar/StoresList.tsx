
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

interface StoresListProps {
  activeStoreId?: string;
}

const StoresList: React.FC<StoresListProps> = ({ activeStoreId }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [stores, setStores] = useState<StoreType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        
        if (!projectId) {
          // If no project context, just show recent stores (limited)
          const { data, error } = await supabase
            .from("stores")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(10);
            
          if (error) throw error;
          setStores(data || []);
        } else {
          // If we're in a project context, only show stores for this project
          console.log("Fetching stores for project:", projectId);
          const { data, error } = await supabase
            .from("stores")
            .select("*")
            .eq("project_id", projectId)
            .order("created_at", { ascending: false });
            
          if (error) throw error;
          console.log("Stores fetched:", data);
          setStores(data || []);
        }
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

  return (
    <ScrollArea className="h-[200px]">
      <SidebarMenu>
        {isLoading ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">Loading stores...</div>
        ) : stores.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            {projectId ? "No stores in this project" : "No recent stores"}
          </div>
        ) : (
          stores.map((store) => (
            <SidebarMenuItem key={store.id}>
              <SidebarMenuButton asChild isActive={isStoreActive(store.id)}>
                <Link to={`/dashboard/stores/${store.id}`}>
                  {isStoreActive(store.id) ? <Store size={18} /> : <ShoppingBag size={18} />}
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
