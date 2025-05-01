
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { Store } from "@/types";

const formSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  type: z.string().min(1, "Please select a store type"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  google_map_pin: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddStoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStoreAdded?: () => void;
}

const storeTypes = ["Supermarket", "Convenience", "Department", "Specialty", "Discount", "Warehouse", "Other"];

const AddStoreDialog: React.FC<AddStoreDialogProps> = ({ open, onOpenChange, onStoreAdded }) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      address: "",
      country: "",
      google_map_pin: "",
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (values: FormValues) => {
    try {
      if (!projectId) {
        toast({
          title: "Error",
          description: "Project ID is missing",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase
        .from("stores")
        .insert([
          {
            project_id: projectId,
            name: values.name,
            type: values.type,
            address: values.address,
            country: values.country,
            google_map_pin: values.google_map_pin || null,
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      toast({
        title: "Store created",
        description: `${values.name} has been added successfully.`,
      });

      form.reset();
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New Store</DialogTitle>
          <DialogDescription>
            Enter the details of the store you want to add to this project.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter store name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select store type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {storeTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter store address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="country"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter country" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="google_map_pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Maps Link (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Paste Google Maps URL" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button
                variant="outline"
                type="button"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Store"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStoreDialog;
