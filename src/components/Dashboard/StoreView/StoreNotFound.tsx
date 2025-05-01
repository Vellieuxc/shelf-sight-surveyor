
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const StoreNotFound: React.FC = () => {
  return (
    <div className="container py-6">
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold mb-2">Store not found</h2>
        <p className="text-muted-foreground mb-4">
          The store you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link to="/dashboard">
          <Button>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
};

export default StoreNotFound;
