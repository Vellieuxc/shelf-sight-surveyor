
// Utility functions for handling images and camera

export const getFileFromCanvas = (canvas: HTMLCanvasElement, fileName: string): File | null => {
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
