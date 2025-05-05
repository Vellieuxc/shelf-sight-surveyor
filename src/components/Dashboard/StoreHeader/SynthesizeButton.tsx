
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SynthesizeButtonProps {
  onSynthesizeStore: () => void;
  className?: string;
  variant?: "default" | "secondary" | "outline" | "ghost";
  children?: React.ReactNode;
}

const SynthesizeButton: React.FC<SynthesizeButtonProps> = ({ 
  onSynthesizeStore, 
  className,
  variant = "secondary",
  children 
}) => {
  return (
    <Button 
      onClick={onSynthesizeStore} 
      className={cn("whitespace-nowrap", className)}
      variant={variant}
    >
      {children || (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Synthesize Data
        </>
      )}
    </Button>
  );
};

export default SynthesizeButton;
