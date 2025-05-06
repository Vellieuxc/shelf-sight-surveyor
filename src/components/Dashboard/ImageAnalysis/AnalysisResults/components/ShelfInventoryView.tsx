
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CircleAlert, CircleCheck, Package, PackageOpen } from "lucide-react";

interface ShelfInventoryViewProps {
  data: any;
}

export const ShelfInventoryView: React.FC<ShelfInventoryViewProps> = ({ data }) => {
  // Early return if no data or not in expected format
  if (!data || !data.shelves) {
    return (
      <div className="text-center p-6 text-muted-foreground">
        No structured inventory data available
      </div>
    );
  }

  const metadata = data.metadata || {};
  const shelves = data.shelves || [];

  // Function to determine stock level color
  const getStockLevelColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case "high": return "bg-green-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      {/* Metadata summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-medium">Inventory Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Total Items</span>
              <span className="text-2xl font-bold">{metadata.total_items || 0}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Out of Stock</span>
              <span className="text-2xl font-bold">{metadata.out_of_stock_positions || 0}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Empty Space %</span>
              <span className="text-2xl font-bold">{metadata.empty_space_percentage || 0}%</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm text-muted-foreground">Image Quality</span>
              <span className="text-2xl font-bold capitalize">{metadata.image_quality || "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Shelves */}
      {shelves.map((shelf: any, shelfIndex: number) => (
        <Card key={`shelf-${shelfIndex}`}>
          <CardHeader>
            <CardTitle className="text-lg font-medium capitalize">
              {shelf.position} Shelf
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {shelf.items?.map((item: any, itemIndex: number) => (
                <React.Fragment key={`item-${shelfIndex}-${itemIndex}`}>
                  {itemIndex > 0 && <Separator className="my-2" />}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {item.out_of_stock ? (
                        <div className="flex items-center space-x-2">
                          <PackageOpen className="h-5 w-5 text-red-500" />
                          <div>
                            <div className="font-medium flex items-center">
                              <span>Empty Space</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {item.position}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {item.missing_product !== "Unknown" ? 
                                `Missing: ${item.missing_product}` : 
                                `Width: ${item.empty_space_width || "unknown"}`}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <Package className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium flex items-center">
                              <span>{item.product_name}</span>
                              <Badge variant="outline" className="ml-2 text-xs">
                                {item.position}
                              </Badge>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Brand: </span>
                              <span>{item.brand}</span>
                            </div>
                            <div className="text-sm">
                              <span className="text-muted-foreground">Price: </span>
                              <span className="font-medium">{item.price}</span>
                              {item.facings > 1 && (
                                <span className="text-muted-foreground ml-2">
                                  ({item.facings} facings)
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-right">
                      {!item.out_of_stock && (
                        <div className="flex items-center justify-end">
                          <div className={`w-3 h-3 rounded-full ${getStockLevelColor(item.stock_level)} mr-2`}></div>
                          <span className="text-sm font-medium capitalize">{item.stock_level || "Unknown"}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-end mt-1">
                        {item.out_of_stock ? (
                          <Badge variant="destructive" className="text-xs">Out of Stock</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs bg-green-50">In Stock</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
              
              {(!shelf.items || shelf.items.length === 0) && (
                <div className="text-center py-4 text-muted-foreground">
                  No items detected on this shelf
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
