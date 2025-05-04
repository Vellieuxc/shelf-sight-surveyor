
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const StoreLoading: React.FC = () => {
  return (
    <div className="container py-6 space-y-6">
      {/* Navigation skeleton */}
      <div className="flex justify-between">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      {/* Store header skeleton */}
      <Card className="p-4 sm:p-6">
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-2 w-full sm:w-2/3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <Skeleton className="h-10 w-full sm:w-36" />
          </div>
        </div>
      </Card>
      
      {/* Actions skeleton */}
      <Skeleton className="h-10 w-48" />
      
      {/* Content grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-7 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Skeleton className="h-[220px] rounded-md" />
            <Skeleton className="h-[220px] rounded-md" />
            <Skeleton className="h-[220px] rounded-md" />
            <Skeleton className="h-[220px] rounded-md" />
          </div>
        </div>
        
        <div>
          <Skeleton className="h-[300px] rounded-md" />
        </div>
      </div>
    </div>
  );
};

export default StoreLoading;
