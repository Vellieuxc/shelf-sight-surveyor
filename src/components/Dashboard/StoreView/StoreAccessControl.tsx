
import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useErrorHandling } from "@/hooks";

interface StoreAccessControlProps {
  storeId: string;
  creatorId: string;
  currentUserId: string;
}

const StoreAccessControl: React.FC<StoreAccessControlProps> = ({
  storeId,
  creatorId,
  currentUserId,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { handleError } = useErrorHandling({ 
    source: 'database',
    componentName: 'StoreAccessControl',
    operation: 'deleteStore'
  });
  
  const handleDeleteStore = async () => {
    if (!window.confirm("Are you sure you want to delete this store? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("stores")
        .delete()
        .eq("id", storeId);

      if (error) throw error;

      toast({
        title: "Store deleted",
        description: "The store has been deleted successfully.",
      });

      navigate("/dashboard");
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to delete store",
        useShadcnToast: true,
        additionalData: { storeId }
      });
    }
  };

  if (creatorId === currentUserId) {
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        onClick={handleDeleteStore}
      >
        <X size={16} className="mr-1" />
        <span>Delete Store</span>
      </Button>
    );
  }

  return null;
};

export default StoreAccessControl;
