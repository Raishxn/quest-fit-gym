
-- 1. Create the classes table
CREATE TABLE IF NOT EXISTS public.classes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  archetype text NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  icon_emoji text NOT NULL DEFAULT '⚔️',
  bonus_type text NOT NULL,
  bonus_value numeric NOT NULL DEFAULT 0,
  debuff_type text,
  debuff_value numeric,
  description text,
  unlock_requirement text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Recreate user_class_progress with class_id FK
DROP TABLE IF EXISTS public.user_class_progress;
CREATE TABLE public.user_class_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  class_id uuid NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  class_xp integer NOT NULL DEFAULT 0,
  class_level integer NOT NULL DEFAULT 1,
  class_rank text NOT NULL DEFAULT 'Iniciante',
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, class_id)
);

-- 3. Add current_class_id to profiles if not exists
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='current_class_id') THEN
    ALTER TABLE public.profiles ADD COLUMN current_class_id uuid REFERENCES public.classes(id);
  END IF;
END $$;

-- 4. Add avatar_position and banner_position to profiles if not exist
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='avatar_position') THEN
    ALTER TABLE public.profiles ADD COLUMN avatar_position text NOT NULL DEFAULT '50% 50%';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='banner_position') THEN
    ALTER TABLE public.profiles ADD COLUMN banner_position text NOT NULL DEFAULT '50% 50%';
  END IF;
END $$;

-- 5. Enable RLS
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_class_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Classes viewable by everyone" ON public.classes FOR SELECT USING (true);

CREATE POLICY "Users can view own class progress" ON public.user_class_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own class progress" ON public.user_class_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own class progress" ON public.user_class_progress FOR UPDATE USING (auth.uid() = user_id);

-- 6. Seed 20 classes
INSERT INTO public.classes (name, archetype, rarity, icon_emoji, bonus_type, bonus_value, debuff_type, debuff_value, description) VALUES
  ('Guerreiro', 'Força', 'common', '⚔️', 'str', 10, NULL, NULL, 'Mestre das armas e da força bruta.'),
  ('Berserker', 'Força', 'rare', '🪓', 'str', 15, 'end', 5, 'Fúria incontrolável que sacrifica resistência por poder.'),
  ('Titan', 'Força', 'epic', '🗡️', 'str', 20, 'agi', 10, 'Colossus imparável com força sobre-humana.'),
  ('Paladino', 'Resistência', 'common', '🛡️', 'end', 10, NULL, NULL, 'Guardião sagrado com resistência inabalável.'),
  ('Guardião', 'Resistência', 'rare', '🏰', 'end', 15, 'str', 5, 'Fortaleza viva que protege a qualquer custo.'),
  ('Monge', 'Equilíbrio', 'common', '🧘', 'vit', 10, NULL, NULL, 'Mestre do equilíbrio entre corpo e mente.'),
  ('Druida', 'Equilíbrio', 'rare', '🌿', 'vit', 12, NULL, NULL, 'Conectado com a natureza, regenera vitalidade.'),
  ('Ranger', 'Agilidade', 'common', '🏹', 'agi', 10, NULL, NULL, 'Ágil e preciso, mestre do arco e flecha.'),
  ('Assassino', 'Agilidade', 'rare', '🗡️', 'agi', 15, 'vit', 5, 'Letal nas sombras, velocidade mortal.'),
  ('Ninja', 'Agilidade', 'epic', '🥷', 'agi', 20, 'str', 10, 'Invisível e veloz, mestre das artes furtivas.'),
  ('Mago', 'Cardio', 'common', '🧙', 'end', 8, NULL, NULL, 'Canaliza energia arcana através da resistência.'),
  ('Feiticeiro', 'Cardio', 'rare', '✨', 'end', 12, 'str', 3, 'Poder mágico devastador com foco em resistência.'),
  ('Necromante', 'Híbrido', 'epic', '💀', 'xp', 15, 'vit', 8, 'Manipula energias sombrias para ganhar poder.'),
  ('Cavaleiro', 'Híbrido', 'common', '🐴', 'str', 5, NULL, NULL, 'Nobre guerreiro montado em batalha.'),
  ('Samurai', 'Disciplina', 'rare', '⛩️', 'xp', 10, NULL, NULL, 'Honra e disciplina acima de tudo.'),
  ('Espartano', 'Disciplina', 'epic', '🏛️', 'str', 12, NULL, NULL, 'Treinamento espartano para uma força lendária.'),
  ('Gladiador', 'Combate', 'common', '🏟️', 'str', 8, NULL, NULL, 'Lutador da arena, forjado em combate.'),
  ('Campeão', 'Combate', 'rare', '🏆', 'xp', 12, NULL, NULL, 'O melhor dos melhores, campeão invicto.'),
  ('Viking', 'Força', 'rare', '🪖', 'str', 14, 'agi', 4, 'Guerreiro nórdico com força bruta implacável.'),
  ('Templário', 'Resistência', 'epic', '✝️', 'end', 18, 'agi', 8, 'Cavaleiro sagrado com resistência divina.')
ON CONFLICT (name) DO NOTHING;
