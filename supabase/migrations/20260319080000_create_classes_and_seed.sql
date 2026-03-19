
-- classes table (RPG class definitions)
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  archetype text NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  icon_emoji text NOT NULL DEFAULT '⚔️',
  bonus_type text NOT NULL DEFAULT 'xp',
  bonus_value numeric NOT NULL DEFAULT 5,
  debuff_type text,
  debuff_value numeric DEFAULT 0,
  description text,
  unlock_requirement text,
  created_at timestamptz DEFAULT now()
);

-- User class progression
CREATE TABLE IF NOT EXISTS public.user_class_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_xp integer NOT NULL DEFAULT 0,
  class_level integer NOT NULL DEFAULT 1,
  class_rank text NOT NULL DEFAULT 'Iniciante',
  unlocked_at timestamptz DEFAULT now(),
  UNIQUE(user_id, class_id)
);

-- Add current_class_id to profiles (only if not exists)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'current_class_id'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN current_class_id uuid REFERENCES public.classes(id);
  END IF;
END $$;

-- Add image position columns for crop support
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'avatar_position'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_position text DEFAULT '50% 50%';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'banner_position'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN banner_position text DEFAULT '50% 50%';
  END IF;
END $$;

-- RLS for classes
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_class_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view classes" ON public.classes;
DROP POLICY IF EXISTS "Users can view own class progress" ON public.user_class_progress;
DROP POLICY IF EXISTS "Users can insert own class progress" ON public.user_class_progress;
DROP POLICY IF EXISTS "Users can update own class progress" ON public.user_class_progress;

CREATE POLICY "Anyone can view classes" ON public.classes FOR SELECT USING (true);
CREATE POLICY "Users can view own class progress" ON public.user_class_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own class progress" ON public.user_class_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own class progress" ON public.user_class_progress FOR UPDATE USING (auth.uid() = user_id);

-- Seed classes
INSERT INTO public.classes (name, archetype, rarity, icon_emoji, bonus_type, bonus_value, debuff_type, debuff_value, description) VALUES
('Guerreiro', 'Força', 'common', '⚔️', 'str', 10, NULL, 0, 'Mestre das armas pesadas. Bônus em força bruta.'),
('Berserker', 'Força', 'rare', '🪓', 'str', 15, 'end', 5, 'Fúria descontrolada. +15% STR, -5% END.'),
('Titan', 'Força', 'epic', '🗡️', 'str', 20, 'agi', 10, 'Poder colossal com mobilidade reduzida.'),
('Paladino', 'Resistência', 'common', '🛡️', 'end', 10, NULL, 0, 'Defensor inabalável. Bônus em resistência.'),
('Guardião', 'Resistência', 'rare', '🏰', 'end', 15, 'str', 5, 'Proteção máxima. +15% END, -5% STR.'),
('Monge', 'Equilíbrio', 'common', '🧘', 'vit', 10, NULL, 0, 'Harmonia entre corpo e mente.'),
('Druida', 'Equilíbrio', 'rare', '🌿', 'vit', 12, NULL, 0, 'Conexão natural com vitalidade.'),
('Ranger', 'Agilidade', 'common', '🏹', 'agi', 10, NULL, 0, 'Velocidade e precisão em combate.'),
('Assassino', 'Agilidade', 'rare', '🗡️', 'agi', 15, 'vit', 5, 'Golpes rápidos e letais. +15% AGI, -5% VIT.'),
('Ninja', 'Agilidade', 'epic', '🥷', 'agi', 20, 'str', 10, 'Mestre da furtividade e velocidade.'),
('Mago', 'Cardio', 'common', '🧙', 'end', 8, NULL, 0, 'Domínio do fôlego e resistência cardio.'),
('Feiticeiro', 'Cardio', 'rare', '✨', 'end', 12, 'str', 3, 'Especialista em cardio longo.'),
('Necromante', 'Híbrido', 'epic', '💀', 'xp', 15, 'vit', 8, 'Drena vida para ganhar XP extra.'),
('Cavaleiro', 'Híbrido', 'common', '🐴', 'str', 5, NULL, 0, 'Bônus equilibrado entre força e resistência.'),
('Samurai', 'Disciplina', 'rare', '⛩️', 'xp', 10, NULL, 0, 'Disciplina inabalável gera mais XP.'),
('Espartano', 'Disciplina', 'epic', '🏛️', 'str', 12, NULL, 0, 'Treino espartano sem fraquezas.'),
('Gladiador', 'Combate', 'common', '🏟️', 'str', 8, NULL, 0, 'Lutador da arena, força e showmanship.'),
('Campeão', 'Combate', 'rare', '🏆', 'xp', 12, NULL, 0, 'Bônus de XP em vitórias de ranking.'),
('Viking', 'Força', 'rare', '🪖', 'str', 14, 'agi', 4, 'Guerreiro nórdico brutal.'),
('Templário', 'Resistência', 'epic', '✝️', 'end', 18, 'agi', 8, 'Fé inabalável. Resistência suprema.')
ON CONFLICT (name) DO NOTHING;
