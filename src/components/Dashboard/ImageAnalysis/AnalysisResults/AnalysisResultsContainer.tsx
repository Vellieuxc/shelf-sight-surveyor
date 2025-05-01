
import React, { useState, useEffect } from "react";
import { AnalysisData } from "@/types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, Edit, Check, X } from "lucide-react";
import { AnalysisResultsTable } from "./AnalysisResultsTable";
import { AnalysisLoadingState } from "./AnalysisLoadingState";
import { AnalysisEmptyState } from "./AnalysisEmptyState";

interface AnalysisResultsContainerProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisData: AnalysisData[] | null;
  onExportToExcel: () => void;
  onUpdateAnalysisData?: (updatedData: AnalysisData[]) => void;
}

export const AnalysisResultsContainer: React.FC<AnalysisResultsContainerProps> = ({
  isLoading,
  isAnalyzing,
  analysisData,
  onExportToExcel,
  onUpdateAnalysisData,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState<AnalysisData[] | null>(null);

  useEffect(() => {
    // When analysis data changes, update the editable copy
    if (analysisData) {
      setEditableData([...analysisData]);
    } else {
      setEditableData(null);
    }
  }, [analysisData]);

  const handleInputChange = (index: number, field: keyof AnalysisData, value: any) => {
    if (!editableData) return;
    
    const updatedData = [...editableData];
    
    // Handle numeric fields
    if (field === 'sku_count' || field === 'sku_price' || field === 'sku_price_pre_promotion' || 
        field === 'empty_space_estimate') {
      const numValue = value === '' ? undefined : Number(value);
      updatedData[index] = { ...updatedData[index], [field]: numValue };
    } else {
      // Handle string fields
      updatedData[index] = { ...updatedData[index], [field]: value };
    }
    
    setEditableData(updatedData);
  };

  const saveChanges = () => {
    if (editableData && onUpdateAnalysisData) {
      onUpdateAnalysisData(editableData);
    }
    setEditMode(false);
  };

  const cancelChanges = () => {
    // Reset to original data
    if (analysisData) {
      setEditableData([...analysisData]);
    }
    setEditMode(false);
  };

  return (
    <Card className="card-shadow">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Analysis Results</CardTitle>
        {analysisData && !isLoading && !isAnalyzing && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => editMode ? saveChanges() : setEditMode(true)}
          >
            {editMode ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save
              </>
            ) : (
              <>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </>
            )}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <AnalysisLoadingState message="Loading data..." />
        ) : isAnalyzing ? (
          <AnalysisLoadingState message="Analyzing shelf contents with AI..." />
        ) : editableData ? (
          <AnalysisResultsTable 
            data={editableData} 
            editMode={editMode} 
            onInputChange={handleInputChange}
          />
        ) : (
          <AnalysisEmptyState />
        )}
      </CardContent>
      {analysisData && !editMode && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onExportToExcel}
          >
            <FileSpreadsheet size={16} />
            Export to Excel
          </Button>
          
          {editMode && (
            <Button 
              variant="outline"
              className="flex items-center gap-2"
              onClick={cancelChanges}
            >
              <X size={16} />
              Cancel
            </Button>
          )}
        </CardFooter>
      )}
    </Card>
  );
};
