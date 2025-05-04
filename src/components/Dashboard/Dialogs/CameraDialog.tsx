
import React, { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Camera, SwitchCamera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFileFromCanvas } from "@/utils/imageUtils";
import { useOfflineMode } from "@/hooks/useOfflineMode";

interface CameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File, preview: string) => void;
}

const CameraDialog: React.FC<CameraDialogProps> = ({ open, onOpenChange, onCapture }) => {
  const { toast } = useToast();
  const { isOnline } = useOfflineMode();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment");

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open, facingMode]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check your permissions.",
        variant: "destructive"
      });
      console.error("Error accessing camera:", err);
      onOpenChange(false);
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  const toggleFacingMode = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };
  
  const takePicture = async () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        try {
          const fileName = `camera_capture_${Date.now()}.png`;
          const file = await getFileFromCanvas(canvas, fileName);
          
          if (file) {
            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
              if (event.target?.result) {
                onCapture(file, event.target.result as string);
                stopCamera();
                onOpenChange(false);
              }
            };
            reader.readAsDataURL(file);
          } else {
            toast({
              title: "Capture Failed",
              description: "Failed to capture image",
              variant: "destructive"
            });
          }
        } catch (err) {
          console.error("Error capturing image:", err);
          toast({
            title: "Processing Error",
            description: "Failed to process captured image",
            variant: "destructive"
          });
        }
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Take a Picture</DialogTitle>
          <DialogDescription>
            {isOnline ? 
              "Take a picture of the store." : 
              "You're offline. Pictures will be saved locally and uploaded when you reconnect."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="relative aspect-video w-full bg-black rounded-md overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              className="w-full h-full object-cover"
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <Button 
              size="icon"
              variant="secondary"
              className="absolute top-2 right-2 p-1.5 h-8 w-8 opacity-80"
              onClick={toggleFacingMode}
            >
              <SwitchCamera className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={takePicture}>
            <Camera className="mr-2 h-4 w-4" />
            Take a picture
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CameraDialog;
