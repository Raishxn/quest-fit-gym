import { motion } from 'framer-motion';
import { LEVEL_TABLE } from '@/types';

export function Podium({ data, getValueKey, getSecondaryValueKey }: { data: any[], getValueKey: (d:any) => string, getSecondaryValueKey?: (d:any) => string }) {
  const podiumSizes = ['text-4xl', 'text-3xl', 'text-2xl'];
  
  if (!data || data.length === 0) return null;

  return (
    <div className="flex items-end justify-center gap-2 sm:gap-6 w-full mt-4 mb-8">
      {[1, 0, 2].map(idx => {
        const entry = data[idx];
        if (!entry) return <div key={idx} className="w-24"></div>;
        
        return (
          <motion.div 
            key={entry.user_id || entry.id || idx} 
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.15 }} 
            className="text-center space-y-2 w-24 sm:w-28"
            style={{ order: idx === 0 ? 1 : idx === 1 ? 0 : 2 }}
          >
            <div className={`relative mx-auto ${idx === 0 ? 'mb-4' : ''}`}>
              <div className={`mx-auto rounded-full bg-secondary flex items-center justify-center text-xl font-bold text-primary border-4 border-background shadow-xl ${idx === 0 ? 'h-20 w-20 ring-4 ring-warning glow-warning' : 'h-16 w-16 opacity-90'}`}>
                {entry.avatar_url ? (
                  <img src={entry.avatar_url} className="w-full h-full rounded-full object-cover" alt="" />
                ) : (
                  entry.name?.charAt(0) || entry.tag?.charAt(0) || '?'
                )}
              </div>
              <span className={`absolute -bottom-3 left-1/2 -translate-x-1/2 ${podiumSizes[idx]} drop-shadow-md`}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
              </span>
            </div>
            <div className="pt-2">
              <p className="font-display font-bold text-sm truncate px-1">{entry.name?.split(' ')[0]}</p>
              <p className="font-mono text-xs font-bold text-primary">{getValueKey(entry)}</p>
              {getSecondaryValueKey && <p className="text-[10px] text-muted-foreground truncate">{getSecondaryValueKey(entry)}</p>}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
