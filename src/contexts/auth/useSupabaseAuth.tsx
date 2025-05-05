
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthState } from "./hooks/useAuthState";
import { 
  handleSignIn as authSignIn,
  handleSignUp as authSignUp,
  handleSignOut as authSignOut
} from "./utils/authUtils";

export const useSupabaseAuth = () => {
  // Use navigate with a try-catch to handle cases where router context might not be available
  let navigate;
  try {
    navigate = useNavigate();
  } catch (error) {
    console.warn("Router context not available for navigation");
  }

  const { user, session, profile, isLoading, setProfile } = useAuthState();

  // Handle user sign in
  const signIn = async (email: string, password: string) => {
    try {
      const { success, user: signedInUser } = await authSignIn(email, password);
      
      if (success && signedInUser && navigate) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign in error:", error);
    }
  };

  // Handle user sign up
  const signUp = async (
    email: string, 
    password: string, 
    userMetadata?: { firstName?: string; lastName?: string }
  ) => {
    try {
      const { success, user: signedUpUser } = await authSignUp(email, password, userMetadata);
      
      // For development, we can auto-sign in
      if (success && signedUpUser && navigate) {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  // Handle user sign out
  const signOut = async () => {
    try {
      const success = await authSignOut();
      if (success && navigate) {
        navigate("/auth");
      }
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return {
    user,
    session,
    profile,
    isLoading,
    signIn,
    signUp,
    signOut
  };
};
