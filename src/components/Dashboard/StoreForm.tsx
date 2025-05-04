
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { formSchema, StoreFormValues } from "./StoreForm/types";
import FormFields from "./StoreForm/FormFields";
import ImageUpload from "./StoreForm/ImageUpload";
import FormButtons from "./StoreForm/FormButtons";

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
        <FormButtons isSubmitting={isSubmitting} onCancel={onCancel} />
      </form>
    </Form>
  );
};

export default StoreForm;
