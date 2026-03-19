-- Create extension if it doesn't exist
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Mission Templates Table
CREATE TABLE IF NOT EXISTS public.mission_templates (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  type text NOT NULL, -- 'daily', 'weekly', 'monthly', 'master', 'global'
  title text NOT NULL,
  description text NOT NULL,
  icon_emoji text NOT NULL,
  xp_reward integer NOT NULL DEFAULT 0,
  mastery_points_reward integer NOT NULL DEFAULT 0,
  target integer NOT NULL DEFAULT 1,
  criteria jsonb,
  category text,
  created_at timestamptz DEFAULT now()
);

-- Active Missions Table
CREATE TABLE IF NOT EXISTS public.active_missions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id uuid NOT NULL REFERENCES public.mission_templates(id) ON DELETE CASCADE,
  type text NOT NULL,
  target integer NOT NULL,
  progress integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'claimed'
  started_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Global Missions Table
CREATE TABLE IF NOT EXISTS public.global_missions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id uuid NOT NULL REFERENCES public.mission_templates(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active', -- 'active', 'completed'
  current_progress bigint NOT NULL DEFAULT 0,
  target bigint NOT NULL,
  started_at timestamptz DEFAULT now(),
  ends_at timestamptz
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.mission_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.active_missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global_missions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Anyone can view mission templates" ON public.mission_templates;
DROP POLICY IF EXISTS "Users can view their own active missions" ON public.active_missions;
DROP POLICY IF EXISTS "Users can insert their own active missions" ON public.active_missions;
DROP POLICY IF EXISTS "Users can update their own active missions" ON public.active_missions;
DROP POLICY IF EXISTS "Anyone can view global missions" ON public.global_missions;

-- Policies for Mission Templates
CREATE POLICY "Anyone can view mission templates"
  ON public.mission_templates FOR SELECT
  USING (true);

-- Policies for Active Missions
CREATE POLICY "Users can view their own active missions"
  ON public.active_missions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own active missions"
  ON public.active_missions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active missions"
  ON public.active_missions FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for Global Missions
CREATE POLICY "Anyone can view global missions"
  ON public.global_missions FOR SELECT
  USING (true);

-- Insert Seed Data for mission_templates

INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_workout_1', 'daily', 'Suor Diário', 'Complete 1 treino de qualquer tipo', '💦', 50, 2, 1, '{"action":"complete_workout"}'::jsonb, 'activity') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_cardio_1', 'daily', 'Coração Acelerado', 'Faça 15 minutos de cardio', '🏃', 40, 2, 15, '{"action":"cardio_minutes"}'::jsonb, 'cardio') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_water_1', 'daily', 'Oásis Pessoal', 'Bata sua meta de água hoje', '💧', 30, 1, 1, '{"action":"water_goal"}'::jsonb, 'diet') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_volume_1', 'daily', 'Volume Intenso', 'Atinja 3000kg de volume em um único treino', '🏋️', 60, 3, 3000, '{"action":"workout_volume"}'::jsonb, 'strength') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_chest_1', 'daily', 'Peitoral de Aço', 'Faça 6 séries de qualquer exercício de peito', '🦍', 50, 2, 6, '{"action":"muscle_sets","group":"Peito"}'::jsonb, 'strength') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_legs_1', 'daily', 'Dia de Perna não se pula', 'Faça 8 séries de exercícios de perna', '🦵', 50, 3, 8, '{"action":"muscle_sets","group":"Pernas"}'::jsonb, 'strength') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_calories_1', 'daily', 'Déficit/Superávit Ideal', 'Bata sua meta de calorias hoje', '🥗', 50, 2, 1, '{"action":"calories_goal"}'::jsonb, 'diet') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_pr_1', 'daily', 'Quebrando Barreiras', 'Bata 1 PR (Recorde Pessoal) hoje', '🔥', 100, 5, 1, '{"action":"break_pr"}'::jsonb, 'achievement') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_macros_1', 'daily', 'Alquimista Nutricional', 'Bata sua meta de Proteína hoje', '🥩', 40, 2, 1, '{"action":"protein_goal"}'::jsonb, 'diet') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('daily_meditation_1', 'daily', 'Corpo e Mente', 'Registrar ao menos 10 minutos de alongamento/mobilidade', '🧘', 30, 1, 10, '{"action":"mobility_minutes"}'::jsonb, 'recovery') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_workout_1', 'weekly', 'Força Semanal', 'Complete 4 treinos de musculação na semana', '🦾', 300, 15, 4, '{"action":"complete_workout"}'::jsonb, 'activity') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_cardio_1', 'weekly', 'Maratonista', 'Acumule 120 minutos de cardio na semana', '🏃‍♂️', 250, 12, 120, '{"action":"cardio_minutes"}'::jsonb, 'cardio') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_volume_1', 'weekly', 'Titan Load', 'Atinja 15000kg de volume semanal total', '🚚', 400, 20, 15000, '{"action":"workout_volume"}'::jsonb, 'strength') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_diet_1', 'weekly', 'Foco de Ferro', 'Bata as metas de dieta 5 dias nesta semana', '🎯', 300, 15, 5, '{"action":"diet_days"}'::jsonb, 'diet') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_squat_1', 'weekly', 'Fundação Obelisco', 'Execute 12 séries de Agachamento Livre na semana', '🏗️', 200, 10, 12, '{"action":"exercise_sets","exercise":"Agachamento Livre"}'::jsonb, 'strength') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_bench_1', 'weekly', 'Escudo Primordial', 'Execute 12 séries de Supino Reto na semana', '🛡️', 200, 10, 12, '{"action":"exercise_sets","exercise":"Supino Reto"}'::jsonb, 'strength') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_deadlift_1', 'weekly', 'Gravidade Desafiada', 'Execute 10 séries de Levantamento Terra na semana', '🔮', 250, 12, 10, '{"action":"exercise_sets","exercise":"Levantamento Terra"}'::jsonb, 'strength') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_party_1', 'weekly', 'Lobo em Alcateia', 'Participe de 2 treinos em Party', '🐺', 300, 15, 2, '{"action":"party_workout"}'::jsonb, 'social') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_guild_1', 'weekly', 'Dever da Guilda', 'Contribua com 50 de Poder XP para sua guilda', '⚔️', 200, 10, 50, '{"action":"guild_contribution"}'::jsonb, 'social') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('weekly_streak_1', 'weekly', 'Implacável', 'Mantenha um streak ativo de 7 dias ou mais', '☄️', 400, 20, 1, '{"action":"streak_maintain","target_streak":7}'::jsonb, 'achievement') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('monthly_workout_1', 'monthly', 'Soldado do Mês', 'Complete 20 treinos', '🏅', 1000, 50, 20, '{"action":"complete_workout"}'::jsonb, 'activity') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('monthly_volume_1', 'monthly', 'Hércules', 'Alcance 100.000kg de volume levantado', '🏛️', 1500, 75, 100000, '{"action":"workout_volume"}'::jsonb, 'strength') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('monthly_cardio_1', 'monthly', 'Pulmões de Aço', 'Corra, pedale ou ande por 600 minutos', '🫁', 1000, 50, 600, '{"action":"cardio_minutes"}'::jsonb, 'cardio') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('monthly_prs_1', 'monthly', 'Evolução Contínua', 'Quebre 5 Recordes Pessoais diferentes', '📈', 1200, 60, 5, '{"action":"break_pr"}'::jsonb, 'achievement') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('monthly_diet_1', 'monthly', 'Máquina Bem Cuidada', 'Bata metas de dieta 20 dias neste mês', '🍏', 1500, 75, 20, '{"action":"diet_days"}'::jsonb, 'diet') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('monthly_rankup_1', 'monthly', 'Ascensão Mensal', 'Suba de Rank em 3 exercícios diferentes', '✨', 2000, 100, 3, '{"action":"exercise_rank_up"}'::jsonb, 'achievement') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('master_100k_1', 'master', 'Lendário: Clube dos 100K', 'Alcance 1.000.000kg de volume levantado em toda conta', '♾️', 5000, 300, 1000000, '{"action":"lifetime_volume"}'::jsonb, 'milestone') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('master_workout_1', 'master', 'Lendário: Mestre Jedi', 'Complete 300 treinos totais na sua vida', '🧙‍♂️', 5000, 300, 300, '{"action":"lifetime_workouts"}'::jsonb, 'milestone') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('master_diet_1', 'master', 'Lendário: Monge Disciplinado', 'Bata a dieta 100 dias totais', '🏯', 4000, 250, 100, '{"action":"lifetime_diet_days"}'::jsonb, 'milestone') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('master_streak_1', 'master', 'Lendário: Avatar Imortal', 'Atingir um Streak de 100 dias seguidos', '🐉', 10000, 500, 100, '{"action":"lifetime_streak"}'::jsonb, 'milestone') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('master_overall_1', 'master', 'Supremo: Transcendente', 'Chegar ao rank Transcendente no Rank Geral de Maestria', '🌠', 20000, 1000, 1, '{"action":"reach_transcendent"}'::jsonb, 'milestone') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('master_pr_1', 'master', 'Mytos: Quebrador de Mundos', 'Atingir Level 100 de PR em um dos levantamentos bases', '🌍', 5000, 350, 1, '{"action":"max_out_exercise"}'::jsonb, 'milestone') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('global_volume_1', 'global', 'Defesa de Asgard', 'Comunidade: Levantem 50.000.000kg de volume juntos', '⚡', 5000, 200, 50000000, '{"action":"workout_volume"}'::jsonb, 'community') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('global_workouts_1', 'global', 'Exército Espartano', 'Comunidade: Completem 10.000 treinos', '🛡️', 3000, 100, 10000, '{"action":"complete_workout"}'::jsonb, 'community') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('global_cardio_1', 'global', 'O Último Suspiro', 'Comunidade: 100.000 horas de cardio (6.000.000 min)', '🌪️', 4000, 150, 6000000, '{"action":"cardio_minutes"}'::jsonb, 'community') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('global_calories_1', 'global', 'Secando o Oceano', 'Comunidade: Entrar em Déficit Calórico 5.000 vezes', '🌊', 3500, 120, 5000, '{"action":"diet_deficit_days"}'::jsonb, 'community') ON CONFLICT (key) DO NOTHING;
INSERT INTO public.mission_templates (key, type, title, description, icon_emoji, xp_reward, mastery_points_reward, target, criteria, category) VALUES ('global_squat_1', 'global', 'Coluna de Atlas', 'Comunidade: Fazer 2.000.000kg no Agachamento Livre', '🗻', 5000, 250, 2000000, '{"action":"exercise_volume","exercise":"Agachamento Livre"}'::jsonb, 'community') ON CONFLICT (key) DO NOTHING;
