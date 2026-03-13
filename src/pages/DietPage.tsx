import { motion } from 'framer-motion';
import { Salad, Droplets, Plus, Coffee, Sun, Apple, Moon, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockDietToday } from '@/lib/mock-data';

const meals = [
  { name: 'Café da Manhã', icon: Coffee, time: '07:00', items: [
    { name: 'Aveia em flocos', qty: '50g', cal: 195, prot: 8.5 },
    { name: 'Banana', qty: '120g', cal: 107, prot: 1.3 },
    { name: 'Whey Protein', qty: '30g', cal: 120, prot: 24 },
  ]},
  { name: 'Almoço', icon: Sun, time: '12:30', items: [
    { name: 'Arroz branco', qty: '150g', cal: 193, prot: 3.8 },
    { name: 'Frango grelhado', qty: '200g', cal: 322, prot: 62 },
    { name: 'Feijão preto', qty: '100g', cal: 77, prot: 4.5 },
    { name: 'Brócolis', qty: '80g', cal: 27, prot: 2.3 },
  ]},
  { name: 'Lanche', icon: Apple, time: '16:00', items: [
    { name: 'Iogurte natural', qty: '200g', cal: 124, prot: 8.0 },
    { name: 'Amendoim', qty: '30g', cal: 170, prot: 7.7 },
  ]},
  { name: 'Jantar', icon: Moon, time: '20:00', items: [] },
  { name: 'Ceia', icon: Sparkles, time: '22:00', items: [] },
];

export default function DietPage() {
  const diet = mockDietToday;

  const macros = [
    { label: 'Calorias', current: diet.totalCalories, target: diet.targetCalories, unit: 'kcal', color: 'bg-primary' },
    { label: 'Proteína', current: diet.totalProteinG, target: diet.targetProteinG, unit: 'g', color: 'bg-attr-str' },
    { label: 'Gordura', current: diet.totalFatG, target: diet.targetFatG, unit: 'g', color: 'bg-warning' },
    { label: 'Carbs', current: diet.totalCarbsG, target: diet.targetCarbsG, unit: 'g', color: 'bg-attr-agi' },
  ];

  const waterPercent = Math.min(100, (diet.totalWaterMl / diet.targetWaterMl) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Salad className="h-8 w-8 text-attr-vit" /> Dieta
        </h1>
        <p className="text-muted-foreground">Acompanhe suas refeições e macros do dia.</p>
      </motion.div>

      {/* Macro Rings */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {macros.map((macro) => {
            const pct = Math.min(100, (macro.current / macro.target) * 100);
            return (
              <Card key={macro.label}>
                <CardContent className="pt-4 text-center space-y-2">
                  <div className="relative h-20 w-20 mx-auto">
                    <svg className="h-20 w-20 -rotate-90" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-secondary" />
                      <circle
                        cx="40" cy="40" r="34" fill="none" strokeWidth="6"
                        className="stroke-primary"
                        strokeDasharray={`${pct * 2.136} 213.6`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center font-mono text-sm font-bold">
                      {Math.round(pct)}%
                    </span>
                  </div>
                  <p className="text-xs font-medium">{macro.label}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    {macro.current}/{macro.target}{macro.unit}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* Water */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <Card>
          <CardContent className="pt-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <Droplets className="h-4 w-4 text-info" /> Água
              </span>
              <span className="font-mono text-xs text-muted-foreground">
                {diet.totalWaterMl}ml / {diet.targetWaterMl}ml
              </span>
            </div>
            <Progress value={waterPercent} className="h-3" />
            <div className="flex gap-2">
              {[200, 300, 500].map((ml) => (
                <Button key={ml} variant="outline" size="sm" className="font-mono text-xs">
                  +{ml}ml
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Meals */}
      <div className="space-y-3">
        {meals.map((meal, i) => (
          <motion.div
            key={meal.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-display flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <meal.icon className="h-4 w-4 text-muted-foreground" />
                    {meal.name}
                    <span className="text-xs text-muted-foreground font-mono">{meal.time}</span>
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <Plus className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              {meal.items.length > 0 && (
                <CardContent className="space-y-1">
                  {meal.items.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{item.qty}</span>
                      </div>
                      <div className="font-mono text-xs text-muted-foreground">
                        {item.cal}kcal • {item.prot}g prot
                      </div>
                    </div>
                  ))}
                </CardContent>
              )}
              {meal.items.length === 0 && (
                <CardContent>
                  <p className="text-sm text-muted-foreground italic">Nenhum alimento registrado</p>
                </CardContent>
              )}
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
