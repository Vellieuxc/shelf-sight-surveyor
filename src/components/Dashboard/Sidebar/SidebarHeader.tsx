
import React from "react";
import { Link } from "react-router-dom";
import { Store } from "lucide-react";
import { SidebarHeader as Header } from "@/components/ui/sidebar";

const SidebarHeader: React.FC = () => {
  return (
    <Header className="border-b">
      <div className="flex items-center gap-2 px-4 py-2">
        <Link to="/dashboard" className="flex items-center space-x-2">
          <Store className="h-6 w-6 text-primary" />
          <span className="font-semibold text-xl">StoreVisitor</span>
        </Link>
      </div>
    </Header>
  );
};

export default SidebarHeader;
