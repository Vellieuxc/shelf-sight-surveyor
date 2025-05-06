
import React from "react";
import DownloadButton from "./DownloadButton";
import AnalyzeButton from "./AnalyzeButton";
import CommentsButton from "./CommentsButton";
import DeletePictureDialog from "../DeletePictureDialog";

interface MobileFooterProps {
  pictureId: string;
  storeId: string;
  imageUrl: string;
  createdAt: string;
  showComments: boolean;
  toggleComments: () => void;
  allowDelete: boolean;
  onDelete?: () => void;
}

const MobileFooter: React.FC<MobileFooterProps> = ({
  pictureId,
  storeId,
  imageUrl,
  createdAt,
  showComments,
  toggleComments,
  allowDelete,
  onDelete
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 p-2 pt-0 sm:hidden">
      <DownloadButton 
        imageUrl={imageUrl} 
        createdAt={createdAt} 
        size="sm" 
        iconSize={16}
        className="touch-target"
      />
      
      <AnalyzeButton 
        storeId={storeId}
        pictureId={pictureId}
        size="sm"
        iconSize={16}
        className="flex-1"
      />
      
      {allowDelete && (
        <DeletePictureDialog
          pictureId={pictureId}
          onDeleted={onDelete || (() => {})}
          className="touch-target"
        />
      )}
      
      <CommentsButton
        showComments={showComments}
        onToggle={toggleComments}
        pictureId={pictureId}
        size="sm"
        className="touch-target"
      />
    </div>
  );
};

export default MobileFooter;
