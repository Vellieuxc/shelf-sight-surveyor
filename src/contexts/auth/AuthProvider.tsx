
import React, { createContext, useContext } from "react";
import { useSupabaseAuth } from "./useSupabaseAuth";
import { AuthContextType } from "./types";

// Create the context with undefined as default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the hook to get authentication state and methods
  const auth = useSupabaseAuth();
  
  // Provide the auth context to children components
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
