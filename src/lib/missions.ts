import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MISSION_TEMPLATES } from './mission-templates-seed';
import type { Database } from '@/integrations/supabase/types';

export type MissionTemplate = Database['public']['Tables']['mission_templates']['Row'];
export type ActiveMission = Database['public']['Tables']['active_missions']['Row'] & {
  template: MissionTemplate;
};
export type GlobalMission = Database['public']['Tables']['global_missions']['Row'] & {
  template: MissionTemplate;
};

export const fetchActiveMissions = async (userId: string) => {
  const { data, error } = await supabase
    .from('active_missions')
    .select('*, template:mission_templates(*)')
    .eq('user_id', userId)
    .in('status', ['pending', 'completed'])
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching active missions:', error);
    toast.error(`BD Erro (Fetch Missões): ${error.message}`);
    return [];
  }
  return data as unknown as ActiveMission[];
};

export const claimMissionReward = async (missionId: string, userId: string) => {
  // 1. Check if mission is completed
  const { data: mission, error: getErr } = await supabase
    .from('active_missions')
    .select('*, template:mission_templates(*)')
    .eq('id', missionId)
    .single();

  if (getErr || !mission) throw getErr;
  if (mission.status !== 'completed') throw new Error('Missão ainda não concluída.');

  const template = mission.template as unknown as MissionTemplate;

  // 2. Mark as claimed
  await supabase
    .from('active_missions')
    .update({ status: 'claimed' })
    .eq('id', missionId);

  // 3. Award XP and PM
  if (template.xp_reward > 0) {
    await supabase.from('xp_transactions').insert({
      user_id: userId,
      amount: template.xp_reward,
      source: 'mission_reward',
      source_id: missionId
    });
    
    // update profile XP
    const { data: profile } = await supabase.from('profiles').select('xp, level').eq('user_id', userId).single();
    if (profile) {
        // level logic is normally handled somewhere else but let's just update xp for now.
      await supabase.from('profiles').update({ xp: profile.xp + template.xp_reward }).eq('user_id', userId);
    }
  }

  if (template.mastery_points_reward > 0) {
    const { data: profile } = await supabase.from('profiles').select('overall_mastery_points').eq('user_id', userId).single();
    if (profile) {
      await supabase.from('profiles').update({ 
        overall_mastery_points: (profile.overall_mastery_points || 0) + template.mastery_points_reward 
      }).eq('user_id', userId);
    }
  }

  return true;
};

export const fetchGlobalMissions = async () => {
  const { data, error } = await supabase
    .from('global_missions')
    .select('*, template:mission_templates(*)')
    .eq('status', 'active');
    
  if (error) {
    console.error('Error fetching global missions', error);
    return [];
  }
  return data as unknown as GlobalMission[];
};

export const checkAndGenerateDailyMissions = async (userId: string) => {
  // Generate Daily, Weekly, Monthly, and Master missions
  const types: ('daily' | 'weekly' | 'monthly' | 'master')[] = ['daily', 'weekly', 'monthly', 'master'];
  
  for (const t of types) {
    const { data: existing } = await supabase
      .from('active_missions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', t)
      .in('status', ['pending', 'completed']);

    // Se o usuário não possui missões relativas a este período, gera!
    if (!existing || existing.length === 0) {
      const limit = t === 'master' ? 1 : 3;
      const { data: templates } = await supabase
        .from('mission_templates')
        .select('*')
        .eq('type', t);

      if (templates && templates.length > 0) {
        // Embaralhando as templates para virem sempre novas missões diferentes
        const shuffled = templates.sort(() => 0.5 - Math.random());
        const selected = shuffled.slice(0, limit);

        const newMissions = selected.map(temp => ({
          user_id: userId,
          template_id: temp.id,
          type: t,
          target: (temp as any).target || (temp.criteria as any)?.count || 1,
          progress: 0,
          status: 'pending'
        }));
        const { error: insErr } = await supabase.from('active_missions').insert(newMissions);
        if (insErr) {
           console.error(`Erro inserindo missões ${t}:`, insErr);
           toast.error(`BD Erro (Insert ${t}): ${insErr.message}`);
        }
      }
    }
  }
};
