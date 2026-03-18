import { supabase } from '@/integrations/supabase/client';
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
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching active missions:', error);
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

/**
 * Temp function to seed Daily Missions for a user if they have none.
 * In a real app this would be an Edge Function running on cron.
 */
export const checkAndGenerateDailyMissions = async (userId: string) => {
  // Auto-Seed Protocol: Se o banco estiver vazio, alimentar com as missões de base
  const { count } = await supabase.from('mission_templates').select('*', { count: 'exact', head: true });
  if (count === 0) {
     console.log('Banco de missões vazio. Iniciando Auto-Seeding...');
     const { error: seedErr } = await supabase.from('mission_templates').upsert(MISSION_TEMPLATES);
     if (seedErr) console.error("Erro no auto-seed das missões:", seedErr);
  }

  // Check if they have any active daily missions
  const { data: existing } = await supabase
    .from('active_missions')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'daily')
    .in('status', ['pending', 'completed']);

  if (existing && existing.length > 0) return;

  // Assume they don't, grab 3 random daily templates
  const { data: templates } = await supabase
    .from('mission_templates')
    .select('*')
    .eq('type', 'daily')
    .limit(3);

  if (!templates) return;

  // Insert them for user
  const newMissions = templates.map(t => ({
    user_id: userId,
    template_id: t.id,
    type: 'daily',
    target: (t.criteria as any)?.count || 1,
    progress: 0,
    status: 'pending'
  }));

  await supabase.from('active_missions').insert(newMissions);
};
