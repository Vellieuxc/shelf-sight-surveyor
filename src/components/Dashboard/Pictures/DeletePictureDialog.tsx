
import React, { useState } from "react";
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
import { toast } from "sonner";
import { picturesService } from "@/services/api/pictures";
import { useErrorHandling } from "@/hooks/use-error-handling";
import { DeletePictureDialogProps } from "./types";

const DeletePictureDialog: React.FC<DeletePictureDialogProps> = ({
  pictureId,
  onDeleted
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { handleError } = useErrorHandling({
    source: 'database',
    componentName: 'DeletePictureDialog',
    operation: 'deletePicture'
  });

  const handleDelete = async () => {
    if (!pictureId) return;
    
    setIsDeleting(true);
    try {
      await picturesService.deletePicture(pictureId);
      toast.success("Picture deleted successfully");
      setIsOpen(false);
      
      // Call the callback to refresh the list after successful deletion
      if (onDeleted) {
        onDeleted();
      }
    } catch (error) {
      handleError(error, {
        fallbackMessage: "Failed to delete picture",
        operation: 'deletePicture',
        additionalData: { pictureId },
        showToast: true
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="w-full sm:flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
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
              This action cannot be undone. This will permanently delete this picture
              and remove the image file from storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeletePictureDialog;
