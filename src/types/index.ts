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
  frameUrl?: string;
  isPremium?: boolean;
  avatarGlowColor?: string;
  nameColor?: string;
  profileFont?: string;
  bio?: string;
  theme: ThemeId;
  xp: number;
  level: number;
  coins?: number;
  className: ClassName;
  specialization: Specialization;
  strAttr: number;
  endAttr: number;
  vitAttr: number;
  agiAttr: number;
  streak: number;
  plan: 'free' | 'vip' | 'vip_plus' | 'pro';
  anamnesisComplete: boolean;
  overall_rank?: string;
  overall_mastery_points?: number;
  selected_title_id?: string | null;
  current_class_id?: string | null;
  currentClass?: {
    name: string;
    archetype: string;
    rarity: string;
    bonus_type: string;
    bonus_value: number;
    icon_emoji: string;
  } | null;
  role?: 'user' | 'admin';
  has_seen_tutorial?: boolean;
  name_effect?: Record<string, any>;
  profile_gradient?: string;
  profile_wallpaper_url?: string;
  avatar_frame?: string;
  is_owner?: boolean;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  buff_type: string | null;
  buff_value: number | null;
  requirement_type: string | null;
  requirement_value: number | null;
  is_unique: boolean;
}

export interface UserTitle {
  id: string;
  user_id: string;
  title_id: string;
  unlocked_at: string;
  is_equipped: boolean;
  title?: Title; // used for joins
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
  frameUrl?: string;
  isPremium?: boolean;
  avatarGlowColor?: string;
  nameColor?: string;
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
