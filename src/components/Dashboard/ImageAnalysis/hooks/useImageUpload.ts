
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useImageUpload as useBaseImageUpload } from "@/hooks/use-image-upload";

export const useImageUpload = () => {
  const { toast } = useToast();
  const [currentPictureId, setCurrentPictureId] = useState<string | null>(null);

  // Use our base image upload hook
  const {
    selectedFile,
    imagePreview: selectedImage,
    handleFileChange: handleImageUpload,
    resetFile: handleResetImage
  } = useBaseImageUpload();

  return {
    selectedImage,
    currentPictureId,
    setSelectedImage: (image: string | null) => {
      // This is a custom setter needed for this specific hook
      if (image) {
        selectedImage ? null : image;
      }
    },
    setCurrentPictureId,
    handleImageUpload,
    handleResetImage,
  };
};
