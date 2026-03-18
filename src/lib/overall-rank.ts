import { Shield, Medal, Trophy, Star, Crown, Flame, Zap, Sword, Target, Crosshair } from 'lucide-react';

export type RankTier = 
  | 'Unranked'
  | 'Ferro'
  | 'Bronze'
  | 'Prata'
  | 'Ouro'
  | 'Platina'
  | 'Esmeralda'
  | 'Diamante'
  | 'Mestre'
  | 'Grão-Mestre'
  | 'Transcendente'
  | 'Desafiante';

export type RankDivision = 'IV' | 'III' | 'II' | 'I' | '';

export interface OverallRankInfo {
  tier: RankTier;
  division: RankDivision;
  currentPM: number;
  pmForNextDivision: number;
  pmInCurrentDivision: number;
  progressPercent: number;
  fullRankString: string;
}

// PM Thresholds
// Each division in normal tiers is 100 PM (400 PM per tier)
const TIER_THRESHOLDS = {
  'Unranked': 0,
  'Ferro': 1,
  'Bronze': 400,
  'Prata': 800,
  'Ouro': 1200,
  'Platina': 1600,
  'Esmeralda': 2000,
  'Diamante': 2400,
  'Mestre': 2800,       // No divisions, +600 PM to next
  'Grão-Mestre': 3400, // No divisions, +800 PM to next
  'Transcendente': 4200,// No divisions, +1000 PM to next
  'Desafiante': 5200    // Uncapped
};

const DIVISIONS: RankDivision[] = ['IV', 'III', 'II', 'I'];
const PM_PER_DIVISION = 100;

export const calculateOverallRank = (pm: number): OverallRankInfo => {
  if (pm < 1 || !pm) {
    return {
      tier: 'Unranked', division: '', currentPM: pm || 0,
      pmForNextDivision: 1, pmInCurrentDivision: pm || 0,
      progressPercent: 0, fullRankString: 'Unranked'
    };
  }

  if (pm >= TIER_THRESHOLDS['Desafiante']) {
    return {
      tier: 'Desafiante', division: '', currentPM: pm,
      pmForNextDivision: 0, pmInCurrentDivision: pm - TIER_THRESHOLDS['Desafiante'],
      progressPercent: 100, fullRankString: 'Desafiante'
    };
  }
  if (pm >= TIER_THRESHOLDS['Transcendente']) {
    const inTier = pm - TIER_THRESHOLDS['Transcendente'];
    return {
      tier: 'Transcendente', division: '', currentPM: pm,
      pmForNextDivision: 1000, pmInCurrentDivision: inTier,
      progressPercent: (inTier / 1000) * 100, fullRankString: 'Transcendente'
    };
  }
  if (pm >= TIER_THRESHOLDS['Grão-Mestre']) {
    const inTier = pm - TIER_THRESHOLDS['Grão-Mestre'];
    return {
      tier: 'Grão-Mestre', division: '', currentPM: pm,
      pmForNextDivision: 800, pmInCurrentDivision: inTier,
      progressPercent: (inTier / 800) * 100, fullRankString: 'Grão-Mestre'
    };
  }
  if (pm >= TIER_THRESHOLDS['Mestre']) {
    const inTier = pm - TIER_THRESHOLDS['Mestre'];
    return {
      tier: 'Mestre', division: '', currentPM: pm,
      pmForNextDivision: 600, pmInCurrentDivision: inTier,
      progressPercent: (inTier / 600) * 100, fullRankString: 'Mestre'
    };
  }

  // Calculate standard tiered ranks (Ferro to Diamante)
  const tiers: RankTier[] = ['Ferro', 'Bronze', 'Prata', 'Ouro', 'Platina', 'Esmeralda', 'Diamante'];
  let currentTier: RankTier = 'Ferro';
  let tierBasePM = 0;

  for (let i = tiers.length - 1; i >= 0; i--) {
    if (pm >= TIER_THRESHOLDS[tiers[i]]) {
      currentTier = tiers[i];
      tierBasePM = TIER_THRESHOLDS[tiers[i]];
      break;
    }
  }

  const inTierPM = pm - tierBasePM;
  const divIndex = Math.min(3, Math.floor(inTierPM / PM_PER_DIVISION));
  const division = DIVISIONS[divIndex];
  
  const inDivisionPM = inTierPM % PM_PER_DIVISION;

  return {
    tier: currentTier,
    division,
    currentPM: pm,
    pmForNextDivision: PM_PER_DIVISION,
    pmInCurrentDivision: inDivisionPM,
    progressPercent: (inDivisionPM / PM_PER_DIVISION) * 100,
    fullRankString: `${currentTier} ${division}`
  };
};

export const getRankColors = (tier: RankTier) => {
  switch (tier) {
    case 'Ferro': return 'text-slate-400 bg-slate-400/10 border-slate-400/30';
    case 'Bronze': return 'text-amber-600 bg-amber-600/10 border-amber-600/30';
    case 'Prata': return 'text-gray-300 bg-gray-300/10 border-gray-300/30';
    case 'Ouro': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    case 'Platina': return 'text-teal-400 bg-teal-400/10 border-teal-400/30';
    case 'Esmeralda': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
    case 'Diamante': return 'text-cyan-400 bg-cyan-400/10 border-cyan-400/30 shadow-[0_0_15px_rgba(34,211,238,0.5)]';
    case 'Mestre': return 'text-purple-400 bg-purple-400/10 border-purple-400/30 shadow-[0_0_20px_rgba(192,132,252,0.6)]';
    case 'Grão-Mestre': return 'text-red-400 bg-red-400/10 border-red-400/30 shadow-[0_0_25px_rgba(248,113,113,0.7)]';
    case 'Transcendente': return 'text-fuchsia-400 bg-fuchsia-400/10 border-fuchsia-400/30 shadow-[0_0_30px_rgba(232,121,249,0.8)]';
    case 'Desafiante': return 'text-rose-500 bg-rose-500/10 border-rose-500/30 shadow-[0_0_40px_rgba(244,63,94,0.9)] font-black tracking-wider';
    default: return 'text-muted-foreground bg-muted/10 border-muted/30';
  }
};

export const getRankIcon = (tier: RankTier) => {
  switch (tier) {
    case 'Ferro': return Shield;
    case 'Bronze': return Crosshair;
    case 'Prata': return Target;
    case 'Ouro': return Medal;
    case 'Platina': return Star;
    case 'Esmeralda': return Zap;
    case 'Diamante': return Flame;
    case 'Mestre': return Sword;
    case 'Grão-Mestre': return Crown;
    case 'Transcendente': return Flame; // Could use custom SVGs in future
    case 'Desafiante': return Trophy;
    default: return Shield;
  }
};
