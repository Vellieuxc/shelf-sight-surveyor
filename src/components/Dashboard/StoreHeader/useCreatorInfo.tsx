
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
    operation: 'fetchCreator'
  });
  
  useEffect(() => {
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
          // Display creator ID as email-like format when profile not found
          setCreatorName(`${creatorId.slice(0, 6)}...`);
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: "Failed to fetch creator information",
          silent: true, // Don't show toast for this non-critical error
          additionalData: { creatorId }
        });
        
        setError(error as Error);
        // Provide a fallback display value
        setCreatorName(`User ${creatorId.slice(0, 6)}...`);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCreator();
  }, [creatorId, handleError]);
  
  return { creatorName, isLoading, error };
};
