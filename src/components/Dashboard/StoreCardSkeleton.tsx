
import React from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

const StoreCardSkeleton: React.FC = () => {
  return (
    <Card className="card-shadow overflow-hidden">
      <div className="h-40 bg-muted animate-pulse" />
      <CardHeader>
        <div className="h-6 w-3/4 bg-muted animate-pulse mb-2 rounded-md" />
        <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-4 w-full bg-muted animate-pulse rounded-md" />
          <div className="h-4 w-3/4 bg-muted animate-pulse rounded-md" />
        </div>
      </CardContent>
      <CardFooter>
        <div className="h-9 w-full bg-muted animate-pulse rounded-md" />
      </CardFooter>
    </Card>
  );
};

export default StoreCardSkeleton;
