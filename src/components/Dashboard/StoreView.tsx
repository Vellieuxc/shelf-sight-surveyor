
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Store, Picture } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Camera, Trash2, Image, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface StoreViewProps {
  storeId: string;
}

const StoreView: React.FC<StoreViewProps> = ({ storeId }) => {
  const [store, setStore] = useState<Store | null>(null);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    const fetchStoreAndPictures = async () => {
      try {
        // Fetch store info
        const { data: storeData, error: storeError } = await supabase
          .from("stores")
          .select("*")
          .eq("id", storeId)
          .single();

        if (storeError) throw storeError;
        setStore(storeData);

        // Fetch pictures for this store
        const { data: picturesData, error: picturesError } = await supabase
          .from("pictures")
          .select("*")
          .eq("store_id", storeId)
          .order("created_at", { ascending: false });

        if (picturesError) throw picturesError;
        setPictures(picturesData || []);
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
        toast.error("Failed to load store data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreAndPictures();
  }, [storeId]);

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
          image_url: publicUrlData.publicUrl
        });
      
      if (dbError) throw dbError;
      
      // Refresh picture list
      const { data: refreshedPictures, error: refreshError } = await supabase
        .from("pictures")
        .select("*")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false });
      
      if (refreshError) throw refreshError;
      setPictures(refreshedPictures || []);
      
      toast.success("Picture uploaded successfully!");
      setIsUploadDialogOpen(false);
      setSelectedFile(null);
      
    } catch (error: any) {
      console.error("Error uploading picture:", error.message);
      toast.error("Failed to upload picture");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeletePicture = async (pictureId: string) => {
    if (!confirm("Are you sure you want to delete this picture?")) return;
    
    try {
      const { error } = await supabase
        .from("pictures")
        .delete()
        .eq("id", pictureId);
      
      if (error) throw error;
      
      // Update pictures state
      setPictures(pictures.filter(pic => pic.id !== pictureId));
      
      toast.success("Picture deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting picture:", error.message);
      toast.error("Failed to delete picture");
    }
  };

  const handleAnalyzePicture = (pictureId: string) => {
    navigate(`/dashboard/stores/${storeId}/analyze?pictureId=${pictureId}`);
  };

  const handleSynthesizeStore = () => {
    toast.info("Synthesizing store data...");
    // This would be implemented later - placeholder for now
  };

  if (isLoading) {
    return <div className="container px-4 py-8">Loading store data...</div>;
  }

  if (!store) {
    return (
      <div className="container px-4 py-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Store not found</h2>
          <Button onClick={() => navigate("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-muted-foreground">{store.address}, {store.country}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => navigate(`/dashboard/projects/${store.project_id}/stores`)}
          >
            <LayoutDashboard className="mr-2 h-4 w-4" />
            Back to Stores
          </Button>
          <Button
            onClick={() => handleSynthesizeStore()}
          >
            <Image className="mr-2 h-4 w-4" />
            Synthesize Store
          </Button>
          <Button
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Camera className="mr-2 h-4 w-4" />
            Upload Picture
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pictures.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted-foreground">No pictures uploaded yet.</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              <Camera size={16} className="mr-2" />
              Upload First Picture
            </Button>
          </div>
        ) : (
          pictures.map((picture) => (
            <Card key={picture.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 bg-muted">
                <img
                  src={picture.image_url}
                  alt={`Store picture ${picture.id}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-muted-foreground">
                    {new Date(picture.created_at).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAnalyzePicture(picture.id)}
                    >
                      Analyze
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                      onClick={() => handleDeletePicture(picture.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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
    </div>
  );
};

export default StoreView;
