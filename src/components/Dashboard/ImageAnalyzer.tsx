
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Camera, Upload, FileSpreadsheet, Trash, Sparkles } from "lucide-react";
import { AnalysisData } from "@/types";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useParams, useSearchParams } from "react-router-dom";

interface ImageAnalyzerProps {
  storeId?: string;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ storeId }) => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const pictureId = searchParams.get("pictureId");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData[] | null>(null);
  const [currentPictureId, setCurrentPictureId] = useState<string | null>(null);

  // Load image and analysis data if pictureId is provided
  useEffect(() => {
    if (pictureId) {
      setIsLoading(true);
      const fetchPictureData = async () => {
        try {
          const { data: picture, error } = await supabase
            .from("pictures")
            .select("*")
            .eq("id", pictureId)
            .single();

          if (error) throw error;

          if (picture) {
            setSelectedImage(picture.image_url);
            setCurrentPictureId(picture.id);
            
            // If analysis data exists, set it
            if (picture.analysis_data && Array.isArray(picture.analysis_data) && picture.analysis_data.length > 0) {
              setAnalysisData(picture.analysis_data as AnalysisData[]);
            }
          }
        } catch (error) {
          console.error("Error fetching picture:", error);
          toast({
            title: "Error",
            description: "Failed to load picture data",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      };

      fetchPictureData();
    }
  }, [pictureId, toast]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setAnalysisData(null);
        setCurrentPictureId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) return;
    
    setIsAnalyzing(true);
    
    try {
      // Call the Edge Function to analyze the image
      const { data, error } = await supabase.functions.invoke('analyze-shelf-image', {
        body: {
          imageUrl: selectedImage,
          imageId: currentPictureId
        }
      });

      if (error) throw error;
      
      if (data.success && data.data) {
        setAnalysisData(data.data);
        toast({
          title: "Analysis Complete",
          description: "Image has been successfully analyzed.",
        });

        // If we have a pictureId, update the analysis data in the database
        if (currentPictureId) {
          const { error: updateError } = await supabase
            .from("pictures")
            .update({
              analysis_data: data.data,
              last_edited_at: new Date().toISOString(),
              last_edited_by: (await supabase.auth.getUser()).data.user?.id
            })
            .eq("id", currentPictureId);

          if (updateError) {
            console.error("Error updating analysis data:", updateError);
            toast({
              title: "Warning",
              description: "Analysis completed but failed to save results to database.",
              variant: "destructive"
            });
          }
        }
      } else {
        throw new Error("Invalid response format from analysis function");
      }
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExportToExcel = () => {
    if (!analysisData) return;

    // Create CSV content
    let csvContent = "SKU Name,Brand,Count,Price,Pre-Promotion Price,Post-Promotion Price,Empty Space %\n";
    
    analysisData.forEach(item => {
      csvContent += [
        `"${item.sku_name || ''}"`,
        `"${item.brand || ''}"`,
        item.sku_count || '',
        item.sku_price || '',
        item.sku_price_pre_promotion || '',
        item.sku_price_post_promotion || '',
        item.empty_space_estimate || ''
      ].join(',') + '\n';
    });
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shelf-analysis-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Analysis data has been exported to CSV.",
    });
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
                      setCurrentPictureId(null);
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
                {isAnalyzing ? (
                  <>Analyzing... <span className="ml-2 animate-spin">⏳</span></>
                ) : analysisData ? (
                  <>View Results</>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Analyze Image with AI
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>

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
