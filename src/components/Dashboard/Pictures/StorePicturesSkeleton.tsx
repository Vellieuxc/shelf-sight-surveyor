
import React from "react";
import PictureGridSkeleton from "./PictureGridSkeleton";

const StorePicturesSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return <PictureGridSkeleton count={count} />;
};

export default StorePicturesSkeleton;
