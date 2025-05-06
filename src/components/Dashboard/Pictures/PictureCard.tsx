
import React, { useState, useEffect } from "react";
import { Picture } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Microscope, Download } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { downloadImage } from "@/utils/imageUtils";
import PictureMetadata from "./PictureMetadata";
import PictureCreatorInfo from "./PictureCreatorInfo";
import PictureAnalysisBadge from "./PictureAnalysisBadge";
import PictureComment from "./PictureComment";
import { useResponsive } from "@/hooks/use-mobile";
import DeletePictureDialog from "./DeletePictureDialog";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { useAuth } from "@/contexts/auth";

interface PictureCardProps {
  picture: Picture;
  onDelete?: () => void;
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
  const [showComments, setShowComments] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const uploadDate = new Date(picture.created_at);
  const exactDate = format(uploadDate, "PPP");
  const hasAnalysis = picture.analysis_data && picture.analysis_data.length > 0;
  const { isMobile, isTablet } = useResponsive();
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'PictureCard',
    operation: 'fetchCreator',
    silent: true // Don't show error toasts for this non-critical feature
  });
  
  // Get the user profile to check role
  const { profile } = useAuth();
  const isCrewOnly = profile?.role === "crew";
  
  // Responsive button size based on screen size
  const buttonSize = isMobile ? "sm" : "default";
  // Responsive icon size
  const iconSize = isMobile ? 16 : 18;

  useEffect(() => {
    // Only fetch the creator if it wasn't provided as prop and there's an uploaded_by value
    if (!createdByName && picture.uploaded_by) {
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
            } else if (data.email) {
              setCreator(data.email);
            } else {
              // Fallback if profile exists but has no name or email
              setCreator(`User ${picture.uploaded_by.slice(0, 6)}...`);
            }
          } else {
            // Display uploader ID as shortened format when profile not found
            setCreator(`User ${picture.uploaded_by.slice(0, 6)}...`);
          }
        } catch (error) {
          console.error("Error fetching creator:", error);
          
          // Provide a fallback display name on error
          setCreator(`User ${picture.uploaded_by.slice(0, 6)}...`);
        }
      };
      
      fetchCreator();
    } else if (!createdByName && !picture.uploaded_by) {
      // If no uploaded_by field is available
      setCreator("Unknown");
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
    <Card className="overflow-hidden flex flex-col">
      <CardContent className="p-0 relative aspect-video">
        <div className={`w-full h-full ${!imageLoaded ? "bg-gray-200 animate-pulse" : ""}`}>
          <img 
            src={picture.image_url} 
            alt="Store picture" 
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? "opacity-100" : "opacity-0"}`}
          />
        </div>
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
      
      {/* Desktop layout: Show all buttons in a row */}
      <CardFooter className="hidden sm:flex flex-wrap gap-2 p-2 pt-0">
        <Button 
          variant="ghost" 
          size={buttonSize}
          className="flex-1"
          onClick={handleDownload}
        >
          <Download className="mr-1" size={iconSize} />
          <span>Download</span>
        </Button>
        
        {/* Only show Analyze button if user is not crew */}
        {!isCrewOnly && (
          <Link to={`/dashboard/stores/${picture.store_id}/analyze?pictureId=${picture.id}`} className="flex-1">
            <Button variant="ghost" size={buttonSize} className="w-full">
              <Microscope className="mr-1" size={iconSize} />
              <span>Analyze</span>
            </Button>
          </Link>
        )}
        
        {allowDelete && (
          <DeletePictureDialog
            pictureId={picture.id}
            onDeleted={onDelete || (() => {})}
          />
        )}
        
        <Button
          variant="outline"
          size={buttonSize}
          className="w-full"
          onClick={() => setShowComments(!showComments)}
        >
          {showComments ? "Hide Comments" : "Show Comments"}
        </Button>
      </CardFooter>
      
      {/* Mobile layout: Show buttons in a grid */}
      <div className="grid grid-cols-2 gap-2 p-2 pt-0 sm:hidden">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleDownload}
          className="touch-target"
        >
          <Download className="mr-1" size={16} />
          <span className="text-xs">Download</span>
        </Button>
        
        {/* Only show Analyze button if user is not crew */}
        {!isCrewOnly && (
          <Link to={`/dashboard/stores/${picture.store_id}/analyze?pictureId=${picture.id}`} className="flex-1">
            <Button variant="ghost" size="sm" className="w-full touch-target">
              <Microscope className="mr-1" size={16} />
              <span className="text-xs">Analyze</span>
            </Button>
          </Link>
        )}
        
        {allowDelete && (
          <DeletePictureDialog
            pictureId={picture.id}
            onDeleted={onDelete || (() => {})}
          />
        )}
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowComments(!showComments)}
          className="touch-target"
        >
          <span className="text-xs">{showComments ? "Hide Comments" : "Comments"}</span>
        </Button>
      </div>
      
      {showComments && (
        <div className="p-3 pt-0 border-t">
          <PictureComment pictureId={picture.id} />
        </div>
      )}
    </Card>
  );
};

export default PictureCard;
