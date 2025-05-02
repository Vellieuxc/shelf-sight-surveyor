
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

interface StoreSummaryProps {
  store: Store;
}

interface SummaryData {
  store: {
    name: string;
    address: string;
    country: string;
    type: string;
  };
  summary: {
    totalPictures: number;
    picturesWithAnalysis: number;
    totalSKUCount: number;
    averageEmptySpace: string;
    positionDistribution: {
      Top: number;
      Middle: number;
      Bottom: number;
    };
    topBrands: Array<{
      brand: string;
      count: number;
    }>;
  };
}

const StoreSummary: React.FC<StoreSummaryProps> = ({ store }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const generateSummary = async () => {
    try {
      setIsLoading(true);
      
      // Make sure we include the proper auth header by using the invoke method
      const { data, error } = await supabase.functions.invoke('store-summary', {
        body: { storeId: store.id }
      });
      
      if (error) {
        console.error("Failed to generate store summary:", error);
        throw new Error(error.message || "Unknown error");
      }
      
      if (!data) {
        throw new Error("No data returned from summary function");
      }
      
      console.log("Summary data received:", data);
      setSummaryData(data);
    } catch (error: any) {
      console.error("Failed to generate store summary:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to generate store summary",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalSkuCount = summaryData?.summary.totalSKUCount || 0;
  
  // Calculate percentages safely avoiding division by zero
  const getPercentage = (value: number) => {
    if (totalSkuCount === 0) return 0;
    return (value * 100) / totalSkuCount;
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <FileText className="h-5 w-5" />
          Store Summary Report
        </CardTitle>
        <CardDescription>
          Generate a comprehensive summary of all analysis data for this store
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-4 sm:p-6 pt-0">
        {summaryData ? (
          <div className="space-y-4 sm:space-y-6">
            <div className="border rounded-lg p-3 sm:p-4">
              <h3 className="text-base sm:text-lg font-medium mb-1 sm:mb-2 truncate">{summaryData.store.name}</h3>
              <p className="text-muted-foreground text-xs sm:text-sm truncate">{summaryData.store.address}, {summaryData.store.country}</p>
              <p className="text-muted-foreground text-xs sm:text-sm">Store Type: {summaryData.store.type}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Pictures</p>
                <p className="text-xl sm:text-2xl font-bold">{summaryData.summary.totalPictures}</p>
                <p className="text-xs text-muted-foreground">
                  {summaryData.summary.picturesWithAnalysis} with analysis
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">Total SKU Count</p>
                <p className="text-xl sm:text-2xl font-bold">{summaryData.summary.totalSKUCount}</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-muted-foreground">Avg Empty Space</p>
                <p className="text-xl sm:text-2xl font-bold">{summaryData.summary.averageEmptySpace}</p>
              </div>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm sm:text-md font-medium">Position Distribution</h3>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-2">
                {totalSkuCount > 0 ? (
                  <>
                    <div 
                      className="flex-grow bg-blue-100 dark:bg-blue-900 h-6 sm:h-8 rounded-sm flex items-center justify-center text-xs" 
                      style={{ width: `${getPercentage(summaryData.summary.positionDistribution.Top)}%` }}
                    >
                      Top ({summaryData.summary.positionDistribution.Top})
                    </div>
                    <div 
                      className="flex-grow bg-green-100 dark:bg-green-900 h-6 sm:h-8 rounded-sm flex items-center justify-center text-xs"
                      style={{ width: `${getPercentage(summaryData.summary.positionDistribution.Middle)}%` }}
                    >
                      Mid ({summaryData.summary.positionDistribution.Middle})
                    </div>
                    <div 
                      className="flex-grow bg-amber-100 dark:bg-amber-900 h-6 sm:h-8 rounded-sm flex items-center justify-center text-xs"
                      style={{ width: `${getPercentage(summaryData.summary.positionDistribution.Bottom)}%` }}
                    >
                      Bot ({summaryData.summary.positionDistribution.Bottom})
                    </div>
                  </>
                ) : (
                  <div className="text-xs text-muted-foreground py-2">No position data available</div>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm sm:text-md font-medium mb-2">Top Brands</h3>
              {summaryData.summary.topBrands.length > 0 ? (
                <ul className="space-y-1 sm:space-y-2">
                  {summaryData.summary.topBrands.map((brand, index) => (
                    <li key={index} className="flex items-center justify-between border-b pb-1 text-xs sm:text-sm">
                      <span className="truncate pr-2">{brand.brand}</span>
                      <span className="text-muted-foreground whitespace-nowrap">{brand.count} items</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground py-2">No brand data available</p>
              )}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 sm:py-8">
            <BarChart2 className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4 text-sm">
              Generate a summary report of all analysis data across pictures in this store.
              <br />
              This report is only available for consultants and bosses.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="px-4 pb-4 sm:px-6 sm:pb-6">
        <Button 
          onClick={generateSummary} 
          disabled={isLoading}
          className="w-full"
          size={isMobile ? "sm" : "default"}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Summary...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              {summaryData ? "Refresh Summary" : "Generate Summary"}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default StoreSummary;
