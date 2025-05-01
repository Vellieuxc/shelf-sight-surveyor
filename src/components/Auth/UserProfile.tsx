
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { UserRole } from "@/types";

// Helper function to get role badge style
const getRoleBadgeStyle = (role: UserRole) => {
  switch (role) {
    case "boss":
      return "bg-red-100 text-red-800";
    case "consultant":
      return "bg-blue-100 text-blue-800";
    case "crew":
    default:
      return "bg-green-100 text-green-800";
  }
};

const UserProfile = () => {
  const { profile, signOut, isLoading } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <div className="flex items-center gap-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2 hover:bg-accent/50">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary">
              {profile.firstName ? profile.firstName[0] : profile.email[0].toUpperCase()}
            </div>
            <span className="hidden md:inline-block">{profile.email}</span>
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-semibold">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.email}
            </h4>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeStyle(profile.role)}`}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
      <Button variant="outline" onClick={signOut} disabled={isLoading}>
        {isLoading ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
};

export default UserProfile;
