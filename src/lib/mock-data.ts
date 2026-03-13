import type { Achievement, WorkoutSession, DietDay, CardioSession, RankingEntry, FeedActivity } from '@/types';

export const mockAchievements: Achievement[] = [
  { id: '1', key: 'first_workout', name: 'Primeira Quest', description: 'Complete seu primeiro treino', iconEmoji: '🗡️', xpReward: 50, category: 'workout', unlockedAt: '2024-01-15' },
  { id: '2', key: 'ten_workouts', name: 'Guerreiro em Formação', description: 'Complete 10 treinos', iconEmoji: '⚔️', xpReward: 100, category: 'workout', unlockedAt: '2024-02-10' },
  { id: '3', key: 'first_pr', name: 'Recorde Pessoal', description: 'Quebre seu primeiro PR', iconEmoji: '🏆', xpReward: 75, category: 'workout', unlockedAt: '2024-01-20' },
  { id: '4', key: 'streak_7', name: 'Sete Dias Seguidos', description: '7 dias de streak', iconEmoji: '🔥', xpReward: 100, category: 'streak', unlockedAt: '2024-02-01' },
  { id: '5', key: 'anamnesis_done', name: 'Auto Conhecimento', description: 'Complete a anamnese', iconEmoji: '🧠', xpReward: 200, category: 'onboarding', unlockedAt: '2024-01-10' },
  { id: '6', key: 'first_cardio', name: 'Primeiro Passo', description: 'Complete sua primeira sessão de cardio', iconEmoji: '👟', xpReward: 30, category: 'cardio', unlockedAt: '2024-01-25' },
  { id: '7', key: 'hydration', name: 'Hidratado', description: 'Atinja a meta de água', iconEmoji: '💧', xpReward: 75, category: 'diet' },
  { id: '8', key: 'fifty_workouts', name: 'Veterano das Barras', description: 'Complete 50 treinos', iconEmoji: '🛡️', xpReward: 250, category: 'workout' },
  { id: '9', key: 'level_5', name: 'Elite', description: 'Alcance o nível 5', iconEmoji: '🔥', xpReward: 0, category: 'level' },
  { id: '10', key: 'marathon_total', name: 'Maratonista', description: 'Acumule 42km de corrida', iconEmoji: '🏅', xpReward: 200, category: 'cardio' },
];

export const mockRecentWorkouts: WorkoutSession[] = [
  { id: '1', programName: 'Push Pull Legs', dayName: 'Push A', status: 'completed', startedAt: '2024-03-12T14:00:00', endedAt: '2024-03-12T15:15:00', durationMin: 75, totalVolumeKg: 5200, totalSets: 24, xpGained: 142 },
  { id: '2', programName: 'Push Pull Legs', dayName: 'Pull A', status: 'completed', startedAt: '2024-03-10T16:00:00', endedAt: '2024-03-10T17:10:00', durationMin: 70, totalVolumeKg: 4800, totalSets: 22, xpGained: 128 },
  { id: '3', programName: 'Push Pull Legs', dayName: 'Legs', status: 'completed', startedAt: '2024-03-08T10:00:00', endedAt: '2024-03-08T11:30:00', durationMin: 90, totalVolumeKg: 8500, totalSets: 28, xpGained: 168 },
];

export const mockDietToday: DietDay = {
  date: new Date().toISOString().slice(0, 10),
  totalCalories: 1850,
  totalProteinG: 145,
  totalFatG: 62,
  totalCarbsG: 195,
  totalWaterMl: 2100,
  targetCalories: 2400,
  targetProteinG: 160,
  targetFatG: 67,
  targetCarbsG: 290,
  targetWaterMl: 2800,
  goalMet: false,
};

export const mockCardioSessions: CardioSession[] = [
  { id: '1', type: 'running', durationMinutes: 35, distanceKm: 5.2, caloriesBurned: 380, xpGained: 50, startedAt: '2024-03-11T07:00:00' },
  { id: '2', type: 'cycling', durationMinutes: 45, distanceKm: 18, caloriesBurned: 420, xpGained: 60, startedAt: '2024-03-09T18:00:00' },
  { id: '3', type: 'swimming', durationMinutes: 30, caloriesBurned: 280, xpGained: 45, startedAt: '2024-03-07T06:30:00' },
];

export const mockRanking: RankingEntry[] = [
  { rank: 1, username: 'ironmaster', name: 'Marcus Silva', level: 6, className: 'Lendário', xp: 35200 },
  { rank: 2, username: 'fitqueen', name: 'Ana Costa', level: 5, className: 'Elite', xp: 28100 },
  { rank: 3, username: 'beastmode', name: 'Carlos Mendes', level: 5, className: 'Elite', xp: 22800 },
  { rank: 4, username: 'heroi_rpg', name: 'Herói RPG', level: 3, className: 'Guerreiro', xp: 4250 },
  { rank: 5, username: 'liftlord', name: 'João Pedro', level: 3, className: 'Guerreiro', xp: 3900 },
  { rank: 6, username: 'strongmind', name: 'Lucia Alves', level: 2, className: 'Aprendiz', xp: 2100 },
  { rank: 7, username: 'runnerx', name: 'Paulo Reis', level: 2, className: 'Aprendiz', xp: 1800 },
  { rank: 8, username: 'newbie01', name: 'Maria Clara', level: 1, className: 'Iniciante', xp: 450 },
];

export const mockFeed: FeedActivity[] = [
  { id: '1', username: 'heroi_rpg', name: 'Herói RPG', type: 'workout_complete', data: { volume: 5200, duration: 75, day: 'Push A' }, createdAt: '2024-03-12T15:15:00', reactions: [{ emoji: '💪', count: 3 }, { emoji: '🔥', count: 1 }] },
  { id: '2', username: 'fitqueen', name: 'Ana Costa', type: 'pr_broken', data: { exercise: 'Agachamento', weight: 120, reps: 5 }, createdAt: '2024-03-12T14:00:00', reactions: [{ emoji: '🔥', count: 5 }, { emoji: '👏', count: 2 }] },
  { id: '3', username: 'beastmode', name: 'Carlos Mendes', type: 'level_up', data: { newLevel: 5, newClass: 'Elite' }, createdAt: '2024-03-11T20:00:00', reactions: [{ emoji: '🔥', count: 8 }, { emoji: '👏', count: 4 }] },
  { id: '4', username: 'heroi_rpg', name: 'Herói RPG', type: 'cardio_complete', data: { type: 'running', distance: 5.2, duration: 35 }, createdAt: '2024-03-11T07:35:00', reactions: [{ emoji: '💪', count: 1 }] },
  { id: '5', username: 'ironmaster', name: 'Marcus Silva', type: 'achievement', data: { name: 'Veterano das Barras', emoji: '🛡️' }, createdAt: '2024-03-10T19:00:00', reactions: [{ emoji: '🔥', count: 6 }, { emoji: '🎯', count: 3 }] },
];
