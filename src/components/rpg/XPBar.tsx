import { motion } from 'framer-motion';
import { LEVEL_TABLE } from '@/types';
import { cn } from '@/lib/utils';

interface XPBarProps {
  xp: number;
  level: number;
  className?: string;
  compact?: boolean;
}

export function XPBar({ xp, level, className, compact = false }: XPBarProps) {
  const currentLevel = LEVEL_TABLE.find(l => l.level === level) || LEVEL_TABLE[0];
  const nextLevel = LEVEL_TABLE.find(l => l.level === level + 1);

  const xpInLevel = xp - currentLevel.xpRequired;
  const xpForNext = nextLevel ? nextLevel.xpRequired - currentLevel.xpRequired : 1;
  const percent = nextLevel ? Math.min(100, (xpInLevel / xpForNext) * 100) : 100;

  return (
    <div className={cn('space-y-1', className)}>
      {!compact && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-display font-semibold text-foreground">
            {currentLevel.icon} Nv.{level} {currentLevel.className}
          </span>
          <span className="font-mono text-muted-foreground">
            {xp.toLocaleString()} / {nextLevel ? nextLevel.xpRequired.toLocaleString() : 'MAX'} XP
          </span>
        </div>
      )}
      <div className="relative h-2.5 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full bg-primary glow-primary"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
      {compact && (
        <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
          <span>Nv.{level}</span>
          <span>{Math.round(percent)}%</span>
        </div>
      )}
    </div>
  );
}
