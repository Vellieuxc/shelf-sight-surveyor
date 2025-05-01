
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Upload, FileSpreadsheet, Trash } from "lucide-react";
import { AnalysisData } from "@/types";
import { useToast } from "@/components/ui/use-toast";

interface ImageAnalyzerProps {
  storeId?: string;
}

const mockAnalysisData: AnalysisData[] = [
  { sku_name: "Organic Milk 1L", brand: "Happy Cow", sku_count: 5, sku_price: 3.99 },
  { sku_name: "Whole Grain Bread", brand: "Nature's Best", sku_count: 8, sku_price: 4.49, sku_price_pre_promotion: 5.99, sku_price_post_promotion: 4.49 },
  { sku_name: "Protein Bars (6 pack)", brand: "FitLife", sku_count: 3, sku_price: 7.99 },
  { sku_name: "Empty", brand: "-", sku_count: 0, sku_price: 0, empty_space_estimate: 15 },
];

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ storeId }) => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisData(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = () => {
    setIsAnalyzing(true);
    
    // Simulate API call to Claude AI
    setTimeout(() => {
      setAnalysisData(mockAnalysisData);
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Image has been successfully analyzed.",
      });
    }, 2000);
  };

  const handleExportToExcel = () => {
    toast({
      title: "Export Started",
      description: "Exporting analysis data to Excel...",
    });
    // In a real app, implement Excel export functionality here
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Image Analysis</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Upload Image</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {selectedImage ? (
                <div className="relative w-full">
                  <img 
                    src={selectedImage} 
                    alt="Selected Store Shelf" 
                    className="w-full h-auto rounded-md"
                  />
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => {
                      setSelectedImage(null);
                      setAnalysisData(null);
                    }}
                  >
                    <Trash size={16} />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-md p-12 w-full text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <Camera size={48} className="text-muted-foreground" />
                    <div className="space-y-2">
                      <p className="text-lg font-medium">Upload a shelf image</p>
                      <p className="text-sm text-muted-foreground">
                        Take a picture or upload from your device
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <label>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button variant="outline" className="cursor-pointer" asChild>
                          <div>
                            <Upload size={16} className="mr-2" />
                            Upload
                          </div>
                        </Button>
                      </label>
                      <Button className="cursor-pointer">
                        <Camera size={16} className="mr-2" />
                        Take Photo
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          {selectedImage && (
            <CardFooter className="flex justify-center">
              <Button
                disabled={isAnalyzing || !selectedImage}
                onClick={handleAnalyzeImage}
                className="w-full"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Image"}
              </Button>
            </CardFooter>
          )}
        </Card>

        <Card className="card-shadow">
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center h-60">
                <div className="animate-pulse text-muted-foreground">
                  Analyzing shelf contents...
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
                            : `$${item.sku_price.toFixed(2)}`
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
                onClick={handleExportToExcel}
              >
                <FileSpreadsheet size={16} />
                Export to Excel
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
