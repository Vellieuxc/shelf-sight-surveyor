
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Store, Project } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddStoreDialog from "../AddStoreDialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth";
import StoresHeader from "./StoresHeader";
import ProjectStatusBanner from "./ProjectStatusBanner";
import StoresContent from "./StoresContent";

interface StoresListProps {
  projectId?: string;
  onStoreSelect?: (storeId: string) => void;
}

const StoresList: React.FC<StoresListProps> = ({ projectId: propProjectId, onStoreSelect }) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const projectId = propProjectId || paramProjectId;
  const { toast: hookToast } = useToast();
  const { profile } = useAuth();
  
  // Role-based permissions
  const isConsultant = profile?.role === "consultant";
  const isCrew = profile?.role === "crew";
  const isBoss = profile?.role === "boss";
  
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
        
      // If user is crew and not boss, filter to only show their stores
      if (isCrew && !isBoss && profile) {
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
  }, [projectId, profile]);
  
  const handleDeleteStore = async (storeId: string) => {
    // Prevent deletion if project is closed and user is not a consultant or boss
    if (project?.is_closed && !isConsultant && !isBoss) {
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
  
  const canAddStores = !project?.is_closed || isConsultant || isBoss;

  return (
    <div className="space-y-6">
      <StoresHeader 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onAddStore={() => setShowAddStoreDialog(true)}
        showAddButton={canAddStores}
      />
      
      <ProjectStatusBanner 
        isProjectClosed={!!project?.is_closed} 
        isConsultant={!!isConsultant} 
        isBoss={!!isBoss}
      />
      
      <StoresContent 
        loading={loading}
        stores={filteredStores}
        onAddStore={() => setShowAddStoreDialog(true)}
        onDeleteStore={handleDeleteStore}
        onStoreSelect={onStoreSelect}
        projectClosed={!!project?.is_closed}
      />
      
      <AddStoreDialog 
        open={showAddStoreDialog}
        onOpenChange={setShowAddStoreDialog}
        onStoreAdded={fetchProjectAndStores}
      />
    </div>
  );
};

export default StoresList;
