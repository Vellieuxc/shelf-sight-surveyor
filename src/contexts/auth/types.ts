
import { User, Session } from "@supabase/supabase-js";
import { UserRole } from "@/types";

export type { UserRole };

export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isBlocked?: boolean;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string, 
    password: string, 
    userMetadata?: { firstName?: string; lastName?: string }
  ) => Promise<void>;
  signOut: () => Promise<void>;
}
