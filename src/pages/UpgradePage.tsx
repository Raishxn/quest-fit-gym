import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Check, Swords, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PRICE_IDS: Record<string, string> = {
  vip: 'price_1TCek7Qrwx2lUhuB8yDmNW7v',
  vip_plus: 'price_1TCekYQrwx2lUhuBhknXgtx7',
  pro: 'price_1TCekxQrwx2lUhuBOfApWqrH',
};

const plans = [
  {
    key: 'free',
    name: 'Free',
    price: 'R$0',
    icon: '🪨',
    features: ['2 programas', '10 exercícios custom', 'Histórico 30d', '1 Party'],
  },
  {
    key: 'vip',
    name: 'VIP',
    price: 'R$9,99',
    icon: '🗡️',
    features: ['Avatar/banner GIF', 'Borda animada', '5 programas', '30 exercícios custom', 'Histórico 90d', '2 Parties'],
  },
  {
    key: 'vip_plus',
    name: 'VIP+',
    price: 'R$12,99',
    icon: '⚔️',
    popular: true,
    features: ['Tudo VIP +', 'Título customizado', '15 programas', '100 exercícios', 'Histórico 1 ano', '5 Parties', 'Exportar dados'],
  },
  {
    key: 'pro',
    name: 'PRO',
    price: 'R$14,99',
    icon: '👑',
    features: ['Tudo VIP+ +', 'Username animado', 'Programas ∞', 'Exercícios ∞', 'Histórico ∞', 'Parties ∞', 'Suporte prioritário', 'Acesso Beta'],
  },
];

export default function UpgradePage() {
  const { profile } = useAuth();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const currentPlan = profile?.plan || 'free';

  const handleCheckout = async (planKey: string) => {
    const priceId = PRICE_IDS[planKey];
    if (!priceId) return;

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      });
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (err: any) {
      toast.error(err.message || 'Erro ao criar sessão de pagamento');
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <h1 className="text-4xl font-display font-bold flex items-center justify-center gap-3">
          <Swords className="h-10 w-10 text-primary" /> Escolha Seu Caminho
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Planos NUNCA afetam XP, rankings ou conquistas — 100% cosmético e qualidade de vida.
        </p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, i) => {
          const isCurrent = currentPlan === plan.key;
          return (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
            >
              <Card className={cn(
                'relative h-full flex flex-col',
                plan.popular && 'border-primary glow-primary',
                isCurrent && 'border-muted'
              )}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-display font-bold px-3 py-0.5 rounded-full">
                    ⭐ Popular
                  </div>
                )}
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-accent-foreground text-xs font-display font-bold px-3 py-0.5 rounded-full">
                    ✅ Seu Plano
                  </div>
                )}
                <CardHeader className="text-center pb-2">
                  <span className="text-3xl">{plan.icon}</span>
                  <CardTitle className="font-display text-xl">{plan.name}</CardTitle>
                  <p className="text-2xl font-display font-bold">{plan.price}<span className="text-sm text-muted-foreground font-body">/mês</span></p>
                </CardHeader>
                <CardContent className="flex-1 space-y-2">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </CardContent>
                <div className="p-4 pt-0">
                  <Button
                    className="w-full font-display"
                    variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'secondary'}
                    disabled={isCurrent || plan.key === 'free' || loadingPlan !== null}
                    onClick={() => handleCheckout(plan.key)}
                  >
                    {loadingPlan === plan.key ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Redirecionando...</>
                    ) : isCurrent ? 'Plano Atual' : plan.key === 'free' ? 'Gratuito' : 'Escolher'}
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
