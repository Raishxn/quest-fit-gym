import { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Trophy, Sparkles, Star, ChevronUp, ChevronsUp } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import confetti from 'canvas-confetti';
import { Button } from '../ui/button';

interface LevelUpModalProps {
  previousLevel: number;
  newLevel: number;
  onClose: () => void;
}

export function LevelUpModal({ previousLevel, newLevel, onClose }: LevelUpModalProps) {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (open) {
      // Fire confetti when modal opens
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FF8C00']
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FF8C00']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      
      // Play a sound if possible (optional)
      // const audio = new Audio('/sounds/level-up.mp3');
      // audio.volume = 0.5;
      // audio.play().catch(e => console.log('Audio play failed:', e));

      frame();
    }
  }, [open]);

  const handleClose = () => {
    setOpen(false);
    setTimeout(onClose, 300); // Wait for Dialog exit animation
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-gradient-to-b from-primary/20 to-background border-primary/50 text-center p-0 overflow-hidden shadow-[0_0_50px_rgba(var(--primary),0.3)]">
        
        {/* Animated Background Rays */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center opacity-30">
           <div className="w-[200%] h-[200%] animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0deg,var(--primary)_45deg,transparent_90deg,var(--primary)_135deg,transparent_180deg,var(--primary)_225deg,transparent_270deg,var(--primary)_315deg,transparent_360deg)] mix-blend-screen opacity-50 blur-xl"></div>
        </div>

        <div className="relative p-8 flex flex-col items-center gap-6 z-10">
          
          <div className="relative">
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center border-4 border-yellow-200 shadow-[0_0_30px_rgba(255,215,0,0.6)] relative z-10">
              <ChevronsUp className="w-12 h-12 text-yellow-950" />
            </div>
            {/* Floating Stars */}
            <Sparkles className="absolute -top-4 -left-4 w-6 h-6 text-yellow-300 animate-bounce" />
            <Star className="absolute top-2 -right-6 w-5 h-5 text-yellow-400 animate-pulse delay-75" />
            <Sparkles className="absolute -bottom-2 right-0 w-7 h-7 text-yellow-200 animate-bounce delay-150" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-display font-black text-glow uppercase tracking-wider text-yellow-400">
              Level Up!
            </h2>
            <p className="text-muted-foreground">Você alcançou um novo patamar de poder.</p>
          </div>

          <div className="flex items-center gap-6 py-4">
            <div className="flex flex-col items-center">
              <span className="text-sm text-muted-foreground font-medium uppercase tracking-widest mb-1">Anterior</span>
              <span className="text-3xl font-bold text-muted-foreground/50">{previousLevel}</span>
            </div>
            
            <ChevronUp className="w-8 h-8 text-yellow-400 animate-pulse" />
            
            <div className="flex flex-col items-center relative group">
              <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full scale-150 group-hover:scale-110 transition-transform"></div>
              <span className="text-sm font-bold text-yellow-400 uppercase tracking-widest mb-1 relative z-10">Novo Level</span>
              <span className="text-5xl font-display font-black text-white drop-shadow-[0_0_10px_rgba(255,215,0,0.8)] relative z-10">
                {newLevel}
              </span>
            </div>
          </div>

          <Button 
            onClick={handleClose}
            className="w-full mt-4 bg-yellow-500 hover:bg-yellow-600 text-yellow-950 font-bold text-lg h-12 shadow-[0_0_15px_rgba(255,215,0,0.4)] transition-all hover:scale-105"
          >
            Continuar a Jornada
          </Button>

        </div>
      </DialogContent>
    </Dialog>
  );
}
