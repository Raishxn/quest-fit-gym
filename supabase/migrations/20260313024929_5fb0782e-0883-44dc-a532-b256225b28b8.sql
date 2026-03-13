
-- ===== ENUMS =====
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
CREATE TYPE public.user_plan AS ENUM ('free', 'vip', 'vip_plus', 'pro');
CREATE TYPE public.rpg_class AS ENUM ('Iniciante', 'Aprendiz', 'Guerreiro', 'Veterano', 'Elite', 'Lendário', 'Imortal');
CREATE TYPE public.specialization AS ENUM ('hercules', 'hermes', 'apollo', 'athena');
CREATE TYPE public.workout_status AS ENUM ('active', 'completed', 'abandoned');
CREATE TYPE public.set_type AS ENUM ('warmup', 'working', 'backoff');
CREATE TYPE public.friendship_status AS ENUM ('pending', 'accepted', 'rejected', 'blocked');
CREATE TYPE public.party_status AS ENUM ('waiting', 'active', 'completed', 'cancelled');

-- ===== TIMESTAMP TRIGGER FUNCTION =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- ===== USER ROLES TABLE =====
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- ===== PROFILES =====
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  username TEXT UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  avatar_url TEXT,
  banner_url TEXT,
  bio TEXT,
  locale TEXT NOT NULL DEFAULT 'pt',
  weight_unit TEXT NOT NULL DEFAULT 'kg',
  theme TEXT NOT NULL DEFAULT 'dark-red',
  plan user_plan NOT NULL DEFAULT 'free',
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  class_name rpg_class NOT NULL DEFAULT 'Iniciante',
  specialization specialization,
  str_attr INT NOT NULL DEFAULT 1,
  end_attr INT NOT NULL DEFAULT 1,
  vit_attr INT NOT NULL DEFAULT 1,
  agi_attr INT NOT NULL DEFAULT 1,
  streak INT NOT NULL DEFAULT 0,
  last_activity_date TIMESTAMPTZ,
  anamnesis_complete BOOLEAN NOT NULL DEFAULT false,
  preferences JSONB NOT NULL DEFAULT '{}',
  privacy_settings JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8))
  );
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== ANAMNESIS =====
CREATE TABLE public.anamnesis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  biological_sex TEXT NOT NULL,
  birth_date DATE NOT NULL,
  height_cm NUMERIC NOT NULL,
  weight_kg NUMERIC NOT NULL,
  body_fat_percent NUMERIC,
  waist_cm NUMERIC,
  hip_cm NUMERIC,
  arm_cm NUMERIC,
  goal TEXT NOT NULL,
  activity_level TEXT NOT NULL,
  dietary_preferences JSONB NOT NULL DEFAULT '[]',
  medical_conditions JSONB NOT NULL DEFAULT '[]',
  bmr NUMERIC NOT NULL,
  tdee NUMERIC NOT NULL,
  target_calories NUMERIC NOT NULL,
  target_protein_g NUMERIC NOT NULL,
  target_fat_g NUMERIC NOT NULL,
  target_carbs_g NUMERIC NOT NULL,
  target_water_ml NUMERIC NOT NULL,
  bmi NUMERIC NOT NULL,
  bmi_category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.anamnesis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own anamnesis" ON public.anamnesis FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own anamnesis" ON public.anamnesis FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own anamnesis" ON public.anamnesis FOR UPDATE USING (auth.uid() = user_id);
CREATE TRIGGER update_anamnesis_updated_at BEFORE UPDATE ON public.anamnesis FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== EXERCISES =====
CREATE TABLE public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  muscle_group TEXT NOT NULL,
  equipment TEXT NOT NULL DEFAULT 'barbell',
  type TEXT NOT NULL DEFAULT 'strength',
  instructions TEXT,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Exercises viewable by everyone" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Users can create custom exercises" ON public.exercises FOR INSERT WITH CHECK (auth.uid() = created_by AND is_custom = true);
CREATE POLICY "Users can update own custom exercises" ON public.exercises FOR UPDATE USING (auth.uid() = created_by AND is_custom = true);
CREATE INDEX idx_exercises_muscle_group ON public.exercises(muscle_group);

-- ===== WORKOUT PROGRAMS =====
CREATE TABLE public.workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workout_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own programs" ON public.workout_programs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create programs" ON public.workout_programs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own programs" ON public.workout_programs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own programs" ON public.workout_programs FOR DELETE USING (auth.uid() = user_id);

