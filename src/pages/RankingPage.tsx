import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Globe, Dumbbell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LEVEL_TABLE } from '@/types';
import { getRankTier, RANK_TIERS } from '@/lib/exercise-ranks';

export default function RankingPage() {
  const { user, profile } = useAuth();
  const [globalRanking, setGlobalRanking] = useState<any[]>([]);
  const [friendsRanking, setFriendsRanking] = useState<any[]>([]);
  const [exerciseRanks, setExerciseRanks] = useState<any[]>([]);
  const [myRanks, setMyRanks] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Global XP ranking
    supabase.from('profiles').select('user_id, username, name, xp, level, class_name, avatar_url')
      .order('xp', { ascending: false }).limit(50)
      .then(({ data }) => setGlobalRanking(data || []));

    // Friends ranking
    supabase.from('friendships').select('initiator_id, receiver_id')
      .eq('status', 'accepted')
      .or(`initiator_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .then(async ({ data: friendships }) => {
        if (!friendships || friendships.length === 0) { setFriendsRanking([]); return; }
        const friendIds = friendships.map(f => f.initiator_id === user.id ? f.receiver_id : f.initiator_id);
        friendIds.push(user.id);
        const { data } = await supabase.from('profiles').select('user_id, username, name, xp, level, class_name, avatar_url')
          .in('user_id', friendIds).order('xp', { ascending: false });
        setFriendsRanking(data || []);
      });

    // My exercise ranks (Hall da Fama)
    supabase.from('exercise_ranks').select('*, exercises(name, muscle_group)').eq('user_id', user.id)
      .then(({ data }) => {
        const sorted = (data || []).sort((a: any, b: any) => {
          const aIdx = RANK_TIERS.findIndex(r => r.name === a.current_rank);
          const bIdx = RANK_TIERS.findIndex(r => r.name === b.current_rank);
          return bIdx - aIdx;
        });
        setMyRanks(sorted);
      });
  }, [user]);

  const podiumSizes = ['text-4xl', 'text-3xl', 'text-2xl'];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Trophy className="h-8 w-8 text-warning" /> Ranking
        </h1>
        <p className="text-muted-foreground">Veja sua posição e compare com outros guerreiros.</p>
      </motion.div>

      <Tabs defaultValue="global">
        <TabsList className="w-full">
          <TabsTrigger value="global" className="flex-1 font-display"><Globe className="h-4 w-4 mr-1" /> XP Global</TabsTrigger>
          <TabsTrigger value="exercises" className="flex-1 font-display"><Dumbbell className="h-4 w-4 mr-1" /> Exercícios</TabsTrigger>
          <TabsTrigger value="fame" className="flex-1 font-display"><Trophy className="h-4 w-4 mr-1" /> Hall da Fama</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          {globalRanking.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground">Nenhum guerreiro no ranking ainda — seja o primeiro!</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Podium */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="border-primary/10">
                  <CardContent className="pt-6">
                    <div className="flex items-end justify-center gap-4">
                      {[1, 0, 2].map(idx => {
                        const entry = globalRanking[idx];
                        if (!entry) return null;
                        const levelData = LEVEL_TABLE.find(l => l.className === entry.class_name);
                        return (
                          <motion.div key={entry.user_id} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + idx * 0.15 }} className="text-center space-y-2"
                            style={{ order: idx === 0 ? 1 : idx === 1 ? 0 : 2 }}>
                            <div className={`relative ${idx === 0 ? 'mb-4' : ''}`}>
                              <div className={`h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary ${idx === 0 ? 'h-20 w-20 ring-2 ring-warning glow-primary-strong' : ''}`}>
                                {entry.name?.charAt(0)}
                              </div>
                              <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${podiumSizes[idx]}`}>
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}
                              </span>
                            </div>
                            <p className="font-display font-bold text-sm">{entry.name?.split(' ')[0]}</p>
                            <p className="font-mono text-xs text-primary">{entry.xp?.toLocaleString()} XP</p>
                            <p className="text-[10px] text-muted-foreground">{levelData?.icon} Nv.{entry.level}</p>
                          </motion.div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Full List */}
              <Card>
                <CardContent className="pt-4 space-y-1">
                  {globalRanking.map((entry, idx) => (
                    <div key={entry.user_id}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        entry.user_id === user?.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-secondary/50'
                      }`}>
                      <span className="font-mono font-bold text-muted-foreground w-8 text-right">#{idx + 1}</span>
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                        {entry.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{entry.name}</p>
                        <p className="text-xs text-muted-foreground">Nv.{entry.level} {entry.class_name}</p>
                      </div>
                      <span className="font-mono text-sm font-bold text-primary">{entry.xp?.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">XP</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-4">
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Ranking por exercício — registre séries para aparecer aqui!</p>
              <p className="text-xs text-muted-foreground">Em breve: veja quem tem o rank mais alto em cada exercício.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fame" className="space-y-4">
          {myRanks.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center space-y-3">
                <p className="text-2xl">⚙️</p>
                <p className="text-muted-foreground">Todos começam em Ferro — registre séries nos treinos para subir de rank!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {myRanks.map(rank => {
                const tier = getRankTier(rank.current_rank);
                return (
                  <Card key={rank.id}>
                    <CardContent className="pt-4 flex items-center gap-3">
                      <span className="text-3xl" style={{ color: tier.color.startsWith('linear') ? '#F59E0B' : tier.color }}>{tier.icon}</span>
                      <div className="flex-1">
                        <p className="font-display font-bold">{rank.exercises?.name}</p>
                        <p className="text-xs text-muted-foreground">{rank.exercises?.muscle_group}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display font-bold" style={{ color: tier.color.startsWith('linear') ? '#F59E0B' : tier.color }}>{tier.name}</p>
                        <p className="text-xs font-mono text-muted-foreground">{rank.best_weight_kg}kg × {rank.best_reps}</p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
