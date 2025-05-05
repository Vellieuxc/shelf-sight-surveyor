
-- Create the analysis queue table
CREATE TABLE IF NOT EXISTS public.analysis_queue (
  job_id UUID PRIMARY KEY,
  image_id TEXT NOT NULL,
  image_url TEXT NOT NULL,
  status TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  result JSONB,
  error_message TEXT
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS analysis_queue_status_idx ON public.analysis_queue(status);
CREATE INDEX IF NOT EXISTS analysis_queue_image_id_idx ON public.analysis_queue(image_id);

-- Set up RLS policies
ALTER TABLE public.analysis_queue ENABLE ROW LEVEL SECURITY;

-- Grant access to authenticated users
CREATE POLICY "Authenticated users can read their analysis jobs" 
  ON public.analysis_queue FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Service role can do everything (for edge functions)
CREATE POLICY "Service role can do everything with analysis jobs"
  ON public.analysis_queue
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
