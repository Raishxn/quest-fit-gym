import { motion } from 'framer-motion';

export function LeaderboardList({ data, startRank = 4, userId, getValueKey, getSecondaryValueKey }: { data: any[], startRank?: number, userId?: string, getValueKey: (d:any) => string, getSecondaryValueKey?: (d:any) => string }) {
  const listData = data.slice(startRank - 1);

  if (listData.length === 0) return null;

  return (
    <div className="space-y-1.5 w-full">
      {listData.map((entry, idx) => {
        const actualRank = startRank + idx;
        const isMe = entry.user_id === userId;
        
        return (
          <motion.div 
            key={entry.user_id || entry.id || actualRank}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * Math.min(idx, 10) }}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all ${
              isMe ? 'bg-primary/10 border border-primary/30 glow-primary-sm scale-[1.02]' : 'bg-card border border-border/50 hover:bg-secondary/50'
            }`}
          >
            <span className={`font-mono font-bold w-6 text-right ${isMe ? 'text-primary' : 'text-muted-foreground'}`}>
              #{actualRank}
            </span>
            <div className="h-9 w-9 shrink-0 rounded-full bg-secondary flex items-center justify-center text-xs font-bold overflow-hidden border border-border">
               {entry.avatar_url ? (
                  <img src={entry.avatar_url} className="w-full h-full object-cover" alt="" />
               ) : (
                  entry.name?.charAt(0) || entry.tag?.charAt(0) || '?'
               )}
            </div>
            <div className="flex-1 min-w-0">
              <p className={`font-medium truncate ${isMe ? 'text-primary font-bold' : ''}`}>{entry.name}</p>
              {getSecondaryValueKey && <p className="text-[10px] text-muted-foreground truncate">{getSecondaryValueKey(entry)}</p>}
            </div>
            <div className="text-right shrink-0">
               <span className="font-mono text-sm font-bold text-primary">{getValueKey(entry)}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