-- ===== WORKOUT DAYS =====
CREATE TABLE public.workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  program_id UUID REFERENCES public.workout_programs(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  week_day INT,
  "order" INT NOT NULL
);
ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own workout days" ON public.workout_days FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.workout_programs wp WHERE wp.id = program_id AND wp.user_id = auth.uid()));
CREATE POLICY "Users can create workout days" ON public.workout_days FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_programs wp WHERE wp.id = program_id AND wp.user_id = auth.uid()));
CREATE POLICY "Users can update workout days" ON public.workout_days FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.workout_programs wp WHERE wp.id = program_id AND wp.user_id = auth.uid()));
CREATE POLICY "Users can delete workout days" ON public.workout_days FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.workout_programs wp WHERE wp.id = program_id AND wp.user_id = auth.uid()));

-- ===== PLANNED EXERCISES =====
CREATE TABLE public.planned_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES public.workout_days(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  "order" INT NOT NULL,
  default_sets INT NOT NULL DEFAULT 3,
  default_reps INT NOT NULL DEFAULT 10,
  rest_seconds INT NOT NULL DEFAULT 90,
  notes TEXT
);
ALTER TABLE public.planned_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own planned exercises" ON public.planned_exercises FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.workout_days wd
    JOIN public.workout_programs wp ON wp.id = wd.program_id
    WHERE wd.id = day_id AND wp.user_id = auth.uid()
  ));
CREATE POLICY "Users can manage planned exercises" ON public.planned_exercises FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.workout_days wd
    JOIN public.workout_programs wp ON wp.id = wd.program_id
    WHERE wd.id = day_id AND wp.user_id = auth.uid()
  ));

-- ===== WORKOUT SESSIONS =====
CREATE TABLE public.workout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  program_id UUID REFERENCES public.workout_programs(id),
  day_id UUID REFERENCES public.workout_days(id),
  status workout_status NOT NULL DEFAULT 'active',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  duration_min INT,
  total_volume_kg NUMERIC,
  total_sets INT,
  xp_gained INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own sessions" ON public.workout_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create sessions" ON public.workout_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sessions" ON public.workout_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_workout_sessions_user_status ON public.workout_sessions(user_id, status);

-- ===== EXERCISE LOGS =====
CREATE TABLE public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  "order" INT NOT NULL
);
ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own exercise logs" ON public.exercise_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.workout_sessions ws WHERE ws.id = session_id AND ws.user_id = auth.uid()));
CREATE POLICY "Users can create exercise logs" ON public.exercise_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.workout_sessions ws WHERE ws.id = session_id AND ws.user_id = auth.uid()));

-- ===== SET LOGS =====
CREATE TABLE public.set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id UUID REFERENCES public.exercise_logs(id) ON DELETE CASCADE NOT NULL,
  set_number INT NOT NULL,
  type set_type NOT NULL DEFAULT 'working',
  weight_kg NUMERIC NOT NULL DEFAULT 0,
  reps INT NOT NULL,
  rpe NUMERIC,
  rest_seconds INT,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own set logs" ON public.set_logs FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.exercise_logs el
    JOIN public.workout_sessions ws ON ws.id = el.session_id
    WHERE el.id = exercise_log_id AND ws.user_id = auth.uid()
  ));
CREATE POLICY "Users can create set logs" ON public.set_logs FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.exercise_logs el
    JOIN public.workout_sessions ws ON ws.id = el.session_id
    WHERE el.id = exercise_log_id AND ws.user_id = auth.uid()
  ));

-- ===== PERSONAL RECORDS =====
CREATE TABLE public.personal_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) NOT NULL,
  weight_kg NUMERIC NOT NULL,
  reps INT NOT NULL,
  volume NUMERIC NOT NULL,
  set_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own PRs" ON public.personal_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own PRs" ON public.personal_records FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_personal_records_user ON public.personal_records(user_id);

-- ===== FOODS =====
CREATE TABLE public.foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  name_en TEXT,
  brand TEXT,
  calories_per_100g NUMERIC NOT NULL,
  protein_per_100g NUMERIC NOT NULL,
  fat_per_100g NUMERIC NOT NULL,
  carbs_per_100g NUMERIC NOT NULL,
  fiber_per_100g NUMERIC NOT NULL DEFAULT 0,
  sodium_per_100g NUMERIC NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'taco',
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.foods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Foods viewable by everyone" ON public.foods FOR SELECT USING (true);
CREATE POLICY "Users can create custom foods" ON public.foods FOR INSERT WITH CHECK (auth.uid() = created_by AND is_custom = true);
CREATE INDEX idx_foods_name ON public.foods(name);

