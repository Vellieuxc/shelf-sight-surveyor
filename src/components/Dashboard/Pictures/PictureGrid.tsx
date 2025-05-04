
import React, { useRef, useEffect, useState } from "react";
import { Picture } from "@/types";
import PictureCard from "./PictureCard";
import { FixedSizeGrid as Grid } from "react-window";
import { useIsMobile } from "@/hooks/use-mobile";
import { useResizeObserver } from "@/hooks/use-resize-observer";

interface PictureGridProps {
  pictures: Picture[];
  onDeletePicture: (id: string) => void;
  allowEditing?: boolean;
  creatorMap?: Record<string, string>;
}

// Fixed card aspect ratio (width:height)
const CARD_ASPECT_RATIO = 1.2;
// Gap between cards
const GAP_SIZE = 16;
// Minimum width for cards
const MIN_CARD_WIDTH = 280;

const PictureGrid: React.FC<PictureGridProps> = ({ 
  pictures, 
  onDeletePicture, 
  allowEditing = true,
  creatorMap = {} 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  
  // State for grid dimensions
  const [dimensions, setDimensions] = useState({
    width: 0,
    height: 600,
    columnCount: 1
  });

  // Calculate the number of columns based on container width and breakpoints
  const calculateColumnCount = (width: number): number => {
    if (width < 640) return 1; // Mobile
    if (width < 1280) return 2; // Tablet
    return 3; // Desktop
  };

  // Track container size changes with ResizeObserver
  const { width } = useResizeObserver(containerRef);

  // Update dimensions when container width changes
  useEffect(() => {
    if (width) {
      const columnCount = calculateColumnCount(width);
      const availableWidth = width - (GAP_SIZE * (columnCount - 1));
      const cardWidth = Math.max(MIN_CARD_WIDTH, Math.floor(availableWidth / columnCount));
      const cardHeight = Math.floor(cardWidth / CARD_ASPECT_RATIO);
      
      setDimensions({
        width,
        height: Math.max(600, window.innerHeight - 200), // Set a reasonable height for the virtualized container
        columnCount
      });
    }
  }, [width]);

  // If no pictures, show empty state
  if (pictures.length === 0) {
    return (
      <div className="text-center p-4 sm:p-8 border border-dashed rounded-lg">
        <p className="text-muted-foreground">No pictures available</p>
        <p className="text-sm text-muted-foreground">Upload some pictures to analyze this store</p>
      </div>
    );
  }

  // Calculate column width based on container width and column count
  const columnWidth = dimensions.columnCount > 0 
    ? Math.floor((dimensions.width - (GAP_SIZE * (dimensions.columnCount - 1))) / dimensions.columnCount)
    : MIN_CARD_WIDTH;

  // Calculate row height maintaining the aspect ratio
  const rowHeight = Math.floor(columnWidth / CARD_ASPECT_RATIO) + GAP_SIZE;
  
  // Calculate total number of rows needed
  const rowCount = Math.ceil(pictures.length / dimensions.columnCount);

  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number; rowIndex: number; style: React.CSSProperties }) => {
    const index = rowIndex * dimensions.columnCount + columnIndex;
    
    // Return empty div if index is out of bounds
    if (index >= pictures.length) {
      return <div style={style} />;
    }
    
    const picture = pictures[index];
    
    // Apply gap spacing to the style
    const cellStyle = {
      ...style,
      left: Number(style.left) + (columnIndex * GAP_SIZE),
      top: Number(style.top) + (rowIndex * GAP_SIZE),
      width: columnWidth,
      height: rowHeight - GAP_SIZE,
      padding: 0
    };
    
    return (
      <div style={cellStyle} role="listitem">
        <PictureCard 
          picture={picture} 
          onDelete={() => onDeletePicture(picture.id)}
          allowDelete={allowEditing}
          createdByName={creatorMap[picture.uploaded_by]}
        />
      </div>
    );
  };

  return (
    <div ref={containerRef} className="w-full" style={{ height: dimensions.height }}>
      {dimensions.width > 0 && dimensions.columnCount > 0 && (
        <Grid
          className="scrollbar-thin"
          columnCount={dimensions.columnCount}
          columnWidth={columnWidth}
          height={dimensions.height}
          rowCount={rowCount}
          rowHeight={rowHeight}
          width={dimensions.width}
        >
          {Cell}
        </Grid>
      )}
    </div>
  );
};

export default PictureGrid;
