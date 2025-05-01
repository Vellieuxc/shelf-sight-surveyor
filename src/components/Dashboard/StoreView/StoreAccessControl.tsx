
import React from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Profile } from "@/contexts/auth/types";
import { Store } from "@/types";

interface StoreAccessControlProps {
  store: Store | null;
  isLoading: boolean;
  profile: Profile | null;
  children: React.ReactNode;
}

const StoreAccessControl: React.FC<StoreAccessControlProps> = ({ 
  store, 
  isLoading, 
  profile,
  children 
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
          <button 
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default StoreAccessControl;
