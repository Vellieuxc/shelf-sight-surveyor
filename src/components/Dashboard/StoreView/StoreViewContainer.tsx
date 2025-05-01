
import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth";
import StoreView from "./index";

interface StoreViewContainerProps {
  storeId: string;
}

const StoreViewContainer: React.FC<StoreViewContainerProps> = ({ storeId }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile } = useAuth();
  
  return (
    <StoreView 
      storeId={storeId} 
      navigate={navigate}
      toast={toast}
      user={user}
      profile={profile}
    />
  );
};

export default StoreViewContainer;
