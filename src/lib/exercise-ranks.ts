// Exercise Rank System - RPG-style ranking per exercise

export interface RankTier {
  rank: number;
  name: string;
  icon: string;
  color: string;
  weightKg: number;
  reps: number;
}

export const RANK_TIERS: RankTier[] = [
  { rank: 1, name: 'Ferro', icon: '⚙️', color: '#6B7280', weightKg: 0, reps: 1 },
  { rank: 2, name: 'Bronze', icon: '🥉', color: '#92400E', weightKg: 0, reps: 0 },
  { rank: 3, name: 'Prata', icon: '🥈', color: '#9CA3AF', weightKg: 0, reps: 0 },
  { rank: 4, name: 'Ouro', icon: '🥇', color: '#F59E0B', weightKg: 0, reps: 0 },
  { rank: 5, name: 'Platina', icon: '💠', color: '#06B6D4', weightKg: 0, reps: 0 },
  { rank: 6, name: 'Diamante', icon: '💎', color: '#818CF8', weightKg: 0, reps: 0 },
  { rank: 7, name: 'Mestre', icon: '🔮', color: '#A855F7', weightKg: 0, reps: 0 },
  { rank: 8, name: 'Grão-Mestre', icon: '👑', color: '#EC4899', weightKg: 0, reps: 0 },
  { rank: 9, name: 'Lendário', icon: '🌟', color: '#F97316', weightKg: 0, reps: 0 },
  { rank: 10, name: 'Transcendente', icon: '✨', color: 'linear-gradient(135deg, #F59E0B, #A855F7)', weightKg: 0, reps: 0 },
];

export const RANK_NAMES = RANK_TIERS.map(r => r.name);

// Per-exercise rank criteria: { exerciseName: RankTier[] }
export const EXERCISE_RANK_CRITERIA: Record<string, { weightKg: number; reps: number }[]> = {
  'Supino Reto': [
    { weightKg: 0, reps: 1 }, { weightKg: 40, reps: 8 }, { weightKg: 60, reps: 8 },
    { weightKg: 80, reps: 8 }, { weightKg: 100, reps: 6 }, { weightKg: 120, reps: 5 },
    { weightKg: 140, reps: 3 }, { weightKg: 160, reps: 2 }, { weightKg: 180, reps: 1 },
    { weightKg: 200, reps: 1 },
  ],
  'Agachamento Livre': [
    { weightKg: 0, reps: 1 }, { weightKg: 50, reps: 8 }, { weightKg: 80, reps: 8 },
    { weightKg: 100, reps: 8 }, { weightKg: 130, reps: 6 }, { weightKg: 160, reps: 5 },
    { weightKg: 180, reps: 3 }, { weightKg: 200, reps: 2 }, { weightKg: 220, reps: 1 },
    { weightKg: 250, reps: 1 },
  ],
  'Levantamento Terra': [
    { weightKg: 0, reps: 1 }, { weightKg: 60, reps: 8 }, { weightKg: 100, reps: 8 },
    { weightKg: 130, reps: 6 }, { weightKg: 160, reps: 5 }, { weightKg: 190, reps: 3 },
    { weightKg: 210, reps: 2 }, { weightKg: 230, reps: 1 }, { weightKg: 250, reps: 1 },
    { weightKg: 280, reps: 1 },
  ],
  'Desenvolvimento Militar': [
    { weightKg: 0, reps: 1 }, { weightKg: 25, reps: 8 }, { weightKg: 40, reps: 8 },
    { weightKg: 55, reps: 6 }, { weightKg: 70, reps: 5 }, { weightKg: 85, reps: 3 },
    { weightKg: 100, reps: 2 }, { weightKg: 115, reps: 1 }, { weightKg: 130, reps: 1 },
    { weightKg: 150, reps: 1 },
  ],
  'Rosca Direta': [
    { weightKg: 0, reps: 1 }, { weightKg: 20, reps: 10 }, { weightKg: 30, reps: 10 },
    { weightKg: 40, reps: 8 }, { weightKg: 50, reps: 6 }, { weightKg: 60, reps: 5 },
    { weightKg: 70, reps: 3 }, { weightKg: 80, reps: 2 }, { weightKg: 90, reps: 1 },
    { weightKg: 100, reps: 1 },
  ],
  'Puxada Frontal': [
    { weightKg: 0, reps: 1 }, { weightKg: 40, reps: 10 }, { weightKg: 60, reps: 10 },
    { weightKg: 80, reps: 8 }, { weightKg: 100, reps: 6 }, { weightKg: 120, reps: 5 },
    { weightKg: 140, reps: 3 }, { weightKg: 160, reps: 2 }, { weightKg: 180, reps: 1 },
    { weightKg: 200, reps: 1 },
  ],
};

export function getRankTier(rankName: string): RankTier {
  return RANK_TIERS.find(r => r.name === rankName) || RANK_TIERS[0];
}

export function calculateRank(exerciseName: string, weightKg: number, reps: number): string {
  const criteria = EXERCISE_RANK_CRITERIA[exerciseName];
  if (!criteria) return 'Ferro';

  let achievedRank = 0;
  for (let i = 0; i < criteria.length; i++) {
    if (weightKg >= criteria[i].weightKg && reps >= criteria[i].reps) {
      achievedRank = i;
    }
  }
  return RANK_TIERS[achievedRank]?.name || 'Ferro';
}

export function getNextRankInfo(exerciseName: string, currentRank: string): { nextRank: RankTier; criteria: { weightKg: number; reps: number } } | null {
  const criteria = EXERCISE_RANK_CRITERIA[exerciseName];
  if (!criteria) return null;

  const currentIdx = RANK_TIERS.findIndex(r => r.name === currentRank);
  if (currentIdx < 0 || currentIdx >= RANK_TIERS.length - 1) return null;

  const nextIdx = currentIdx + 1;
  if (nextIdx >= criteria.length) return null;

  return {
    nextRank: RANK_TIERS[nextIdx],
    criteria: criteria[nextIdx],
  };
}

export function getRankProgress(exerciseName: string, currentRank: string, bestWeightKg: number): number {
  const criteria = EXERCISE_RANK_CRITERIA[exerciseName];
  if (!criteria) return 0;

  const currentIdx = RANK_TIERS.findIndex(r => r.name === currentRank);
  if (currentIdx < 0 || currentIdx >= criteria.length - 1) return 100;

  const currentThreshold = criteria[currentIdx].weightKg;
  const nextThreshold = criteria[currentIdx + 1].weightKg;
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 100;

  return Math.min(100, Math.max(0, ((bestWeightKg - currentThreshold) / range) * 100));
}

export const RANK_UP_MESSAGES = [
  'Você forjou o aço em ouro, aventureiro!',
  'Sua força transcende os limites mortais!',
  'Os deuses do Olimpo reconhecem seu poder!',
  'A lenda cresce — continue subindo!',
  'Rank up! Sua jornada épica continua!',
  'O ferro reconhece seu domínio!',
  'Poder absoluto conquistado neste exercício!',
];
