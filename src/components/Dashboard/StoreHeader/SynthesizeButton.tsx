
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface SynthesizeButtonProps {
  onSynthesizeStore: () => void;
  className?: string;
}

const SynthesizeButton: React.FC<SynthesizeButtonProps> = ({ onSynthesizeStore, className }) => {
  return (
    <Button 
      onClick={onSynthesizeStore} 
      className={cn("whitespace-nowrap", className)}
      variant="secondary"
    >
      <Sparkles className="mr-2 h-4 w-4" />
      Synthesize Data
    </Button>
  );
};

export default SynthesizeButton;
