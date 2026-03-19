import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { fetchActiveMissions, fetchGlobalMissions, claimMissionReward, checkAndGenerateDailyMissions, ActiveMission, GlobalMission } from '@/lib/missions';
import { Medal, CheckCircle2, Gift, Loader2, Clock } from 'lucide-react';
import { toast } from 'sonner';

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
  const [globalMissions, setGlobalMissions] = useState<GlobalMission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    await checkAndGenerateDailyMissions(user!.id);
    const [userMissions, globals] = await Promise.all([
      fetchActiveMissions(user!.id),
      fetchGlobalMissions()
    ]);
    setMissions(userMissions || []);
    setGlobalMissions(globals || []);
    setLoading(false);
  };

  const handleClaim = async (missionId: string) => {
    try {
      await claimMissionReward(missionId, user!.id);
      toast.success('Recompensa resgatada com sucesso!');
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao resgatar recompensa.');
    }
  };

  const renderMissionCard = (mission: ActiveMission) => {
    const isCompleted = mission.status === 'completed';
    const percent = Math.min(100, (mission.progress / mission.target) * 100);

    return (
      <Card key={mission.id} className={`bg-card border-border overflow-hidden relative ${isCompleted ? 'border-primary/50 bg-primary/5' : ''}`}>
        {isCompleted && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-primary/20 rounded-bl-full flex items-start justify-end p-2">
            <CheckCircle2 className="text-primary w-5 h-5" />
          </div>
        )}
        <CardHeader className="pb-2">
          <div className="flex gap-4 items-center">
            <div className="text-4xl">{mission.template.icon_emoji}</div>
            <div className="flex-1 pr-8">
              <CardTitle className="text-lg">{mission.template.title}</CardTitle>
              <CardDescription className="text-sm mt-1">{mission.template.description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
            <span>Progresso</span>
            <span>{mission.progress} / {mission.target}</span>
          </div>
          <Progress 
            value={percent} 
            className="h-2 bg-secondary" 
            indicatorClassName={isCompleted ? "bg-primary" : "bg-blue-500"} 
          />
          
          <div className="flex gap-4 mt-4 text-sm font-bold">
            {mission.template.xp_reward > 0 && (
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="text-base">⚔️</span> +{mission.template.xp_reward} XP
              </div>
            )}
            {mission.template.mastery_points_reward > 0 && (
              <div className="flex items-center gap-1.5 text-yellow-400">
                <Medal className="w-4 h-4" /> +{mission.template.mastery_points_reward} PM
              </div>
            )}
          </div>
        </CardContent>
        {isCompleted && (
          <CardFooter className="pt-2">
            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold" onClick={() => handleClaim(mission.id)}>
              <Gift className="w-5 h-5 mr-2" /> Resgatar Recompensa
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  };
  
  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');
  const monthlyMissions = missions.filter(m => m.type === 'monthly');
  const masterMissions = missions.filter(m => m.type === 'master');

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
          <p className="text-muted-foreground mt-1">Complete desafios e avance seu Nível e PM</p>
        </div>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="w-full justify-start overflow-x-auto flex-nowrap bg-background border border-border p-1 rounded-xl h-auto">
          <TabsTrigger value="daily" className="py-2.5 px-4 rounded-lg">Diárias</TabsTrigger>
          <TabsTrigger value="weekly" className="py-2.5 px-4 rounded-lg">Semanais</TabsTrigger>
          <TabsTrigger value="monthly" className="py-2.5 px-4 rounded-lg">Mensais</TabsTrigger>
          <TabsTrigger value="master" className="py-2.5 px-4 rounded-lg text-yellow-500 data-[state=active]:text-yellow-400">Master</TabsTrigger>
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
        
        <TabsContent value="master" className="mt-6 space-y-4 outline-none">
           {masterMissions.length === 0 ? (
             <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border outline-dashed outline-1 outline-neutral-800 outline-offset-[-8px]">Você precisa avançar seu Ranking Geral para desbloquear Missões Master.</p>
           ) : (
             masterMissions.map(renderMissionCard)
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
                      <span className="text-3xl">🌍</span>
                      <div>
                        <CardTitle>{m.title}</CardTitle>
                        <CardDescription className="mt-1">{m.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-xs font-medium text-muted-foreground mb-2">
                        <span>Progresso da Comunidade</span>
                        <span>{m.current_progress.toLocaleString()} / {m.target.toLocaleString()}</span>
                    </div>
                    <Progress value={Math.min(100, (m.current_progress / m.target)*100)} className="h-3" indicatorClassName="bg-blue-500" />
                  </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
