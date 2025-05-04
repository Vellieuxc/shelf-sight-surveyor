
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import StoreDataFetcher from "./StoreDataFetcher";
import { useToast } from "@/hooks/use-toast";
import StoreView from "./index";
import { useIsMobile } from "@/hooks/use-mobile";

interface StoreViewContainerProps {
  storeId: string;
}

const StoreViewContainer: React.FC<StoreViewContainerProps> = ({ storeId }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Redirect if not authenticated
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className={isMobile ? "px-2" : "px-4"}>
      <StoreDataFetcher
        storeId={storeId}
        onError={(message) => {
          toast({
            title: "Error",
            description: message,
            variant: "destructive",
          });
          navigate("/dashboard");
        }}
        onLoading={(loading) => setIsLoading(loading)}
      >
        {(data) => (
          <StoreView 
            storeId={storeId} 
          />
        )}
      </StoreDataFetcher>
    </div>
  );
};

export default StoreViewContainer;
