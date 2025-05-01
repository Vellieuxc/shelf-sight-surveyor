
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Trash, Sparkles } from "lucide-react";

interface ImageUploaderProps {
  selectedImage: string | null;
  isAnalyzing: boolean;
  analysisData: any | null;
  onImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAnalyze: () => void;
  onResetImage: () => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  selectedImage,
  isAnalyzing,
  analysisData,
  onImageUpload,
  onAnalyze,
  onResetImage
}) => {
  return (
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
                onClick={onResetImage}
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
                      onChange={onImageUpload}
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
            onClick={onAnalyze}
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
  );
};

export default ImageUploader;
