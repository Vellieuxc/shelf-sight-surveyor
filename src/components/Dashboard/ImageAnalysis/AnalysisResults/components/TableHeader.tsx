
import React from "react";
import { TableHead, TableHeader as UITableHeader, TableRow } from "@/components/ui/table";

interface TableHeaderProps {
  showPrePromo: boolean;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ showPrePromo }) => {
  return (
    <UITableHeader>
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
    </UITableHeader>
  );
};
