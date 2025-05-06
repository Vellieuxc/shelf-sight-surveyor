
import React from "react";
import { Microscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/auth";

interface AnalyzeButtonProps {
  storeId: string;
  pictureId: string;
  size?: "sm" | "default";
  iconSize?: number;
  className?: string;
}

const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({ 
  storeId, 
  pictureId, 
  size = "default",
  iconSize = 18,
  className = ""
}) => {
  // Get the user profile to check role
  const { profile } = useAuth();
  const isCrewOnly = profile?.role === "crew";

  // Don't render anything if user is crew
  if (isCrewOnly) {
    return null;
  }

  return (
    <Link to={`/dashboard/stores/${storeId}/analyze?pictureId=${pictureId}`} className={className}>
      <Button variant="ghost" size={size} className="w-full">
        <Microscope className="mr-1" size={iconSize} />
        <span className={size === "sm" ? "text-xs" : ""}>Analyze</span>
      </Button>
    </Link>
  );
};

export default AnalyzeButton;
