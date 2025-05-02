
import React from "react";
import { AnalysisData } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/utils/formatters";

interface AnalysisResultsTableProps {
  data: AnalysisData[];
  editMode: boolean;
  onInputChange: (index: number, field: keyof AnalysisData, value: any) => void;
}

export const AnalysisResultsTable: React.FC<AnalysisResultsTableProps> = ({ 
  data, 
  editMode, 
  onInputChange 
}) => {
  const showPrePromo = data.some(item => item.sku_price_pre_promotion);
  
  // Sort data to put empty spaces at the end
  const sortedData = [...data].sort((a, b) => {
    // Move summary items (not products) to the end
    if (a.total_sku_facings || a.quality_picture) return 1;
    if (b.total_sku_facings || b.quality_picture) return -1;

    // Move empty spaces to the end, but before summary items
    if (a.empty_space_estimate && !b.empty_space_estimate) return 1;
    if (!a.empty_space_estimate && b.empty_space_estimate) return -1;
    
    return 0;
  });

  // Extract summary fields if they exist
  const summaryItem = sortedData.find(item => item.total_sku_facings || item.quality_picture);
  
  // Remove summary item from display data if it exists
  const displayData = summaryItem ? sortedData.filter(item => item !== summaryItem) : sortedData;
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU Name</TableHead>
            <TableHead>Brand</TableHead>
            <TableHead>Count</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Position</TableHead>
            {showPrePromo && (
              <TableHead>Pre-Promo</TableHead>
            )}
            <TableHead>Confidence</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayData.map((item, index) => (
            <TableRow key={index} className={item.empty_space_estimate ? "bg-muted/30" : ""}>
              <TableCell>
                {editMode ? (
                  <Input 
                    value={item.sku_name} 
                    onChange={(e) => onInputChange(index, 'sku_name', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  item.sku_name
                )}
              </TableCell>
              <TableCell>
                {editMode ? (
                  <Input 
                    value={item.brand || ''} 
                    onChange={(e) => onInputChange(index, 'brand', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  item.brand || "-"
                )}
              </TableCell>
              <TableCell>
                {editMode ? (
                  item.empty_space_estimate !== undefined ? (
                    <Input 
                      type="number"
                      value={item.empty_space_estimate} 
                      onChange={(e) => onInputChange(index, 'empty_space_estimate', e.target.value)}
                      className="w-20"
                      min="0"
                      max="100"
                    />
                  ) : (
                    <Input 
                      type="number"
                      value={item.sku_count || ''} 
                      onChange={(e) => onInputChange(index, 'sku_count', e.target.value)}
                      className="w-20"
                      min="0"
                    />
                  )
                ) : (
                  item.empty_space_estimate 
                    ? `${item.empty_space_estimate}% empty` 
                    : item.sku_count
                )}
              </TableCell>
              <TableCell>
                {editMode ? (
                  item.empty_space_estimate === undefined ? (
                    <Input 
                      type="number"
                      value={item.sku_price || ''} 
                      onChange={(e) => onInputChange(index, 'sku_price', e.target.value)}
                      className="w-24"
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    "-"
                  )
                ) : (
                  item.empty_space_estimate 
                    ? "-" 
                    : formatPrice(item.sku_price)
                )}
              </TableCell>
              <TableCell>
                {editMode ? (
                  <Input 
                    value={item.sku_position || ''} 
                    onChange={(e) => onInputChange(index, 'sku_position', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  item.sku_position || "-"
                )}
              </TableCell>
              {showPrePromo && (
                <TableCell>
                  {editMode ? (
                    item.empty_space_estimate === undefined ? (
                      <Input 
                        type="number"
                        value={item.sku_price_pre_promotion || ''} 
                        onChange={(e) => onInputChange(index, 'sku_price_pre_promotion', e.target.value)}
                        className="w-24"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      "-"
                    )
                  ) : (
                    item.sku_price_pre_promotion 
                      ? formatPrice(item.sku_price_pre_promotion) 
                      : "-"
                  )}
                </TableCell>
              )}
              <TableCell>
                {editMode ? (
                  item.empty_space_estimate === undefined ? (
                    <Input 
                      value={item.sku_confidence || ''} 
                      onChange={(e) => onInputChange(index, 'sku_confidence', e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    "-"
                  )
                ) : (
                  item.sku_confidence || "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Display summary information if available */}
      {summaryItem && (
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
      )}
    </div>
  );
};
