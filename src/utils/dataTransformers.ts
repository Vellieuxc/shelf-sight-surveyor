
import { Json } from "@/integrations/supabase/types";

/**
 * Transform raw JSON data to properly typed analysis data
 * preserving the original format without any transformation
 * @param data Raw JSON data from database
 * @returns The original data without transformation
 */
export function transformAnalysisData(data: Json[]): any {
  // Return the raw data without transformation
  return data;
}
