
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, Maximize2, Minimize2 } from "lucide-react";

interface JsonViewProps {
  data: any | null;
}

export const JsonView: React.FC<JsonViewProps> = ({ data }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!data) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No analysis data available
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setExpanded(!expanded)}
          className="text-xs"
        >
          {expanded ? (
            <>
              <Minimize2 className="h-3.5 w-3.5 mr-2" />
              Collapse
            </>
          ) : (
            <>
              <Maximize2 className="h-3.5 w-3.5 mr-2" />
              Expand
            </>
          )}
        </Button>
      </div>
      
      <div className={`overflow-auto ${expanded ? 'h-auto' : 'max-h-[500px]'}`}>
        <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-4 rounded-md overflow-y-auto whitespace-pre-wrap">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
      
      {!expanded && (
        <div className="text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setExpanded(true)}
            className="text-xs"
          >
            <ChevronDown className="h-3.5 w-3.5 mr-1" />
            Show full output
          </Button>
        </div>
      )}
    </div>
  );
};
