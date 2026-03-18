import { calculateOverallRank, getRankColors, getRankIcon } from '@/lib/overall-rank';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

interface OverallRankBadgeProps {
  pm: number;
  className?: string;
  showProgress?: boolean;
}

export function OverallRankBadge({ pm, className, showProgress = true }: OverallRankBadgeProps) {
  const rank = calculateOverallRank(pm);
  const colorClass = getRankColors(rank.tier);
  const Icon = getRankIcon(rank.tier);

  return (
    <div className={cn('flex flex-col gap-2 relative group', className)}>
      <div className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-sm transition-all',
        colorClass
      )}>
        <div className="p-2 rounded-lg bg-background/40">
          <Icon className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Rank Geral</p>
          <p className="font-bold text-lg leading-tight">{rank.fullRankString}</p>
        </div>
        <div className="text-right pl-4">
          <p className="text-2xl font-black font-display tracking-tight leading-none">{pm.toLocaleString()}</p>
          <p className="text-[10px] font-bold opacity-70 mt-0.5 uppercase tracking-widest">Mast. Pts</p>
        </div>
      </div>
      
      {showProgress && rank.tier !== 'Desafiante' && (
        <div className="space-y-1.5 mt-1">
          <div className="flex justify-between text-[10px] font-bold opacity-70 px-1">
            <span>{rank.pmInCurrentDivision} PM</span>
            <span>{rank.pmForNextDivision} PM</span>
          </div>
          <Progress 
            value={rank.progressPercent} 
            className="h-2 bg-secondary/60" 
            indicatorClassName="bg-current"
          />
        </div>
      )}
    </div>
  );
}
