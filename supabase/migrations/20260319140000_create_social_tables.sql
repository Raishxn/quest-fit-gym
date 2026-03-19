-- Add Social features to profiles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'last_seen'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN last_seen timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'current_workout_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN current_workout_status text DEFAULT 'idle'; -- 'idle', 'freestyle', 'playlist'
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'current_playlist_name'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN current_playlist_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'privacy_share_status'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN privacy_share_status boolean DEFAULT true;
  END IF;
END $$;


-- Social Posts Table
CREATE TABLE IF NOT EXISTS public.social_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text,
  image_url text,
  workout_duration integer,
  workout_volume integer,
  workout_summary jsonb,
  created_at timestamptz DEFAULT now()
);

-- Social Likes Table
CREATE TABLE IF NOT EXISTS public.social_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Social Comments Table
CREATE TABLE IF NOT EXISTS public.social_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.social_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_comments ENABLE ROW LEVEL SECURITY;

-- Policies for Social Posts
CREATE POLICY "Anyone can view posts" ON public.social_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.social_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.social_posts FOR DELETE USING (auth.uid() = user_id);

-- Policies for Social Likes
CREATE POLICY "Anyone can view likes" ON public.social_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON public.social_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON public.social_likes FOR DELETE USING (auth.uid() = user_id);

-- Policies for Social Comments
CREATE POLICY "Anyone can view comments" ON public.social_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON public.social_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON public.social_comments FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Post owners can delete comments on their posts" ON public.social_comments FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.social_posts
    WHERE social_posts.id = social_comments.post_id
    AND social_posts.user_id = auth.uid()
  )
);
