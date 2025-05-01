
import React from "react";
import { Input } from "@/components/ui/input";
import { Search, Shield } from "lucide-react";

interface SearchHeaderProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const SearchHeader: React.FC<SearchHeaderProps> = ({ searchTerm, setSearchTerm }) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <Shield className="h-6 w-6" />
        User Management
      </h2>
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input 
          className="pl-9"
          placeholder="Search users..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SearchHeader;
