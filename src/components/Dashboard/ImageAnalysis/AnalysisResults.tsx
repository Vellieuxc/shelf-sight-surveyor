
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileSpreadsheet } from "lucide-react";
import { AnalysisData } from "@/types";

interface AnalysisResultsProps {
  isLoading: boolean;
  isAnalyzing: boolean;
  analysisData: AnalysisData[] | null;
  onExportToExcel: () => void;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({
  isLoading,
  isAnalyzing,
  analysisData,
  onExportToExcel,
}) => {
  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle>Analysis Results</CardTitle>
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
        ) : analysisData ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>SKU Name</TableHead>
                  <TableHead>Brand</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Price</TableHead>
                  {analysisData.some(item => item.sku_price_pre_promotion) && (
                    <TableHead>Pre-Promo</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {analysisData.map((item, index) => (
                  <TableRow key={index} className={item.empty_space_estimate ? "bg-muted/30" : ""}>
                    <TableCell>{item.sku_name}</TableCell>
                    <TableCell>{item.brand}</TableCell>
                    <TableCell>
                      {item.empty_space_estimate 
                        ? `${item.empty_space_estimate}% empty` 
                        : item.sku_count
                      }
                    </TableCell>
                    <TableCell>
                      {item.empty_space_estimate 
                        ? "-" 
                        : item.sku_price ? `$${item.sku_price.toFixed(2)}` : "-"
                      }
                    </TableCell>
                    {analysisData.some(item => item.sku_price_pre_promotion) && (
                      <TableCell>
                        {item.sku_price_pre_promotion 
                          ? `$${item.sku_price_pre_promotion.toFixed(2)}` 
                          : "-"
                        }
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
      {analysisData && (
        <CardFooter>
          <Button 
            variant="outline" 
            className="w-full flex items-center gap-2"
            onClick={onExportToExcel}
          >
            <FileSpreadsheet size={16} />
            Export to Excel
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default AnalysisResults;
