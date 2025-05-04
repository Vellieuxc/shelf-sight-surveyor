
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, BarChart3 } from "lucide-react";
import { Store } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface StoreSummaryProps {
  store: Store;
}

interface StoreSummaryData {
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
}

interface StoreAnalysisResponse {
  store: {
    id: string;
    name: string;
    address: string;
    country: string;
    type: string;
  };
  summary: StoreSummaryData;
}

const StoreSummary: React.FC<StoreSummaryProps> = ({ store }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summaryData, setSummaryData] = useState<StoreSummaryData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const generateStoreSummary = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the store-summary edge function
      const { data, error } = await supabase.functions.invoke('store-summary', {
        body: { storeId: store.id }
      });
      
      if (error) throw error;
      
      if (data) {
        const responseData = data as StoreAnalysisResponse;
        setSummaryData(responseData.summary);
        toast({
          title: "Summary Generated",
          description: "Store analysis data has been successfully generated."
        });
      } else {
        throw new Error("No data returned from analysis service");
      }
    } catch (err: any) {
      console.error("Error generating store summary:", err);
      setError(err.message || "Failed to connect to the analysis service. Please try again later.");
      toast({
        title: "Analysis Failed",
        description: "There was a problem connecting to the analysis service.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex justify-between items-center">
          <div>Store Analysis Summary</div>
          <Button 
            size="sm" 
            onClick={generateStoreSummary} 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Summary
              </>
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-destructive mb-4 p-2 bg-destructive/10 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {summaryData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted p-2 rounded-md">
                <div className="text-xs text-muted-foreground">Total Pictures</div>
                <div className="text-lg font-medium">{summaryData.totalPictures}</div>
              </div>
              <div className="bg-muted p-2 rounded-md">
                <div className="text-xs text-muted-foreground">Analyzed Pictures</div>
                <div className="text-lg font-medium">{summaryData.picturesWithAnalysis}</div>
              </div>
              <div className="bg-muted p-2 rounded-md">
                <div className="text-xs text-muted-foreground">Total SKUs</div>
                <div className="text-lg font-medium">{summaryData.totalSKUCount}</div>
              </div>
              <div className="bg-muted p-2 rounded-md">
                <div className="text-xs text-muted-foreground">Avg. Empty Space</div>
                <div className="text-lg font-medium">{summaryData.averageEmptySpace}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Position Distribution</h4>
              <div className="flex gap-2 text-sm">
                <div className="flex-1 bg-primary/10 p-2 rounded-md">
                  <div className="text-xs">Top</div>
                  <div>{summaryData.positionDistribution.Top}</div>
                </div>
                <div className="flex-1 bg-primary/10 p-2 rounded-md">
                  <div className="text-xs">Middle</div>
                  <div>{summaryData.positionDistribution.Middle}</div>
                </div>
                <div className="flex-1 bg-primary/10 p-2 rounded-md">
                  <div className="text-xs">Bottom</div>
                  <div>{summaryData.positionDistribution.Bottom}</div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Top Brands</h4>
              <ul className="space-y-1">
                {summaryData.topBrands.map((brand, index) => (
                  <li key={index} className="text-sm flex justify-between bg-secondary/20 p-1.5 rounded-sm">
                    <span>{brand.brand}</span>
                    <span className="font-medium">{brand.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p>Click "Generate Summary" to analyze store data.</p>
            <p className="text-xs mt-2">This will process all pictures and their analysis data.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StoreSummary;
