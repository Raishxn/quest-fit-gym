export type MissionCategory = 'workout' | 'cardio' | 'diet' | 'social' | 'master' | 'global';
export type MissionDifficulty = 'easy' | 'normal' | 'medium' | 'hard' | 'master';

export interface MissionTemplate {
  key: string;
  type: 'daily' | 'weekly' | 'monthly' | 'master' | 'global';
  title: string;
  description: string;
  icon_emoji: string;
  xp_reward: number;
  mastery_points_reward: number;
  criteria: Record<string, any>;
  category: MissionCategory;
  difficulty: MissionDifficulty;
}

export const MISSION_TEMPLATES_SEED: MissionTemplate[] = [
  {
    key: 'daily_workout_1',
    type: 'daily',
    title: 'O Despertar do Guerreiro',
    description: 'Complete qualquer treino hoje.',
    icon_emoji: '🏋️',
    xp_reward: 50,
    mastery_points_reward: 0,
    criteria: { action: 'complete_workout', count: 1 },
    category: 'workout',
    difficulty: 'easy'
  },
  {
    key: 'daily_cardio_1',
    type: 'daily',
    title: 'Fôlego de Ferro',
    description: 'Faça 20 minutos de cardio.',
    icon_emoji: '🏃',
    xp_reward: 40,
    mastery_points_reward: 0,
    criteria: { action: 'complete_cardio', duration_min: 20 },
    category: 'cardio',
    difficulty: 'easy'
  },
  {
    key: 'master_squat_1',
    type: 'master',
    title: 'Pernas de Titã',
    description: 'Alcançar um Agachamento validado com 1.5x seu peso corporal.',
    icon_emoji: '🦵',
    xp_reward: 2000,
    mastery_points_reward: 100,
    criteria: { action: 'exercise_milestone', exercise_id: 'squat', multiplier: 1.5 },
    category: 'master',
    difficulty: 'master'
  },
  {
    key: 'global_volume_1',
    type: 'global',
    title: 'A Grande Forja',
    description: 'A comunidade toda deve levantar 5.000.000 kg.',
    icon_emoji: '🌍',
    xp_reward: 500,
    mastery_points_reward: 20,
    criteria: { action: 'community_volume', amount: 5000000 },
    category: 'global',
    difficulty: 'normal'
  }
];
