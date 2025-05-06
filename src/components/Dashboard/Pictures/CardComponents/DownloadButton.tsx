
import React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadImage } from "@/utils/imageUtils";
import { format } from "date-fns";

interface DownloadButtonProps {
  imageUrl: string;
  createdAt: string;
  size?: "sm" | "default";
  iconSize?: number;
  className?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ 
  imageUrl, 
  createdAt, 
  size = "default",
  iconSize = 18,
  className = ""
}) => {
  const uploadDate = new Date(createdAt);

  const handleDownload = () => {
    try {
      // Generate a filename based on store and date
      const fileName = `store-picture-${format(uploadDate, "yyyy-MM-dd")}.jpg`;
      
      // Use the utility function for downloading
      downloadImage(imageUrl, fileName);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <Button 
      variant="ghost" 
      size={size}
      className={className}
      onClick={handleDownload}
    >
      <Download className="mr-1" size={iconSize} />
      <span className={size === "sm" ? "text-xs" : ""}>{size === "sm" ? "Download" : "Download"}</span>
    </Button>
  );
};

export default DownloadButton;
