
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Camera } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface PictureUploadProps {
  storeId: string;
  onPictureUploaded: () => void;
}

const PictureUpload: React.FC<PictureUploadProps> = ({ storeId, onPictureUploaded }) => {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
      onPictureUploaded();
      
    } catch (error: any) {
      console.error("Error uploading picture:", error.message);
      toast.error("Failed to upload picture");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button onClick={() => setIsUploadDialogOpen(true)}>
        <Camera className="mr-2 h-4 w-4" />
        Upload Picture
      </Button>

      <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Upload Picture</DialogTitle>
            <DialogDescription>
              Upload a new picture for this store.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
    </>
  );
};

export default PictureUpload;
