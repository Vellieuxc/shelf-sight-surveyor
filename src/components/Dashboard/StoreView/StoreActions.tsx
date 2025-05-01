
import React from "react";
import { Button } from "@/components/ui/button";
import { Microscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import PictureUpload from "../PictureUpload";
import { useAuth } from "@/contexts/auth";

interface StoreActionsProps {
  storeId: string;
  isProjectClosed?: boolean;
  onPictureUploaded: () => void;
  onSynthesizeStore: () => void;
}

const StoreActions: React.FC<StoreActionsProps> = ({
  storeId,
  isProjectClosed = false,
  onPictureUploaded,
  onSynthesizeStore
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isConsultant = profile?.role === "consultant";
  const isBoss = profile?.role === "boss";
  
  const handleAnalyzeStore = () => {
    navigate(`/dashboard/stores/${storeId}/analyze`);
  };

  return (
    <div className="flex justify-between mb-6">
      <Button variant="outline" onClick={handleAnalyzeStore}>
        <Microscope className="mr-2 h-4 w-4" />
        Analyze Store Data
      </Button>
      
      <div>
        {(!isProjectClosed || isConsultant || isBoss) && (
          <PictureUpload 
            storeId={storeId} 
            onPictureUploaded={onPictureUploaded} 
          />
        )}
        {isProjectClosed && !isConsultant && !isBoss && (
          <div className="text-sm text-muted-foreground">
            This project is closed. Contact a consultant to make changes.
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreActions;
