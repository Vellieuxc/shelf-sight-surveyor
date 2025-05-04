
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
 * Validates file types against an allowed list
 */
export const validateImageType = (file: File, allowedTypes: string[] = ["image/jpeg", "image/png", "image/jpg", "image/webp"]): boolean => {
  return allowedTypes.includes(file.type);
};

/**
 * Validates file size against a maximum size in MB
 */
export const validateImageSize = (file: File, maxSizeMB: number = 10): boolean => {
  const fileSizeInMB = file.size / (1024 * 1024);
  return fileSizeInMB <= maxSizeMB;
};

/**
 * Creates a safe filename for storage
 */
export const createSafeImageFilename = (originalName: string): string => {
  // Remove potentially dangerous characters
  const safeName = originalName
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_');
  
  // Generate a random suffix for uniqueness
  const randomSuffix = Math.random().toString(36).substring(2, 9);
  
  // Extract file extension
  const parts = safeName.split('.');
  const extension = parts.length > 1 ? parts.pop() : '';
  const nameWithoutExtension = parts.join('.');
  
  // Combine with random suffix
  return `${nameWithoutExtension}_${randomSuffix}.${extension}`;
};

/**
 * Downloads an image from a URL
 * Uses fetch API for cross-origin images and falls back to anchor element
 */
export const downloadImage = (imageUrl: string, fileName: string): void => {
  // Try using fetch for better cross-origin support
  fetch(imageUrl)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.blob();
    })
    .then(blob => {
      // Create object URL from the fetched blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Create a link element to handle the download
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = fileName;
      
      // Append to the document body
      document.body.appendChild(link);
      
      // Trigger the click event
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      
      // Release the object URL
      URL.revokeObjectURL(blobUrl);
    })
    .catch(error => {
      console.error("Error downloading image with fetch:", error);
      
      // Fallback to the original method
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
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

/**
 * Convert a Blob to a base64 string
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Convert a base64 string to a Blob
 */
export const base64ToBlob = (base64: string, contentType = ''): Blob => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i += 512) {
    const slice = byteCharacters.slice(i, i + 512);
    const byteNumbers = new Array(slice.length);
    
    for (let j = 0; j < slice.length; j++) {
      byteNumbers[j] = slice.charCodeAt(j);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};
