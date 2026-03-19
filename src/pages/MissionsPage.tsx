import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { fetchActiveMissions, claimMissionReward, checkAndGenerateDailyMissions, ActiveMission } from '@/lib/missions';
import { Medal, CheckCircle2, Gift, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

/** Calcula as datas de reset */
const getNextDailyReset = () => { const d = new Date(); d.setHours(23, 59, 59, 999); return d; }
const getNextWeeklyReset = () => { 
  const d = new Date(); 
  const day = d.getDay(); 
  const daysUntilSunday = day === 0 ? 0 : 7 - day; 
  d.setDate(d.getDate() + daysUntilSunday); 
  d.setHours(23, 59, 59, 999); 
  return d; 
}
const getNextMonthlyReset = () => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999); }

function MissionCountdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const calc = () => {
      const diff = targetDate.getTime() - new Date().getTime();
      if (diff <= 0) return setTimeLeft('00h 00m');
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const m = Math.floor((diff / 1000 / 60) % 60);
      if (d > 0) setTimeLeft(`${d}d ${h}h`);
      else setTimeLeft(`${h}h ${m}m`);
    };
    calc();
    const interval = setInterval(calc, 60000);
    return () => clearInterval(interval);
  }, [targetDate]);

  return <span className="text-xs font-mono font-bold bg-secondary/80 text-muted-foreground px-3 py-1 rounded-full flex items-center justify-center gap-1.5 ring-1 ring-border shadow-inner"><Clock className="w-3.5 h-3.5" /> Atualiza em {timeLeft}</span>;
}

export default function MissionsPage() {
  const { user } = useAuth();
  const [missions, setMissions] = useState<ActiveMission[]>([]);
  const [globalMissions, setGlobalMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    
    // Start global missions fetch in parallel with user missions generation
    const globalsPromise = supabase
      .from('global_missions' as any)
      .select('*')
      .eq('is_active', true);

    await checkAndGenerateDailyMissions(user!.id);
    const userMissions = await fetchActiveMissions(user!.id);
    const { data: globals } = await globalsPromise;

    setMissions(userMissions || []);
    setGlobalMissions(globals || []);
    setLoading(false);
  };

  const handleClaim = async (missionId: string) => {
    try {
      const result = await claimMissionReward(missionId, user!.id);
      toast.success(`Recompensa resgatada! +${result?.xpReward} XP`);
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao resgatar recompensa.');
    }
  };

  const renderMissionCard = (mission: ActiveMission) => {
    const isCompleted = mission.completed;
    const isClaimed = mission.claimed;
    const percent = Math.min(100, mission.target_value > 0 ? (mission.current_value / mission.target_value) * 100 : 0);
    const template = mission.template;

    return (
      <Card key={mission.id} className={`bg-card border-border overflow-hidden relative ${isCompleted ? 'border-primary/50 bg-primary/5' : ''}`}>
        {isCompleted && !isClaimed && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-bl-full flex items-start justify-end p-2">
            <CheckCircle2 className="text-primary w-5 h-5" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex gap-4 items-center">
            <div className="text-4xl">{template?.icon || '🎯'}</div>
            <div className="flex-1 pr-8">
              <CardTitle className="text-lg">{template?.title || 'Missão'}</CardTitle>
              <CardDescription className="text-sm mt-1">{template?.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Progresso</span>
            <span>{mission.current_value} / {mission.target_value}</span>
          </div>
          <Progress 
            value={percent} 
            className="h-2 bg-secondary" 
          />
          
          <div className="flex gap-4 mt-4 text-sm font-bold">
            {(template?.xp_reward || 0) > 0 && (
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="text-base">⚔️</span> +{template?.xp_reward} XP
              </div>
            )}
            {(template?.coin_reward || 0) > 0 && (
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Medal className="w-4 h-4" /> +{template?.coin_reward} moedas
              </div>
            )}
          </div>
        </CardContent>
        {isCompleted && !isClaimed && (
          <CardFooter className="pt-2">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => handleClaim(mission.id)}>
              <Gift className="w-5 h-5 mr-2" /> Resgatar Recompensa
            </Button>
          </CardFooter>
        )}
        {isClaimed && (
          <CardFooter className="pt-2">
            <Button className="w-full" variant="secondary" disabled>
              ✅ Recompensa Resgatada
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };

  // Separate by mission type based on template.type
  const dailyMissions = missions.filter(m => m.template?.type === 'daily');
  const weeklyMissions = missions.filter(m => m.template?.type === 'weekly');
  const monthlyMissions = missions.filter(m => m.template?.type === 'monthly');

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="p-3.5 bg-primary/20 rounded-2xl border border-primary/30">
          <Medal className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-glow">Missões</h1>
          <p className="text-muted-foreground mt-1">Complete desafios e avance seu Nível</p>
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-background border border-border p-1 rounded-xl h-auto">
          <TabsTrigger value="daily" className="py-2.5 px-4 rounded-lg">Diárias</TabsTrigger>
          <TabsTrigger value="weekly" className="py-2.5 px-4 rounded-lg">Semanais</TabsTrigger>
          <TabsTrigger value="monthly" className="py-2.5 px-4 rounded-lg">Mensais</TabsTrigger>
          <TabsTrigger value="global" className="py-2.5 px-4 rounded-lg">Globais</TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-6 space-y-4 outline-none">
          <div className="flex justify-end mb-2">
             <MissionCountdown targetDate={getNextDailyReset()} />
          </div>
          {dailyMissions.length === 0 ? (
             <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border outline-dashed outline-1 outline-neutral-800 outline-offset-[-8px]">Nenhuma missão diária ativa hoje.</p>
          ) : (
            dailyMissions.map(renderMissionCard)
          )}
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-6 space-y-4 outline-none">
          <div className="flex justify-end mb-2">
             <MissionCountdown targetDate={getNextWeeklyReset()} />
          </div>
          {weeklyMissions.length === 0 ? (
             <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border outline-dashed outline-1 outline-neutral-800 outline-offset-[-8px]">Você completou todas missões semanais.</p>
          ) : (
            weeklyMissions.map(renderMissionCard)
          )}
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-6 space-y-4 outline-none">
          <div className="flex justify-end mb-2">
             <MissionCountdown targetDate={getNextMonthlyReset()} />
          </div>
          {monthlyMissions.length === 0 ? (
             <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border outline-dashed outline-1 outline-neutral-800 outline-offset-[-8px]">Sem missões mensais no momento.</p>
          ) : (
            monthlyMissions.map(renderMissionCard)
          )}
        </TabsContent>

        <TabsContent value="global" className="mt-6 space-y-4 outline-none">
          {globalMissions.length === 0 ? (
             <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border outline-dashed outline-1 outline-neutral-800 outline-offset-[-8px]">A comunidade está aguardando novos desafios globais.</p>
          ) : (
            globalMissions.map(m => (
              <Card key={m.id} className="bg-card border-border overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{m.icon || '🌍'}</span>
                      <div>
                        <CardTitle>{m.title}</CardTitle>
                        <CardDescription className="mt-1">{m.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
                        <span>Progresso da Comunidade</span>
                        <span>{(m.current_value || 0).toLocaleString()} / {m.objective_value.toLocaleString()}</span>
                    </div>
                    <Progress value={Math.min(100, ((m.current_value || 0) / m.objective_value) * 100)} className="h-3" />
                  </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
