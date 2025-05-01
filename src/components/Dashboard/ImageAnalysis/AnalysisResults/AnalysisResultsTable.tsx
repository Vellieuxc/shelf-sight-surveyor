
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => (
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
                    value={item.brand} 
                    onChange={(e) => onInputChange(index, 'brand', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  item.brand
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
                      value={item.sku_count} 
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
