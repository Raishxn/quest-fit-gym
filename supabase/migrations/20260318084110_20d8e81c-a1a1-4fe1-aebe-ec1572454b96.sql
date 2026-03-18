
-- Exercise Ranks table
CREATE TABLE public.exercise_ranks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  current_rank text NOT NULL DEFAULT 'Ferro',
  best_weight_kg numeric NOT NULL DEFAULT 0,
  best_reps integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

ALTER TABLE public.exercise_ranks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercise ranks" ON public.exercise_ranks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exercise ranks" ON public.exercise_ranks FOR ALL USING (auth.uid() = user_id);

-- Storage buckets for avatars and banners
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true);

-- Storage RLS policies
CREATE POLICY "Users can upload own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Avatars are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload own banner" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Users can update own banner" ON storage.objects FOR UPDATE USING (bucket_id = 'banners' AND (storage.foldername(name))[1] = auth.uid()::text);
CREATE POLICY "Banners are publicly viewable" ON storage.objects FOR SELECT USING (bucket_id = 'banners');

-- Enable realtime for exercise_ranks
ALTER PUBLICATION supabase_realtime ADD TABLE public.exercise_ranks;
