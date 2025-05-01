
import React from "react";
import { useAuth } from "@/contexts/auth";
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
  const { profile } = useAuth();

  if (!profile) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <HoverCard>
        <HoverCardTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-primary">
              {profile.firstName ? profile.firstName[0] : profile.email[0].toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="font-medium truncate max-w-[140px]">
                {profile.firstName && profile.lastName
                  ? `${profile.firstName} ${profile.lastName}`
                  : profile.email}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeStyle(profile.role)}`}>
                {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
              </span>
            </div>
          </div>
        </HoverCardTrigger>
        <HoverCardContent className="w-80">
          <div className="flex flex-col space-y-2">
            <h4 className="text-sm font-semibold">
              {profile.firstName && profile.lastName
                ? `${profile.firstName} ${profile.lastName}`
                : profile.email}
            </h4>
            <p className="text-sm text-muted-foreground">{profile.email}</p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  );
};

export default UserProfile;
