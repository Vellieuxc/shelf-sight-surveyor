
import { useState, useEffect } from "react";
import { AnalysisData } from "@/types";

/**
 * Hook for handling edit mode and data editing in the analysis results
 */
export function useAnalysisEditor(
  analysisData: any | null,
  onUpdateAnalysisData?: (updatedData: AnalysisData[]) => void
) {
  // State for edit mode
  const [editMode, setEditMode] = useState(false);
  const [showRawJson, setShowRawJson] = useState(true);
  
  // Create a copy of analysis data for editing
  const [editableData, setEditableData] = useState<AnalysisData[] | null>(null);
  
  // Initialize editable data whenever analysis data changes
  useEffect(() => {
    if (analysisData && Array.isArray(analysisData)) {
      setEditableData([...analysisData]);
    } else {
      // Handle the case when analysisData is not an array
      setEditableData(null);
    }
  }, [analysisData]);
  
  // Toggle between JSON view and table view
  const toggleViewMode = () => {
    setShowRawJson(!showRawJson);
  };
  
  // Handle input change in the table
  const handleInputChange = (index: number, field: keyof AnalysisData, value: any) => {
    if (!editableData) return;
    
    const updatedData = [...editableData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value
    };
    
    setEditableData(updatedData);
  };
  
  // Save changes to analysis data
  const saveChanges = () => {
    if (editableData && onUpdateAnalysisData) {
      onUpdateAnalysisData(editableData);
    }
    setEditMode(false);
  };
  
  // Cancel changes and revert to original data
  const cancelChanges = () => {
    if (analysisData && Array.isArray(analysisData)) {
      setEditableData([...analysisData]);
    } else {
      setEditableData(null);
    }
    setEditMode(false);
  };
  
  return {
    editMode,
    showRawJson,
    editableData,
    toggleViewMode,
    handleInputChange,
    saveChanges,
    cancelChanges,
    setEditMode
  };
}
