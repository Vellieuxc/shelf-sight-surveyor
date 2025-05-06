
import React from "react";
import { useImageAnalysis } from "./ImageAnalysis/useImageAnalysis";
import ImageUploader from "./ImageAnalysis/ImageUploader";
import AnalysisResults from "./ImageAnalysis/AnalysisResults";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ImageAnalyzerProps {
  storeId?: string;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ storeId }) => {
  const [searchParams] = useSearchParams();
  const pictureId = searchParams.get("pictureId");
  const isExistingPicture = !!pictureId;
  
  const {
    selectedImage,
    isAnalyzing,
    isLoading,
    isError,
    errorMessage,
    analysisData,
    handleImageUpload,
    handleResetImage,
    handleAnalyzeImage,
    handleExportToExcel,
    handleUpdateAnalysisData
  } = useImageAnalysis(storeId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isExistingPicture ? "Analyze Existing Image" : "Image Analysis"}
        </h2>
      </div>
      
      {isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {errorMessage || "There was a problem loading the image. Please try again."}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageUploader
          selectedImage={selectedImage}
          isAnalyzing={isAnalyzing}
          isLoading={isLoading}
          isError={isError}
          errorMessage={errorMessage}
          analysisData={analysisData}
          onImageUpload={handleImageUpload}
          onAnalyze={handleAnalyzeImage}
          onResetImage={handleResetImage}
          storeId={storeId}
        />

        <AnalysisResults
          isLoading={isLoading}
          isAnalyzing={isAnalyzing}
          analysisData={analysisData}
          onExportToExcel={handleExportToExcel}
          onUpdateAnalysisData={handleUpdateAnalysisData}
        />
      </div>
    </div>
  );
};

export default ImageAnalyzer;
