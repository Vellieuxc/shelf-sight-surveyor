
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "@/types";
import StoreForm, { StoreFormValues } from "./StoreForm";

interface AddStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStoreAdded?: () => void;
}

const AddStoreDialog: React.FC<AddStoreDialogProps> = ({ open, onOpenChange, onStoreAdded }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleSubmit = async (values: StoreFormValues) => {
    try {
      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID is missing",
          variant: "destructive",
        });
        return;
      }
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to create a store",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("stores")
        .insert({
          project_id: projectId,
          name: values.name,
          type: values.type,
          address: values.address,
          country: values.country,
          google_map_pin: values.google_map_pin || null,
          created_by: user.id
        })
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Store created",
        description: `${values.name} has been added successfully.`,
      });

      onOpenChange(false);
      
      if (onStoreAdded) {
        onStoreAdded();
      }
      
      // If we get back the new store data, navigate to it
      if (data && data.length > 0) {
        const newStore = data[0] as Store;
        navigate(`/dashboard/stores/${newStore.id}/analyze`);
      }
    } catch (error: any) {
      toast({
        title: "Failed to create store",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
          <DialogDescription>
            Enter the details of the store you want to add to this project.
          </DialogDescription>
        </DialogHeader>
        
        <StoreForm 
          onSubmit={handleSubmit}
          isSubmitting={false}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddStoreDialog;
