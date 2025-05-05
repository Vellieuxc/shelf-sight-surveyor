
// Simple performance monitoring for Claude API calls

type MonitoredFunction<T> = () => Promise<T>;

// In-memory metrics storage (in a production environment, these would be sent to a proper monitoring system)
const metrics = {
  totalCalls: 0,
  successfulCalls: 0,
  failedCalls: 0,
  totalResponseTime: 0,
  averageResponseTime: 0,
  lastTenResponseTimes: [] as number[],
};

// Monitor a Claude API call with timing and success tracking
export async function monitorClaudeCall<T>(fn: MonitoredFunction<T>): Promise<T> {
  metrics.totalCalls++;
  
  const startTime = performance.now();
  try {
    // Execute the actual API call
    const result = await fn();
    
    // Record success metrics
    const duration = performance.now() - startTime;
    recordSuccessMetrics(duration);
    
    return result;
  } catch (error) {
    // Record failure metrics
    metrics.failedCalls++;
    const errorRate = (metrics.failedCalls / metrics.totalCalls) * 100;
    
    // Log error rate if it's concerning
    if (errorRate > 10) {
      console.warn(`⚠️ Claude API error rate: ${errorRate.toFixed(2)}% (${metrics.failedCalls}/${metrics.totalCalls})`);
    }
    
    // Re-throw the error to be handled by the caller
    throw error;
  }
}

// Record metrics for successful API calls
function recordSuccessMetrics(duration: number): void {
  metrics.successfulCalls++;
  metrics.totalResponseTime += duration;
  
  // Update rolling average
  metrics.averageResponseTime = metrics.totalResponseTime / metrics.successfulCalls;
  
  // Track last 10 response times for variance analysis
  metrics.lastTenResponseTimes.push(duration);
  if (metrics.lastTenResponseTimes.length > 10) {
    metrics.lastTenResponseTimes.shift();
  }
  
  // Log performance metrics periodically (every 10 calls)
  if (metrics.successfulCalls % 10 === 0) {
    console.log(`📊 Claude API Stats: 
    - Avg response time: ${metrics.averageResponseTime.toFixed(2)}ms
    - Success rate: ${((metrics.successfulCalls / metrics.totalCalls) * 100).toFixed(2)}%
    - Total calls: ${metrics.totalCalls}`);
  }
  
  // Alert on slow response times
  if (duration > metrics.averageResponseTime * 2 && metrics.successfulCalls > 10) {
    console.warn(`⚠️ Slow Claude API response: ${duration.toFixed(2)}ms (avg: ${metrics.averageResponseTime.toFixed(2)}ms)`);
  }
}

// Get the current metrics (for future API endpoints that could expose monitoring data)
export function getMetrics() {
  return {
    ...metrics,
    successRate: metrics.totalCalls > 0 ? 
      ((metrics.successfulCalls / metrics.totalCalls) * 100).toFixed(2) + '%' : 
      'N/A',
  };
}
