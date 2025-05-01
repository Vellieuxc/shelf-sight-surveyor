
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Store } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddStoreDialog from "./AddStoreDialog";
import StoreCard from "./StoreCard";
import StoreCardSkeleton from "./StoreCardSkeleton";
import EmptyStoresState from "./EmptyStoresState";
import { toast } from "sonner";

interface StoresListProps {
  projectId?: string;
  onStoreSelect?: (storeId: string) => void;
}

const StoresList: React.FC<StoresListProps> = ({ projectId: propProjectId, onStoreSelect }) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const projectId = propProjectId || paramProjectId;
  const { toast: hookToast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStoreDialog, setShowAddStoreDialog] = useState(false);
  
  const fetchStores = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setStores(data || []);
    } catch (error: any) {
      hookToast({
        title: "Error fetching stores",
        description: error.message || "Could not load stores. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchStores();
  }, [projectId]);
  
  const handleDeleteStore = async (storeId: string) => {
    if (!confirm("Are you sure you want to delete this store? This will delete all associated data.")) {
      return;
    }
    
    try {
      // First delete all pictures associated with the store
      const { error: picturesError } = await supabase
        .from("pictures")
        .delete()
        .eq("store_id", storeId);
      
      if (picturesError) throw picturesError;
      
      // Then delete the store
      const { error: storeError } = await supabase
        .from("stores")
        .delete()
        .eq("id", storeId);
      
      if (storeError) throw storeError;
      
      toast.success("Store deleted successfully");
      
      // Refresh the store list
      fetchStores();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete store. Please try again.");
    }
  };
  
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStoresList = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <StoreCardSkeleton key={n} />
          ))}
        </div>
      );
    }
    
    if (filteredStores.length === 0) {
      return (
        <EmptyStoresState onAddStore={() => setShowAddStoreDialog(true)} />
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStores.map((store) => (
          <StoreCard 
            key={store.id} 
            store={store} 
            onSelect={onStoreSelect}
            onDeleteStore={handleDeleteStore}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold">Stores</h2>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              className="pl-9"
              placeholder="Search stores..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="whitespace-nowrap" onClick={() => setShowAddStoreDialog(true)}>
            <Plus size={16} className="mr-2" />
            Add Store
          </Button>
        </div>
      </div>
      
      {renderStoresList()}
      
      <AddStoreDialog 
        open={showAddStoreDialog}
        onOpenChange={setShowAddStoreDialog}
        onStoreAdded={fetchStores}
      />
    </div>
  );
};

export default StoresList;
