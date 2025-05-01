
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MapPin } from "lucide-react";
import { Store } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AddStoreDialog from "./AddStoreDialog";

interface StoresListProps {
  projectId?: string;
  onStoreSelect?: (storeId: string) => void;
}

const StoresList: React.FC<StoresListProps> = ({ projectId: propProjectId, onStoreSelect }) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const projectId = propProjectId || paramProjectId;
  const { toast } = useToast();
  
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
      toast({
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
  
  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="card-shadow overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted animate-pulse mb-2 rounded-md" />
                <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
                  <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
                </div>
              </CardContent>
              <CardFooter>
                <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No stores found. Create one?</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setShowAddStoreDialog(true)}
          >
            <Plus size={16} className="mr-2" />
            Add New Store
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStores.map((store) => (
            <Card key={store.id} className="card-shadow overflow-hidden">
              {store.store_image && (
                <div className="h-40 overflow-hidden">
                  <img 
                    src={store.store_image} 
                    alt={store.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-lg">{store.name}</CardTitle>
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} className="shrink-0 mt-0.5" />
                  <span>{store.address}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-muted-foreground">Type:</span>
                    <span>{store.type}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pictures:</span>
                    <span>0</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => onStoreSelect && onStoreSelect(store.id)}
                >
                  View Store
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <AddStoreDialog 
        open={showAddStoreDialog}
        onOpenChange={setShowAddStoreDialog}
        onStoreAdded={fetchStores}
      />
    </div>
  );
};

export default StoresList;
