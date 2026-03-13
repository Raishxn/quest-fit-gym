import { motion } from 'framer-motion';
import { Activity, Timer, Route, Heart, Flame as FlameIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { mockCardioSessions } from '@/lib/mock-data';

const cardioTypes = [
  { type: 'running', label: 'Corrida', emoji: '🏃' },
  { type: 'cycling', label: 'Bike', emoji: '🚴' },
  { type: 'swimming', label: 'Natação', emoji: '🏊' },
  { type: 'walking', label: 'Caminhada', emoji: '🚶' },
  { type: 'elliptical', label: 'Elíptico', emoji: '⛹️' },
  { type: 'rowing', label: 'Remo', emoji: '🚣' },
  { type: 'jump_rope', label: 'Pular Corda', emoji: '🎯' },
  { type: 'other', label: 'Outro', emoji: '💪' },
];

export default function CardioPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Activity className="h-8 w-8 text-attr-end" /> Cardio
        </h1>
        <p className="text-muted-foreground">Registre suas sessões de cardio e acompanhe seu progresso.</p>
      </motion.div>

      {/* Type Selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Nova Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {cardioTypes.map((ct) => (
                <Button
                  key={ct.type}
                  variant="outline"
                  className="h-auto py-3 flex-col gap-1 hover:border-primary hover:bg-primary/5"
                >
                  <span className="text-2xl">{ct.emoji}</span>
                  <span className="text-[10px]">{ct.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Attribute Bars */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 text-center space-y-2">
              <span className="text-2xl">🛡️</span>
              <p className="text-xs text-muted-foreground">END (Resistência)</p>
              <p className="font-mono text-2xl font-bold">15</p>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-attr-end rounded-full" style={{ width: '15%' }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center space-y-2">
              <span className="text-2xl">⚡</span>
              <p className="text-xs text-muted-foreground">AGI (Agilidade)</p>
              <p className="font-mono text-2xl font-bold">8</p>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-attr-agi rounded-full" style={{ width: '8%' }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Últimas Sessões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockCardioSessions.map((session) => {
              const ct = cardioTypes.find((t) => t.type === session.type);
              return (
                <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                  <span className="text-2xl">{ct?.emoji || '💪'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{ct?.label || session.type}</p>
                    <div className="flex gap-3 text-xs text-muted-foreground font-mono">
                      <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{session.durationMinutes}min</span>
                      {session.distanceKm && <span className="flex items-center gap-1"><Route className="h-3 w-3" />{session.distanceKm}km</span>}
                      {session.caloriesBurned && <span className="flex items-center gap-1"><FlameIcon className="h-3 w-3" />{session.caloriesBurned}kcal</span>}
                      <span className="text-primary">+{session.xpGained} XP</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
