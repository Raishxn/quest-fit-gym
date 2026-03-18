export type MissionTemplate = {
  id: string;
  key: string;
  type: 'daily' | 'weekly' | 'monthly' | 'master' | 'global';
  title: string;
  description: string;
  icon_emoji: string;
  xp_reward: number;
  mastery_points_reward: number;
  target: number;
  criteria: Record<string, any>;
  category: string;
};

// Geração de 50+ Missões
export const MISSION_TEMPLATES: MissionTemplate[] = [
  // === DIÁRIAS (Daily) ===
  { id: '1', key: 'daily_workout_1', type: 'daily', title: 'Suor Diário', description: 'Complete 1 treino de qualquer tipo', icon_emoji: '💦', xp_reward: 50, mastery_points_reward: 2, target: 1, criteria: { action: 'complete_workout' }, category: 'activity' },
  { id: '2', key: 'daily_cardio_1', type: 'daily', title: 'Coração Acelerado', description: 'Faça 15 minutos de cardio', icon_emoji: '🏃', xp_reward: 40, mastery_points_reward: 2, target: 15, criteria: { action: 'cardio_minutes' }, category: 'cardio' },
  { id: '3', key: 'daily_water_1', type: 'daily', title: 'Oásis Pessoal', description: 'Bata sua meta de água hoje', icon_emoji: '💧', xp_reward: 30, mastery_points_reward: 1, target: 1, criteria: { action: 'water_goal' }, category: 'diet' },
  { id: '4', key: 'daily_volume_1', type: 'daily', title: 'Volume Intenso', description: 'Atinja 3000kg de volume em um único treino', icon_emoji: '🏋️', xp_reward: 60, mastery_points_reward: 3, target: 3000, criteria: { action: 'workout_volume' }, category: 'strength' },
  { id: '5', key: 'daily_chest_1', type: 'daily', title: 'Peitoral de Aço', description: 'Faça 6 séries de qualquer exercício de peito', icon_emoji: '🦍', xp_reward: 50, mastery_points_reward: 2, target: 6, criteria: { action: 'muscle_sets', group: 'Peito' }, category: 'strength' },
  { id: '6', key: 'daily_legs_1', type: 'daily', title: 'Dia de Perna não se pula', description: 'Faça 8 séries de exercícios de perna', icon_emoji: '🦵', xp_reward: 50, mastery_points_reward: 3, target: 8, criteria: { action: 'muscle_sets', group: 'Pernas' }, category: 'strength' },
  { id: '7', key: 'daily_calories_1', type: 'daily', title: 'Déficit/Superávit Ideal', description: 'Bata sua meta de calorias hoje', icon_emoji: '🥗', xp_reward: 50, mastery_points_reward: 2, target: 1, criteria: { action: 'calories_goal' }, category: 'diet' },
  { id: '8', key: 'daily_pr_1', type: 'daily', title: 'Quebrando Barreiras', description: 'Bata 1 PR (Recorde Pessoal) hoje', icon_emoji: '🔥', xp_reward: 100, mastery_points_reward: 5, target: 1, criteria: { action: 'break_pr' }, category: 'achievement' },
  { id: '9', key: 'daily_macros_1', type: 'daily', title: 'Alquimista Nutricional', description: 'Bata sua meta de Proteína hoje', icon_emoji: '🥩', xp_reward: 40, mastery_points_reward: 2, target: 1, criteria: { action: 'protein_goal' }, category: 'diet' },
  { id: '10', key: 'daily_meditation_1', type: 'daily', title: 'Corpo e Mente', description: 'Registrar ao menos 10 minutos de alongamento/mobilidade', icon_emoji: '🧘', xp_reward: 30, mastery_points_reward: 1, target: 10, criteria: { action: 'mobility_minutes' }, category: 'recovery' },

  // === SEMANAIS (Weekly) ===
  { id: '11', key: 'weekly_workout_1', type: 'weekly', title: 'Força Semanal', description: 'Complete 4 treinos de musculação na semana', icon_emoji: '🦾', xp_reward: 300, mastery_points_reward: 15, target: 4, criteria: { action: 'complete_workout' }, category: 'activity' },
  { id: '12', key: 'weekly_cardio_1', type: 'weekly', title: 'Maratonista', description: 'Acumule 120 minutos de cardio na semana', icon_emoji: '🏃‍♂️', xp_reward: 250, mastery_points_reward: 12, target: 120, criteria: { action: 'cardio_minutes' }, category: 'cardio' },
  { id: '13', key: 'weekly_volume_1', type: 'weekly', title: 'Titan Load', description: 'Atinja 15000kg de volume semanal total', icon_emoji: '🚚', xp_reward: 400, mastery_points_reward: 20, target: 15000, criteria: { action: 'workout_volume' }, category: 'strength' },
  { id: '14', key: 'weekly_diet_1', type: 'weekly', title: 'Foco de Ferro', description: 'Bata as metas de dieta 5 dias nesta semana', icon_emoji: '🎯', xp_reward: 300, mastery_points_reward: 15, target: 5, criteria: { action: 'diet_days' }, category: 'diet' },
  { id: '15', key: 'weekly_squat_1', type: 'weekly', title: 'Fundação Obelisco', description: 'Execute 12 séries de Agachamento Livre na semana', icon_emoji: '🏗️', xp_reward: 200, mastery_points_reward: 10, target: 12, criteria: { action: 'exercise_sets', exercise: 'Agachamento Livre' }, category: 'strength' },
  { id: '16', key: 'weekly_bench_1', type: 'weekly', title: 'Escudo Primordial', description: 'Execute 12 séries de Supino Reto na semana', icon_emoji: '🛡️', xp_reward: 200, mastery_points_reward: 10, target: 12, criteria: { action: 'exercise_sets', exercise: 'Supino Reto' }, category: 'strength' },
  { id: '17', key: 'weekly_deadlift_1', type: 'weekly', title: 'Gravidade Desafiada', description: 'Execute 10 séries de Levantamento Terra na semana', icon_emoji: '🔮', xp_reward: 250, mastery_points_reward: 12, target: 10, criteria: { action: 'exercise_sets', exercise: 'Levantamento Terra' }, category: 'strength' },
  { id: '18', key: 'weekly_party_1', type: 'weekly', title: 'Lobo em Alcateia', description: 'Participe de 2 treinos em Party', icon_emoji: '🐺', xp_reward: 300, mastery_points_reward: 15, target: 2, criteria: { action: 'party_workout' }, category: 'social' },
  { id: '19', key: 'weekly_guild_1', type: 'weekly', title: 'Dever da Guilda', description: 'Contribua com 50 de Poder XP para sua guilda', icon_emoji: '⚔️', xp_reward: 200, mastery_points_reward: 10, target: 50, criteria: { action: 'guild_contribution' }, category: 'social' },
  { id: '20', key: 'weekly_streak_1', type: 'weekly', title: 'Implacável', description: 'Mantenha um streak ativo de 7 dias ou mais', icon_emoji: '☄️', xp_reward: 400, mastery_points_reward: 20, target: 1, criteria: { action: 'streak_maintain', target_streak: 7 }, category: 'achievement' },

  // === MENSAIS (Monthly) ===
  { id: '21', key: 'monthly_workout_1', type: 'monthly', title: 'Soldado do Mês', description: 'Complete 20 treinos', icon_emoji: '🏅', xp_reward: 1000, mastery_points_reward: 50, target: 20, criteria: { action: 'complete_workout' }, category: 'activity' },
  { id: '22', key: 'monthly_volume_1', type: 'monthly', title: 'Hércules', description: 'Alcance 100.000kg de volume levantado', icon_emoji: '🏛️', xp_reward: 1500, mastery_points_reward: 75, target: 100000, criteria: { action: 'workout_volume' }, category: 'strength' },
  { id: '23', key: 'monthly_cardio_1', type: 'monthly', title: 'Pulmões de Aço', description: 'Corra, pedale ou ande por 600 minutos', icon_emoji: '🫁', xp_reward: 1000, mastery_points_reward: 50, target: 600, criteria: { action: 'cardio_minutes' }, category: 'cardio' },
  { id: '24', key: 'monthly_prs_1', type: 'monthly', title: 'Evolução Contínua', description: 'Quebre 5 Recordes Pessoais diferentes', icon_emoji: '📈', xp_reward: 1200, mastery_points_reward: 60, target: 5, criteria: { action: 'break_pr' }, category: 'achievement' },
  { id: '25', key: 'monthly_diet_1', type: 'monthly', title: 'Máquina Bem Cuidada', description: 'Bata metas de dieta 20 dias neste mês', icon_emoji: '🍏', xp_reward: 1500, mastery_points_reward: 75, target: 20, criteria: { action: 'diet_days' }, category: 'diet' },
  { id: '26', key: 'monthly_rankup_1', type: 'monthly', title: 'Ascensão Mensal', description: 'Suba de Rank em 3 exercícios diferentes', icon_emoji: '✨', xp_reward: 2000, mastery_points_reward: 100, target: 3, criteria: { action: 'exercise_rank_up' }, category: 'achievement' },

  // === MESTRE (Master) ===
  { id: '27', key: 'master_100k_1', type: 'master', title: 'Lendário: Clube dos 100K', description: 'Alcance 1.000.000kg de volume levantado em toda conta', icon_emoji: '♾️', xp_reward: 5000, mastery_points_reward: 300, target: 1000000, criteria: { action: 'lifetime_volume' }, category: 'milestone' },
  { id: '28', key: 'master_workout_1', type: 'master', title: 'Lendário: Mestre Jedi', description: 'Complete 300 treinos totais na sua vida', icon_emoji: '🧙‍♂️', xp_reward: 5000, mastery_points_reward: 300, target: 300, criteria: { action: 'lifetime_workouts' }, category: 'milestone' },
  { id: '29', key: 'master_diet_1', type: 'master', title: 'Lendário: Monge Disciplinado', description: 'Bata a dieta 100 dias totais', icon_emoji: '🏯', xp_reward: 4000, mastery_points_reward: 250, target: 100, criteria: { action: 'lifetime_diet_days' }, category: 'milestone' },
  { id: '30', key: 'master_streak_1', type: 'master', title: 'Lendário: Avatar Imortal', description: 'Atingir um Streak de 100 dias seguidos', icon_emoji: '🐉', xp_reward: 10000, mastery_points_reward: 500, target: 100, criteria: { action: 'lifetime_streak' }, category: 'milestone' },
  { id: '31', key: 'master_overall_1', type: 'master', title: 'Supremo: Transcendente', description: 'Chegar ao rank Transcendente no Rank Geral de Maestria', icon_emoji: '🌠', xp_reward: 20000, mastery_points_reward: 1000, target: 1, criteria: { action: 'reach_transcendent' }, category: 'milestone' },
  { id: '32', key: 'master_pr_1', type: 'master', title: 'Mytos: Quebrador de Mundos', description: 'Atingir Level 100 de PR em um dos levantamentos bases', icon_emoji: '🌍', xp_reward: 5000, mastery_points_reward: 350, target: 1, criteria: { action: 'max_out_exercise' }, category: 'milestone' },

  // === GLOBAIS (Global) ===
  // Global missions targets are HUGE because the entire community chips in
  { id: '33', key: 'global_volume_1', type: 'global', title: 'Defesa de Asgard', description: 'Comunidade: Levantem 50.000.000kg de volume juntos', icon_emoji: '⚡', xp_reward: 5000, mastery_points_reward: 200, target: 50000000, criteria: { action: 'workout_volume' }, category: 'community' },
  { id: '34', key: 'global_workouts_1', type: 'global', title: 'Exército Espartano', description: 'Comunidade: Completem 10.000 treinos', icon_emoji: '🛡️', xp_reward: 3000, mastery_points_reward: 100, target: 10000, criteria: { action: 'complete_workout' }, category: 'community' },
  { id: '35', key: 'global_cardio_1', type: 'global', title: 'O Último Suspiro', description: 'Comunidade: 100.000 horas de cardio (6.000.000 min)', icon_emoji: '🌪️', xp_reward: 4000, mastery_points_reward: 150, target: 6000000, criteria: { action: 'cardio_minutes' }, category: 'community' },
  { id: '36', key: 'global_calories_1', type: 'global', title: 'Secando o Oceano', description: 'Comunidade: Entrar em Déficit Calórico 5.000 vezes', icon_emoji: '🌊', xp_reward: 3500, mastery_points_reward: 120, target: 5000, criteria: { action: 'diet_deficit_days' }, category: 'community' },
  { id: '37', key: 'global_squat_1', type: 'global', title: 'Coluna de Atlas', description: 'Comunidade: Fazer 2.000.000kg no Agachamento Livre', icon_emoji: '🗻', xp_reward: 5000, mastery_points_reward: 250, target: 2000000, criteria: { action: 'exercise_volume', exercise: 'Agachamento Livre' }, category: 'community' },
];

export const getTemplatesByType = (type: MissionTemplate['type']) => {
  return MISSION_TEMPLATES.filter((m) => m.type === type);
};

export const getRandomTemplates = (type: MissionTemplate['type'], count: number): MissionTemplate[] => {
  const filtered = getTemplatesByType(type);
  const shuffled = [...filtered].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};
