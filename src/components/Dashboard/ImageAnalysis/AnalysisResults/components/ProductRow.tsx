
import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AnalysisData } from "@/types";
import { formatPrice } from "@/utils/formatters";

interface ProductRowProps {
  item: AnalysisData;
  index: number;
  editMode: boolean;
  showPrePromo: boolean;
  onInputChange: (index: number, field: keyof AnalysisData, value: any) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({ 
  item, 
  index, 
  editMode, 
  showPrePromo,
  onInputChange 
}) => {
  const isEmptySpace = item.empty_space_estimate !== undefined;

  return (
    <TableRow className={isEmptySpace ? "bg-muted/30" : ""}>
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
          isEmptySpace ? (
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
          isEmptySpace 
            ? `${item.empty_space_estimate}% empty` 
            : item.sku_count
        )}
      </TableCell>
      <TableCell>
        {editMode ? (
          !isEmptySpace ? (
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
          isEmptySpace 
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
            !isEmptySpace ? (
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
          !isEmptySpace ? (
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
  );
};
