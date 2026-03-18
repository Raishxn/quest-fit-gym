
-- ===== SEED: Exercícios por equipamento =====
-- Equipment types: 'maquina', 'halter', 'barra', 'peso_corpo', 'cabo', 'smith', 'outro'

-- ====== COSTAS ======
INSERT INTO public.exercises (name, muscle_group, equipment, type) VALUES
  ('Remada Máquina Articulada', 'costas', 'maquina', 'strength'),
  ('Puxada Alta Triângulo Máquina', 'costas', 'maquina', 'strength'),
  ('Puxada Alta Articulada', 'costas', 'maquina', 'strength'),
  ('Remada Baixa Triângulo Máquina', 'costas', 'maquina', 'strength'),
  ('Puxada Alta Aberta', 'costas', 'maquina', 'strength'),
  ('Puxada Alta Fechada', 'costas', 'maquina', 'strength'),
  ('Remada Cavalinho Máquina', 'costas', 'maquina', 'strength'),
  ('Pulldown Máquina', 'costas', 'maquina', 'strength'),
  ('Puxada Alta Barra', 'costas', 'barra', 'strength'),
  ('Remada Curvada Barra', 'costas', 'barra', 'strength'),
  ('Remada Unilateral Halter', 'costas', 'halter', 'strength'),
  ('Remada Curvada Halter', 'costas', 'halter', 'strength'),
  ('Remada Baixa Cabo', 'costas', 'cabo', 'strength'),
  ('Pullover Cabo', 'costas', 'cabo', 'strength'),
  ('Barra Fixa', 'costas', 'peso_corpo', 'strength'),
  ('Barra Fixa Supinada', 'costas', 'peso_corpo', 'strength')
ON CONFLICT DO NOTHING;

-- ====== PEITO ======
INSERT INTO public.exercises (name, muscle_group, equipment, type) VALUES
  ('Supino Reto Máquina', 'peito', 'maquina', 'strength'),
  ('Supino Inclinado Máquina', 'peito', 'maquina', 'strength'),
  ('Voador Máquina', 'peito', 'maquina', 'strength'),
  ('Crossover Cabo', 'peito', 'cabo', 'strength'),
  ('Supino Reto Barra', 'peito', 'barra', 'strength'),
  ('Supino Inclinado Barra', 'peito', 'barra', 'strength'),
  ('Supino Declinado Barra', 'peito', 'barra', 'strength'),
  ('Supino Reto Halter', 'peito', 'halter', 'strength'),
  ('Supino Inclinado Halter', 'peito', 'halter', 'strength'),
  ('Supino Declinado Halter', 'peito', 'halter', 'strength'),
  ('Crucifixo Halter', 'peito', 'halter', 'strength'),
  ('Crucifixo Inclinado Halter', 'peito', 'halter', 'strength'),
  ('Supino Reto Smith', 'peito', 'smith', 'strength'),
  ('Supino Inclinado Smith', 'peito', 'smith', 'strength'),
  ('Flexão de Braço', 'peito', 'peso_corpo', 'strength'),
  ('Mergulho Paralelas', 'peito', 'peso_corpo', 'strength')
ON CONFLICT DO NOTHING;

-- ====== OMBROS ======
INSERT INTO public.exercises (name, muscle_group, equipment, type) VALUES
  ('Desenvolvimento Máquina', 'ombros', 'maquina', 'strength'),
  ('Voador Invertido Máquina', 'ombros', 'maquina', 'strength'),
  ('Elevação Lateral Máquina', 'ombros', 'maquina', 'strength'),
  ('Elevação Lateral Halter', 'ombros', 'halter', 'strength'),
  ('Elevação Frontal Halter', 'ombros', 'halter', 'strength'),
  ('Desenvolvimento Halter', 'ombros', 'halter', 'strength'),
  ('Arnold Press Halter', 'ombros', 'halter', 'strength'),
  ('Desenvolvimento Barra', 'ombros', 'barra', 'strength'),
  ('Remada Alta Barra', 'ombros', 'barra', 'strength'),
  ('Elevação Lateral Cabo', 'ombros', 'cabo', 'strength'),
  ('Face Pull Cabo', 'ombros', 'cabo', 'strength'),
  ('Desenvolvimento Smith', 'ombros', 'smith', 'strength')
ON CONFLICT DO NOTHING;

-- ====== BÍCEPS ======
INSERT INTO public.exercises (name, muscle_group, equipment, type) VALUES
  ('Rosca Scott Barra', 'biceps', 'barra', 'strength'),
  ('Rosca Direta Barra', 'biceps', 'barra', 'strength'),
  ('Rosca Barra W', 'biceps', 'barra', 'strength'),
  ('Rosca Bayesiana Máquina', 'biceps', 'maquina', 'strength'),
  ('Rosca Scott Máquina', 'biceps', 'maquina', 'strength'),
  ('Rosca Direta Halter', 'biceps', 'halter', 'strength'),
  ('Rosca Alternada Halter', 'biceps', 'halter', 'strength'),
  ('Rosca Martelo Halter', 'biceps', 'halter', 'strength'),
  ('Rosca Concentrada Halter', 'biceps', 'halter', 'strength'),
  ('Rosca Inclinada Halter', 'biceps', 'halter', 'strength'),
  ('Rosca Cabo', 'biceps', 'cabo', 'strength'),
  ('Rosca Corda Cabo', 'biceps', 'cabo', 'strength')
