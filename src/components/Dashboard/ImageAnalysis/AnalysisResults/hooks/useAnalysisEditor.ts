
import { useState, useEffect } from "react";
import { AnalysisData } from "@/types";

export const useAnalysisEditor = (
  analysisData: AnalysisData[] | null,
  onUpdateAnalysisData?: (updatedData: AnalysisData[]) => void
) => {
  const [editMode, setEditMode] = useState(false);
  const [editableData, setEditableData] = useState<AnalysisData[] | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    // When analysis data changes, update the editable copy
    if (analysisData) {
      setEditableData([...analysisData]);
    } else {
      setEditableData(null);
    }
  }, [analysisData]);

  const handleInputChange = (index: number, field: keyof AnalysisData, value: any) => {
    if (!editableData) return;
    
    const updatedData = [...editableData];
    
    // Handle numeric fields
    if (field === 'sku_count' || field === 'sku_price' || field === 'sku_price_pre_promotion' || 
        field === 'empty_space_estimate') {
      const numValue = value === '' ? undefined : Number(value);
      updatedData[index] = { ...updatedData[index], [field]: numValue };
    } else {
      // Handle string fields
      updatedData[index] = { ...updatedData[index], [field]: value };
    }
    
    setEditableData(updatedData);
  };

  const saveChanges = () => {
    if (editableData && onUpdateAnalysisData) {
      onUpdateAnalysisData(editableData);
    }
    setEditMode(false);
  };

  const cancelChanges = () => {
    // Reset to original data
    if (analysisData) {
      setEditableData([...analysisData]);
    }
    setEditMode(false);
  };

  const toggleViewMode = () => {
    setShowRawJson(!showRawJson);
  };

  return {
    editMode,
    editableData,
    showRawJson,
    setEditMode,
    setEditableData,
    setShowRawJson,
    handleInputChange,
    saveChanges,
    cancelChanges,
    toggleViewMode
  };
};
