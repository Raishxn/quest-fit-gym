import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, CalendarDays, TrendingUp, Trophy, ArrowRight, ArrowLeft, Share2, Crown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import confetti from 'canvas-confetti';

interface WeeklyStats {
  totalWorkouts: number;
  totalVolume: number;
  totalTimeMinutes: number;
  bestDay: string;
}

export function WeeklyRecapModal({ 
  open, 
  onOpenChange 
}: { 
  open?: boolean;
  onOpenChange?: (open: boolean) => void; 
} = {}) {
  const { user } = useAuth();
  const [internalOpen, setInternalOpen] = useState(false);
  
  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) onOpenChange(newOpen);
    setInternalOpen(newOpen);
  };

  const [currentSlide, setCurrentSlide] = useState(0);
  const [stats, setStats] = useState<WeeklyStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user && !stats) {
      loadWeeklyStats();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (isOpen && currentSlide === 3) {
      // Throw confetti on the final slide
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#F59E0B', '#EF4444', '#10B981']
        });
      }, 500);
    }
  }, [currentSlide, isOpen]);

  const loadWeeklyStats = async () => {
    setLoading(true);
    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 7);
    
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('id, started_at, total_volume_kg, created_at')
      .eq('user_id', user?.id)
      .eq('status', 'completed')
      .gte('started_at', sevenDaysAgo.toISOString())
      .lte('started_at', today.toISOString());

    if (!sessions || sessions.length === 0) {
      setStats({ totalWorkouts: 0, totalVolume: 0, totalTimeMinutes: 0, bestDay: 'Nenhum' });
      setLoading(false);
      return;
    }

    let totalVolume = 0;
    let totalTime = 0;
    const dayCounts: Record<string, number> = {};

    sessions.forEach((s: any) => {
      totalVolume += s.total_volume_kg || 0;
      
      // Since there's no finished_at, assume 60 minutes per workout or compute based on sets in future
      totalTime += 60;

      const dayStr = new Date(s.started_at).toLocaleDateString('pt-BR', { weekday: 'long' });
      dayCounts[dayStr] = (dayCounts[dayStr] || 0) + 1;
    });

    let bestDay = '';
    let maxD = 0;
    Object.entries(dayCounts).forEach(([d, c]) => {
      if (c > maxD) {
        maxD = c;
        bestDay = d;
      }
    });

    setStats({
      totalWorkouts: sessions.length,
      totalVolume,
      totalTimeMinutes: totalTime,
      bestDay: bestDay.charAt(0).toUpperCase() + bestDay.slice(1)
    });
    setLoading(false);
  };

  const nextSlide = () => setCurrentSlide(p => Math.min(3, p + 1));
  const prevSlide = () => setCurrentSlide(p => Math.max(0, p - 1));

  const slides = stats ? [
    // Slide 1: Intro
    <div key="intro" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.5 }}>
        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4 mx-auto border-2 border-primary/50">
          <CalendarDays className="w-12 h-12 text-primary" />
        </div>
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-3xl font-display font-bold text-white">
        Sua Semana em Resumo
      </motion.h2>
      <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="text-muted-foreground text-lg">
        Vamos ver como você se saiu nos últimos 7 dias.
      </motion.p>
    </div>,
    
    // Slide 2: Workouts & Time
    <div key="time" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
      <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring' }}>
        <TrendingUp className="w-20 h-20 text-blue-500 mb-2 mx-auto" />
      </motion.div>
      <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="space-y-2">
        <h2 className="text-5xl font-display font-bold text-white">{stats.totalWorkouts}</h2>
        <p className="text-xl text-blue-400 font-medium tracking-wide uppercase">Treinos Concluídos</p>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-muted-foreground mt-4 text-lg">
        Totalizando <span className="font-bold text-white">{Math.round(stats.totalTimeMinutes / 60 * 10) / 10} horas</span> de dedicação pura. {stats.totalWorkouts === 0 && 'É hora de voltar à ativa!'}
      </motion.p>
    </div>,

    // Slide 3: Volume & Best Day
    <div key="volume" className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4">
      <motion.div initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: 0 }} transition={{ type: 'spring' }}>
        <Trophy className="w-20 h-20 text-yellow-500 mb-2 mx-auto drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
      </motion.div>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="space-y-2">
        <h2 className="text-5xl font-display font-bold text-white">{(stats.totalVolume / 1000).toFixed(1)} <span className="text-2xl text-yellow-500/80">ton</span></h2>
        <p className="text-xl text-yellow-400 font-medium tracking-wide uppercase">Volume Levantado</p>
      </motion.div>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-muted-foreground mt-4 text-lg">
        {stats.totalVolume > 1000 ? 'Isso equivale a levantar um carro pequeno!' : 'Cada quilo conta para a sua evolução.'} <br/> 
        Seu dia mais ativo foi <strong className="text-primary">{stats.bestDay}</strong>.
      </motion.p>
    </div>,

    // Slide 4: Outro
    <div key="outro" className="flex flex-col items-center justify-center h-full text-center space-y-8 px-4">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', bounce: 0.6 }}>
        <div className="w-28 h-28 rounded-full bg-primary/20 flex items-center justify-center mx-auto border-4 border-primary shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] overflow-hidden relative">
          <div className="absolute inset-0 bg-primary/20 animate-pulse" />
          <Crown className="w-14 h-14 text-primary relative z-10" />
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h2 className="text-3xl font-display font-bold text-white mb-2">Herói Lendário</h2>
        <p className="text-muted-foreground text-lg mb-6 max-w-[280px] mx-auto">
          {stats.totalWorkouts >= 4 ? 'Uma semana de maestria implacável.' : 'Descanse, recupere e volte mais forte na próxima semana!'}
        </p>
        <Button className="w-full sm:w-auto h-12 px-8 text-md font-bold rounded-full gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)] hover:scale-105 transition-all">
          <Share2 className="w-4 h-4" /> Compartilhar Recapitulação
        </Button>
      </motion.div>
    </div>
  ] : [];

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2 bg-secondary/50 border-primary/20 hover:bg-primary/10 hover:border-primary/50 transition-all font-display group relative overflow-hidden">
          <div className="absolute inset-0 w-1/4 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-[200%] group-hover:animate-sparkle" />
          <Sparkles className="w-4 h-4 text-primary" />
          Meu Recap Semanal
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md h-[80vh] sm:h-[600px] p-0 border-primary/30 bg-black/95 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-primary animate-pulse font-display">
             Calculando seus feitos...
          </div>
        ) : (
          <>
            {/* Story Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-50">
              {[0, 1, 2, 3].map((idx) => (
                <div key={idx} className="h-1 flex-1 rounded-full bg-white/20 overflow-hidden">
                  <motion.div 
                    className="h-full bg-primary"
                    initial={{ width: '0%' }}
                    animate={{ width: currentSlide > idx ? '100%' : currentSlide === idx ? '100%' : '0%' }}
                    transition={{ duration: currentSlide === idx ? 0 : 0.3 }}
                  />
                </div>
              ))}
            </div>

            {/* Slides container */}
            <div className="flex-1 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  {slides[currentSlide]}
                </motion.div>
              </AnimatePresence>

              {/* Invisible clickable areas for navigation like instagram stories */}
              <div 
                className="absolute inset-y-0 left-0 w-1/3 z-40 cursor-pointer" 
                onClick={prevSlide}
              />
              <div 
                className="absolute inset-y-0 right-0 w-2/3 z-40 cursor-pointer" 
                onClick={nextSlide}
              />
            </div>

            {/* Controls (visible for accessibility but mostly overridden by touch zones) */}
            <div className="p-4 flex justify-between items-center bg-gradient-to-t from-black to-transparent z-50 pointer-events-none">
              <Button size="icon" variant="ghost" onClick={prevSlide} disabled={currentSlide === 0} className="pointer-events-auto rounded-full bg-white/10 hover:bg-white/20 text-white border-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="text-white/50 text-xs font-mono pointer-events-auto">
                 {currentSlide < 3 ? 'Toque nos lados p/ navegar' : ''}
              </div>
              <Button size="icon" variant="ghost" onClick={nextSlide} disabled={currentSlide === 3} className="pointer-events-auto rounded-full bg-white/10 hover:bg-white/20 text-white border-0">
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
