
import React from "react";
import { Button } from "@/components/ui/button";

interface FormButtonsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

const FormButtons: React.FC<FormButtonsProps> = ({ isSubmitting, onCancel }) => {
  return (
    <div className="flex justify-end gap-2 pt-4">
      <Button
        variant="outline"
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Creating..." : "Create Store"}
      </Button>
    </div>
  );
};

export default FormButtons;
