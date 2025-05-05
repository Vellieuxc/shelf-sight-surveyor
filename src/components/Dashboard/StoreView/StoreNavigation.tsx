
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import StoreAccessControl from "./StoreAccessControl";
import { useResponsive } from "@/hooks/use-mobile";

interface StoreNavigationProps {
  projectId: string;
  storeId: string;
  creatorId: string;
  currentUserId: string;
}

const StoreNavigation: React.FC<StoreNavigationProps> = ({
  projectId,
  storeId,
  creatorId,
  currentUserId
}) => {
  const { isMobile } = useResponsive();
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <Link to={`/dashboard/projects/${projectId}/stores`} className="w-full sm:w-auto">
        <Button variant="outline" size={isMobile ? "sm" : "default"} className="w-full sm:w-auto">
          <ArrowLeft size={16} className="mr-1" />
          <span className="truncate">{isMobile ? 'Back' : 'Back to Stores'}</span>
        </Button>
      </Link>
      
      <StoreAccessControl 
        storeId={storeId} 
        creatorId={creatorId}
        currentUserId={currentUserId} 
      />
    </div>
  );
};

export default StoreNavigation;