ON CONFLICT DO NOTHING;

-- ====== TRÍCEPS ======
INSERT INTO public.exercises (name, muscle_group, equipment, type) VALUES
  ('Tríceps Corda Máquina', 'triceps', 'cabo', 'strength'),
  ('Tríceps Barra Máquina', 'triceps', 'cabo', 'strength'),
  ('Tríceps Francês Halter Unilateral', 'triceps', 'halter', 'strength'),
  ('Tríceps Francês Halter', 'triceps', 'halter', 'strength'),
  ('Tríceps Testa Barra', 'triceps', 'barra', 'strength'),
  ('Tríceps Francês Barra', 'triceps', 'barra', 'strength'),
  ('Tríceps Supino Fechado Barra', 'triceps', 'barra', 'strength'),
  ('Tríceps Mergulho Banco', 'triceps', 'peso_corpo', 'strength'),
  ('Tríceps Máquina', 'triceps', 'maquina', 'strength'),
  ('Tríceps Kickback Halter', 'triceps', 'halter', 'strength')
ON CONFLICT DO NOTHING;

-- ====== PERNAS ======
INSERT INTO public.exercises (name, muscle_group, equipment, type) VALUES
  ('Agachamento Smith', 'pernas', 'smith', 'strength'),
  ('Leg Press', 'pernas', 'maquina', 'strength'),
  ('Leg Press 45°', 'pernas', 'maquina', 'strength'),
  ('Cadeira Flexora', 'pernas', 'maquina', 'strength'),
  ('Cadeira Extensora', 'pernas', 'maquina', 'strength'),
  ('Mesa Flexora', 'pernas', 'maquina', 'strength'),
  ('Flexão em Pé Máquina', 'pernas', 'maquina', 'strength'),
  ('Panturrilha Máquina', 'pernas', 'maquina', 'strength'),
  ('Panturrilha Sentado Máquina', 'pernas', 'maquina', 'strength'),
  ('Hack Squat Máquina', 'pernas', 'maquina', 'strength'),
  ('Abdução Máquina', 'pernas', 'maquina', 'strength'),
  ('Adução Máquina', 'pernas', 'maquina', 'strength'),
  ('Stiff Barra', 'pernas', 'barra', 'strength'),
  ('Agachamento Barra', 'pernas', 'barra', 'strength'),
  ('Agachamento Frontal Barra', 'pernas', 'barra', 'strength'),
  ('Agachamento Búlgaro Halter', 'pernas', 'halter', 'strength'),
  ('Afundo Halter', 'pernas', 'halter', 'strength'),
  ('Stiff Halter', 'pernas', 'halter', 'strength'),
  ('Panturrilha em Pé', 'pernas', 'peso_corpo', 'strength'),
  ('Agachamento Livre', 'pernas', 'peso_corpo', 'strength'),
  ('Avanço', 'pernas', 'peso_corpo', 'strength'),
  ('Elevação Pélvica', 'pernas', 'peso_corpo', 'strength'),
  ('Cadeira Abdutora', 'gluteos', 'maquina', 'strength'),
  ('Cadeira Adutora', 'gluteos', 'maquina', 'strength'),
  ('Glúteo Máquina', 'gluteos', 'maquina', 'strength'),
  ('Hip Thrust Barra', 'gluteos', 'barra', 'strength'),
  ('Hip Thrust Smith', 'gluteos', 'smith', 'strength')
ON CONFLICT DO NOTHING;

-- ====== ABDÔMEN ======
INSERT INTO public.exercises (name, muscle_group, equipment, type) VALUES
  ('Cadeira Abdominal', 'abdomen', 'maquina', 'strength'),
  ('Abdominal Máquina', 'abdomen', 'maquina', 'strength'),
  ('Abdominal Cabo', 'abdomen', 'cabo', 'strength'),
  ('Abdominal Crunch', 'abdomen', 'peso_corpo', 'strength'),
  ('Prancha', 'abdomen', 'peso_corpo', 'strength'),
  ('Prancha Lateral', 'abdomen', 'peso_corpo', 'strength'),
  ('Elevação de Pernas', 'abdomen', 'peso_corpo', 'strength'),
  ('Abdominal Infra', 'abdomen', 'peso_corpo', 'strength'),
  ('Russian Twist', 'abdomen', 'peso_corpo', 'strength')
ON CONFLICT DO NOTHING;

-- ====== ANTEBRAÇO ======
INSERT INTO public.exercises (name, muscle_group, equipment, type) VALUES
  ('Flexão de Punho Barra', 'antebraco', 'barra', 'strength'),
  ('Extensão de Punho Barra', 'antebraco', 'barra', 'strength'),
  ('Flexão de Punho Halter', 'antebraco', 'halter', 'strength'),
  ('Rosca Inversa Barra', 'antebraco', 'barra', 'strength')
ON CONFLICT DO NOTHING;

-- ====== TRAPÉZIO ======
INSERT INTO public.exercises (name, muscle_group, equipment, type) VALUES
  ('Encolhimento Halter', 'trapezio', 'halter', 'strength'),
  ('Encolhimento Barra', 'trapezio', 'barra', 'strength'),
  ('Encolhimento Smith', 'trapezio', 'smith', 'strength'),
  ('Encolhimento Máquina', 'trapezio', 'maquina', 'strength')
ON CONFLICT DO NOTHING;
