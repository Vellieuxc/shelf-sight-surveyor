
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Upload, Camera } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { StoreFormValues } from "./types";
import { useImageUpload } from "@/hooks/use-image-upload";
import { CameraDialog } from "../Dialogs";

interface ImageUploadProps {
  form: UseFormReturn<StoreFormValues>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ form }) => {
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  
  const {
    imagePreview,
    handleFileChange: baseHandleFileChange,
    handleCaptureFromCamera: baseHandleCaptureFromCamera,
    resetFile
  } = useImageUpload({
    onSuccess: (file) => {
      form.setValue("store_image", file);
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    baseHandleFileChange(e);
  };

  const handleCaptureImage = (file: File, previewUrl: string) => {
    baseHandleCaptureFromCamera(file, previewUrl);
    form.setValue("store_image", file);
    setIsCameraDialogOpen(false);
  };

  return (
    <>
      <FormField
        control={form.control}
        name="store_image"
        render={() => (
          <FormItem>
            <FormLabel>Store Image (Optional)</FormLabel>
            <FormControl>
              <div className="space-y-2">
                {imagePreview && (
                  <div className="relative w-full h-40 mb-2">
                    <img 
                      src={imagePreview}
                      alt="Store Preview" 
                      className="w-full h-full object-contain bg-muted rounded-md"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label 
                    htmlFor="store_image" 
                    className="cursor-pointer flex items-center justify-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Select Image
                    <input
                      id="store_image"
                      name="store_image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCameraDialogOpen(true)}
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    Take Picture
                  </Button>
                  
                  {imagePreview && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="ml-2"
                      onClick={() => {
                        form.setValue("store_image", undefined);
                        resetFile();
                      }}
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <CameraDialog
        open={isCameraDialogOpen}
        onOpenChange={setIsCameraDialogOpen}
        onCapture={handleCaptureImage}
      />
    </>
  );
};

export default ImageUpload;
