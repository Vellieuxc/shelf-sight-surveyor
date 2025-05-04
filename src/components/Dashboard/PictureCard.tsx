import React, { useState, useEffect } from "react";
import { Picture } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Microscope, Download } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { downloadImage } from "@/utils/imageUtils";
import PictureMetadata from "./PictureMetadata";
import PictureCreatorInfo from "./PictureCreatorInfo";
import PictureAnalysisBadge from "./PictureAnalysisBadge";
import { useIsMobile } from "@/hooks/use-mobile";

interface PictureCardProps {
  picture: Picture;
  onDelete: () => void;
  allowDelete?: boolean;
  createdByName?: string;
}

const PictureCard: React.FC<PictureCardProps> = ({ 
  picture, 
  onDelete, 
  allowDelete = true, 
  createdByName 
}) => {
  const [creator, setCreator] = useState<string>(createdByName || "");
  const uploadDate = new Date(picture.created_at);
  const exactDate = format(uploadDate, "PPP");
  const hasAnalysis = picture.analysis_data && picture.analysis_data.length > 0;
  const isMobile = useIsMobile();

  useEffect(() => {
    // Only fetch the creator if it wasn't provided as prop
    if (!createdByName) {
      const fetchCreator = async () => {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("first_name, last_name, email")
            .eq("id", picture.uploaded_by)
            .maybeSingle();
            
          if (error) throw error;
          
          if (data) {
            if (data.first_name && data.last_name) {
              setCreator(`${data.first_name} ${data.last_name}`);
            } else {
              setCreator(data.email);
            }
          } else {
            // Display uploader ID as email-like format when profile not found
            setCreator(`${picture.uploaded_by}@user.id`);
          }
        } catch (error) {
          console.error("Error fetching picture creator:", error);
          // Display uploader ID as email-like format on error
          setCreator(`${picture.uploaded_by}@user.id`);
        }
      };
      
      fetchCreator();
    }
  }, [picture.uploaded_by, createdByName]);

  const handleDownload = () => {
    try {
      // Generate a filename based on store and date
      const fileName = `store-picture-${format(uploadDate, "yyyy-MM-dd")}.jpg`;
      
      // Use the utility function for downloading
      downloadImage(picture.image_url, fileName);
    } catch (error) {
      console.error("Error downloading image:", error);
    }
  };

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <CardContent className="p-0 relative aspect-video">
        <img 
          src={picture.image_url} 
          alt="Store picture" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-white truncate">{format(uploadDate, "MMM d, yyyy")}</span>
            <PictureAnalysisBadge hasAnalysis={hasAnalysis} />
          </div>
        </div>
      </CardContent>
      <div className="p-2 text-xs text-muted-foreground">
        <PictureMetadata createdAt={picture.created_at} exactDate={exactDate} />
        <PictureCreatorInfo creator={creator} />
      </div>
      <CardFooter className="flex flex-wrap gap-2 p-2 pt-0 mt-auto">
        <Button 
          variant="ghost" 
          size={isMobile ? "sm" : "default"}
          className="w-full sm:flex-1"
          onClick={handleDownload}
        >
          <Download className="mr-1 h-4 w-4" />
          <span>Download</span>
        </Button>
        
        <Link to={`/dashboard/stores/${picture.store_id}/analyze?pictureId=${picture.id}`} className="w-full sm:flex-1">
          <Button variant="ghost" size={isMobile ? "sm" : "default"} className="w-full">
            <Microscope className="mr-1 h-4 w-4" />
            <span>Analyze</span>
          </Button>
        </Link>
        
        {allowDelete && (
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"} 
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 w-full sm:flex-1"
            onClick={onDelete}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            <span>Delete</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default PictureCard;
