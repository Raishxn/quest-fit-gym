import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator } from 'lucide-react';
import { motion } from 'framer-motion';

const PLATES = [
  { weight: 25, color: 'bg-red-600' },
  { weight: 20, color: 'bg-blue-600' },
  { weight: 15, color: 'bg-yellow-500' },
  { weight: 10, color: 'bg-green-600' },
  { weight: 5, color: 'bg-gray-100/90 text-black' },
  { weight: 2.5, color: 'bg-zinc-800' },
  { weight: 1.25, color: 'bg-zinc-800' },
];

export function BarbellCalculatorDialog({ defaultWeight = 60 }: { defaultWeight?: number }) {
  const [totalWeight, setTotalWeight] = useState<number>(defaultWeight);
  const [barWeight, setBarWeight] = useState<number>(20);

  useEffect(() => {
    setTotalWeight(defaultWeight);
  }, [defaultWeight]);

  const calculatePlates = () => {
    let weightPerSide = (totalWeight - barWeight) / 2;
    if (weightPerSide <= 0) return [];

    const selectedPlates: typeof PLATES = [];
    
    for (const plate of PLATES) {
      while (weightPerSide >= plate.weight) {
        selectedPlates.push(plate);
        weightPerSide -= plate.weight;
      }
    }
    return selectedPlates;
  };

  const plates = calculatePlates();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs font-bold text-primary border-primary/20 hover:bg-primary/10">
          <Calculator className="w-3.5 h-3.5" />
          Anilhas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-center flex items-center justify-center gap-2">
            <Calculator className="w-5 h-5 text-primary" /> Calculadora de Anilhas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Peso Total (kg)</Label>
              <Input 
                type="number" 
                value={totalWeight} 
                onChange={(e) => setTotalWeight(Number(e.target.value))}
                className="font-mono font-bold text-lg h-12 text-center"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Barra (kg)</Label>
              <Input 
                type="number" 
                value={barWeight} 
                onChange={(e) => setBarWeight(Number(e.target.value))}
                className="font-mono text-lg h-12 text-center"
              />
            </div>
          </div>

          <div className="bg-secondary/30 rounded-xl p-6 border border-border mt-4 flex items-center justify-center min-h-[160px] relative overflow-hidden">
            {totalWeight < barWeight ? (
              <p className="text-sm text-muted-foreground text-center">Peso menor que a barra!</p>
            ) : plates.length === 0 ? (
              <p className="text-sm text-primary font-bold">Apenas a barra</p>
            ) : (
              <div className="relative flex items-center justify-center w-full">
                {/* Bar */}
                <div className="absolute top-1/2 left-0 right-0 h-4 bg-zinc-400 rounded-sm -translate-y-1/2 flex items-center justify-between px-2 shadow-inner">
                   <div className="w-1 h-full bg-zinc-500 rounded-full"></div>
                   <div className="w-1 h-full bg-zinc-500 rounded-full"></div>
                </div>
                
                {/* Plates (Side view) */}
                <div className="flex items-center justify-center gap-[2px] z-10">
                  {plates.map((plate, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: idx * 0.1 }}
                      className={`rounded-sm flex flex-col items-center justify-center font-mono font-bold text-[10px] shadow-lg border border-black/20 ${plate.color}`}
                      style={{
                        height: `${Math.max(40, plate.weight * 3.5)}px`,
                        width: '20px',
                      }}
                    >
                      <span className="-rotate-90 text-[8px] whitespace-nowrap">{plate.weight}</span>
                    </motion.div>
                  ))}
                </div>
                
                {/* Collar */}
                <div className="w-4 h-8 bg-zinc-800 border-2 border-zinc-950 rounded z-10 ml-1"></div>
              </div>
            )}
          </div>
          
          {plates.length > 0 && (
             <p className="text-center text-xs text-muted-foreground font-medium mt-2">
                Coloque <strong className="text-foreground">{plates.map(p => p.weight).join(' + ')} kg</strong> de cada lado.
             </p>
          )}

        </div>
      </DialogContent>
    </Dialog>
  );
}
