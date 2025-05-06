
export interface Comment {
  id: string;
  picture_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_name?: string;
}

export interface DeletePictureDialogProps {
  pictureId: string;
  onDeleted?: () => void;
  className?: string;
}
