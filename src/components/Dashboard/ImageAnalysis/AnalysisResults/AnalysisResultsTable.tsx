
import React from "react";
import { AnalysisData } from "@/types";
import { Table, TableBody } from "@/components/ui/table";
import { prepareTableData, shouldShowPrePromo } from "./utils/tableUtils";
import { ProductRow } from "./components/ProductRow";
import { SummarySection } from "./components/SummarySection";
import { TableHeader } from "./components/TableHeader";

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
  const showPrePromo = shouldShowPrePromo(data);
  const { displayData, summaryItem } = prepareTableData(data);
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader showPrePromo={showPrePromo} />
        <TableBody>
          {displayData.map((item, index) => (
            <ProductRow 
              key={index}
              item={item}
              index={index}
              editMode={editMode}
              showPrePromo={showPrePromo}
              onInputChange={onInputChange}
            />
          ))}
        </TableBody>
      </Table>

      <SummarySection summaryItem={summaryItem} />
    </div>
  );
};
