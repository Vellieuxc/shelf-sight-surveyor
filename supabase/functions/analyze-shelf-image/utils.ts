
import { ValidationError } from "./error-handler.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

// Helper function to generate request IDs
export function generateRequestId(): string {
  const randomBytes = crypto.getRandomValues(new Uint8Array(16));
  return [...randomBytes].map(b => b.toString(16).padStart(2, '0')).join('');
}

// Extract and validate data from the request
export async function validateRequest(req: Request, requestId: string): Promise<{ imageUrl: string, imageId: string }> {
  const requestData = await req.json().catch(error => {
    console.error(`Failed to parse request body [${requestId}]:`, error);
    throw new ValidationError("Invalid request body format");
  });
  
  const { imageUrl, imageId } = requestData;
  
  if (!imageUrl) {
    console.error(`Image URL is required but was not provided [${requestId}]`);
    throw new ValidationError("Image URL is required");
  }
  
  return { imageUrl, imageId: imageId || 'unspecified' };
}

// Transform the analysis data to our application format
export function transformAnalysisData(analysisData: any[]): any[] {
  return analysisData.map(item => {
    return {
      sku_name: item.SKUFullName || '',
      brand: item.SKUBrand || '',
      sku_count: item.NumberFacings || 0,
      sku_price: parseFloat(item.PriceSKU?.replace(/[^0-9.]/g, '')) || 0,
      sku_position: item.ShelfSection || '',
      sku_confidence: item.BoundingBox?.confidence ? 
        (item.BoundingBox.confidence >= 0.9 ? 'high' : 
         item.BoundingBox.confidence >= 0.7 ? 'mid' : 'low') : 
        'unknown',
      empty_space_estimate: item.OutofStock === true ? 100 : undefined
    };
  });
}

// Simple in-memory storage for future queue implementation
// This is a placeholder for a proper queue system
const analysisQueue: Array<{ imageUrl: string, imageId: string }> = [];

// Add a job to the analysis queue (placeholder implementation)
export async function addToAnalysisQueue(job: { imageUrl: string, imageId: string }): Promise<void> {
  analysisQueue.push(job);
  console.log(`Added job to queue: ${job.imageId}`);
  
  // In a real implementation, we would post to a proper queue service
  // For now, we just return - in production this would be connected to a worker process
}

// Get the next job from the queue (placeholder implementation)
export async function getNextAnalysisJob(): Promise<{ imageUrl: string, imageId: string } | null> {
  if (analysisQueue.length === 0) return null;
  return analysisQueue.shift() || null;
}
