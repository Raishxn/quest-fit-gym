import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { recalculateLevel } from '@/lib/level';

// ─── Mission Templates with Auto-Detection ─────────────────────────────────
// Each template has a `check` function that queries the DB to see if the condition is met.

export interface MissionTemplate {
  title: string;
  type: 'daily' | 'weekly' | 'monthly';
  xp_reward: number;
  check: (userId: string, dateRange: { start: string; end: string }) => Promise<boolean>;
}

const todayRange = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  const start = d.toISOString();
  d.setHours(23, 59, 59, 999);
  const end = d.toISOString();
  return { start, end };
};

const DAILY_TEMPLATES: MissionTemplate[] = [
  {
    title: "Treino do Dia",
    type: "daily",
    xp_reward: 100,
    check: async (userId, { start, end }) => {
      const { count } = await supabase.from('workout_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).eq('status', 'completed').gte('started_at', start).lte('started_at', end);
      return (count || 0) >= 1;
    }
  },
  {
    title: "Sessão de Cardio (20min)",
    type: "daily",
    xp_reward: 80,
    check: async (userId, { start, end }) => {
      const { data } = await supabase.from('cardio_sessions').select('duration_minutes')
        .eq('user_id', userId).gte('started_at', start).lte('started_at', end);
      const totalMin = (data || []).reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
      return totalMin >= 20;
    }
  },
  {
    title: "Registrar Refeição",
    type: "daily",
    xp_reward: 50,
    check: async (userId) => {
      const today = new Date().toISOString().slice(0, 10);
      const { count } = await supabase.from('meals').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).eq('date', today);
      return (count || 0) >= 1;
    }
  },
  {
    title: "Bater Meta de Proteína",
    type: "daily",
    xp_reward: 70,
    check: async (userId) => {
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase.from('diet_days').select('total_protein_g, target_protein_g')
        .eq('user_id', userId).eq('date', today).maybeSingle();
      if (!data || !data.target_protein_g) return false;
      return data.total_protein_g >= data.target_protein_g;
    }
  },
  {
    title: "Completar 10+ Séries",
    type: "daily",
    xp_reward: 90,
    check: async (userId, { start, end }) => {
      // Count set_logs for today's workout sessions
      const { data: sessions } = await supabase.from('workout_sessions').select('id')
        .eq('user_id', userId).gte('started_at', start).lte('started_at', end);
      if (!sessions || sessions.length === 0) return false;
      const ids = sessions.map(s => s.id);
      const { count } = await supabase.from('set_logs').select('*', { count: 'exact', head: true })
        .in('session_id', ids);
      return (count || 0) >= 10;
    }
  },
];

