
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { countries } from "@/utils/countries";
import { FormControl, FormItem, FormLabel, FormMessage } from "../ui/form";
import { useFormContext } from "react-hook-form";

interface CountrySelectProps {
  name: string;
  label: string;
}

const CountrySelect: React.FC<CountrySelectProps> = ({ name, label }) => {
  const form = useFormContext();

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Select
        onValueChange={(value) => form.setValue(name, value)}
        defaultValue={form.getValues(name) || ""}
      >
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Select country" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {countries.map((country) => (
            <SelectItem key={country.code} value={country.name}>
              {country.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  );
};

export default CountrySelect;
