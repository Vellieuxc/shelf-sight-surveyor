
import { corsHeaders } from "./cors.ts";
import { getJobByImageId } from "./queue.ts";

// Handle status check requests
export async function handleStatusCheck(req: Request, requestId: string): Promise<Response> {
  // Parse the request body
  const { imageId } = await req.json();
  
  if (!imageId) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Missing imageId parameter",
        requestId
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  console.log(`Checking status for image [${requestId}]: ${imageId}`);
  
  // Get the job status
  const jobStatus = await getJobByImageId(imageId);
  
  if (!jobStatus) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "No job found for the given imageId",
        requestId
      }),
      { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
  
  // Return the job status
  return new Response(
    JSON.stringify({ 
      success: true,
      status: jobStatus.status,
      jobId: jobStatus.jobId,
      imageId: jobStatus.imageId,
      createdAt: jobStatus.createdAt,
      data: jobStatus.result,
      message: jobStatus.error || undefined,
      requestId
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
}
