import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Salad, Swords, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { XPBar } from '@/components/rpg/XPBar';
import { LevelBadge } from '@/components/rpg/LevelBadge';
import { AttributeBars } from '@/components/rpg/AttributeBars';
import { OverallRankBadge } from '@/components/rpg/OverallRankBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { UpdatePopup } from '@/components/ui/UpdatePopup';

export default function HomePage() {
  const { profile, user } = useAuth();
  const [dietToday, setDietToday] = useState<any>(null);
  const [ranking, setRanking] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);

    // Fetch today's diet
    supabase.from('diet_days').select('*').eq('user_id', user.id).eq('date', today).maybeSingle()
      .then(({ data }) => setDietToday(data));

    // Fetch top 5 by XP for ranking preview
    supabase.from('profiles').select('username, name, xp, level, class_name, avatar_url').order('xp', { ascending: false }).limit(5)
      .then(({ data }) => setRanking(data || []));

    // Fetch recent feed activities
    supabase.from('feed_activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5)
      .then(({ data }) => setRecentActivity(data || []));
  }, [user]);

  if (!profile) return null;

  const calPercent = dietToday && dietToday.target_calories > 0 
    ? Math.min(100, (dietToday.total_calories / dietToday.target_calories) * 100) 
    : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <UpdatePopup />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-3xl font-display font-bold">
          Olá, {profile.name.split(' ')[0]}! <Swords className="inline h-7 w-7 text-primary" />
        </h1>
        <p className="text-muted-foreground">Level up your body. Conquer your limits.</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="border-primary/20 glow-primary">
          <CardContent className="pt-4 space-y-3">
            <div className="flex justify-center md:justify-start">
              <LevelBadge level={profile.level} className={profile.currentClass?.name || profile.className} size="md" />
            </div>
            {profile.specialization && (
              <span className="text-sm text-muted-foreground block text-center md:text-left mt-2">
                {profile.specialization === 'hercules' && '🏋️ Hércules'}
                {profile.specialization === 'hermes' && '🏃 Hermes'}
                {profile.specialization === 'apollo' && '🥗 Apollo'}
                {profile.specialization === 'athena' && '⚖️ Atena'}
              </span>
            )}
            <XPBar xp={profile.xp} level={profile.level} />
            <div className="pt-4 border-t border-border/50 mt-4">
              <OverallRankBadge pm={profile.overall_mastery_points || 0} />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <Card>
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Flame className="h-8 w-8 text-primary animate-pulse-glow" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold">{profile.streak}</p>
                <p className="text-sm text-muted-foreground">dias de streak</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
          <Card>
            <CardContent className="pt-4 flex items-center gap-4">
              <div className="h-14 w-14 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <img src="/questcoin.png" alt="QC" className="h-9 w-9 object-contain" />
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-yellow-400">{profile.coins || 0}</p>
                <p className="text-sm text-muted-foreground">QuestCoins</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardContent className="pt-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1">
                  <Salad className="h-4 w-4 text-attr-vit" /> Calorias Hoje
                </span>
                {dietToday ? (
                  <span className="font-mono text-xs text-muted-foreground">
                    {dietToday.total_calories} kcal
                  </span>
                ) : (
                  <span className="font-mono text-xs text-muted-foreground">Sem registro</span>
                )}
              </div>
              {dietToday ? (
                <Progress value={calPercent} className="h-3" />
              ) : (
                <p className="text-xs text-muted-foreground italic">Registre sua primeira refeição na aba Dieta!</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display">Atributos RPG</CardTitle>
            </CardHeader>
            <CardContent>
              <AttributeBars str={profile.strAttr} end={profile.endAttr} vit={profile.vitAttr} agi={profile.agiAttr} compact />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card className="border-primary/10">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Dumbbell className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-display font-bold">Iniciar Treino</p>
                  <p className="text-sm text-muted-foreground">Comece sua próxima sessão</p>
                </div>
              </div>
              <Button asChild className="font-display">
                <Link to="/workout">⚔️ Treinar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Trophy className="h-4 w-4 text-primary" /> Ranking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {ranking.length === 0 ? (
                <p className="text-sm text-muted-foreground italic text-center py-4">Nenhum guerreiro no ranking ainda.</p>
              ) : (
                ranking.map((entry, idx) => (
                  <div key={entry.username || idx} className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
                    <span className="font-mono font-bold text-muted-foreground w-6">#{idx + 1}</span>
                    <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-[10px] font-bold">
                      {entry.name?.charAt(0) || '?'}
                    </div>
                    <span className="flex-1 truncate font-medium">{entry.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{entry.xp?.toLocaleString()} XP</span>
                  </div>
                ))
              )}
              <Button variant="ghost" size="sm" asChild className="w-full">
                <Link to="/ranking">Ver ranking completo →</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">📜 Quest Log</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-2xl">📜</p>
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma quest registrada ainda — comece sua jornada, aventureiro!
                  </p>
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-2 text-sm">
                    <span className="text-base shrink-0">⚔️</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-muted-foreground">{activity.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
