
import { z } from "zod";

export const formSchema = z.object({
  name: z.string().min(2, "Store name must be at least 2 characters"),
  type: z.string().min(1, "Please select a store type"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  country: z.string().min(2, "Country must be at least 2 characters"),
  google_map_pin: z.string().optional(),
  store_image: z.any().optional(),
});

export type StoreFormValues = z.infer<typeof formSchema>;

export const storeTypes = [
  "Convenience store / minimart",
  "Supermarket",
  "Hypermarket",
  "Pharmacy",
  "Traditional store (warungs, sari sari,...)",
  "Specialized store"
];