const WEEKLY_TEMPLATES: MissionTemplate[] = [
  {
    title: "Concluir 4 Treinos",
    type: "weekly",
    xp_reward: 300,
    check: async (userId, { start, end }) => {
      const { count } = await supabase.from('workout_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).eq('status', 'completed').gte('started_at', start).lte('started_at', end);
      return (count || 0) >= 4;
    }
  },
  {
    title: "Fazer Cardio 3 Vezes",
    type: "weekly",
    xp_reward: 200,
    check: async (userId, { start, end }) => {
      const { count } = await supabase.from('cardio_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).gte('started_at', start).lte('started_at', end);
      return (count || 0) >= 3;
    }
  },
  {
    title: "Registrar Dieta 5 Dias",
    type: "weekly",
    xp_reward: 250,
    check: async (userId) => {
      // Count distinct diet_days this week
      const weekStart = getWeekStartDate();
      const { count } = await supabase.from('diet_days').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).gte('date', weekStart);
      return (count || 0) >= 5;
    }
  },
];

const MONTHLY_TEMPLATES: MissionTemplate[] = [
  {
    title: "Mestre da Frequência (20 treinos)",
    type: "monthly",
    xp_reward: 1000,
    check: async (userId, { start, end }) => {
      const { count } = await supabase.from('workout_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).eq('status', 'completed').gte('started_at', start).lte('started_at', end);
      return (count || 0) >= 20;
    }
  },
  {
    title: "Super Cardio (15 Sessões)",
    type: "monthly",
    xp_reward: 800,
    check: async (userId, { start, end }) => {
      const { count } = await supabase.from('cardio_sessions').select('*', { count: 'exact', head: true })
        .eq('user_id', userId).gte('started_at', start).lte('started_at', end);
      return (count || 0) >= 15;
    }
  },
];

export interface UserMission {
  id: string;
  user_id: string;
  title: string;
  xp_reward: number;
  is_completed: boolean;
  is_claimed: boolean;
  date_assigned: string;
  type: string;
  created_at?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────
const getLocalDateString = () => new Date().toISOString().split('T')[0];

const getWeekStartDate = () => {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

const getWeekString = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7);
  const w1 = new Date(d.getFullYear(), 0, 4);
  const wn = 1 + Math.round(((d.getTime() - w1.getTime()) / 86400000 - 3 + (w1.getDay() + 6) % 7) / 7);
  return `${d.getFullYear()}-W${wn}`;
};

const getMonthString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

const getDateRange = (type: string): { start: string; end: string } => {
  if (type === 'daily') return todayRange();
  if (type === 'weekly') {
    const ws = getWeekStartDate();
    const we = new Date(ws);
    we.setDate(we.getDate() + 6);
    we.setHours(23, 59, 59, 999);
    return { start: new Date(ws).toISOString(), end: we.toISOString() };
  }
  // monthly
  const d = new Date();
  const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();
  return { start, end };
};

// ─── Fetch & Auto-Check Missions ────────────────────────────────────────────
export const fetchActiveMissions = async (userId: string): Promise<UserMission[]> => {
  const { data, error } = await (supabase as any)
    .from('user_missions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar missões:', error);
    toast.error(`Erro ao buscar missões: ${error.message}`);
    return [];
  }

  const missions = (data || []) as UserMission[];

  // Auto-check: for each uncompleted mission, run its check function
  const templates = [...DAILY_TEMPLATES, ...WEEKLY_TEMPLATES, ...MONTHLY_TEMPLATES];

  for (const mission of missions) {
    if (mission.is_completed) continue;

    const template = templates.find(t => t.title === mission.title && t.type === mission.type);
    if (!template) continue;

    const range = getDateRange(mission.type);
    try {
      const isDone = await template.check(userId, range);
      if (isDone) {
        await (supabase as any).from('user_missions').update({ is_completed: true }).eq('id', mission.id);
        mission.is_completed = true;
      }
    } catch (e) {
      console.warn(`Auto-check failed for "${mission.title}":`, e);
    }
  }

  return missions;
};

// ─── Claim Reward (only after auto-completed) ───────────────────────────────
export const claimMissionReward = async (missionId: string, userId: string): Promise<{ xpReward: number }> => {
  const { data: mission, error: getErr } = await (supabase as any)
    .from('user_missions')
    .select('*')
    .eq('id', missionId)
    .single();

  if (getErr || !mission) throw getErr;
  if (!mission.is_completed) throw new Error('Missão ainda não foi concluída!');
  if (mission.is_claimed) throw new Error('Recompensa já resgatada.');

  // Mark as claimed
  await (supabase as any).from('user_missions').update({ is_claimed: true }).eq('id', missionId);

  // Give XP + Coins
  if (mission.xp_reward > 0) {
    const { data: profileData } = await supabase.from('profiles').select('xp, coins').eq('user_id', userId).single();
    if (profileData) {
      const coinReward = Math.round(mission.xp_reward / 5);
      await (supabase as any).from('profiles').update({
        xp: (profileData.xp || 0) + mission.xp_reward,
        coins: ((profileData as any).coins || 0) + coinReward
      }).eq('user_id', userId);
      
      await recalculateLevel(userId);
    }
  }

  return { xpReward: mission.xp_reward };
};

// ─── Generate Missions (unchanged logic, just picks and inserts) ────────────
export const checkAndGenerateDailyMissions = async (userId: string) => {
  const { data: existingData } = await (supabase as any)
    .from('user_missions')
    .select('id, type, date_assigned, is_completed')
    .eq('user_id', userId);

  const existing = existingData || [];
  const todayStr = getLocalDateString();
  const weekStr = getWeekString();
  const monthStr = getMonthString();

  const newMissionsToInsert: any[] = [];
  const myDailies = existing.filter((m: any) => m.type === 'daily');
  const myWeeklies = existing.filter((m: any) => m.type === 'weekly');
  const myMonthlies = existing.filter((m: any) => m.type === 'monthly');

  // Cleanup old
  const toDelete = myDailies.filter((m: any) => m.date_assigned !== todayStr)
    .concat(myWeeklies.filter((m: any) => m.date_assigned !== weekStr))
    .concat(myMonthlies.filter((m: any) => m.date_assigned !== monthStr));

  if (toDelete.length > 0) {
    await (supabase as any).from('user_missions').delete().in('id', toDelete.map((m: any) => m.id));
  }

  const needsDaily = myDailies.filter((m: any) => m.date_assigned === todayStr).length === 0;
  const needsWeekly = myWeeklies.filter((m: any) => m.date_assigned === weekStr).length === 0;
  const needsMonthly = myMonthlies.filter((m: any) => m.date_assigned === monthStr).length === 0;

  const pickRandom = (arr: any[], num: number) => [...arr].sort(() => 0.5 - Math.random()).slice(0, num);

  if (needsDaily) {
    const picked = pickRandom(DAILY_TEMPLATES, 3);
    picked.forEach(p => newMissionsToInsert.push({
      title: p.title, type: p.type, xp_reward: p.xp_reward,
      is_completed: false, is_claimed: false,
      user_id: userId, date_assigned: todayStr
    }));
  }

  if (needsWeekly) {
    const picked = pickRandom(WEEKLY_TEMPLATES, 2);
    picked.forEach(p => newMissionsToInsert.push({
      title: p.title, type: p.type, xp_reward: p.xp_reward,
      is_completed: false, is_claimed: false,
      user_id: userId, date_assigned: weekStr
    }));
  }

  if (needsMonthly) {
    const picked = pickRandom(MONTHLY_TEMPLATES, 1);
    picked.forEach(p => newMissionsToInsert.push({
      title: p.title, type: p.type, xp_reward: p.xp_reward,
      is_completed: false, is_claimed: false,
      user_id: userId, date_assigned: monthStr
    }));
  }

  if (newMissionsToInsert.length > 0) {
    await (supabase as any).from('user_missions').insert(newMissionsToInsert);
  }
};