-- ===== DIET DAYS =====
CREATE TABLE public.diet_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  total_calories NUMERIC NOT NULL DEFAULT 0,
  total_protein_g NUMERIC NOT NULL DEFAULT 0,
  total_fat_g NUMERIC NOT NULL DEFAULT 0,
  total_carbs_g NUMERIC NOT NULL DEFAULT 0,
  total_fiber_g NUMERIC NOT NULL DEFAULT 0,
  total_water_ml NUMERIC NOT NULL DEFAULT 0,
  goal_met BOOLEAN NOT NULL DEFAULT false,
  macros_goal_met BOOLEAN NOT NULL DEFAULT false,
  UNIQUE(user_id, date)
);
ALTER TABLE public.diet_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own diet days" ON public.diet_days FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own diet days" ON public.diet_days FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_diet_days_user_date ON public.diet_days(user_id, date);

-- ===== MEALS =====
CREATE TABLE public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diet_day_id UUID REFERENCES public.diet_days(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  time TEXT NOT NULL,
  "order" INT NOT NULL DEFAULT 0
);
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meals" ON public.meals FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.diet_days dd WHERE dd.id = diet_day_id AND dd.user_id = auth.uid()));
CREATE POLICY "Users can manage own meals" ON public.meals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.diet_days dd WHERE dd.id = diet_day_id AND dd.user_id = auth.uid()));

-- ===== MEAL ITEMS =====
CREATE TABLE public.meal_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID REFERENCES public.meals(id) ON DELETE CASCADE NOT NULL,
  food_id UUID REFERENCES public.foods(id) NOT NULL,
  quantity_g NUMERIC NOT NULL,
  calories NUMERIC NOT NULL,
  protein_g NUMERIC NOT NULL,
  fat_g NUMERIC NOT NULL,
  carbs_g NUMERIC NOT NULL,
  fiber_g NUMERIC NOT NULL DEFAULT 0
);
ALTER TABLE public.meal_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own meal items" ON public.meal_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.meals m
    JOIN public.diet_days dd ON dd.id = m.diet_day_id
    WHERE m.id = meal_id AND dd.user_id = auth.uid()
  ));
CREATE POLICY "Users can manage own meal items" ON public.meal_items FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.meals m
    JOIN public.diet_days dd ON dd.id = m.diet_day_id
    WHERE m.id = meal_id AND dd.user_id = auth.uid()
  ));

-- ===== CARDIO SESSIONS =====
CREATE TABLE public.cardio_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  subtype TEXT,
  duration_minutes INT NOT NULL,
  distance_km NUMERIC,
  avg_heart_rate INT,
  calories_burned NUMERIC,
  avg_pace_min_km NUMERIC,
  xp_gained INT NOT NULL DEFAULT 0,
  notes TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cardio_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own cardio" ON public.cardio_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cardio" ON public.cardio_sessions FOR ALL USING (auth.uid() = user_id);
CREATE INDEX idx_cardio_user_date ON public.cardio_sessions(user_id, started_at);

-- ===== XP TRANSACTIONS =====
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INT NOT NULL,
  source TEXT NOT NULL,
  source_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own xp" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create xp" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_xp_user_date ON public.xp_transactions(user_id, created_at);

-- ===== ACHIEVEMENTS =====
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT NOT NULL,
  description TEXT NOT NULL,
  description_en TEXT NOT NULL,
  icon_emoji TEXT NOT NULL,
  xp_reward INT NOT NULL DEFAULT 0,
  category TEXT NOT NULL
);
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Achievements viewable by everyone" ON public.achievements FOR SELECT USING (true);

-- ===== USER ACHIEVEMENTS =====
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view achievements" ON public.user_achievements FOR SELECT USING (true);
CREATE POLICY "Users can unlock achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== FRIENDSHIPS =====
CREATE TABLE public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id UUID REFERENCES auth.users(id) NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) NOT NULL,
  status friendship_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(initiator_id, receiver_id)
);
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own friendships" ON public.friendships FOR SELECT
  USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);
CREATE POLICY "Users can create friendships" ON public.friendships FOR INSERT
  WITH CHECK (auth.uid() = initiator_id);
CREATE POLICY "Users can update own friendships" ON public.friendships FOR UPDATE
  USING (auth.uid() = initiator_id OR auth.uid() = receiver_id);

-- ===== FEED ACTIVITIES =====
CREATE TABLE public.feed_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.feed_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public feeds viewable by everyone" ON public.feed_activities FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create feed activities" ON public.feed_activities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_feed_user_date ON public.feed_activities(user_id, created_at);

-- ===== FEED REACTIONS =====
CREATE TABLE public.feed_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_activity_id UUID REFERENCES public.feed_activities(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(feed_activity_id, user_id, emoji)
);
ALTER TABLE public.feed_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Reactions viewable by everyone" ON public.feed_reactions FOR SELECT USING (true);
CREATE POLICY "Users can manage own reactions" ON public.feed_reactions FOR ALL USING (auth.uid() = user_id);

-- ===== NOTIFICATIONS =====
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_notifications_user_read ON public.notifications(user_id, is_read);
