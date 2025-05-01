
import { useToast } from "@/components/ui/use-toast";
import { AnalysisData } from "@/types";

export const useDataExport = () => {
  const { toast } = useToast();

  const handleExportToExcel = (analysisData: AnalysisData[] | null) => {
    if (!analysisData) return;

    // Create CSV content
    let csvContent = "SKU Name,Brand,Count,Price,Position,Pre-Promotion Price,Post-Promotion Price,Empty Space %\n";
    
    analysisData.forEach(item => {
      csvContent += [
        `"${item.sku_name || ''}"`,
        `"${item.brand || ''}"`,
        item.sku_count || '',
        item.sku_price || '',
        `"${item.sku_position || ''}"`,
        item.sku_price_pre_promotion || '',
        item.sku_price_post_promotion || '',
        item.empty_space_estimate || ''
      ].join(',') + '\n';
    });
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `shelf-analysis-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Export Complete",
      description: "Analysis data has been exported to CSV.",
    });
  };

  return {
    handleExportToExcel
  };
};
