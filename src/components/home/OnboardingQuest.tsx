import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, ChevronRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function OnboardingQuest({ totalWorkouts }: { totalWorkouts: number | null }) {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem('onboardingDismissed') === 'true');

  if (totalWorkouts === null || totalWorkouts > 0 || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem('onboardingDismissed', 'true');
    setDismissed(true);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="mb-6 relative"
      >
        <Card className="border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-[50px] -mr-10 -mt-10 pointer-events-none" />
           
           <CardContent className="p-5 md:p-6 relative z-10">
              <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-transparent" onClick={dismiss}>
                <X className="h-4 w-4" />
              </Button>
              
              <div className="flex flex-col md:flex-row gap-5 items-center">
                 <div className="h-16 w-16 shrink-0 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30 shadow-inner">
                    <Target className="h-8 w-8 text-primary" />
                 </div>
                 
                 <div className="flex-1 space-y-2 text-center md:text-left pr-4">
                    <h3 className="text-xl font-display font-bold text-primary flex items-center justify-center md:justify-start gap-2 text-shadow-sm">
                      A Primeira Missão 🗡️
                    </h3>
                    <p className="text-sm text-foreground/80 font-medium leading-relaxed">
                      Bem-vindo à Guilda! Todo grande herói precisa começar de algum lugar. Sua primeira missão é simples: completar um treino e provar seu valor.
                    </p>
                 </div>
                 
                 <div className="shrink-0 w-full md:w-auto mt-2 md:mt-0">
                    <Button asChild className="w-full md:w-auto font-display text-base h-11 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                      <Link to="/workout">
                        Aceitar Missão <ChevronRight className="ml-2 h-5 w-5" />
                      </Link>
                    </Button>
                 </div>
              </div>
           </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
