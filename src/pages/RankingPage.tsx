import { motion } from 'framer-motion';
import { Trophy, Medal, Users, Globe } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { mockRanking } from '@/lib/mock-data';
import { useUserStore } from '@/store/user';
import { LEVEL_TABLE } from '@/types';

const podiumColors = ['text-warning', 'text-muted-foreground', 'text-warning/60'];
const podiumSizes = ['text-4xl', 'text-3xl', 'text-2xl'];

export default function RankingPage() {
  const user = useUserStore((s) => s.user);

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
          <TabsTrigger value="global" className="flex-1 font-display"><Globe className="h-4 w-4 mr-1" /> Global</TabsTrigger>
          <TabsTrigger value="friends" className="flex-1 font-display"><Users className="h-4 w-4 mr-1" /> Amigos</TabsTrigger>
        </TabsList>

        <TabsContent value="global" className="space-y-4">
          {/* Podium */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-primary/10">
              <CardContent className="pt-6">
                <div className="flex items-end justify-center gap-4">
                  {[1, 0, 2].map((idx) => {
                    const entry = mockRanking[idx];
                    if (!entry) return null;
                    const levelData = LEVEL_TABLE.find(l => l.className === entry.className);
                    return (
                      <motion.div
                        key={entry.username}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + idx * 0.15 }}
                        className="text-center space-y-2"
                        style={{ order: idx === 0 ? 1 : idx === 1 ? 0 : 2 }}
                      >
                        <div className={`relative ${idx === 0 ? 'mb-4' : ''}`}>
                          <div className={`h-16 w-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center text-xl font-bold text-primary ${idx === 0 ? 'h-20 w-20 ring-2 ring-warning glow-primary-strong' : ''}`}>
                            {entry.name.charAt(0)}
                          </div>
                          <span className={`absolute -bottom-2 left-1/2 -translate-x-1/2 ${podiumSizes[entry.rank - 1]}`}>
                            {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                          </span>
                        </div>
                        <p className="font-display font-bold text-sm">{entry.name.split(' ')[0]}</p>
                        <p className="font-mono text-xs text-primary">{entry.xp.toLocaleString()} XP</p>
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
              {mockRanking.map((entry) => (
                <div
                  key={entry.username}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    entry.username === user?.username
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-secondary/50'
                  }`}
                >
                  <span className="font-mono font-bold text-muted-foreground w-8 text-right">#{entry.rank}</span>
                  <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold">
                    {entry.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{entry.name}</p>
                    <p className="text-xs text-muted-foreground">Nv.{entry.level} {entry.className}</p>
                  </div>
                  <span className="font-mono text-sm font-bold text-primary">{entry.xp.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">XP</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="friends">
          <Card>
            <CardContent className="pt-6 text-center space-y-3">
              <Users className="h-12 w-12 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">Adicione amigos para ver o ranking entre vocês!</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
