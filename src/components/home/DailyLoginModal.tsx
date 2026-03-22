import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Gift, Check, Sparkles, Coins, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const REWARDS = [
  { day: 1, xp: 50, coins: 10 },
  { day: 2, xp: 100, coins: 20 },
  { day: 3, xp: 150, coins: 30 },
  { day: 4, xp: 200, coins: 40 },
  { day: 5, xp: 250, coins: 50 },
  { day: 6, xp: 500, coins: 100 },
  { day: 7, xp: 1000, coins: 200, isGrand: true },
];

export function DailyLoginModal() {
  const { user, profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginData, setLoginData] = useState<any>(null);
  const [streakToClaim, setStreakToClaim] = useState(1);

  useEffect(() => {
    if (!user) return;
    
    const checkLoginEligibility = async () => {
      try {
        const today = new Date().toISOString().slice(0, 10);
        
        const { data, error } = await supabase
          .from('daily_login_rewards')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching login rewards:', error);
          return;
        }

        if (!data) {
          // Never claimed, show modal for day 1
          setStreakToClaim(1);
          setOpen(true);
        } else {
          setLoginData(data);
          
          if (data.last_claim_date < today) {
            // Need to calculate if streak is broken
            const lastClaim = new Date(data.last_claim_date);
            const current = new Date(today);
            const diffDays = Math.floor((current.getTime() - lastClaim.getTime()) / (1000 * 3600 * 24));
            
            let nextStreak = data.current_streak + 1;
            
            // If missed more than 1 day or completed 7 days, reset streak
            if (diffDays > 1 || nextStreak > 7) {
              nextStreak = 1;
            }
            
            setStreakToClaim(nextStreak);
            setOpen(true);
          }
        }
      } catch (err) {
        console.error('Failed to check daily login', err);
      }
    };

    checkLoginEligibility();
  }, [user]);

  const handleClaim = async () => {
    if (!user || !profile) return;
    setLoading(true);
    
    try {
      const today = new Date().toISOString().slice(0, 10);
      const reward = REWARDS[streakToClaim - 1];
      
      // Update daily login record
      const { error: loginError } = await supabase
        .from('daily_login_rewards')
        .upsert({
          user_id: user.id,
          last_claim_date: today,
          current_streak: streakToClaim,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });

      if (loginError) throw loginError;

      // Update user profile with rewards
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          xp: (profile.xp || 0) + reward.xp,
          coins: (profile.coins || 0) + reward.coins
        })
        .eq('id', profile.id);

      if (profileError) throw profileError;

      // Log transaction
      await supabase.from('xp_transactions').insert({
        user_id: user.id,
        amount: reward.xp,
        source: 'daily_login',
        metadata: { day: streakToClaim, coins: reward.coins }
      });

      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Recompensa Diária Resgatada! 🎉</span>
          <span className="text-sm">+ {reward.xp} XP | + {reward.coins} QuestCoins</span>
        </div>
      );
      
      setOpen(false);
    } catch (err) {
      console.error('Error claiming reward', err);
      toast.error('Erro ao resgatar recompensa.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md bg-card border-primary/20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        <DialogHeader className="text-center space-y-2 pb-4">
          <div className="mx-auto w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mb-2 animate-pulse-glow">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-display text-center">Recompensa Diária</DialogTitle>
          <DialogDescription className="text-center">
            Bem-vindo de volta! Resgate seus prêmios por entrar todos os dias.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {REWARDS.slice(0, 4).map((r) => (
             <RewardCard key={r.day} reward={r} currentStreak={streakToClaim} />
          ))}
          <div className="col-span-4 grid grid-cols-3 gap-2 mt-1">
             {REWARDS.slice(4, 7).map((r) => (
               <RewardCard key={r.day} reward={r} currentStreak={streakToClaim} large={r.isGrand} />
             ))}
          </div>
        </div>

        <Button 
          onClick={handleClaim} 
          disabled={loading}
          className="w-full font-display text-lg py-6 btn-press-effect glow-primary"
        >
          {loading ? 'Resgatando...' : 'Resgatar Recompensa'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}

function RewardCard({ reward, currentStreak, large = false }: { reward: any, currentStreak: number, large?: boolean }) {
  const isPast = reward.day < currentStreak;
  const isCurrent = reward.day === currentStreak;
  const isFuture = reward.day > currentStreak;

  let bgClass = "bg-secondary/50 border-border";
  if (isCurrent) bgClass = "bg-primary/20 border-primary shadow-[0_0_15px_rgba(var(--primary),0.3)]";
  if (isPast) bgClass = "bg-secondary border-border opacity-60";
  if (large) {
    if (isCurrent) bgClass = "bg-yellow-500/20 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)]";
    else if (!isPast) bgClass = "bg-secondary border-yellow-500/30";
  }

  return (
    <motion.div 
      whileHover={{ y: isCurrent || isFuture ? -2 : 0 }}
      className={`relative rounded-xl border p-2 flex flex-col items-center justify-center gap-1 ${bgClass} ${large ? 'col-span-1 py-4' : ''}`}
    >
      <div className="text-xs font-bold text-muted-foreground mb-1">Dia {reward.day}</div>
      
      {isPast ? (
        <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
          <Check className="h-5 w-5 text-primary" />
        </div>
      ) : large ? (
        <Sparkles className={`h-8 w-8 ${isCurrent ? 'text-yellow-400 animate-pulse' : 'text-yellow-600'}`} />
      ) : (
        <Flame className={`h-6 w-6 ${isCurrent ? 'text-primary animate-pulse' : 'text-muted-foreground'}`} />
      )}

      <div className="mt-2 text-center">
        <div className={`text-xs font-bold ${large ? 'text-yellow-400' : ''}`}>+{reward.xp} XP</div>
        {large && <div className="text-xs text-yellow-500 font-medium">+{reward.coins} QC</div>}
      </div>

      {isCurrent && (
        <div className="absolute -inset-1 border-2 border-primary rounded-xl animate-pulse -z-10 blur-[1px]"></div>
      )}
    </motion.div>
  );
}
