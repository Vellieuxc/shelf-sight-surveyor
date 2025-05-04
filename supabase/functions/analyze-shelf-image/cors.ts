
// CORS configuration for the edge function

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-app-version',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function handleCorsOptions() {
  console.log("Handling OPTIONS request with CORS headers");
  return new Response(null, { 
    status: 204, 
    headers: corsHeaders 
  });
}
