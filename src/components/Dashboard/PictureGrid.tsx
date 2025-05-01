
import React, { useState, useEffect } from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";
import { supabase } from "@/integrations/supabase/client";

interface PictureGridProps {
  pictures: Picture[];
  onDeletePicture: (id: string) => void;
  allowEditing?: boolean;
}

const PictureGrid: React.FC<PictureGridProps> = ({ pictures, onDeletePicture, allowEditing = true }) => {
  const [creatorMap, setCreatorMap] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchCreators = async () => {
      if (pictures.length === 0) return;
      
      // Get unique creator IDs
      const creatorIds = [...new Set(pictures.map(pic => pic.uploaded_by))];
      
      // Fetch creator information
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", creatorIds);
        
      if (error) {
        console.error("Error fetching creator information:", error);
        return;
      }
      
      // Create a map of creator IDs to names
      const creators: Record<string, string> = {};
      data?.forEach(profile => {
        if (profile.first_name && profile.last_name) {
          creators[profile.id] = `${profile.first_name} ${profile.last_name}`;
        } else {
          creators[profile.id] = profile.email;
        }
      });
      
      setCreatorMap(creators);
    };
    
    fetchCreators();
  }, [pictures]);

  if (pictures.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No pictures available</p>
        <p className="text-sm text-muted-foreground">Upload some pictures to analyze this store</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {pictures.map((picture) => (
        <PictureCard 
          key={picture.id} 
          picture={picture} 
          onDelete={() => onDeletePicture(picture.id)}
          allowDelete={allowEditing}
          createdByName={creatorMap[picture.uploaded_by]}
        />
      ))}
    </div>
  );
};

export default PictureGrid;
