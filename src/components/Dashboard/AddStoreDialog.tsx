
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "@/types";
import StoreForm, { StoreFormValues } from "./StoreForm";
import { toast } from "sonner";
import { ensurePicturesBucketExists } from "@/integrations/supabase/client";

interface AddStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStoreAdded?: () => void;
}

const AddStoreDialog: React.FC<AddStoreDialogProps> = ({ open, onOpenChange, onStoreAdded }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast: hookToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = async (values: StoreFormValues) => {
    if (!projectId) {
      toast.error("Project ID is missing");
      return;
    }
    
    if (!user) {
      toast.error("You must be logged in to create a store");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Make sure the pictures bucket exists
      await ensurePicturesBucketExists();
      
      let storeImageUrl = null;
      
      // If there's a store image, upload it first
      if (values.store_image instanceof File) {
        try {
          const file = values.store_image;
          const fileExt = file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          const filePath = `stores/thumbnails/${fileName}`;
          
          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from('pictures')
            .upload(filePath, file);
          
          if (uploadError) {
            console.error("Error uploading store image:", uploadError);
            toast.error(`Error uploading image: ${uploadError.message}`);
          } else {
            // Get the public URL
            const { data: publicUrlData } = supabase.storage
              .from('pictures')
              .getPublicUrl(filePath);
              
            storeImageUrl = publicUrlData.publicUrl;
          }
        } catch (imageError: any) {
          console.error("Error processing store image:", imageError);
          toast.error(`Error processing image: ${imageError.message}`);
          // Continue with store creation even if image upload fails
        }
      }
      
      // Create the store record
      const { data, error } = await supabase
        .from("stores")
        .insert({
          project_id: projectId,
          name: values.name,
          type: values.type,
          address: values.address,
          country: values.country,
          google_map_pin: values.google_map_pin || null,
          store_image: storeImageUrl,
          created_by: user.id
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success(`${values.name} has been added successfully.`);

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
      toast.error(error.message || "Failed to create store. Please try again.");
    } finally {
      setIsSubmitting(false);
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
          isSubmitting={isSubmitting}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddStoreDialog;
