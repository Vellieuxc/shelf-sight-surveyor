
import { AnalysisData } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface AnalysisOptions {
  retryCount?: number;
  timeout?: number;
  includeConfidence?: boolean;
}

export async function analyzeShelfImage(
  imageUrl: string, 
  imageId: string, 
  options: AnalysisOptions = {}
): Promise<AnalysisData[]> {
  const { 
    retryCount = 3, 
    timeout = 60000,
    includeConfidence = true 
  } = options;
  
  // Add timeout logic
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error("Analysis timed out")), timeout);
  });
  
  // Add retry logic
  for (let attempt = 0; attempt < retryCount; attempt++) {
    try {
      const { data, error } = await Promise.race([
        supabase.functions.invoke('analyze-shelf-image', {
          body: {
            imageUrl,
            imageId,
            includeConfidence
          }
        }),
        timeoutPromise
      ]);
      
      if (error) throw error;
      
      if (data?.success && data.data) {
        return data.data;
      }
      
      throw new Error("Invalid response format from analysis function");
    } catch (error) {
      console.error(`Analysis attempt ${attempt + 1} failed:`, error);
      
      if (attempt < retryCount - 1) {
        toast(`Analysis attempt ${attempt + 1} failed, retrying...`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 2000));
      } else {
        // Last attempt failed, throw error
        throw error;
      }
    }
  }
  
  // This should never be reached due to the throw in the loop
  throw new Error("All analysis attempts failed");
}
