
import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { addToAnalysisQueue, getNextAnalysisJob, updateJobStatus, getJobByImageId } from "../../queue.ts";

// Note: For the KV tests, we need to mock the Deno.openKv functionality
// This is a simplified mock implementation for testing purposes
const mockKvStore: Record<string, any> = {};

// Mock Deno.openKv
const originalOpenKv = Deno.openKv;
Deno.openKv = async () => {
  return {
    get: async (key: string[]) => {
      const keyStr = key.join(':');
      return { value: mockKvStore[keyStr] || null };
    },
    set: async (key: string[], value: any) => {
      const keyStr = key.join(':');
      mockKvStore[keyStr] = value;
      return { ok: true };
    },
    list: async ({ prefix }: { prefix: string[] }) => {
      const prefixStr = prefix.join(':');
      const entries = Object.entries(mockKvStore)
        .filter(([key]) => key.startsWith(prefixStr))
        .map(([key, value]) => ({ 
          key: key.split(':'), 
          value 
        }));
      
      return {
        [Symbol.asyncIterator]: async function* () {
          for (const entry of entries) {
            yield entry;
          }
        }
      };
    },
    close: () => {}
  };
};

// Clear mock KV store before each test
beforeEach(() => {
  for (const key in mockKvStore) {
    delete mockKvStore[key];
  }
});

Deno.test("addToAnalysisQueue should create a new job", async () => {
  const job = { imageUrl: "https://example.com/test.jpg", imageId: "test-image-1" };
  const jobId = await addToAnalysisQueue(job);
  
  assertExists(jobId);
  assertEquals(typeof jobId, "string");
  
  // Check job was stored in KV
  const keyStr = `image_analysis_queue:${jobId}`;
  const storedJob = mockKvStore[keyStr];
  
  assertEquals(storedJob.imageUrl, job.imageUrl);
  assertEquals(storedJob.imageId, job.imageId);
  assertEquals(storedJob.status, "pending");
  assertEquals(storedJob.attempts, 0);
  assertExists(storedJob.createdAt);
  
  // Check image ID reference was stored
  const imageIdRefKey = `image_analysis_queue:by_image_id:${job.imageId}`;
  assertEquals(mockKvStore[imageIdRefKey], jobId);
});

Deno.test("getNextAnalysisJob should return the next pending job", async () => {
  // Add a mock job
  const job = { 
    imageUrl: "https://example.com/test.jpg", 
    imageId: "test-image-2",
    status: "pending",
    createdAt: new Date().toISOString(),
    attempts: 0
  };
  
  const jobId = "test-job-id-1";
  mockKvStore[`image_analysis_queue:${jobId}`] = job;
  
  const nextJob = await getNextAnalysisJob();
  
  assertExists(nextJob);
  assertEquals(nextJob.jobId, jobId);
  assertEquals(nextJob.imageUrl, job.imageUrl);
  assertEquals(nextJob.imageId, job.imageId);
  assertEquals(nextJob.attempts, 1); // Should increment attempts
  
  // Check job was updated to processing status
  const updatedJob = mockKvStore[`image_analysis_queue:${jobId}`];
  assertEquals(updatedJob.status, "processing");
  assertExists(updatedJob.startedAt);
});

Deno.test("updateJobStatus should update job status correctly", async () => {
  const jobId = "test-job-id-2";
  const job = { 
    imageUrl: "https://example.com/test.jpg", 
    imageId: "test-image-3",
    status: "processing",
    createdAt: new Date().toISOString(),
    attempts: 1,
    startedAt: new Date().toISOString()
  };
  
  mockKvStore[`image_analysis_queue:${jobId}`] = job;
  
  const result = { data: [{ sku_name: "Test Product" }], processingTimeMs: 1500 };
  await updateJobStatus(jobId, "completed", result);
  
  // Check job was updated
  const updatedJob = mockKvStore[`image_analysis_queue:${jobId}`];
  assertEquals(updatedJob.status, "completed");
  assertExists(updatedJob.completedAt);
  assertEquals(updatedJob.result, result);
  assertEquals(updatedJob.error, null);
});

Deno.test("getJobByImageId should retrieve job by image ID", async () => {
  const jobId = "test-job-id-3";
  const imageId = "test-image-4";
  
  const job = { 
    imageUrl: "https://example.com/test.jpg", 
    imageId: imageId,
    status: "completed",
    createdAt: new Date().toISOString(),
    attempts: 1,
    result: { data: [{ sku_name: "Test Product" }] }
  };
  
  // Store job and image ID reference
  mockKvStore[`image_analysis_queue:${jobId}`] = job;
  mockKvStore[`image_analysis_queue:by_image_id:${imageId}`] = jobId;
  
  const retrievedJob = await getJobByImageId(imageId);
  
  assertExists(retrievedJob);
  assertEquals(retrievedJob.jobId, jobId);
  assertEquals(retrievedJob.imageId, imageId);
  assertEquals(retrievedJob.status, "completed");
  assertExists(retrievedJob.result);
});

// Restore original Deno.openKv after tests
afterAll(() => {
  Deno.openKv = originalOpenKv;
});
