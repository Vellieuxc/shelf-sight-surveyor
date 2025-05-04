
import React, { useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { StoreFormValues } from "./types";

interface ImageUploadProps {
  form: UseFormReturn<StoreFormValues>;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ form }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("store_image", file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
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
              <div className="flex items-center">
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
                {imagePreview && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="ml-2"
                    onClick={() => {
                      form.setValue("store_image", undefined);
                      setImagePreview(null);
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
  );
};

export default ImageUpload;
