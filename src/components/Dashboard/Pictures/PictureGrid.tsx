
import React, { useRef, useEffect } from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";

interface PictureGridProps {
  pictures: Picture[];
  onDeletePicture: (id: string) => void;
  allowEditing?: boolean;
  creatorMap?: Record<string, string>;
}

const PictureGrid: React.FC<PictureGridProps> = ({ 
  pictures, 
  onDeletePicture, 
  allowEditing = true,
  creatorMap = {} 
}) => {
  const pictureRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  
  useEffect(() => {
    // Set up intersection observer for lazy loading
    const observerOptions = {
      root: null, // viewport
      rootMargin: '100px', // start loading when 100px from viewport
      threshold: 0.1, // trigger when 10% visible
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Stop observing this element if it's in view
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
    
    // Observe all the picture card elements
    pictureRefs.current.forEach(element => {
      if (element) {
        observer.observe(element);
      }
    });
    
    return () => {
      // Clean up observer
      observer.disconnect();
    };
  }, [pictures.length]);
  
  if (pictures.length === 0) {
    return (
      <div className="text-center p-4 sm:p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No pictures available</p>
        <p className="text-sm text-muted-foreground">Upload some pictures to analyze this store</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
      {pictures.map((picture) => (
        <div 
          key={picture.id}
          ref={el => el && pictureRefs.current.set(picture.id, el)}
        >
          <PictureCard 
            picture={picture} 
            onDelete={() => onDeletePicture(picture.id)}
            allowDelete={allowEditing}
            createdByName={creatorMap[picture.uploaded_by]}
          />
        </div>
      ))}
    </div>
  );
};

export default PictureGrid;
