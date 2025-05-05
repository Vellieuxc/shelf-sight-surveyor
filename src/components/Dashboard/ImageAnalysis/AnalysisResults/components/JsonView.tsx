
import React from "react";

interface JsonViewProps {
  data: any | null;
}

export const JsonView: React.FC<JsonViewProps> = ({ data }) => {
  return (
    <div className="overflow-auto">
      <pre className="text-xs bg-slate-50 dark:bg-slate-800 p-4 rounded-md max-h-[500px] overflow-y-auto whitespace-pre-wrap">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};
