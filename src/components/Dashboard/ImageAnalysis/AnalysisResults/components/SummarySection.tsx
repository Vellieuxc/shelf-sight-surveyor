
import React from "react";
import { AnalysisData } from "@/types";

interface SummarySectionProps {
  summaryItem: AnalysisData | undefined;
}

export const SummarySection: React.FC<SummarySectionProps> = ({ summaryItem }) => {
  if (!summaryItem) return null;
  
  return (
    <div className="mt-4 p-4 border rounded-md bg-slate-50 dark:bg-slate-800">
      <h4 className="font-medium mb-2">Summary</h4>
      <div className="grid grid-cols-2 gap-4">
        {summaryItem.total_sku_facings !== undefined && (
          <div>
            <span className="text-muted-foreground">Total SKU Facings:</span>{" "}
            <span className="font-medium">{summaryItem.total_sku_facings}</span>
          </div>
        )}
        {summaryItem.quality_picture && (
          <div>
            <span className="text-muted-foreground">Image Quality:</span>{" "}
            <span className="font-medium">{summaryItem.quality_picture}</span>
          </div>
        )}
      </div>
    </div>
  );
};
