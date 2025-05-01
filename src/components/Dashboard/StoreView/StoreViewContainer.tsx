
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import StoreDataFetcher from "./StoreDataFetcher";
import { toast } from "@/hooks/use-toast";
import StoreView from "./index";

interface StoreViewContainerProps {
  storeId: string;
}

const StoreViewContainer: React.FC<StoreViewContainerProps> = ({ storeId }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <StoreDataFetcher
      storeId={storeId}
      userId={user.id}
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
      {(storeData, picturesData) => (
        <StoreView 
          store={storeData} 
          pictures={picturesData} 
          isLoading={isLoading}
          userId={user.id} 
        />
      )}
    </StoreDataFetcher>
  );
};

export default StoreViewContainer;
