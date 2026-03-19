import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Gift, ArrowRight, Copy, Check } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SuccessPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [giftCode, setGiftCode] = useState<string | null>(null);
  const [planGranted, setPlanGranted] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    // Tenta buscar o código gerado mais recente pra exibir na tela
    const fetchLatestCode = async () => {
      if (!user?.id) return;
      
      const { data } = await supabase
        .from('gift_codes' as any)
        .select('*')
        .eq('creator_user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
        
      if (data) {
        setGiftCode(data.code);
        setPlanGranted(data.plan_granted);
      }
    };

    // Dá um tempinho de 3 segundos para o webhook terminar de processar antes de buscar
    const timer = setTimeout(fetchLatestCode, 3000);
    return () => clearTimeout(timer);
  }, [user]);

  const handleCopy = () => {
    if (giftCode) {
      navigator.clipboard.writeText(giftCode);
      setCopied(true);
      toast.success('Código copiado!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg text-center space-y-8"
      >
        <div className="flex justify-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-500" />
          </div>
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold">Herói Evoluído!</h1>
          <p className="text-muted-foreground text-lg">
            Sua assinatura de sucesso foi processada. Suas novas vantagens já estão ativas e o seu perfil foi atualizado.
          </p>
        </div>

        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
          <CardContent className="p-6 space-y-6">
            <h2 className="font-display text-xl font-bold flex items-center justify-center gap-2">
              <Gift className="w-5 h-5 text-primary" /> Presenteie um Aliado
            </h2>
            
            <p className="text-sm">
              Por ter assinado um plano de longo prazo, você liberou um código mágico para um amigo! Use-o para recrutar alguém para o seu esquadrão.
            </p>

            {giftCode ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-background rounded-lg border">
                  <span className="flex-1 font-mono text-center font-bold text-lg tracking-widest">{giftCode}</span>
                  <Button size="icon" variant="ghost" onClick={handleCopy}>
                    {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Este código concede acesso <strong>{planGranted === 'vip_plus' ? 'VIP+' : 'VIP'}</strong> para quem resgatá-lo. (Válido por 3 meses)
                </p>
              </div>
            ) : (
              <div className="p-4 border border-dashed rounded-lg bg-background/50 text-sm text-muted-foreground animate-pulse">
                Gerando seu código especial... aguarde um instante.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center">
          <Button asChild size="lg" className="font-display">
            <Link to="/quest">Ir para as Quests <ArrowRight className="w-4 h-4 ml-2" /></Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-display">
            <Link to="/settings?tab=plan">Ver Configurações</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
