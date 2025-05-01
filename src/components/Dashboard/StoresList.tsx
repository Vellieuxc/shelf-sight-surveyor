
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, MapPin } from "lucide-react";
import { Store } from "@/types";

// Dummy data for stores
const dummyStores: Store[] = [
  {
    id: "1",
    project_id: "1",
    type: "Supermarket",
    name: "Fresh Mart",
    address: "123 Main St, Boston, MA",
    country: "United States",
    google_map_pin: "https://goo.gl/maps/example1",
    store_image: "https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=300&h=200",
  },
  {
    id: "2",
    project_id: "1",
    type: "Convenience",
    name: "Quick Stop",
    address: "456 Oak Ave, Cambridge, MA",
    country: "United States",
    google_map_pin: "https://goo.gl/maps/example2",
  },
];

interface StoresListProps {
  projectId?: string;
  onStoreSelect?: (storeId: string) => void;
}

const StoresList: React.FC<StoresListProps> = ({ projectId, onStoreSelect }) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredStores = dummyStores.filter(store => 
    store.project_id === projectId && 
    (store.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     store.address.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <Button className="whitespace-nowrap">
            <Plus size={16} className="mr-2" />
            Add Store
          </Button>
        </div>
      </div>
      
      {filteredStores.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No stores found. Create one?</p>
          <Button variant="outline" className="mt-4">
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
    </div>
  );
};

export default StoresList;
