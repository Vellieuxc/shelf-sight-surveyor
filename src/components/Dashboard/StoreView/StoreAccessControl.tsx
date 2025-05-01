
import React from "react";
import { NavigateFunction } from "react-router-dom";
import { type ToastAPI } from "@/hooks/use-toast";
import { UserProfile } from "@/contexts/auth/types";
import { Store } from "@/types";
import { Button } from "@/components/ui/button";

interface StoreAccessControlProps {
  store: Store | null;
  isLoading: boolean;
  profile: UserProfile | null;
  navigate: NavigateFunction;
  toast: ToastAPI;
  children: React.ReactNode;
}

const StoreAccessControl: React.FC<StoreAccessControlProps> = ({ 
  store, 
  isLoading, 
  profile,
  navigate,
  toast,
  children 
}) => {
  const isCrew = profile?.role === "crew";
  const isBoss = profile?.role === "boss";

  // For crew users who are not bosses, check if they created this store
  React.useEffect(() => {
    if (!isLoading && store && isCrew && !isBoss && profile && store.created_by !== profile.id) {
      toast({
        title: "Access Denied",
        description: "You don't have access to this store",
        variant: "destructive"
      });
      navigate("/dashboard");
    }
  }, [store, isLoading, isCrew, isBoss, profile, navigate, toast]);

  if (isLoading) {
    return <div className="container px-4 py-8">Loading store data...</div>;
  }

  if (!store) {
    return (
      <div className="container px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Store not found</h2>
          <Button 
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StoreAccessControl;
