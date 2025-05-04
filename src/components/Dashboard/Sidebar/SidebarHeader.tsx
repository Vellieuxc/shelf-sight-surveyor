
import React from "react";
import { Link } from "react-router-dom";
import { SidebarHeader as Header } from "@/components/ui/sidebar";

const SidebarHeader: React.FC = () => {
  return (
    <Header className="border-b">
      <div className="flex items-center gap-2 px-4 py-2">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/3b34ddeb-22f1-40a6-9711-c5aa47570fd7.png" 
            alt="Store Intelligence logo" 
            className="h-6 w-6"
          />
          <span className="font-semibold text-xl">Store Intelligence</span>
        </Link>
      </div>
    </Header>
  );
};

export default SidebarHeader;
