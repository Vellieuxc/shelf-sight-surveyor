
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, Image as ImageIcon } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  type: z.string().min(1, "Please select a store type"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  google_map_pin: z.string().optional(),
  store_image: z.any().optional(),
});

export type StoreFormValues = z.infer<typeof formSchema>;

const storeTypes = [
  "Convenience store / minimart",
  "Supermarket",
  "Hypermarket",
  "Pharmacy",
  "Traditional store (warungs, sari sari,...)",
  "Specialized store"
];

interface StoreFormProps {
  onSubmit: (values: StoreFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const StoreForm: React.FC<StoreFormProps> = ({ onSubmit, isSubmitting, onCancel }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<StoreFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      type: "",
      address: "",
      country: "",
      google_map_pin: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      form.setValue("store_image", file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = async (values: StoreFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
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

        <FormField
          control={form.control}
          name="store_image"
          render={() => (
            <FormItem>
              <FormLabel>Store Image (Optional)</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  {imagePreview && (
                    <div className="relative w-full h-40 mb-2">
                      <img 
                        src={imagePreview}
                        alt="Store Preview" 
                        className="w-full h-full object-contain bg-muted rounded-md"
                      />
                    </div>
                  )}
                  <div className="flex items-center">
                    <label 
                      htmlFor="store_image" 
                      className="cursor-pointer flex items-center justify-center px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md text-sm font-medium"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Select Image
                      <input
                        id="store_image"
                        name="store_image"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {imagePreview && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="ml-2"
                        onClick={() => {
                          form.setValue("store_image", undefined);
                          setImagePreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Store"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default StoreForm;
