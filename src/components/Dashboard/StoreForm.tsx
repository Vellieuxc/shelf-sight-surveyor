
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { formSchema, StoreFormValues } from "./StoreForm/types";
import FormFields from "./StoreForm/FormFields";
import ImageUpload from "./StoreForm/ImageUpload";

interface StoreFormProps {
  onSubmit: (values: StoreFormValues) => Promise<void>;
  isSubmitting: boolean;
  onCancel: () => void;
}

const StoreForm: React.FC<StoreFormProps> = ({ onSubmit, isSubmitting, onCancel }) => {
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

  const handleFormSubmit = async (values: StoreFormValues) => {
    await onSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormFields form={form} />
        <ImageUpload form={form} />

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
