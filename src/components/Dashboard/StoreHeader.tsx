
import React, { useState, useEffect } from "react";
import { Store } from "@/types";
import { Button } from "@/components/ui/button";
import { Sparkles, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface StoreHeaderProps {
  store: Store;
  onSynthesizeStore: () => void;
}

const StoreHeader: React.FC<StoreHeaderProps> = ({ store, onSynthesizeStore }) => {
  const [creatorName, setCreatorName] = useState<string>("");
  
  useEffect(() => {
    const fetchCreator = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", store.created_by)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          if (data.first_name && data.last_name) {
            setCreatorName(`${data.first_name} ${data.last_name}`);
          } else {
            setCreatorName(data.email);
          }
        } else {
          // Display creator ID as email-like format when profile not found
          setCreatorName(`${store.created_by}@user.id`);
        }
      } catch (error) {
        console.error("Error fetching store creator:", error);
        // Display creator ID as email-like format on error
        setCreatorName(`${store.created_by}@user.id`);
      }
    };
    
    fetchCreator();
  }, [store.created_by]);
  
  const creationDate = format(new Date(store.created_at), "PPP");
  
  return (
    <div className="mb-8">
      {store.store_image && (
        <div className="w-full h-48 mb-6 rounded-lg overflow-hidden">
          <img 
            src={store.store_image} 
            alt={`${store.name} store`} 
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <div className="flex items-center text-sm text-muted-foreground mt-1">
            <span className="mr-2">{store.type}</span>
            <span>•</span>
            <span className="ml-2">{store.address}</span>
          </div>
          
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground mt-2">
            <div className="flex items-center gap-1">
              <Calendar size={12} />
              <span>Created on {creationDate}</span>
            </div>
            {creatorName && (
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>Created by {creatorName}</span>
              </div>
            )}
          </div>
        </div>
        
        <Button onClick={onSynthesizeStore} className="whitespace-nowrap">
          <Sparkles className="mr-2 h-4 w-4" />
          Synthesize Data
        </Button>
      </div>
    </div>
  );
};

export default StoreHeader;
