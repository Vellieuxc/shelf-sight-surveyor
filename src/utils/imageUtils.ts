
// Utility functions for handling images and camera

/**
 * Creates a File object from a canvas element
 */
export const getFileFromCanvas = (canvas: HTMLCanvasElement, fileName: string): Promise<File | null> => {
  return new Promise<File | null>((resolve) => {
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], fileName, { 
          type: 'image/png' 
        });
        resolve(file);
      } else {
        resolve(null);
      }
    }, 'image/png');
  });
};

/**
 * Creates a data URL preview from a File object
 */
export const createImagePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        resolve(event.target.result as string);
      } else {
        reject(new Error("Failed to generate preview"));
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
};

/**
 * Downloads an image from a URL
 */
export const downloadImage = (imageUrl: string, fileName: string): void => {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Format file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
