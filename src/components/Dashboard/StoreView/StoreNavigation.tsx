
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import StoreAccessControl from "./StoreAccessControl";

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
  return (
    <div className="flex items-center justify-between">
      <Link to={`/dashboard/projects/${projectId}/stores`}>
        <Button variant="outline" size="sm">
          <ArrowLeft size={16} className="mr-1" />
          <span>Back to Stores</span>
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
