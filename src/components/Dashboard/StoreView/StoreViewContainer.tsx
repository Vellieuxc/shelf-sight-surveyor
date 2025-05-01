
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import StoreDataFetcher from "./StoreDataFetcher";
import { useToast } from "@/hooks/use-toast";
import StoreView from "./index";

interface StoreViewContainerProps {
  storeId: string;
}

const StoreViewContainer: React.FC<StoreViewContainerProps> = ({ storeId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
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
          store={data.store} 
          pictures={data.pictures} 
          isLoading={data.isLoading} 
          isProjectClosed={data.isProjectClosed}
          userId={user.id} 
        />
      )}
    </StoreDataFetcher>
  );
};

export default StoreViewContainer;
