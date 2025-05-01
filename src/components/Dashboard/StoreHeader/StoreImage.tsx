
import React from "react";

interface StoreImageProps {
  imageUrl: string | null;
  storeName: string;
}

const StoreImage: React.FC<StoreImageProps> = ({ imageUrl, storeName }) => {
  if (!imageUrl) return null;
  
  return (
    <div className="w-full h-48 mb-6 rounded-lg overflow-hidden">
      <img 
        src={imageUrl} 
        alt={`${storeName} store`} 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export default StoreImage;
