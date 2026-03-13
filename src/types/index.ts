export type ThemeId = 'dark-red' | 'dark-orange' | 'dark-gold' | 'light-red' | 'light-orange' | 'light-gold';

export type ClassName = 'Iniciante' | 'Aprendiz' | 'Guerreiro' | 'Veterano' | 'Elite' | 'Lendário' | 'Imortal';

export type Specialization = 'hercules' | 'hermes' | 'apollo' | 'athena' | null;

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bannerUrl?: string;
  bio?: string;
  theme: ThemeId;
  xp: number;
  level: number;
  className: ClassName;
  specialization: Specialization;
  strAttr: number;
  endAttr: number;
  vitAttr: number;
  agiAttr: number;
  streak: number;
  plan: 'free' | 'vip' | 'vip_plus' | 'pro';
  anamnesisComplete: boolean;
}

export interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  iconEmoji: string;
  xpReward: number;
  category: string;
  unlockedAt?: string;
}

export interface WorkoutSession {
  id: string;
  programName?: string;
  dayName?: string;
  status: 'active' | 'completed' | 'abandoned';
  startedAt: string;
  endedAt?: string;
  durationMin?: number;
  totalVolumeKg?: number;
  totalSets?: number;
  xpGained: number;
}

export interface DietDay {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalFatG: number;
  totalCarbsG: number;
  totalWaterMl: number;
  targetCalories: number;
  targetProteinG: number;
  targetFatG: number;
  targetCarbsG: number;
  targetWaterMl: number;
  goalMet: boolean;
}

export interface CardioSession {
  id: string;
  type: string;
  durationMinutes: number;
  distanceKm?: number;
  caloriesBurned?: number;
  xpGained: number;
  startedAt: string;
}

export interface RankingEntry {
  rank: number;
  username: string;
  name: string;
  level: number;
  className: ClassName;
  xp: number;
  avatarUrl?: string;
}

export interface FeedActivity {
  id: string;
  username: string;
  name: string;
  type: 'workout_complete' | 'pr_broken' | 'level_up' | 'achievement' | 'cardio_complete' | 'diet_goal';
  data: Record<string, any>;
  createdAt: string;
  reactions: { emoji: string; count: number }[];
}

export const LEVEL_TABLE = [
  { level: 1, xpRequired: 0, className: 'Iniciante' as ClassName, icon: '🪨' },
  { level: 2, xpRequired: 1000, className: 'Aprendiz' as ClassName, icon: '🗡️' },
  { level: 3, xpRequired: 3000, className: 'Guerreiro' as ClassName, icon: '⚔️' },
  { level: 4, xpRequired: 7000, className: 'Veterano' as ClassName, icon: '🛡️' },
  { level: 5, xpRequired: 15000, className: 'Elite' as ClassName, icon: '🔥' },
  { level: 6, xpRequired: 30000, className: 'Lendário' as ClassName, icon: '💎' },
  { level: 7, xpRequired: 60000, className: 'Imortal' as ClassName, icon: '👑' },
];
