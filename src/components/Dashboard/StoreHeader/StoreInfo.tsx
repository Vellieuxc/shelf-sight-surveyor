
import React from "react";
import { Calendar, User } from "lucide-react";

interface StoreInfoProps {
  name: string;
  type: string;
  address: string;
  creationDate: string;
  creatorName: string;
}

const StoreInfo: React.FC<StoreInfoProps> = ({ 
  name, 
  type, 
  address, 
  creationDate, 
  creatorName 
}) => {
  return (
    <div className="w-full sm:w-auto">
      <h1 className="text-xl sm:text-2xl font-bold truncate">{name}</h1>
      <div className="flex flex-wrap items-center text-sm text-muted-foreground mt-1">
        <span className="mr-2 truncate">{type}</span>
        <span className="hidden sm:inline">•</span>
        <span className="block sm:inline sm:ml-2 truncate w-full sm:w-auto">{address}</span>
      </div>
      
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground mt-2">
        <div className="flex items-center gap-1">
          <Calendar size={12} />
          <span>Created on {creationDate}</span>
        </div>
        {creatorName && (
          <div className="flex items-center gap-1">
            <User size={12} />
            <span>Created by {creatorName}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreInfo;
