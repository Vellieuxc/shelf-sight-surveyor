
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { getFileFromCanvas } from "@/utils/imageUtils";

export const useImageHandlers = (storeId: string, refetchPictures: () => void) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'storage',
    componentName: 'ImageHandlers'
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleCaptureFromCamera = async (file: File, preview: string) => {
    setSelectedFile(file);
    setImagePreview(preview);
  };
  
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select or capture an image first.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Generate a unique file name
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${storeId}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("store-pictures")
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from("store-pictures")
        .getPublicUrl(filePath);
      
      if (!publicUrlData) throw new Error("Failed to get public URL");
      
      // Create a record in the pictures table
      const { error: dbError } = await supabase
        .from("pictures")
        .insert({
          store_id: storeId,
          image_url: publicUrlData.publicUrl
        });
      
      if (dbError) throw dbError;
      
      toast({
        title: "Upload successful",
        description: "The image has been uploaded successfully.",
      });
      
      // Reset state
      setSelectedFile(null);
      setImagePreview(null);
      
      // Refresh pictures
      refetchPictures();
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to upload image",
        operation: 'uploadImage',
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
    handleCaptureFromCamera,
    handleUpload
  };
};
