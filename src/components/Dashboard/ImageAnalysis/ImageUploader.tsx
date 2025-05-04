
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, RefreshCw, X } from "lucide-react";
import { AnalysisData } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";

interface ImageUploaderProps {
  selectedImage: string | null;
  isAnalyzing: boolean;
  isLoading?: boolean;
  analysisData: AnalysisData[] | null;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onResetImage: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  isAnalyzing,
  isLoading = false,
  analysisData,
  onImageUpload,
  onAnalyze,
  onResetImage,
}) => {
  return (
    <Card className="card-shadow">
      <CardHeader>
        <CardTitle>Upload Image for Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          {isLoading ? (
            <Skeleton className="w-full h-[300px] rounded-md" />
          ) : selectedImage ? (
            <div className="relative w-full">
              <img
                src={selectedImage}
                alt="Selected shelf"
                className="w-full h-auto rounded-md border border-muted"
              />
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
      {selectedImage && !isLoading && (
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
