-- Body measurements table for weight tracking over time
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  weight_kg NUMERIC NOT NULL,
  body_fat_percent NUMERIC,
  waist_cm NUMERIC,
  measured_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast user queries
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date
  ON public.body_measurements (user_id, measured_at DESC);

-- Enable RLS
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;

-- Users can view and manage their own measurements
CREATE POLICY "Users read own measurements"
  ON public.body_measurements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own measurements"
  ON public.body_measurements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own measurements"
  ON public.body_measurements FOR DELETE
  USING (auth.uid() = user_id);
