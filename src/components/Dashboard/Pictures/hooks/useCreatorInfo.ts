
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
            // Always use email as requested
            setCreator(data.email);
          } else {
            // Display uploader ID when profile not found
            setCreator(`User ID: ${uploadedBy}`);
          }
        } catch (error) {
          console.error("Error fetching creator:", error);
          
          // Provide a fallback display name on error
          setCreator(`User ID: ${uploadedBy}`);
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
