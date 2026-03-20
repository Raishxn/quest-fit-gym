import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { LevelUpModal } from './LevelUpModal';

export function LevelUpTracker() {
  const { profile } = useAuth();
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ previous: number; new: number } | null>(null);

  useEffect(() => {
    if (profile && profile.level) {
      if (currentLevel === null) {
        // Initial load
        setCurrentLevel(profile.level);
      } else if (profile.level > currentLevel) {
        // Leveled up!
        setLevelUpData({ previous: currentLevel, new: profile.level });
        setCurrentLevel(profile.level);
      }
    }
  }, [profile?.level, currentLevel]);

  if (!levelUpData) return null;

  return (
    <LevelUpModal 
      previousLevel={levelUpData.previous} 
      newLevel={levelUpData.new} 
      onClose={() => setLevelUpData(null)} 
    />
  );
}
