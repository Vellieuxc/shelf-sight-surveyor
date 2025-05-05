
import { assertEquals, assertNotEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { addToAnalysisQueue, getNextAnalysisJob, updateJobStatus, getJobByImageId } from "../../queue.ts";
import { stub, restore } from "https://deno.land/std@0.168.0/testing/mock.ts";

// Mock Supabase client and responses
const mockSupabaseClient = {
  from: () => ({
    insert: () => ({ error: null }),
    select: () => ({
      eq: () => ({
        order: () => ({
          limit: () => ({
            single: () => ({ data: { job_id: "test-job-id", image_id: "test-image", image_url: "test-url", status: "pending", attempts: 0 }, error: null })
          })
        }),
        order: () => ({
          limit: () => ({
            single: () => ({ data: { job_id: "test-job-id", image_id: "test-image", image_url: "test-url", status: "pending", attempts: 0 }, error: null })
          })
        })
      })
    }),
    update: () => ({
      eq: () => ({ error: null })
    })
  })
};

// Tests for queue functionality
Deno.test("Queue operations", async () => {
  // Mock environment and createClient
  Deno.env.set("SUPABASE_URL", "https://test-url.com");
  Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", "test-key");
  
  // Stub the createClient function to return our mock
  const createClientModule = await import("@supabase/supabase-js");
  stub(createClientModule, "createClient", () => mockSupabaseClient);
  
  try {
    // Test addToAnalysisQueue
    const jobId = await addToAnalysisQueue({
      imageUrl: "https://example.com/image.jpg",
      imageId: "test-image-123"
    });
    
    assertNotEquals(jobId, undefined);
    assertEquals(typeof jobId, "string");
    
    // Test getNextAnalysisJob
    const job = await getNextAnalysisJob();
    assertEquals(job?.jobId, "test-job-id");
    assertEquals(job?.imageId, "test-image");
    
    // Test updateJobStatus
    await updateJobStatus("test-job-id", "completed", { result: "success" });
    
    // Test getJobByImageId
    const status = await getJobByImageId("test-image");
    assertEquals(status?.jobId, "test-job-id");
    assertEquals(status?.status, "pending");
    
  } finally {
    // Clean up stubs
    restore();
  }
});
