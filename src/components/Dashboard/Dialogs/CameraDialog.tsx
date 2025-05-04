
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getFileFromCanvas } from "@/utils/imageUtils";

interface CameraDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCapture: (file: File, preview: string) => void;
}

const CameraDialog: React.FC<CameraDialogProps> = ({ open, onOpenChange, onCapture }) => {
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [open]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: "environment" }
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
            Use your camera to take a picture of the store.
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
