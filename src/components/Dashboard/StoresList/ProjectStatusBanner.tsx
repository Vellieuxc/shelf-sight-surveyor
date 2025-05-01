
import React from "react";

interface ProjectStatusBannerProps {
  isProjectClosed: boolean;
  isConsultant: boolean;
  isBoss: boolean;
}

const ProjectStatusBanner: React.FC<ProjectStatusBannerProps> = ({ 
  isProjectClosed,
  isConsultant,
  isBoss
}) => {
  // Only show for closed projects, and only to non-consultant/boss users
  if (!isProjectClosed || isConsultant || isBoss) {
    return null;
  }
  
  return (
    <div className="bg-muted text-muted-foreground text-sm p-3 rounded-md">
      This project is currently closed. Contact a consultant to make changes.
    </div>
  );
};

export default ProjectStatusBanner;
