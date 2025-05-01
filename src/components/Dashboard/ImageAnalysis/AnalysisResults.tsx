
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet, Edit, Check, X } from "lucide-react";
import { AnalysisData } from "@/types";
import { Input } from "@/components/ui/input";

interface AnalysisResultsProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisData: AnalysisData[] | null;
  onExportToExcel: () => void;
  onUpdateAnalysisData?: (updatedData: AnalysisData[]) => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  isLoading,
  isAnalyzing,
  analysisData,
  onExportToExcel,
  onUpdateAnalysisData,
}) => {
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState<AnalysisData[] | null>(null);

  // Helper function to safely format price values
  const formatPrice = (price: any): string => {
    // Check if price is a valid number
    if (typeof price === 'number' && !isNaN(price)) {
      return `$${price.toFixed(2)}`;
    }
    return "-";
  };

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
          <div className="flex flex-col items-center justify-center h-60">
            <div className="animate-pulse text-muted-foreground">
              Loading data...
            </div>
          </div>
        ) : isAnalyzing ? (
          <div className="flex flex-col items-center justify-center h-60">
            <div className="animate-pulse text-muted-foreground">
              Analyzing shelf contents with AI...
            </div>
          </div>
        ) : editableData ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Position</TableHead>
                  {editableData.some(item => item.sku_price_pre_promotion) && (
                    <TableHead>Pre-Promo</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {editableData.map((item, index) => (
                  <TableRow key={index} className={item.empty_space_estimate ? "bg-muted/30" : ""}>
                    <TableCell>
                      {editMode ? (
                        <Input 
                          value={item.sku_name} 
                          onChange={(e) => handleInputChange(index, 'sku_name', e.target.value)}
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
                          onChange={(e) => handleInputChange(index, 'brand', e.target.value)}
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
                            onChange={(e) => handleInputChange(index, 'empty_space_estimate', e.target.value)}
                            className="w-20"
                            min="0"
                            max="100"
                          />
                        ) : (
                          <Input 
                            type="number"
                            value={item.sku_count} 
                            onChange={(e) => handleInputChange(index, 'sku_count', e.target.value)}
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
                            onChange={(e) => handleInputChange(index, 'sku_price', e.target.value)}
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
                          onChange={(e) => handleInputChange(index, 'sku_position', e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        item.sku_position || "-"
                      )}
                    </TableCell>
                    {editableData.some(item => item.sku_price_pre_promotion) && (
                      <TableCell>
                        {editMode ? (
                          item.empty_space_estimate === undefined ? (
                            <Input 
                              type="number"
                              value={item.sku_price_pre_promotion || ''} 
                              onChange={(e) => handleInputChange(index, 'sku_price_pre_promotion', e.target.value)}
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
        ) : (
          <div className="flex flex-col items-center justify-center h-60 text-muted-foreground">
            <p>No analysis results yet</p>
            <p className="text-sm">Upload and analyze an image to see results</p>
          </div>
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

export default AnalysisResults;
