
import { AnalysisData } from "@/types";
import { Json } from "@/integrations/supabase/types";
import { ensureAnalysisDataType } from "@/services/analysis/transformers";

/**
 * Transform raw JSON data to properly typed analysis data
 * @param data Raw JSON data from database
 * @returns Properly typed analysis data
 */
export function transformAnalysisData(data: Json[]): AnalysisData[] {
  return ensureAnalysisDataType(data as any[]);
}
