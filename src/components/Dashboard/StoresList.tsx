import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Store, Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddStoreDialog from "./AddStoreDialog";
import StoreCard from "./StoreCard";
import StoreCardSkeleton from "./StoreCardSkeleton";
import EmptyStoresState from "./EmptyStoresState";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface StoresListProps {
  projectId?: string;
  onStoreSelect?: (storeId: string) => void;
}

const StoresList: React.FC<StoresListProps> = ({ projectId: propProjectId, onStoreSelect }) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const projectId = propProjectId || paramProjectId;
  const { toast: hookToast } = useToast();
  const { profile } = useAuth();
  const isConsultant = profile?.role === "consultant";
  const isCrew = profile?.role === "crew";
  
  const [searchTerm, setSearchTerm] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddStoreDialog, setShowAddStoreDialog] = useState(false);
  
  const fetchProjectAndStores = async () => {
    if (!projectId) return;
    
    setLoading(true);
    try {
      // First fetch the project to check if it's closed
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single();
        
      if (projectError) throw projectError;
      setProject(projectData);
      
      // Then fetch the stores - for crew users, only fetch stores they created
      let storesQuery = supabase
        .from("stores")
        .select("*")
        .eq("project_id", projectId);
        
      // If user is crew, filter to only show their stores
      if (isCrew && profile) {
        storesQuery = storesQuery.eq("created_by", profile.id);
      }
      
      // Order by creation date (newest first)
      const { data, error } = await storesQuery.order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      setStores(data || []);
    } catch (error: any) {
      hookToast({
        title: "Error fetching data",
        description: error.message || "Could not load data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProjectAndStores();
  }, [projectId]);
  
  const handleDeleteStore = async (storeId: string) => {
    // Prevent deletion if project is closed and user is not a consultant
    if (project?.is_closed && !isConsultant) {
      toast.error("Cannot delete stores in a closed project");
      return;
    }
    
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
      fetchProjectAndStores();
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
            projectClosed={project?.is_closed || false}
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
          {(!project?.is_closed || isConsultant) && (
            <Button className="whitespace-nowrap" onClick={() => setShowAddStoreDialog(true)}>
              <Plus size={16} className="mr-2" />
              Add Store
            </Button>
          )}
        </div>
      </div>
      
      {project?.is_closed && !isConsultant && (
        <div className="bg-muted text-muted-foreground text-sm p-3 rounded-md">
          This project is currently closed. Contact a consultant to make changes.
        </div>
      )}
      
      {renderStoresList()}
      
      <AddStoreDialog 
        open={showAddStoreDialog}
        onOpenChange={setShowAddStoreDialog}
        onStoreAdded={fetchProjectAndStores}
      />
    </div>
  );
};

export default StoresList;
