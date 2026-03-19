import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// ─── Types matching the actual DB schema ──────────────────────────────────────
export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'daily' | 'weekly' | 'monthly';
  objective_type: string;
  objective_value: number;
  xp_reward: number;
  coin_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface ActiveMission {
  id: string;
  user_id: string;
  mission_id: string;
  current_value: number;
  target_value: number;
  completed: boolean;
  claimed: boolean;
  expires_at: string | null;
  started_at: string;
  completed_at: string | null;
  template: MissionTemplate;
}

const AM = 'active_missions' as any;
const MT = 'mission_templates' as any;

// ─── Fetch active missions for a user ─────────────────────────────────────────
export const fetchActiveMissions = async (userId: string): Promise<ActiveMission[]> => {
  const { data, error } = await supabase
    .from(AM)
    .select('*, template:mission_templates(*)')
    .eq('user_id', userId)
    .eq('claimed', false)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar missões:', error);
    toast.error(`BD Erro (Fetch Missões): ${error.message}`);
    return [];
  }
  return (data || []) as unknown as ActiveMission[];
};

// ─── Claim mission reward ──────────────────────────────────────────────────────
export const claimMissionReward = async (missionId: string, userId: string) => {
  const { data: mission, error: getErr } = await supabase
    .from(AM)
    .select('*, template:mission_templates(*)')
    .eq('id', missionId)
    .single();

  if (getErr || !mission) throw getErr;
  const m = mission as unknown as ActiveMission;
  if (!m.completed) throw new Error('Missão ainda não concluída.');
  if (m.claimed) throw new Error('Recompensa já coletada.');

  const template = m.template as MissionTemplate;

  await supabase
    .from(AM)
    .update({ claimed: true, completed_at: new Date().toISOString() } as any)
    .eq('id', missionId);

  if (template.xp_reward > 0) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('xp')
      .eq('user_id', userId)
      .single();

    if (profileData) {
      await supabase
        .from('profiles')
        .update({ xp: (profileData.xp || 0) + template.xp_reward })
        .eq('user_id', userId);
    }
  }

  return { xpReward: template.xp_reward, coinReward: template.coin_reward };
};

export const checkAndGenerateDailyMissions = async (userId: string) => {
  // Batch fetch all active templates and all user's active un-claimed missions
  const [templatesRes, existingRes] = await Promise.all([
    supabase.from(MT).select('*').eq('is_active', true),
    supabase.from(AM)
      .select('id, mission_id')
      .eq('user_id', userId)
      .eq('claimed', false)
  ]);

  if (!templatesRes.data || templatesRes.data.length === 0) return;
  const templates = templatesRes.data as unknown as MissionTemplate[];
  const existing = existingRes.data || [];
  const assignedMissionIds = new Set(existing.map((m: any) => m.mission_id));

  const types: ('daily' | 'weekly' | 'monthly')[] = ['daily', 'weekly', 'monthly'];
  const newMissionsToInsert: any[] = [];
  const now = new Date();

  for (const t of types) {
    const typeTemplates = templates.filter((tmpl: any) => tmpl.type === t);
    if (typeTemplates.length === 0) continue;

    const existingOfType = existing.filter((m: any) => {
      const tmpl = templates.find((temp: any) => temp.id === m.mission_id);
      return tmpl && tmpl.type === t;
    });

    const needed = Math.max(0, 3 - existingOfType.length);
    if (needed === 0) continue;

    const available = typeTemplates.filter((tmpl: any) => !assignedMissionIds.has(tmpl.id));
    const shuffled = available.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, needed);

    if (selected.length === 0) continue;

    let expiresAt: Date;
    if (t === 'daily') {
      expiresAt = new Date(now);
      expiresAt.setHours(23, 59, 59, 999);
    } else if (t === 'weekly') {
      const daysUntilSunday = 7 - now.getDay() || 7;
      expiresAt = new Date(now);
      expiresAt.setDate(now.getDate() + daysUntilSunday);
      expiresAt.setHours(23, 59, 59, 999);
    } else {
      expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    selected.forEach((tmpl: any) => {
      newMissionsToInsert.push({
        user_id: userId,
        mission_id: tmpl.id,
        current_value: 0,
        target_value: tmpl.objective_value,
        completed: false,
        claimed: false,
        expires_at: expiresAt.toISOString(),
      });
    });
  }

  // Insert all new missions in a single batched query
  if (newMissionsToInsert.length > 0) {
    const { error: insErr } = await supabase.from(AM).insert(newMissionsToInsert);
    if (insErr) {
      console.error('Erro inserindo missões:', insErr);
      toast.error(`BD Erro (Insert): ${insErr.message}`);
    }
  }
};
