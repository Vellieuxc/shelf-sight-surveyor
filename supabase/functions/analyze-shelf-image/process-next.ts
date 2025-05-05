
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { handleProcessNext } from "./queue-processor.ts";
import { generateRequestId } from "./utils.ts";

// Simple endpoint to manually trigger queue processing
serve(async (req) => {
  const requestId = generateRequestId();
  console.log(`Process-next function invoked [${requestId}]`);
  return await handleProcessNext(req, requestId);
});
