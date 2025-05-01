
import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface SynthesizeButtonProps {
  onSynthesizeStore: () => void;
}

const SynthesizeButton: React.FC<SynthesizeButtonProps> = ({ onSynthesizeStore }) => {
  return (
    <Button onClick={onSynthesizeStore} className="whitespace-nowrap">
      <Sparkles className="mr-2 h-4 w-4" />
      Synthesize Data
    </Button>
  );
};

export default SynthesizeButton;
