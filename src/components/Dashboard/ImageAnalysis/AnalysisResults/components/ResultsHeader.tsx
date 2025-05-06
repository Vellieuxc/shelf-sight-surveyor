
import React from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileSpreadsheet,
  Save,
  X,
  Edit,
  Code,
  LayoutDashboard
} from "lucide-react";

interface ResultsHeaderProps {
  analysisData: any | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  showRawJson: boolean;
  editMode: boolean;
  toggleViewMode?: () => void;
  setEditMode: (value: boolean) => void;
  saveChanges: () => void;
  cancelChanges: () => void;
  onExportToExcel: () => void;
}

export const ResultsHeader: React.FC<ResultsHeaderProps> = ({
  analysisData,
  isLoading,
  isAnalyzing,
  showRawJson,
  editMode,
  toggleViewMode,
  setEditMode,
  saveChanges,
  cancelChanges,
  onExportToExcel
}) => {
  const isActionDisabled = isLoading || isAnalyzing || !analysisData;
  
  return (
    <div className="w-full flex justify-between items-center">
      <h3 className="font-medium text-base sm:text-lg">Analysis Results</h3>
      
      <div className="flex space-x-2">
        {/* View toggle if toggle function is provided */}
        {toggleViewMode && (
          <Tabs
            value={showRawJson ? "json" : "structured"}
            onValueChange={(value) => {
              if (value === "json" && !showRawJson) toggleViewMode();
              if (value === "structured" && showRawJson) toggleViewMode();
            }}
            className="mr-2"
          >
            <TabsList>
              <TabsTrigger value="structured" disabled={isActionDisabled}>
                <LayoutDashboard className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Structured</span>
              </TabsTrigger>
              <TabsTrigger value="json" disabled={isActionDisabled}>
                <Code className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">JSON</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}
        
        {/* Edit Mode Controls */}
        {editMode ? (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={cancelChanges}
              disabled={isActionDisabled}
            >
              <X className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
            <Button 
              variant="default" 
              size="sm"
              onClick={saveChanges}
              disabled={isActionDisabled}
            >
              <Save className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Save</span>
            </Button>
          </>
        ) : (
          <>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setEditMode(true)}
              disabled={isActionDisabled || showRawJson}
            >
              <Edit className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Edit</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onExportToExcel}
              disabled={isActionDisabled}
            >
              <FileSpreadsheet className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
