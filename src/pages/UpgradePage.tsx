import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Crown, Sparkles, Zap, Gift, Star, Shield, ChevronRight,
  Check, X, Tag, Users, Timer, Percent, Loader2, Ticket
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type BillingInterval = 'monthly' | 'quarterly' | 'semiannual' | 'annual';

interface PlanPrice {
  priceId: string;
  amount: number; // total in centavos
  perMonth: number; // monthly equivalent in reais
  discount: number; // percentage off vs monthly
}

interface Plan {
  id: string;
  name: string;
  icon: typeof Crown;
  color: string;
  gradient: string;
  badge?: string;
  badgeColor?: string;
  features: string[];
  notIncluded?: string[];
  prices: Record<BillingInterval, PlanPrice>;
  giftCampaign?: {
    semiannual: string;
    annual: string;
  };
}

const PLANS: Plan[] = [
  {
    id: 'vip',
    name: 'VIP',
    icon: Star,
    color: 'text-blue-400',
    gradient: 'from-blue-600/20 to-blue-400/5',
    features: [
      'Avatar e banner GIF animado',
      'Borda animada no perfil',
      '5 programas de treino',
      '30 exercícios personalizados',
      'Histórico de 90 dias',
      '2 Parties simultâneas',
    ],
    notIncluded: [
      'Título customizado',
      'Exportar dados',
      'Suporte prioritário',
    ],
    prices: {
      monthly: { priceId: 'price_1TCf5gQrwx2lUhuBCSM05Hf5', amount: 599, perMonth: 5.99, discount: 0 },
      quarterly: { priceId: 'price_1TCf5gQrwx2lUhuB14pUadun', amount: 1599, perMonth: 5.33, discount: 11 },
      semiannual: { priceId: 'price_1TCf5hQrwx2lUhuBM8rNBlBq', amount: 2899, perMonth: 4.83, discount: 19 },
      annual: { priceId: 'price_1TCf5iQrwx2lUhuBJQc0sYwc', amount: 4999, perMonth: 4.17, discount: 30 },
    },
  },
  {
    id: 'vip_plus',
    name: 'VIP+',
    icon: Crown,
    color: 'text-amber-400',
    gradient: 'from-amber-600/20 to-amber-400/5',
    badge: '⭐ Popular',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    features: [
      'Tudo do VIP +',
      'Título customizado',
      '15 programas de treino',
      '100 exercícios personalizados',
      'Histórico de 1 ano',
      '5 Parties simultâneas',
      'Exportar dados (CSV/PDF)',
    ],
    notIncluded: [
      'Itens ilimitados',
      'Suporte prioritário',
      'Acesso beta',
    ],
    prices: {
      monthly: { priceId: 'price_1TCf5tQrwx2lUhuBVf3fgNrh', amount: 999, perMonth: 9.99, discount: 0 },
      quarterly: { priceId: 'price_1TCf5tQrwx2lUhuBXJ9TS8Yu', amount: 2699, perMonth: 9.00, discount: 10 },
      semiannual: { priceId: 'price_1TCf5uQrwx2lUhuBjW6mJbF5', amount: 4799, perMonth: 8.00, discount: 20 },
      annual: { priceId: 'price_1TCf5uQrwx2lUhuBJzHNEgZ3', amount: 8399, perMonth: 7.00, discount: 30 },
    },
    giftCampaign: {
      semiannual: '🎁 Presenteie um amigo com 1 mês de VIP grátis!',
      annual: '🎁 Presenteie um amigo com 2 meses de VIP grátis!',
    },
  },
  {
    id: 'pro',
    name: 'PRO',
    icon: Zap,
    color: 'text-purple-400',
    gradient: 'from-purple-600/20 to-purple-400/5',
    badge: '🔥 Melhor Valor',
    badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    features: [
      'Tudo do VIP+ +',
      'Username animado',
      'Programas ilimitados',
      'Exercícios ilimitados',
      'Histórico ilimitado',
      'Parties ilimitadas',
      'Suporte prioritário',
      'Acesso beta antecipado',
    ],
    prices: {
      monthly: { priceId: 'price_1TCekxQrwx2lUhuBOfApWqrH', amount: 1499, perMonth: 14.99, discount: 0 },
      quarterly: { priceId: 'price_1TCf65Qrwx2lUhuBXJBPfjUn', amount: 3999, perMonth: 13.33, discount: 11 },
      semiannual: { priceId: 'price_1TCf66Qrwx2lUhuB3whAIum5', amount: 7199, perMonth: 12.00, discount: 20 },
      annual: { priceId: 'price_1TCf66Qrwx2lUhuB0vPEMnoR', amount: 12599, perMonth: 10.50, discount: 30 },
    },
    giftCampaign: {
      semiannual: '🎁 Presenteie um amigo com 1 mês de VIP+ grátis!',
      annual: '🎁 Presenteie um amigo com 2 meses de VIP+ grátis!',
    },
  },
];

