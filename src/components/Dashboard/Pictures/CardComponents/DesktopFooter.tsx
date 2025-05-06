
import React from "react";
import { CardFooter } from "@/components/ui/card";
import DownloadButton from "./DownloadButton";
import AnalyzeButton from "./AnalyzeButton";
import CommentsButton from "./CommentsButton";
import DeletePictureDialog from "../DeletePictureDialog";

interface DesktopFooterProps {
  pictureId: string;
  storeId: string;
  imageUrl: string;
  createdAt: string;
  showComments: boolean;
  toggleComments: () => void;
  allowDelete: boolean;
  buttonSize: "sm" | "default";
  iconSize: number;
  onDelete?: () => void;
}

const DesktopFooter: React.FC<DesktopFooterProps> = ({
  pictureId,
  storeId,
  imageUrl,
  createdAt,
  showComments,
  toggleComments,
  allowDelete,
  buttonSize,
  iconSize,
  onDelete
}) => {
  return (
    <CardFooter className="hidden sm:flex flex-wrap gap-2 p-2 pt-0">
      <DownloadButton 
        imageUrl={imageUrl} 
        createdAt={createdAt} 
        size={buttonSize} 
        iconSize={iconSize} 
        className="flex-1"
      />
      
      <AnalyzeButton 
        storeId={storeId}
        pictureId={pictureId}
        size={buttonSize}
        iconSize={iconSize}
        className="flex-1"
      />
      
      {allowDelete && (
        <DeletePictureDialog
          pictureId={pictureId}
          onDeleted={onDelete || (() => {})}
          className="flex-1"
        />
      )}
      
      <CommentsButton
        showComments={showComments}
        onToggle={toggleComments}
        pictureId={pictureId}
        size={buttonSize}
        className="w-full sm:flex-1 md:w-auto"
      />
    </CardFooter>
  );
};

export default DesktopFooter;
