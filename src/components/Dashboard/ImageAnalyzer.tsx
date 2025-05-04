
import React from "react";
import { useImageAnalysis } from "./ImageAnalysis/useImageAnalysis";
import ImageUploader from "./ImageAnalysis/ImageUploader";
import AnalysisResults from "./ImageAnalysis/AnalysisResults";

interface ImageAnalyzerProps {
  storeId?: string;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ storeId }) => {
  const {
    selectedImage,
    isAnalyzing,
    isLoading,
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
        <h2 className="text-2xl font-bold">Image Analysis</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ImageUploader
          selectedImage={selectedImage}
          isAnalyzing={isAnalyzing}
          isLoading={isLoading}
          analysisData={analysisData}
          onImageUpload={handleImageUpload}
          onAnalyze={handleAnalyzeImage}
          onResetImage={handleResetImage}
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
