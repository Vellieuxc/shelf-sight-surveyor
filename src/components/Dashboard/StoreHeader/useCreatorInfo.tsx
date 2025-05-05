
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
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'useCreatorInfo',
    operation: 'fetchCreator',
    silent: true // Don't show error toasts for this non-critical feature
  });
  
  useEffect(() => {
    // If no creatorId is provided, return early with a default value
    if (!creatorId) {
      setCreatorName("Unknown");
      setIsLoading(false);
      return;
    }
    
    const fetchCreator = async () => {
      setIsLoading(true);
      try {
        const { data, error: fetchError } = await supabase
          .from("profiles")
          .select("first_name, last_name, email")
          .eq("id", creatorId)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        if (data) {
          const profile = data as CreatorProfile;
          if (profile.first_name && profile.last_name) {
            setCreatorName(`${profile.first_name} ${profile.last_name}`);
          } else {
            setCreatorName(profile.email);
          }
        } else {
          // Display creator ID as shortened format when profile not found
          setCreatorName(`User ${creatorId.slice(0, 6)}...`);
        }
      } catch (error) {
        console.error("Creator info fetch error:", error);
        setError(error as Error);
        // Provide a fallback display name on error
        setCreatorName(`User ${creatorId.slice(0, 6)}...`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCreator();
  }, [creatorId]);
  
  return { creatorName, isLoading, error };
};
