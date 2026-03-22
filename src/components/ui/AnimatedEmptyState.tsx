import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LucideIcon } from 'lucide-react';

interface AnimatedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  color?: 'primary' | 'destructive' | 'secondary' | 'amber';
  className?: string; // Add optional className
}

export function AnimatedEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  color = 'primary',
  className = ''
}: AnimatedEmptyStateProps) {
  
  const colors = {
    primary: 'text-primary drop-shadow-[0_0_15px_rgba(var(--primary-rgb),0.5)] bg-primary/10',
    destructive: 'text-destructive drop-shadow-[0_0_15px_rgba(239,68,68,0.5)] bg-destructive/10',
    secondary: 'text-secondary-foreground drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] bg-secondary',
    amber: 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)] bg-amber-500/10'
  };

  const currentColors = colors[color];

  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[50vh] ${className}`}>
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className={`w-32 h-32 rounded-full ${currentColors.split('bg-')[1] ? 'bg-' + currentColors.split('bg-')[1] : ''} flex items-center justify-center mb-6`}
      >
        <Icon className={`w-16 h-16 ${currentColors.split(' ')[0]} ${currentColors.split(' ')[1]}`} />
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-2xl font-display font-bold text-white mb-2"
      >
        {title}
      </motion.h2>

      <motion.p 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-muted-foreground max-w-sm mb-8"
      >
        {description}
      </motion.p>

      {actionLabel && onAction && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Button 
            onClick={onAction} 
            size="lg" 
            className="font-bold text-md px-8 rounded-full shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:scale-105 transition-transform"
          >
            {actionLabel}
          </Button>
        </motion.div>
      )}
    </div>
  );
}
