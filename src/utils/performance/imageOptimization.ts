
/**
 * Compresses an image file to reduce its size
 * 
 * @param file The original image file
 * @param maxWidthOrHeight Maximum width or height in pixels
 * @param quality Compression quality (0-1)
 * @returns A promise resolving to the compressed file
 */
export async function compressImage(
  file: File,
  maxWidthOrHeight: number = 1920,
  quality: number = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Don't compress if it's not an image
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }
    
    // Don't compress GIFs (they often get larger when recompressed)
    if (file.type === 'image/gif') {
      resolve(file);
      return;
    }
    
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > height) {
          if (width > maxWidthOrHeight) {
            height = Math.round(height * maxWidthOrHeight / width);
            width = maxWidthOrHeight;
          }
        } else {
          if (height > maxWidthOrHeight) {
            width = Math.round(width * maxWidthOrHeight / height);
            height = maxWidthOrHeight;
          }
        }
        
        // Create canvas and resize image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Draw image with smooth scaling
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas toBlob failed'));
              return;
            }
            
            // Create new file with same name
            const newFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            
            resolve(newFile);
          },
          file.type,
          quality
        );
      };
      
      img.onerror = () => {
        reject(new Error('Image failed to load'));
      };
    };
    
    reader.onerror = () => {
      reject(new Error('FileReader failed'));
    };
  });
}

/**
 * Preloads an image to ensure it's in the browser cache
 * 
 * @param src The image source URL
 * @returns A promise that resolves when the image is loaded
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to preload image: ${src}`));
  });
}

/**
 * Preloads multiple images in parallel
 * 
 * @param sources Array of image URLs to preload
 * @returns A promise that resolves when all images are loaded
 */
export async function preloadImages(sources: string[]): Promise<void> {
  try {
    await Promise.all(sources.map(src => preloadImage(src)));
  } catch (error) {
    console.error('Error preloading images:', error);
    // Continue even if some images fail to load
  }
}

/**
 * Creates a lazy-loading image URL (blurred placeholder)
 * 
 * @param width Width of the placeholder
 * @param height Height of the placeholder
 * @returns A data URL for a placeholder image
 */
export function createPlaceholderImage(width: number = 10, height: number = 10): string {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  
  // Fill with a light gray
  ctx.fillStyle = '#E5E7EB';
  ctx.fillRect(0, 0, width, height);
  
  return canvas.toDataURL('image/png');
}
