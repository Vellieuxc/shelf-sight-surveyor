
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { StoreFormValues, storeTypes } from "./types";
import CountrySelect from "@/components/Common/CountrySelect";

interface FormFieldsProps {
  form: UseFormReturn<StoreFormValues>;
}

const FormFields: React.FC<FormFieldsProps> = ({ form }) => {
  return (
    <>
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
          <CountrySelect name="country" label="Country" />
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
    </>
  );
};

export default FormFields;
