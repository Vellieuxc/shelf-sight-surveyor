
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { picturesService } from "@/services/api/pictures";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { useIsMobile } from "@/hooks/use-mobile";

interface DeletePictureDialogProps {
  pictureId: string;
  onDeleted: () => void;
}

const DeletePictureDialog = ({ pictureId, onDeleted }: DeletePictureDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { handleError } = useErrorHandling({
    source: 'ui',
    componentName: 'DeletePictureDialog'
  });
  const isMobile = useIsMobile();
  
  const handleDelete = async () => {
    if (!pictureId) {
      setIsOpen(false);
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await picturesService.deletePicture(pictureId);
      
      toast({
        title: "Picture deleted",
        description: "The picture has been successfully deleted"
      });
      
      onDeleted();
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to delete the picture",
        operation: "deletePicture",
        additionalData: { pictureId }
      });
    } finally {
      setIsDeleting(false);
      setIsOpen(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="ghost" 
        size={isMobile ? "sm" : "default"} 
        className="text-destructive hover:text-destructive-foreground hover:bg-destructive/90 w-full sm:flex-1"
        onClick={() => setIsOpen(true)}
      >
        <Trash2 className="mr-1 h-4 w-4" />
        <span>Delete</span>
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the picture 
              from the server and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete picture"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeletePictureDialog;
