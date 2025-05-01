
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Camera, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface PictureUploadProps {
  storeId: string;
  onPictureUploaded: () => void;
}

const PictureUpload: React.FC<PictureUploadProps> = ({ storeId, onPictureUploaded }) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
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
      toast.error("Failed to access camera. Please check your permissions.");
      console.error("Error accessing camera:", err);
    }
  };
  
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };
  
  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `camera_capture_${Date.now()}.png`, { 
              type: 'image/png' 
            });
            setSelectedFile(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (event) => {
              setImagePreview(event.target?.result as string);
            };
            reader.readAsDataURL(file);
          }
        }, 'image/png');
      }
      
      stopCamera();
      setIsCameraDialogOpen(false);
      setIsUploadDialogOpen(true);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;
    
    setIsUploading(true);
    
    try {
      // Upload the file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `stores/${storeId}/${fileName}`;
      
      // Create a storage object
      const { error: uploadError } = await supabase.storage
        .from('pictures')
        .upload(filePath, selectedFile);
      
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('pictures')
        .getPublicUrl(filePath);
      
      // Save picture metadata to database
      const { error: dbError } = await supabase
        .from("pictures")
        .insert({
          store_id: storeId,
          uploaded_by: user.id,
          image_url: publicUrlData.publicUrl,
          analysis_data: []
        });
      
      if (dbError) throw dbError;
      
      toast.success("Picture uploaded successfully!");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      setImagePreview(null);
      onPictureUploaded();
      
    } catch (error: any) {
      console.error("Error uploading picture:", error.message);
      toast.error("Failed to upload picture");
    } finally {
      setIsUploading(false);
    }
  };

  const openCameraDialog = () => {
    setIsCameraDialogOpen(true);
    // Start camera when dialog opens
    setTimeout(() => {
      startCamera();
    }, 500);
  };

  const closeCameraDialog = () => {
    stopCamera();
    setIsCameraDialogOpen(false);
  };

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setIsUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Picture
        </Button>
        <Button onClick={openCameraDialog} variant="secondary">
          <Camera className="mr-2 h-4 w-4" />
          Take a Picture
        </Button>
      </div>

      {/* Upload Dialog */}
      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Picture</DialogTitle>
            <DialogDescription>
              Upload a new picture for this store.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {imagePreview && (
              <div className="relative w-full h-40 mb-2">
                <img 
                  src={imagePreview}
                  alt="Preview" 
                  className="w-full h-full object-contain bg-muted rounded-md"
                />
              </div>
            )}
            <div className="grid gap-2">
              <input
                id="picture"
                name="picture"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="cursor-pointer block w-full text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpload} 
              disabled={isUploading || !selectedFile}
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Camera Dialog */}
      <Dialog open={isCameraDialogOpen} onOpenChange={closeCameraDialog}>
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
            <Button type="button" variant="outline" onClick={closeCameraDialog}>
              Cancel
            </Button>
            <Button onClick={takePicture}>
              <Camera className="mr-2 h-4 w-4" />
              Capture
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PictureUpload;
