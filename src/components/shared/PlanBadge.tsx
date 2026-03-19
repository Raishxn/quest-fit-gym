import { Badge } from '@/components/ui/badge';
import { Shield, Star, Crown, Zap } from 'lucide-react';

interface PlanBadgeProps {
  plan?: string;
  className?: string;
}

export function PlanBadge({ plan = 'free', className = '' }: PlanBadgeProps) {
  switch (plan) {
    case 'vip':
      return (
        <Badge variant="outline" className={`bg-blue-500/10 text-blue-400 border-blue-500/30 gap-1 ${className}`}>
          <Star className="h-3 w-3" /> VIP
        </Badge>
      );
    case 'vip_plus':
      return (
        <Badge variant="outline" className={`bg-amber-500/10 text-amber-400 border-amber-500/30 gap-1 ${className}`}>
          <Crown className="h-3 w-3" /> VIP+
        </Badge>
      );
    case 'pro':
      return (
        <Badge variant="outline" className={`bg-purple-500/10 text-purple-400 border-purple-500/30 gap-1 ${className}`}>
          <Zap className="h-3 w-3" /> PRO
        </Badge>
      );
    case 'free':
    default:
      return (
        <Badge variant="outline" className={`bg-secondary/50 text-muted-foreground border-border gap-1 ${className}`}>
          <Shield className="h-3 w-3" /> FREE
        </Badge>
      );
  }
}
