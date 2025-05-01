
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export const useImageUpload = () => {
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentPictureId, setCurrentPictureId] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
        setCurrentPictureId(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetImage = () => {
    setSelectedImage(null);
    setCurrentPictureId(null);
  };

  return {
    selectedImage,
    currentPictureId,
    setSelectedImage,
    setCurrentPictureId,
    handleImageUpload,
    handleResetImage,
  };
};
