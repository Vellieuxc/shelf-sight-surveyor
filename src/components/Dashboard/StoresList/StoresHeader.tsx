
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { useResponsive } from "@/hooks/use-mobile";

interface StoresHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onAddStore: () => void;
  showAddButton: boolean;
}

const StoresHeader: React.FC<StoresHeaderProps> = ({
  searchTerm,
  setSearchTerm,
  onAddStore,
  showAddButton
}) => {
  const { isMobile } = useResponsive();
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
      <h2 className="text-xl sm:text-2xl font-bold">Stores</h2>
      <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto">
        <div className="relative flex-1 sm:flex-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-9"
            placeholder="Search stores..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {showAddButton && (
          <Button 
            className="whitespace-nowrap" 
            onClick={onAddStore} 
            size={isMobile ? "sm" : "default"}
          >
            <Plus size={16} className="mr-2" />
            <span>Add Store</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default StoresHeader;
