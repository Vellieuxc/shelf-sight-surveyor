
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Store } from "@/types";

export const useFileUpload = (store: Store | null, userId: string) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      try {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setImagePreview(event.target.result as string);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Failed to create preview:", error);
        toast({
          title: "Preview Error",
          description: "Failed to create image preview", 
          variant: "destructive"
        });
      }
    }
  };
  
  const handleFileUpload = async (file?: File) => {
    if (!file || !store) return;
    
    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `stores/${store.id}/${fileName}`;
      
      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('pictures')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('pictures')
        .getPublicUrl(filePath);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // Add record to database
      const { error: dbError } = await supabase
        .from('pictures')
        .insert([
          {
            store_id: store.id,
            image_url: imageUrl,
            uploaded_by: userId,
          },
        ]);
      
      if (dbError) throw dbError;
      
      toast({
        title: "Upload successful",
        description: "The image has been uploaded successfully.",
      });
      
      // Force a page reload to refresh the pictures list
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setImagePreview(null);
    }
  };

  const handleCapture = async (file: File, preview: string) => {
    setSelectedFile(file);
    setImagePreview(preview);
    await handleFileUpload(file);
  };

  return {
    selectedFile,
    imagePreview,
    isUploading,
    handleFileChange,
    handleFileUpload,
    handleCapture,
    setSelectedFile,
    setImagePreview
  };
};
