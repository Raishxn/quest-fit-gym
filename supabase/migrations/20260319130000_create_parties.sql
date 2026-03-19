-- Workout Parties Table
CREATE TABLE IF NOT EXISTS public.workout_parties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  leader_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'waiting', -- 'waiting', 'active', 'finished'
  created_at timestamptz DEFAULT now()
);

-- Party Members Table
CREATE TABLE IF NOT EXISTS public.party_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id uuid NOT NULL REFERENCES public.workout_parties(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(party_id, user_id)
);

-- Enable RLS
ALTER TABLE public.workout_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;

-- Policies for Workout Parties
CREATE POLICY "Anyone can view workout parties"
  ON public.workout_parties FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create parties"
  ON public.workout_parties FOR INSERT
  WITH CHECK (auth.uid() = leader_id);

CREATE POLICY "Leader can update party"
  ON public.workout_parties FOR UPDATE
  USING (auth.uid() = leader_id);

-- Policies for Party Members
CREATE POLICY "Anyone can view party members"
  ON public.party_members FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join parties"
  ON public.party_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave parties"
  ON public.party_members FOR DELETE
  USING (auth.uid() = user_id);
