import { motion } from 'framer-motion';
import { Flame, Dumbbell, Salad, Activity, Trophy, Swords } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUserStore } from '@/store/user';
import { XPBar } from '@/components/rpg/XPBar';
import { LevelBadge } from '@/components/rpg/LevelBadge';
import { AttributeBars } from '@/components/rpg/AttributeBars';
import { mockDietToday, mockRecentWorkouts, mockRanking, mockFeed } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

const feedTypeLabels: Record<string, { icon: string; text: (d: any) => string }> = {
  workout_complete: { icon: '🏋️', text: (d) => `completou treino ${d.day} — ${d.volume}kg volume` },
  pr_broken: { icon: '🏆', text: (d) => `quebrou PR: ${d.exercise} ${d.weight}kg × ${d.reps}` },
  level_up: { icon: '⬆️', text: (d) => `subiu para Nível ${d.newLevel} — ${d.newClass}!` },
  achievement: { icon: d => d.emoji, text: (d) => `desbloqueou: ${d.name}` },
  cardio_complete: { icon: '🏃', text: (d) => `${d.type} — ${d.distance}km em ${d.duration}min` },
  diet_goal: { icon: '🥗', text: () => 'atingiu meta calórica do dia!' },
};

export default function HomePage() {
  const user = useUserStore((s) => s.user);
  if (!user) return null;

  const diet = mockDietToday;
  const calPercent = Math.min(100, (diet.totalCalories / diet.targetCalories) * 100);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1"
      >
        <h1 className="text-3xl font-display font-bold">
          Olá, {user.name.split(' ')[0]}! <Swords className="inline h-7 w-7 text-primary" />
        </h1>
        <p className="text-muted-foreground">Level up your body. Conquer your limits.</p>
      </motion.div>

      {/* XP + Level */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-primary/20 glow-primary">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <LevelBadge level={user.level} className={user.className} size="md" />
              {user.specialization && (
                <span className="text-sm text-muted-foreground">
                  {user.specialization === 'hercules' && '🏋️ Hércules'}
                  {user.specialization === 'hermes' && '🏃 Hermes'}
                  {user.specialization === 'apollo' && '🥗 Apollo'}
                  {user.specialization === 'athena' && '⚖️ Atena'}
                </span>
              )}
            </div>
            <XPBar xp={user.xp} level={user.level} />
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Streak */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flame className="h-8 w-8 text-primary animate-pulse-glow" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">{user.streak}</p>
                <p className="text-sm text-muted-foreground">dias de streak</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Calorias Hoje */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Salad className="h-4 w-4 text-attr-vit" /> Calorias Hoje
                </span>
                <span className="font-mono text-xs text-muted-foreground">
                  {diet.totalCalories} / {diet.targetCalories} kcal
                </span>
              </div>
              <Progress value={calPercent} className="h-3" />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>P: {diet.totalProteinG}g/{diet.targetProteinG}g</span>
                <span>G: {diet.totalFatG}g/{diet.targetFatG}g</span>
                <span>C: {diet.totalCarbsG}g/{diet.targetCarbsG}g</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Atributos RPG */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Atributos RPG</CardTitle>
            </CardHeader>
            <CardContent>
              <AttributeBars str={user.strAttr} end={user.endAttr} vit={user.vitAttr} agi={user.agiAttr} compact />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Próximo Treino + Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-primary/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold">Push Pull Legs</p>
                  <p className="text-sm text-muted-foreground">Próximo: Push A</p>
                </div>
              </div>
              <Button asChild className="font-display">
                <Link to="/workout">⚔️ Iniciar Treino</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Ranking Friends */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Ranking Amigos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {mockRanking.slice(0, 5).map((entry) => (
                <div
                  key={entry.username}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    entry.username === user.username ? 'bg-primary/10 border border-primary/20' : ''
                  }`}
                >
                  <span className="font-mono font-bold text-muted-foreground w-6">#{entry.rank}</span>
                  <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                    {entry.name.charAt(0)}
                  </div>
                  <span className="flex-1 truncate font-medium">{entry.name}</span>
                  <span className="font-mono text-xs text-muted-foreground">{entry.xp.toLocaleString()} XP</span>
                </div>
              ))}
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link to="/ranking">Ver ranking completo →</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quest Log */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                📜 Quest Log
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockFeed.slice(0, 5).map((activity) => {
                const config = feedTypeLabels[activity.type];
                return (
                  <div key={activity.id} className="flex items-start gap-2 text-sm">
                    <span className="text-base shrink-0">
                      {typeof config.icon === 'function' ? config.icon(activity.data) : config.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p>
                        <span className="font-medium">{activity.name}</span>{' '}
                        <span className="text-muted-foreground">{config.text(activity.data)}</span>
                      </p>
                      <div className="flex gap-2 mt-1">
                        {activity.reactions.map((r) => (
                          <span key={r.emoji} className="text-xs bg-secondary rounded-full px-2 py-0.5">
                            {r.emoji} {r.count}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
