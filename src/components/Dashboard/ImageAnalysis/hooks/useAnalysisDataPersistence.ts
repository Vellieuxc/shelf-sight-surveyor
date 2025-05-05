
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisData } from "@/types";
import { useErrorHandling } from "@/hooks";

interface UseAnalysisDataPersistenceProps {
  pictureId: string | null;
  setPictureAnalysisData?: (data: AnalysisData[] | null) => void;
}

/**
 * Hook for managing analysis data persistence to database
 */
export const useAnalysisDataPersistence = ({
  pictureId,
  setPictureAnalysisData
}: UseAnalysisDataPersistenceProps) => {
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'ui',
    componentName: 'AnalysisDataPersistence',
    operation: 'saveAnalysisData'
  });

  const saveAnalysisData = async (data: AnalysisData[]) => {
    // If we're working with an existing picture, update its analysis data
    if (pictureId) {
      console.log("Analysis complete for existing picture. Updating state and saving to DB.");
      if (setPictureAnalysisData) {
        setPictureAnalysisData(data);
      }
      
      // Save the analysis data to the database
      try {
        console.log("Saving analysis data to database for picture:", pictureId);
        const { error } = await supabase
          .from('pictures')
          .update({ analysis_data: data })
          .eq('id', pictureId);
          
        if (error) {
          throw error;
        }
        
        console.log("Analysis data saved successfully");
        toast({
          title: "Analysis Saved",
          description: "Analysis data has been saved to the database."
        });
        
        return true;
      } catch (err) {
        handleError(err, {
          title: "Save Error",
          description: "Failed to save analysis data to database."
        });
        return false;
      }
    } else {
      console.log("Analysis complete for uploaded image");
      return true;
    }
  };

  const updateAnalysisData = async (updatedData: AnalysisData[]) => {
    // Update in database if we have a pictureId
    if (pictureId) {
      try {
        const { error } = await supabase
          .from('pictures')
          .update({ analysis_data: updatedData })
          .eq('id', pictureId);
            
        if (error) throw error;
            
        toast({
          title: "Data Updated",
          description: "Analysis data has been updated and saved successfully."
        });
        
        return true;
      } catch (err) {
        handleError(err, {
          title: "Update Failed",
          description: "Failed to save analysis data to database.",
          variant: "destructive"
        });
        return false;
      }
    } else {
      toast({
        title: "Data Updated",
        description: "Analysis data has been updated successfully."
      });
      return true;
    }
  };

  return {
    saveAnalysisData,
    updateAnalysisData
  };
};
