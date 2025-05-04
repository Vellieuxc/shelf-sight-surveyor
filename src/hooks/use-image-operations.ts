
import { useState } from "react";
import { useToast } from "./use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useErrorHandling } from "./use-error-handling";

interface UseImageOperationsProps {
  storeId?: string;
  onSuccess?: () => void;
  bucketName?: string;
}

export const useImageOperations = ({
  storeId,
  onSuccess,
  bucketName = "store-pictures"
}: UseImageOperationsProps = {}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { handleError, runSafely } = useErrorHandling({
    source: 'storage',
    componentName: 'ImageOperations'
  });
  
  const resetImage = () => {
    setSelectedFile(null);
    setImagePreview(null);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image should be less than 10MB.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleUpload = async () => {
    if (!selectedFile || !storeId) {
      toast({
        title: "Missing information",
        description: selectedFile ? "Store ID is required." : "Please select a file first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${storeId}/${fileName}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, selectedFile);
        
      if (uploadError) throw uploadError;
        
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);
        
      if (!publicUrlData) throw new Error("Failed to get public URL");
        
      // Create record in pictures table
      const { error: dbError } = await supabase
        .from('pictures')
        .insert({
          store_id: storeId,
          image_url: publicUrlData.publicUrl,
        });
        
      if (dbError) throw dbError;
      
      toast({
        title: "Success",
        description: "Image uploaded successfully.",
      });
      
      // Reset state
      resetImage();
      
      // Call success callback
      if (onSuccess) onSuccess();
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to upload image. Please try again.",
        operation: 'imageUpload',
        additionalData: { storeId }
      });
    } finally {
      setIsUploading(false);
    }
  };

  return {
    selectedFile,
    imagePreview,
    isUploading,
    handleFileChange,
    handleUpload,
    resetImage
  };
};
