
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, BarChart2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "@/types";

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Store Summary Report
        </CardTitle>
        <CardDescription>
          Generate a comprehensive summary of all analysis data for this store
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {summaryData ? (
          <div className="space-y-6">
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium mb-2">{summaryData.store.name}</h3>
              <p className="text-muted-foreground">{summaryData.store.address}, {summaryData.store.country}</p>
              <p className="text-muted-foreground text-sm">Store Type: {summaryData.store.type}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total Pictures</p>
                <p className="text-2xl font-bold">{summaryData.summary.totalPictures}</p>
                <p className="text-xs text-muted-foreground">
                  {summaryData.summary.picturesWithAnalysis} with analysis
                </p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Total SKU Count</p>
                <p className="text-2xl font-bold">{summaryData.summary.totalSKUCount}</p>
              </div>
              
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg Empty Space</p>
                <p className="text-2xl font-bold">{summaryData.summary.averageEmptySpace}</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-md font-medium">Position Distribution</h3>
              <div className="flex gap-2">
                <div className="grow bg-blue-100 dark:bg-blue-900 h-8 rounded-sm flex items-center justify-center text-xs" 
                     style={{ width: `${summaryData.summary.positionDistribution.Top * 100 / Math.max(summaryData.summary.totalSKUCount, 1)}%` }}>
                  Top ({summaryData.summary.positionDistribution.Top})
                </div>
                <div className="grow bg-green-100 dark:bg-green-900 h-8 rounded-sm flex items-center justify-center text-xs"
                     style={{ width: `${summaryData.summary.positionDistribution.Middle * 100 / Math.max(summaryData.summary.totalSKUCount, 1)}%` }}>
                  Middle ({summaryData.summary.positionDistribution.Middle})
                </div>
                <div className="grow bg-amber-100 dark:bg-amber-900 h-8 rounded-sm flex items-center justify-center text-xs"
                     style={{ width: `${summaryData.summary.positionDistribution.Bottom * 100 / Math.max(summaryData.summary.totalSKUCount, 1)}%` }}>
                  Bottom ({summaryData.summary.positionDistribution.Bottom})
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-md font-medium mb-2">Top Brands</h3>
              <ul className="space-y-2">
                {summaryData.summary.topBrands.map((brand, index) => (
                  <li key={index} className="flex items-center justify-between border-b pb-1">
                    <span>{brand.brand}</span>
                    <span className="text-muted-foreground">{brand.count} items</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <BarChart2 className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center mb-4">
              Generate a summary report of all analysis data across pictures in this store.
              <br />
              This report is only available for consultants and bosses.
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={generateSummary} 
          disabled={isLoading}
          className="w-full"
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
