
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Store, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StoreNotFound: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container py-8">
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <X className="text-destructive" />
            Store Not Found
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>The store you're looking for doesn't exist or has been removed.</p>
          <div className="flex justify-between">
            <Button onClick={() => navigate(-1)}>Go Back</Button>
            <Button onClick={() => navigate("/dashboard")} variant="outline">
              <Store className="mr-2 h-4 w-4" />
              Browse Stores
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StoreNotFound;
