import { LEVEL_TABLE, type ClassName } from '@/types';
import { cn } from '@/lib/utils';

interface LevelBadgeProps {
  level: number;
  className?: ClassName;
  size?: 'sm' | 'md' | 'lg';
  cssClassName?: string;
}

export function LevelBadge({ level, className: rpgClass, size = 'md', cssClassName }: LevelBadgeProps) {
  const levelData = LEVEL_TABLE.find(l => l.level === level) || LEVEL_TABLE[0];

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full bg-accent-muted font-display font-semibold text-primary border border-primary/20',
      sizeClasses[size],
      cssClassName,
    )}>
      <span>{levelData.icon}</span>
      <span>Nv.{level}</span>
      {rpgClass && <span className="hidden sm:inline">• {rpgClass}</span>}
    </span>
  );
}
