
import React from "react";
import { useImageAnalysis } from "./ImageAnalysis/useImageAnalysis";
import ImageUploader from "./ImageAnalysis/ImageUploader";
import AnalysisResults from "./ImageAnalysis/AnalysisResults";
import { useSearchParams } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { processNextQueuedAnalysis } from "@/services/analysis/core";
import { useToast } from "@/hooks/use-toast";
import SynthesizeButton from "./StoreHeader/SynthesizeButton";

interface ImageAnalyzerProps {
  storeId?: string;
}

const ImageAnalyzer: React.FC<ImageAnalyzerProps> = ({ storeId }) => {
  const [searchParams] = useSearchParams();
  const pictureId = searchParams.get("pictureId");
  const isExistingPicture = !!pictureId;
  const { toast } = useToast();
  const [isProcessingQueue, setIsProcessingQueue] = React.useState(false);
  
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

  const handleProcessQueue = async () => {
    setIsProcessingQueue(true);
    try {
      await processNextQueuedAnalysis();
      toast({
        title: "Queue Processing Triggered",
        description: "The system is now processing the next job in the queue.",
      });
    } catch (error) {
      console.error("Error processing queue:", error);
      toast({
        title: "Queue Processing Failed",
        description: "There was an error processing the queue. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingQueue(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {isExistingPicture ? "Analyze Existing Image" : "Image Analysis"}
        </h2>
        <SynthesizeButton 
          onSynthesizeStore={handleProcessQueue}
          variant="outline"
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isProcessingQueue ? "animate-spin" : ""}`} />
          Process Queue
        </SynthesizeButton>
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
