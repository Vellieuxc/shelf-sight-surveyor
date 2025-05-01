
import { UserRole } from "@/types";

export interface UserData {
  id: string;
  email: string;
  created_at: string;
  role: UserRole;
  is_blocked?: boolean;
  first_name?: string;
  last_name?: string;
}
