import { supabase } from '@/integrations/supabase/client';
import { LEVEL_TABLE } from '@/types';

/**
 * Recalculates the user's level and class_name based on their current XP.
 * Should be called every time XP changes.
 * Returns the new level and class_name, and whether a level-up happened.
 */
export async function recalculateLevel(userId: string): Promise<{
  newLevel: number;
  newClassName: string;
  leveledUp: boolean;
  oldLevel: number;
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp, level, class_name')
    .eq('user_id', userId)
    .single();

  if (!profile) return { newLevel: 1, newClassName: 'Iniciante', leveledUp: false, oldLevel: 1 };

  const xp = profile.xp || 0;
  const oldLevel = profile.level || 1;

  // Find the highest level the user qualifies for
  let newLevelData = LEVEL_TABLE[0];
  for (const entry of LEVEL_TABLE) {
    if (xp >= entry.xpRequired) {
      newLevelData = entry;
    }
  }

  const newLevel = newLevelData.level;
  const newClassName = newLevelData.className;
  const leveledUp = newLevel > oldLevel;

  // Only update if level changed
  if (newLevel !== oldLevel) {
    await supabase
      .from('profiles')
      .update({
        level: newLevel,
        class_name: newClassName,
      })
      .eq('user_id', userId);
  }

  return { newLevel, newClassName, leveledUp, oldLevel };
}
