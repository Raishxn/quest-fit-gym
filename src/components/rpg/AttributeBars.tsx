import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface AttributeBarsProps {
  str: number;
  end: number;
  vit: number;
  agi: number;
  compact?: boolean;
  className?: string;
}

const attributes = [
  { key: 'str', label: 'STR', emoji: '⚔️', color: 'bg-attr-str' },
  { key: 'end', label: 'END', emoji: '🛡️', color: 'bg-attr-end' },
  { key: 'vit', label: 'VIT', emoji: '💚', color: 'bg-attr-vit' },
  { key: 'agi', label: 'AGI', emoji: '⚡', color: 'bg-attr-agi' },
] as const;

export function AttributeBars({ str, end, vit, agi, compact = false, className }: AttributeBarsProps) {
  const values = { str, end, vit, agi };

  return (
    <div className={cn('space-y-2', className)}>
      {attributes.map((attr, i) => (
        <div key={attr.key} className={cn('flex items-center gap-2', compact ? 'gap-1.5' : 'gap-3')}>
          <span className={cn('font-mono font-bold text-muted-foreground', compact ? 'text-[10px] w-7' : 'text-xs w-10')}>
            {compact ? attr.emoji : `${attr.emoji} ${attr.label}`}
          </span>
          <div className="relative flex-1 h-2 overflow-hidden rounded-full bg-secondary">
            <motion.div
              className={cn('absolute inset-y-0 left-0 rounded-full', attr.color)}
              initial={{ width: 0 }}
              animate={{ width: `${values[attr.key]}%` }}
              transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
            />
          </div>
          <span className={cn('font-mono font-bold', compact ? 'text-[10px] w-5' : 'text-xs w-8 text-right')}>
            {values[attr.key]}
          </span>
        </div>
      ))}
    </div>
  );
}
