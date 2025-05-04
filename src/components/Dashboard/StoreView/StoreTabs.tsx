
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Picture, Store } from "@/types";

interface StoreTabsProps {
  store: Store;
  pictures: Picture[];
  isLoading: boolean;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  children?: React.ReactNode;
}

const StoreTabs: React.FC<StoreTabsProps> = ({
  store,
  pictures,
  isLoading,
  activeTab = "pictures",
  onTabChange,
  children
}) => {
  const handleTabChange = (value: string) => {
    if (onTabChange) {
      onTabChange(value);
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="mb-6">
        <TabsTrigger value="pictures">Pictures</TabsTrigger>
        <TabsTrigger value="analysis">Analysis</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="pictures" className="mt-0">
        {children}
      </TabsContent>
      
      <TabsContent value="analysis" className="mt-0">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-medium">Analysis Dashboard</h3>
          <p className="text-muted-foreground">
            Analysis features coming soon
          </p>
        </div>
      </TabsContent>
      
      <TabsContent value="settings" className="mt-0">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-medium">Store Settings</h3>
          <p className="text-muted-foreground">
            Settings panel coming soon
          </p>
        </div>
      </TabsContent>
    </Tabs>
  );
};

export default StoreTabs;
