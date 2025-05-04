
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { getFileFromCanvas } from "@/utils/imageUtils";
import { useAuth } from "@/contexts/auth";

// Constants
const BUCKET_NAME = 'pictures';

export const useImageHandlers = (storeId: string, refetchPictures: () => void) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'storage',
    componentName: 'ImageHandlers'
  });
  const { user } = useAuth(); // Get the current user

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
    if (!selectedFile || !user) {
      toast({
        title: "No file selected",
        description: "Please select or capture an image first or log in.",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploading(true);
    
    try {
      // Generate a unique file name
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `stores/${storeId}/${fileName}`;
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);
      
      if (!publicUrlData) throw new Error("Failed to get public URL");
      
      // Create a record in the pictures table
      const { error: dbError } = await supabase
        .from("pictures")
        .insert({
          store_id: storeId,
          uploaded_by: user.id, // Add the required uploaded_by field
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
