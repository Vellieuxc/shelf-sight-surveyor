
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandling } from "@/hooks/use-error-handling";

interface CreatorProfile {
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export const useCreatorInfo = (creatorId: string) => {
  const [creatorName, setCreatorName] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'useCreatorInfo',
    operation: 'fetchCreator'
  });
  
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
          const profile = data as CreatorProfile;
          if (profile.first_name && profile.last_name) {
            setCreatorName(`${profile.first_name} ${profile.last_name}`);
          } else {
            setCreatorName(profile.email);
          }
        } else {
          // Display creator ID as email-like format when profile not found
          setCreatorName(`${creatorId}@user.id`);
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: "Failed to fetch creator information",
          silent: true, // Don't show toast for this non-critical error
          additionalData: { creatorId }
        });
        // Display creator ID as email-like format on error
        setCreatorName(`${creatorId}@user.id`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCreator();
  }, [creatorId, handleError]);
  
  return { creatorName, isLoading };
};
