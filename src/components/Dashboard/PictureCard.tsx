
import React, { useState, useEffect } from "react";
import { Picture } from "@/types";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Info, Calendar, User, Microscope } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface PictureCardProps {
  picture: Picture;
  onDelete: () => void;
  allowDelete?: boolean;
  createdByName?: string;
}

const PictureCard: React.FC<PictureCardProps> = ({ picture, onDelete, allowDelete = true, createdByName }) => {
  const [creator, setCreator] = useState<string>(createdByName || "");
  const uploadDate = new Date(picture.created_at);
  const formattedDate = formatDistanceToNow(uploadDate, { addSuffix: true });
  const exactDate = format(uploadDate, "PPP"); // Localized date format
  const hasAnalysis = picture.analysis_data && picture.analysis_data.length > 0;

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

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0 relative aspect-video">
        <img 
          src={picture.image_url} 
          alt="Store picture" 
          className="w-full h-full object-cover"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-3">
          <div className="flex justify-between items-center">
            <span className="text-xs text-white">{formattedDate}</span>
            {hasAnalysis && (
              <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full flex items-center gap-1">
                <Info size={10} />
                Analyzed
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <div className="p-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1" title={exactDate}>
          <Calendar size={12} />
          <span>Created: {formattedDate}</span>
        </div>
        {creator && (
          <div className="flex items-center gap-1 mt-1">
            <User size={12} />
            <span>By: {creator}</span>
          </div>
        )}
      </div>
      <CardFooter className="flex justify-between p-2 pt-0">
        <Link to={`/dashboard/stores/${picture.store_id}/analyze?pictureId=${picture.id}`}>
          <Button variant="ghost" size="sm">
            <Microscope className="mr-1 h-4 w-4" />
            <span>Analyze</span>
          </Button>
        </Link>
        {allowDelete && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90"
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
