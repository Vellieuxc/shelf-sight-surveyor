
import React, { useState, useEffect } from 'react';
import { preloadImage, createPlaceholderImage } from '@/utils/performance/imageOptimization';
import { useRenderPerformanceMonitor } from '@/utils/performance/renderOptimization';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
  placeholderColor?: string;
}

/**
 * Performance optimized image component with lazy loading,
 * placeholder and preloading capabilities
 */
const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  onLoad,
  onError,
  priority = false,
  loading = 'lazy',
  placeholderColor = '#E5E7EB'
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [placeholder, setPlaceholder] = useState<string | null>(null);
  
  // Monitor render performance
  useRenderPerformanceMonitor('OptimizedImage');
  
  // Generate placeholder and preload image
  useEffect(() => {
    if (!src) return;
    
    // Create placeholder
    setPlaceholder(createPlaceholderImage(10, 10));
    
    // Reset state when src changes
    setIsLoaded(false);
    setError(false);
    
    // Preload image if it's marked as priority
    if (priority) {
      preloadImage(src)
        .then(() => {
          setIsLoaded(true);
          onLoad?.();
        })
        .catch(() => {
          setError(true);
          onError?.();
        });
    }
  }, [src, priority, onLoad, onError]);
  
  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };
  
  const handleError = () => {
    setError(true);
    onError?.();
  };
  
  const imageSrc = error ? placeholder || '' : src;
  
  // Apply loading style for better UX
  const imageStyle = {
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease',
    backgroundColor: !isLoaded ? placeholderColor : undefined,
  };
  
  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width, height }}>
      {!isLoaded && placeholder && (
        <img 
          src={placeholder} 
          alt="Loading placeholder"
          className="absolute inset-0 w-full h-full object-cover blur-sm"
          style={{ filter: 'blur(8px)' }}
        />
      )}
      <img 
        src={imageSrc}
        alt={error ? `Error loading image: ${alt}` : alt}
        width={width}
        height={height}
        onLoad={handleLoad}
        onError={handleError}
        loading={loading}
        className="w-full h-full object-cover"
        style={imageStyle}
      />
    </div>
  );
};

export default OptimizedImage;
