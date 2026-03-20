import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { fetchActiveMissions, claimMissionReward, checkAndGenerateDailyMissions, UserMission } from '@/lib/missions';
import { Medal, CheckCircle2, Gift, Loader2, Clock, Circle } from 'lucide-react';
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
  const { user, refreshProfile } = useAuth();
  const [missions, setMissions] = useState<UserMission[]>([]);
  const [globalMissions, setGlobalMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    
    const globalsPromise = supabase
      .from('global_missions' as any)
      .select('*')
      .eq('is_active', true);

    await checkAndGenerateDailyMissions(user!.id);
    const userMissions = await fetchActiveMissions(user!.id); // This auto-checks completion!
    const { data: globals } = await globalsPromise;

    setMissions(userMissions || []);
    setGlobalMissions(globals || []);
    setLoading(false);
  };

  const handleClaim = async (missionId: string) => {
    setClaimingId(missionId);
    try {
      const result = await claimMissionReward(missionId, user!.id);
      const coinReward = Math.round((result?.xpReward || 0) / 5);
      
      const audio = new Audio('/completequest.mp3');
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Audio error:', e));

      toast.success(`Recompensa resgatada! +${result?.xpReward} XP  +${coinReward} QC 🪙`);
      await refreshProfile();
      loadData();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao resgatar recompensa.');
    }
    setClaimingId(null);
  };

  const renderMissionCard = (mission: UserMission) => {
    const isCompleted = mission.is_completed;
    const isClaimed = mission.is_claimed;
    const coinReward = Math.round(mission.xp_reward / 5);

    return (
      <Card key={mission.id} className={`bg-card border-border overflow-hidden relative transition-all duration-300 ${
        isClaimed ? 'opacity-60 grayscale-[30%]' : isCompleted ? 'border-primary/50 bg-primary/5 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' : ''
      }`}>
        {/* Status indicator */}
        <div className="absolute top-3 right-3">
          {isClaimed ? (
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5" /> Resgatado
            </div>
          ) : isCompleted ? (
            <div className="flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full animate-pulse">
              <Gift className="w-3.5 h-3.5" /> Pronto!
            </div>
          ) : (
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground bg-secondary/50 px-2.5 py-1 rounded-full">
              <Circle className="w-3 h-3" /> Em andamento
            </div>
          )}
        </div>

        <CardHeader className="pb-2">
          <div className="flex gap-4 items-center">
            <div className={`text-4xl transition-all duration-500 ${isCompleted && !isClaimed ? 'animate-bounce' : ''}`}>
              {isClaimed ? '✅' : isCompleted ? '🏆' : '🎯'}
            </div>
            <div className="flex-1 pr-20">
              <CardTitle className="text-lg">{mission.title}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {isCompleted
                  ? isClaimed ? 'Missão concluída e recompensa coletada.' : 'Missão concluída! Resgate sua recompensa.'
                  : 'Detectamos automaticamente quando você completar.'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pb-2">
          <div className="flex gap-4 mt-2 text-sm font-bold">
            {mission.xp_reward > 0 && (
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="text-base">⚔️</span> +{mission.xp_reward} XP
              </div>
            )}
            <div className="flex items-center gap-1.5 text-yellow-400">
              <img src="/questcoin.png" alt="QC" className="w-4 h-4 object-contain" /> +{coinReward} QC
            </div>
          </div>
        </CardContent>

        <CardFooter className="pt-2">
          {isClaimed ? (
            <Button className="w-full" variant="secondary" disabled>
              ✅ Recompensa Coletada
            </Button>
          ) : isCompleted ? (
            <Button 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20" 
              onClick={() => handleClaim(mission.id)}
              disabled={claimingId === mission.id}
            >
              {claimingId === mission.id ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <><Gift className="w-5 h-5 mr-2" /> Resgatar Recompensa</>
              )}
            </Button>
          ) : (
            <div className="w-full py-2 text-center text-xs text-muted-foreground italic">
              Continue treinando — atualizamos automaticamente! ⚡
            </div>
          )}
        </CardFooter>
      </Card>
    );
  };

  const dailyMissions = missions.filter(m => m.type === 'daily');
  const weeklyMissions = missions.filter(m => m.type === 'weekly');
  const monthlyMissions = missions.filter(m => m.type === 'monthly');

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
          <p className="text-muted-foreground mt-1">Complete desafios reais e resgate recompensas</p>
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
          <div className="flex justify-end mb-2"><MissionCountdown targetDate={getNextDailyReset()} /></div>
          {dailyMissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border">Nenhuma missão diária ativa hoje.</p>
          ) : dailyMissions.map(renderMissionCard)}
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-6 space-y-4 outline-none">
          <div className="flex justify-end mb-2"><MissionCountdown targetDate={getNextWeeklyReset()} /></div>
          {weeklyMissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border">Você completou todas missões semanais.</p>
          ) : weeklyMissions.map(renderMissionCard)}
        </TabsContent>
        
        <TabsContent value="monthly" className="mt-6 space-y-4 outline-none">
          <div className="flex justify-end mb-2"><MissionCountdown targetDate={getNextMonthlyReset()} /></div>
          {monthlyMissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border">Sem missões mensais no momento.</p>
          ) : monthlyMissions.map(renderMissionCard)}
        </TabsContent>

        <TabsContent value="global" className="mt-6 space-y-4 outline-none">
          {globalMissions.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 bg-card rounded-xl border border-border">A comunidade está aguardando novos desafios globais.</p>
          ) : globalMissions.map(m => (
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
                <div className="w-full bg-secondary rounded-full h-3 overflow-hidden">
                  <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, ((m.current_value || 0) / m.objective_value) * 100)}%` }} />
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
