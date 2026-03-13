import { motion } from 'framer-motion';
import { Dumbbell, Play, Clock, Weight, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockRecentWorkouts } from '@/lib/mock-data';

const programs = [
  { id: '1', name: 'Push Pull Legs', description: '6 dias/semana', days: 6, nextDay: 'Push A' },
  { id: '2', name: 'Upper/Lower', description: '4 dias/semana', days: 4, nextDay: 'Upper A' },
];

const prsByGroup = [
  { group: 'Peito', exercise: 'Supino Reto', weight: 100, reps: 5 },
  { group: 'Costas', exercise: 'Remada Curvada', weight: 90, reps: 6 },
  { group: 'Pernas', exercise: 'Agachamento', weight: 130, reps: 5 },
  { group: 'Ombros', exercise: 'Desenvolvimento', weight: 50, reps: 8 },
];

export default function WorkoutPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Dumbbell className="h-8 w-8 text-primary" /> Treino
        </h1>
        <p className="text-muted-foreground">Gerencie seus programas e inicie sessões de treino.</p>
      </motion.div>

      {/* Start Workout */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-primary/20 glow-primary">
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
                <Play className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-xl font-display font-bold">Iniciar Treino</h2>
              <p className="text-sm text-muted-foreground">Selecione um programa para começar sua sessão</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {programs.map((prog) => (
                  <Button key={prog.id} variant="outline" className="h-auto p-4 flex-col items-start text-left">
                    <span className="font-display font-bold">{prog.name}</span>
                    <span className="text-xs text-muted-foreground">{prog.description} • Próximo: {prog.nextDay}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Histórico Recente */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Histórico Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockRecentWorkouts.map((session) => (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Dumbbell className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{session.dayName}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground font-mono">
                      <span>{session.durationMin}min</span>
                      <span>{session.totalVolumeKg?.toLocaleString()}kg</span>
                      <span>+{session.xpGained} XP</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* PRs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Personal Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {prsByGroup.map((pr) => (
                  <div key={pr.group} className="p-3 rounded-lg bg-secondary/50 space-y-1">
                    <p className="text-xs text-muted-foreground">{pr.group}</p>
                    <p className="font-display font-bold text-sm">{pr.exercise}</p>
                    <p className="font-mono text-xs text-primary">
                      {pr.weight}kg × {pr.reps}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