const INTERVAL_LABELS: Record<BillingInterval, { label: string; months: number; tagline?: string }> = {
  monthly: { label: 'Mensal', months: 1 },
  quarterly: { label: 'Trimestral', months: 3, tagline: '~11% OFF' },
  semiannual: { label: 'Semestral', months: 6, tagline: '~20% OFF' },
  annual: { label: 'Anual', months: 12, tagline: '~30% OFF' },
};

export default function UpgradePage() {
  const { user, profile } = useAuth();
  const [interval, setInterval] = useState<BillingInterval>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [showGiftInfo, setShowGiftInfo] = useState(false);
  const [showRedeemCode, setShowRedeemCode] = useState(false);
  const [giftCode, setGiftCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  const handleSubscribe = async (plan: Plan) => {
    if (!user) {
      toast.error('Faça login para assinar');
      return;
    }

    setLoading(plan.id);

    try {
      const price = plan.prices[interval];
      const priceId = price.priceId; // Define priceId here

      setLoading(priceId); // This line was added from the instruction
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, plan: plan.id, interval, userId: user.id } // Adjusted body based on instruction and original context
      });

      if (error) throw error;
      
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch {
      toast.error('Erro ao criar sessão de pagamento');
    } finally {
      setLoading(null);
    }
  };

  const handleRedeemCode = async () => {
    if (!user || !giftCode.trim()) return;
    setRedeemLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('redeem-gift-code', {
        body: { code: giftCode.trim().toUpperCase(), userId: user.id },
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(`🎁 Código resgatado! Você ganhou ${data.months} mês(es) de ${data.planName}!`);
        setShowRedeemCode(false);
        setGiftCode('');
      } else {
        toast.error(data?.message || 'Código inválido ou já utilizado');
      }
    } catch {
      toast.error('Erro ao resgatar código');
    } finally {
      setRedeemLoading(false);
    }
  };

  const currentInterval = INTERVAL_LABELS[interval];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute left-0 top-0 md:-left-4 md:-top-4" 
          onClick={() => window.history.back()}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-left h-5 w-5"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        </Button>
        <div className="text-center space-y-2 pt-8 md:pt-0">
          <h1 className="text-4xl font-display font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
            Level Up Seu Plano ⚔️
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Desbloqueie cosméticos exclusivos e ferramentas premium. 100% cosmético, sem P2W.
          </p>
        </div>
      </motion.div>

      {/* Billing Interval Selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="py-4">
            <Tabs value={interval} onValueChange={(v) => setInterval(v as BillingInterval)}>
              <TabsList className="grid w-full grid-cols-4 h-auto">
                {(Object.entries(INTERVAL_LABELS) as [BillingInterval, typeof INTERVAL_LABELS['monthly']][]).map(([key, info]) => (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="relative flex-col gap-0.5 py-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <span className="text-xs font-bold">{info.label}</span>
                    {info.tagline && (
                      <span className="text-[9px] font-mono opacity-80">{info.tagline}</span>
                    )}
                    {key === 'annual' && (
                      <div className="absolute -top-2.5 -right-1">
                        <Badge className="text-[8px] px-1 py-0 bg-green-500 text-white border-0 animate-pulse">
                          MELHOR
                        </Badge>
                      </div>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      {/* Redeem Gift Code Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
        <Button
          variant="outline"
          className="w-full border-dashed border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          onClick={() => setShowRedeemCode(true)}
        >
          <Ticket className="h-4 w-4 mr-2" /> Tenho um Código de Presente
        </Button>
      </motion.div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((plan, idx) => {
          const price = plan.prices[interval];
          const monthlyPrice = plan.prices.monthly;
          const savings = interval !== 'monthly'
            ? ((monthlyPrice.perMonth * currentInterval.months) - (price.amount / 100)).toFixed(2)
            : null;

          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
            >
              <Card className={`relative overflow-hidden h-full flex flex-col ${
                plan.badge ? 'border-primary/40 shadow-lg shadow-primary/5' : ''
              }`}>
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute top-0 right-0">
                    <div className={`text-[10px] font-bold px-3 py-1 rounded-bl-xl border ${plan.badgeColor}`}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                {/* Gradient Header */}
                <div className={`bg-gradient-to-b ${plan.gradient} p-6 text-center`}>
                  <plan.icon className={`h-10 w-10 mx-auto mb-2 ${plan.color}`} />
                  <h2 className="text-xl font-display font-bold">{plan.name}</h2>

                  {/* Pricing */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-3xl font-mono font-bold">
                        R${price.perMonth.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs text-muted-foreground">/mês</span>
                    </div>

                    {interval !== 'monthly' && (
                      <>
                        <p className="text-xs text-muted-foreground line-through font-mono">
                          R${monthlyPrice.perMonth.toFixed(2).replace('.', ',')}/mês
                        </p>
                        <div className="flex items-center justify-center gap-2">
                          <Badge variant="outline" className="text-[10px] border-green-500/30 text-green-400 gap-0.5">
                            <Percent className="h-2.5 w-2.5" /> {price.discount}% OFF
                          </Badge>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Total: R${(price.amount / 100).toFixed(2).replace('.', ',')} / {currentInterval.months} meses
                        </p>
                        {savings && (
                          <p className="text-[10px] text-green-400 font-bold">
                            💰 Economia de R${savings.replace('.', ',')}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <CardContent className="flex-1 flex flex-col pt-4 space-y-4">
                  {/* Gift Campaign Banner */}
                  {plan.giftCampaign && (interval === 'semiannual' || interval === 'annual') && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 text-center space-y-1 cursor-pointer"
                      onClick={() => setShowGiftInfo(true)}
                    >
                      <p className="text-xs font-bold text-amber-300">
                        {interval === 'semiannual' ? plan.giftCampaign.semiannual : plan.giftCampaign.annual}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        Clique para saber mais →
                      </p>
                    </motion.div>
                  )}

                  {/* Features */}
                  <ul className="space-y-2 flex-1">
                    {plan.features.map(feature => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.color}`} />
                        <span>{feature}</span>
                      </li>
                    ))}
                    {plan.notIncluded?.map(feature => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-muted-foreground/50">
                        <X className="h-4 w-4 shrink-0 mt-0.5" />
                        <span className="line-through">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Button
                    className={`w-full font-display text-base h-12 ${
                      plan.id === 'vip_plus'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                        : plan.id === 'pro'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white'
                        : ''
                    }`}
                    variant={plan.id === 'vip' ? 'default' : 'default'}
                    onClick={() => handleSubscribe(plan)}
                    disabled={loading === plan.id || profile?.plan === plan.id}
                  >
                    {loading === plan.id ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : profile?.plan === plan.id ? (
                      <>
                        <Shield className="h-4 w-4 mr-2" /> Plano Atual
                      </>
                    ) : (
                      <>
                        <ChevronRight className="h-4 w-4 mr-1" /> Assinar {plan.name}
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Free Plan Note */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
        <Card className="border-dashed">
          <CardContent className="py-4 text-center">
            <p className="text-sm text-muted-foreground">
              <Shield className="inline h-4 w-4 mr-1" />
              O plano <strong>Free</strong> inclui todas as features principais: treinos, dieta, cardio, missões, ranking e social.
              Planos pagos são <strong>100% cosméticos</strong> — sem pay-to-win! ⚔️
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Guarantee */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 }}>
        <div className="text-center space-y-1">
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
            <Shield className="h-3 w-3" /> Cancele a qualquer momento • Sem multa • Sem surpresas
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            Pagamento seguro via Stripe. Preços em BRL (Real).
          </p>
        </div>
      </motion.div>

      {/* Gift Campaign Info Dialog */}
      <Dialog open={showGiftInfo} onOpenChange={setShowGiftInfo}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg flex items-center gap-2">
              <Gift className="h-5 w-5 text-amber-400" /> Campanha: Presenteie um Amigo!
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Ao assinar um plano semestral ou anual, você recebe um <strong>código de presente</strong> para dar
              a um amigo! O código concede acesso gratuito ao plano anterior ao seu.
            </p>

            <div className="space-y-3">
              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-400" /> VIP+
              </h3>
              <div className="space-y-2 pl-6">
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span><strong>Semestral:</strong> Seu amigo ganha <span className="text-blue-400 font-bold">1 mês de VIP</span> grátis</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span><strong>Anual:</strong> Seu amigo ganha <span className="text-blue-400 font-bold">2 meses de VIP</span> grátis</span>
                </div>
              </div>

              <h3 className="font-display font-bold text-sm flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-400" /> PRO
              </h3>
              <div className="space-y-2 pl-6">
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span><strong>Semestral:</strong> Seu amigo ganha <span className="text-amber-400 font-bold">1 mês de VIP+</span> grátis</span>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <Tag className="h-4 w-4 text-green-400 shrink-0 mt-0.5" />
                  <span><strong>Anual:</strong> Seu amigo ganha <span className="text-amber-400 font-bold">2 meses de VIP+</span> grátis</span>
                </div>
              </div>
            </div>

            <Card className="bg-secondary/50">
              <CardContent className="py-3 space-y-2">
                <h4 className="text-xs font-display font-bold flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" /> Como funciona?
                </h4>
                <ol className="space-y-1.5 text-xs text-muted-foreground list-decimal pl-4">
                  <li>Assine um plano <strong>semestral</strong> ou <strong>anual</strong></li>
                  <li>Após o pagamento, você receberá um <strong>código único</strong> no email e no app</li>
                  <li>Compartilhe o código com seu amigo</li>
                  <li>Seu amigo resgata o código em <strong>Configurações → Resgatar Código</strong></li>
                  <li>O plano gratuito é ativado automaticamente! 🎉</li>
                </ol>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowGiftInfo(false)} className="w-full font-display">
              Entendi! ⚔️
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Redeem Code Dialog */}
      <Dialog open={showRedeemCode} onOpenChange={setShowRedeemCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Ticket className="h-5 w-5 text-amber-400" /> Resgatar Código de Presente
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Código</Label>
              <Input
                placeholder="Ex: QF-XXXX-XXXX-XXXX"
                value={giftCode}
                onChange={e => setGiftCode(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleRedeemCode()}
                className="font-mono text-center text-lg tracking-widest"
                maxLength={19}
              />
            </div>

            <Card className="bg-secondary/50">
              <CardContent className="py-3 space-y-2">
                <h4 className="text-xs font-display font-bold">📖 Como resgatar?</h4>
                <ol className="space-y-1 text-xs text-muted-foreground list-decimal pl-4">
                  <li>Receba o código de um amigo que assinou plano semestral/anual</li>
                  <li>Cole o código no campo acima (formato: QF-XXXX-XXXX-XXXX)</li>
                  <li>Clique em "Resgatar" — o plano será ativado imediatamente!</li>
                  <li>Cada código pode ser usado <strong>apenas uma vez</strong></li>
                </ol>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRedeemCode(false)}>Cancelar</Button>
            <Button
              onClick={handleRedeemCode}
              disabled={!giftCode.trim() || giftCode.trim().length < 10 || redeemLoading}
              className="gap-1"
            >
              {redeemLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Gift className="h-4 w-4" /> Resgatar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
