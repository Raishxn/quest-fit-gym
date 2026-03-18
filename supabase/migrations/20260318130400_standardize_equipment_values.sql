-- Standardize equipment values from English to Portuguese
UPDATE public.exercises SET equipment = 'barra' WHERE equipment IN ('barbell', 'Barbell', 'bar');
UPDATE public.exercises SET equipment = 'halter' WHERE equipment IN ('dumbbell', 'Dumbbell', 'dumbell');
UPDATE public.exercises SET equipment = 'maquina' WHERE equipment IN ('machine', 'Machine');
UPDATE public.exercises SET equipment = 'cabo' WHERE equipment IN ('cable', 'Cable');
UPDATE public.exercises SET equipment = 'peso_corpo' WHERE equipment IN ('bodyweight', 'Bodyweight', 'body_weight', 'none');
UPDATE public.exercises SET equipment = 'smith' WHERE equipment IN ('smith_machine', 'Smith', 'smith machine');
UPDATE public.exercises SET equipment = 'outro' WHERE equipment NOT IN ('barra', 'halter', 'maquina', 'cabo', 'peso_corpo', 'smith', 'outro');

-- Also update the default for new exercises
ALTER TABLE public.exercises ALTER COLUMN equipment SET DEFAULT 'barra';
