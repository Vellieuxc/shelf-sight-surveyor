
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw, X, AlertTriangle } from "lucide-react";
import { AnalysisData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageUploaderProps {
  selectedImage: string | null;
  isAnalyzing: boolean;
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  analysisData: AnalysisData[] | null;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onResetImage: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  isAnalyzing,
  isLoading = false,
  isError = false,
  errorMessage = null,
  analysisData,
  onImageUpload,
  onAnalyze,
  onResetImage,
}) => {
  // Only show skeleton when loading initially, not when analyzing
  const showSkeleton = isLoading && !selectedImage;

  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle>Shelf Image Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          {showSkeleton ? (
            <Skeleton className="w-full h-[300px] rounded-md" />
          ) : isError ? (
            <div className="border-dashed border-2 border-destructive rounded-lg p-12 text-center w-full">
              <div className="flex flex-col items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-destructive" />
                <p className="font-medium text-destructive">Error loading image</p>
                <p className="text-sm text-muted-foreground">{errorMessage || "Failed to load image. Please try again."}</p>
                <Button variant="outline" size="sm" onClick={onResetImage}>
                  Try Again
                </Button>
                <label htmlFor="image-upload" className="cursor-pointer mt-4">
                  <Button variant="secondary">Upload New Image</Button>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : selectedImage ? (
            <div className="relative w-full">
              <img
                src={selectedImage}
                alt="Selected shelf"
                className="w-full h-auto rounded-md border border-muted"
                onError={(e) => {
                  // Handle image load error
                  const target = e.target as HTMLImageElement;
                  target.onerror = null; // Prevent infinite loop
                  target.src = "/placeholder.svg"; // Set a fallback image
                }}
              />
              {isAnalyzing && (
                <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 p-4 bg-background rounded-md shadow-md">
                    <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Analyzing image...</p>
                  </div>
                </div>
              )}
              <Button
                variant="outline"
                size="icon"
                className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                onClick={onResetImage}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="border-dashed border-2 border-muted-foreground/25 rounded-lg p-12 text-center w-full cursor-pointer hover:bg-accent/50 transition-colors">
              <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">Upload an image</p>
                <p className="text-sm text-muted-foreground">
                  Supported formats: JPG, PNG
                </p>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={onImageUpload}
                  className="hidden"
                />
              </label>
            </div>
          )}
        </div>
      </CardContent>
      {selectedImage && !showSkeleton && !isError && (
        <CardFooter>
          <Button
            onClick={onAnalyze}
            className="w-full"
            disabled={isAnalyzing || !selectedImage}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isAnalyzing ? "animate-spin" : ""}`}
            />
            {analysisData ? "Re-analyze" : "Analyze Image"}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default ImageUploader;
