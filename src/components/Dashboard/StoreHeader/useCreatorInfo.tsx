
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCreatorInfo = (creatorId: string) => {
  const [creatorName, setCreatorName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const fetchCreator = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", creatorId)
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
          setCreatorName(`${creatorId}@user.id`);
        }
      } catch (error) {
        console.error("Error fetching store creator:", error);
        // Display creator ID as email-like format on error
        setCreatorName(`${creatorId}@user.id`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCreator();
  }, [creatorId]);
  
  return { creatorName, isLoading };
};
