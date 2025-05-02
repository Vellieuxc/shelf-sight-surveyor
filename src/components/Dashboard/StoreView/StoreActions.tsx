
import React from "react";
import { Button } from "@/components/ui/button";
import { Microscope } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface StoreActionsProps {
  storeId: string;
  isProjectClosed?: boolean;
  onAnalyze: () => void;
}

const StoreActions: React.FC<StoreActionsProps> = ({
  storeId,
  isProjectClosed = false,
  onAnalyze
}) => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const isConsultant = profile?.role === "consultant";
  const isBoss = profile?.role === "boss";
  
  const handleAnalyzeStore = () => {
    onAnalyze();
    navigate(`/dashboard/stores/${storeId}/analyze`);
  };

  return (
    <div>
      <Button variant="outline" onClick={handleAnalyzeStore}>
        <Microscope className="mr-2 h-4 w-4" />
        Analyze Store Data
      </Button>
    </div>
  );
};

export default StoreActions;
