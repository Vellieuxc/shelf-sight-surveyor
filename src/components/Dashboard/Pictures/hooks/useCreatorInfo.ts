
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandling } from "@/hooks/use-error-handling";

interface UseCreatorInfoProps {
  uploadedBy: string | undefined;
  createdByName?: string;
}

export const useCreatorInfo = ({ uploadedBy, createdByName }: UseCreatorInfoProps) => {
  const [creator, setCreator] = useState<string>(createdByName || "");
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'useCreatorInfo',
    operation: 'fetchCreator',
    silent: true // Don't show error toasts for this non-critical feature
  });

  useEffect(() => {
    // Only fetch the creator if it wasn't provided as prop and there's an uploaded_by value
    if (!createdByName && uploadedBy) {
      const fetchCreator = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("first_name, last_name, email")
            .eq("id", uploadedBy)
            .maybeSingle();
            
          if (error) throw error;
          
          if (data) {
            if (data.first_name && data.last_name) {
              setCreator(`${data.first_name} ${data.last_name}`);
            } else if (data.email) {
              setCreator(data.email);
            } else {
              // Fallback if profile exists but has no name or email
              setCreator(`User ${uploadedBy.slice(0, 6)}...`);
            }
          } else {
            // Display uploader ID as shortened format when profile not found
            setCreator(`User ${uploadedBy.slice(0, 6)}...`);
          }
        } catch (error) {
          console.error("Error fetching creator:", error);
          
          // Provide a fallback display name on error
          setCreator(`User ${uploadedBy.slice(0, 6)}...`);
        }
      };
      
      fetchCreator();
    } else if (!createdByName && !uploadedBy) {
      // If no uploaded_by field is available
      setCreator("Unknown");
    }
  }, [uploadedBy, createdByName, handleError]);

  return { creator };
};
