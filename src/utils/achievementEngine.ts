import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const checkWorkoutAchievements = async (
  userId: string,
  workoutData: { volume: number; durationSeconds: number; endTime: Date }
) => {
  try {
    // 1. Fetch total workouts (count)
    const { count } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const totalWorkouts = (count || 0) + 1; // including this one just completed

    // 2. Load all achievements
    const { data: achievements } = await supabase
      .from('achievements')
      .select('*');
      
    if (!achievements) return;

    // 3. Load user's unlocked achievements
    const { data: userAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_id')
      .eq('user_id', userId);

    const unlockedIds = new Set(userAchievements?.map(ua => ua.achievement_id) || []);

    const toUnlock: any[] = [];
    const hourOfDay = workoutData.endTime.getHours();

    for (const ach of achievements) {
      if (unlockedIds.has(ach.id)) continue;

      let conditionsMet = false;

      switch (ach.key) {
        case 'first_workout':
          if (totalWorkouts >= 1) conditionsMet = true;
          break;
        case 'century_workouts':
          if (totalWorkouts >= 100) conditionsMet = true;
          break;
        case 'night_owl':
          // Midnight to 5 AM
          if (hourOfDay >= 0 && hourOfDay < 5) conditionsMet = true;
          break;
        case 'hercules':
          // Lifted over 10000 kg
          if (workoutData.volume > 10000) conditionsMet = true;
          break;
      }

      if (conditionsMet) {
        toUnlock.push(ach);
      }
    }

    // 4. Unlock and Toast
    for (const ach of toUnlock) {
      const { error } = await supabase.from('user_achievements').insert({
        user_id: userId,
        achievement_id: ach.id,
      });

      if (!error) {
        toast('🏆 Conquista Desbloqueada!', {
          description: `${ach.icon_emoji} ${ach.name}: ${ach.description}`,
          duration: 6000,
        });
        
        // Post to social feed
        await supabase.from('social_posts' as any).insert({
          user_id: userId,
          content: `Desbloqueou a conquista: ${ach.icon_emoji} ${ach.name}!`,
          workout_summary: {
            type: 'achievement',
            achievement_id: ach.id,
            name: ach.name,
            icon: ach.icon_emoji
          }
        });
        
        // Add XP reward to profile if ach.xp_reward is set
        if (ach.xp_reward) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('xp')
            .eq('user_id', userId)
            .single();
            
          if (profile) {
            await supabase
              .from('profiles')
              .update({ xp: profile.xp + ach.xp_reward })
              .eq('user_id', userId);
          }
        }
      }
    }
  } catch (err) {
    console.error('Error checking achievements', err);
  }
};
