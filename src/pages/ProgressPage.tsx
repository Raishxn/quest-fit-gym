import { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Calendar, Dumbbell, Activity, Weight, Flame,
  ChevronDown, BarChart3, Target, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

type Period = '7d' | '30d' | 'custom';

export default function ProgressPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('7d');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  // Data
  const [sessions, setSessions] = useState<any[]>([]);
  const [cardioSessions, setCardioSessions] = useState<any[]>([]);
  const [bodyWeights, setBodyWeights] = useState<any[]>([]);
  const [anamnesis, setAnamnesis] = useState<any>(null);
  const [dietDays, setDietDays] = useState<any[]>([]);

  // Body weight logging
  const [showLogWeight, setShowLogWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');

  // Weekly report
  const [showWeeklyReport, setShowWeeklyReport] = useState(false);

  const dateRange = useMemo(() => {
    const end = new Date();
    let start: Date;
    if (period === '7d') {
      start = new Date();
      start.setDate(start.getDate() - 7);
    } else if (period === '30d') {
      start = new Date();
      start.setDate(start.getDate() - 30);
    } else {
      start = customStart ? new Date(customStart) : new Date(Date.now() - 7 * 86400000);
      if (customEnd) end.setTime(new Date(customEnd).getTime());
    }
    return { start: start.toISOString(), end: end.toISOString() };
  }, [period, customStart, customEnd]);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, dateRange]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const [sessionsRes, cardioRes, weightsRes, anamRes, dietRes] = await Promise.all([
      supabase.from('workout_sessions')
        .select('*, exercise_logs(*, exercises(*), set_logs(*))')
        .eq('user_id', user.id)
        .eq('status', 'completed')
        .gte('started_at', dateRange.start)
        .lte('started_at', dateRange.end)
        .order('started_at', { ascending: true }),
      supabase.from('cardio_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('started_at', dateRange.start)
        .lte('started_at', dateRange.end)
        .order('started_at', { ascending: true }),
      supabase.from('body_weight_logs')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true })
        .limit(50),
      supabase.from('anamnesis')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.from('diet_days')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', dateRange.start.slice(0, 10))
        .lte('date', dateRange.end.slice(0, 10))
        .order('date', { ascending: true }),
    ]);

    setSessions(sessionsRes.data || []);
    setCardioSessions(cardioRes.data || []);
    setBodyWeights(weightsRes.data || []);
    setAnamnesis(anamRes.data);
    setDietDays(dietRes.data || []);
    setLoading(false);

    // Check if should show weekly report (Saturday)
    const today = new Date();
    if (today.getDay() === 6) { // Saturday
      const lastShown = localStorage.getItem('qf_weekly_report_shown');
      const todayStr = today.toISOString().slice(0, 10);
      if (lastShown !== todayStr) {
        setShowWeeklyReport(true);
        localStorage.setItem('qf_weekly_report_shown', todayStr);
      }
    }
  };

  const logBodyWeight = async () => {
    if (!user || !newWeight) return;
    const { error } = await supabase.from('body_weight_logs').insert({
      user_id: user.id,
      weight_kg: Number(newWeight),
      date: new Date().toISOString().slice(0, 10),
    } as any);
    if (error) { toast.error('Erro ao salvar'); return; }
    toast.success('Peso registrado!');
    setNewWeight('');
    setShowLogWeight(false);
    loadData();
  };

  // ---- COMPUTED METRICS ----

  // Exercise progression — max weight per exercise
  const exerciseProgression = useMemo(() => {
    const map: Record<string, { name: string; muscle_group: string; entries: { date: string; maxWeight: number; totalSets: number }[] }> = {};

    sessions.forEach(session => {
      const date = session.started_at?.slice(0, 10);
      (session.exercise_logs || []).forEach((log: any) => {
        const exName = log.exercises?.name || 'Unknown';
        const muscle = log.exercises?.muscle_group || '';
        if (!map[exName]) map[exName] = { name: exName, muscle_group: muscle, entries: [] };
        const sets = log.set_logs || [];
        const workingSets = sets.filter((s: any) => s.type === 'working' || !s.type);
        const maxWeight = Math.max(0, ...workingSets.map((s: any) => s.weight_kg || 0));
        map[exName].entries.push({ date, maxWeight, totalSets: sets.length });
      });
    });

    return Object.values(map).sort((a, b) => b.entries.length - a.entries.length);
  }, [sessions]);

  // Sets per muscle group
  const setsPerMuscle = useMemo(() => {
    const map: Record<string, number> = {};
    sessions.forEach(session => {
      (session.exercise_logs || []).forEach((log: any) => {
        const muscle = log.exercises?.muscle_group || 'outro';
        const sets = (log.set_logs || []).filter((s: any) => s.type === 'working' || !s.type).length;
        map[muscle] = (map[muscle] || 0) + sets;
      });
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [sessions]);

  // Cardio stats
  const cardioStats = useMemo(() => ({
    totalMinutes: cardioSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
    totalDistance: cardioSessions.reduce((sum, s) => sum + (s.distance_km || 0), 0),
    totalCalories: cardioSessions.reduce((sum, s) => sum + (s.calories_burned || 0), 0),
    sessionsCount: cardioSessions.length,
  }), [cardioSessions]);

  // Weekly calorie expenditure
  const weeklyCalories = useMemo(() => {
    const tdee = anamnesis?.tdee || 2000;
    const days = period === '7d' ? 7 : period === '30d' ? 30 : Math.max(1, Math.ceil((new Date(dateRange.end).getTime() - new Date(dateRange.start).getTime()) / 86400000));
    const baseCals = tdee * days;
    const workoutCals = sessions.reduce((sum, s) => sum + (s.total_volume_kg || 0) * 0.05, 0); // rough estimate
    const cardioCals = cardioStats.totalCalories;
    return { baseCals: Math.round(baseCals), workoutCals: Math.round(workoutCals), cardioCals, total: Math.round(baseCals + workoutCals + cardioCals), days };
  }, [anamnesis, sessions, cardioStats, dateRange, period]);

  // Diet adherence
  const dietStats = useMemo(() => {
    if (dietDays.length === 0) return null;
    const avgCalories = Math.round(dietDays.reduce((sum, d) => sum + (d.total_calories || 0), 0) / dietDays.length);
    const avgProtein = Math.round(dietDays.reduce((sum, d) => sum + (d.total_protein_g || 0), 0) / dietDays.length);
    return { avgCalories, avgProtein, days: dietDays.length };
  }, [dietDays]);

  // Body weight change
  const weightChange = useMemo(() => {
    if (bodyWeights.length < 2) return null;
    const first = bodyWeights[0].weight_kg;
    const last = bodyWeights[bodyWeights.length - 1].weight_kg;
    return { first, last, diff: +(last - first).toFixed(1) };
  }, [bodyWeights]);

  // Weekly report data (last 7 days regardless of period)
  const weeklyReport = useMemo(() => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const weekSessions = sessions.filter(s => s.started_at >= sevenDaysAgo);
    const weekCardio = cardioSessions.filter(s => s.started_at >= sevenDaysAgo);

    const totalVolume = weekSessions.reduce((sum, s) => sum + (s.total_volume_kg || 0), 0);
    const totalSets = weekSessions.reduce((sum, s) => sum + (s.total_sets || 0), 0);

    // Best lifts this week
    const bestLifts: Record<string, number> = {};
    weekSessions.forEach(session => {
      (session.exercise_logs || []).forEach((log: any) => {
        const name = log.exercises?.name;
        if (!name) return;
        const max = Math.max(0, ...(log.set_logs || []).map((s: any) => s.weight_kg || 0));
        if (!bestLifts[name] || max > bestLifts[name]) bestLifts[name] = max;
      });
    });

    return {
      sessionsCount: weekSessions.length,
      totalVolume: Math.round(totalVolume),
      totalSets,
      cardioMinutes: weekCardio.reduce((sum, s) => sum + (s.duration_minutes || 0), 0),
      bestLifts: Object.entries(bestLifts).sort((a, b) => b[1] - a[1]).slice(0, 5),
    };
  }, [sessions, cardioSessions]);

  const periodLabel = period === '7d' ? 'Semanal' : period === '30d' ? 'Mensal' : 'Personalizado';

  // ---- RENDER ----
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando progresso...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <TrendingUp className="h-8 w-8 text-primary" /> Progresso
        </h1>
        <p className="text-muted-foreground">Acompanhe sua evolução em cada detalhe.</p>
      </motion.div>

      {/* Period Selector + Log Weight */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-wrap gap-2">
        {(['7d', '30d', 'custom'] as Period[]).map(p => (
          <Button
            key={p}
            variant={period === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setPeriod(p); if (p === 'custom') setShowCustom(true); }}
          >
            {p === '7d' ? '📅 Semanal' : p === '30d' ? '📆 Mensal' : '🔧 Personalizado'}
          </Button>
        ))}
        <Button variant="outline" size="sm" className="ml-auto" onClick={() => setShowLogWeight(true)}>
          <Weight className="h-3.5 w-3.5 mr-1" /> Registrar Peso
        </Button>
      </motion.div>

      {/* Summary Cards */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card>
            <CardContent className="pt-4 text-center space-y-1">
              <Dumbbell className="h-5 w-5 mx-auto text-primary" />
              <p className="font-mono text-2xl font-bold">{sessions.length}</p>
              <p className="text-[10px] text-muted-foreground">Treinos</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center space-y-1">
              <Activity className="h-5 w-5 mx-auto text-attr-end" />
              <p className="font-mono text-2xl font-bold">{cardioStats.totalMinutes}<span className="text-xs">min</span></p>
              <p className="text-[10px] text-muted-foreground">Cardio</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center space-y-1">
              <Flame className="h-5 w-5 mx-auto text-orange-500" />
              <p className="font-mono text-2xl font-bold">{weeklyCalories.total.toLocaleString()}</p>
              <p className="text-[10px] text-muted-foreground">kcal gastas ({weeklyCalories.days}d)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center space-y-1">
              <Weight className="h-5 w-5 mx-auto text-info" />
              {weightChange ? (
                <>
                  <p className="font-mono text-2xl font-bold">{weightChange.last}kg</p>
                  <p className={`text-[10px] font-mono ${weightChange.diff < 0 ? 'text-success' : weightChange.diff > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                    {weightChange.diff > 0 ? '+' : ''}{weightChange.diff}kg
                  </p>
                </>
              ) : (
                <>
                  <p className="font-mono text-lg text-muted-foreground">—</p>
                  <p className="text-[10px] text-muted-foreground">Sem registro</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Calorie Expenditure Breakdown */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Flame className="h-4 w-4 text-orange-500" /> Gasto Calórico ({periodLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="font-mono text-lg font-bold">{weeklyCalories.baseCals.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">TDEE Base</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold">{weeklyCalories.workoutCals.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Treinos</p>
              </div>
              <div>
                <p className="font-mono text-lg font-bold">{weeklyCalories.cardioCals.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">Cardio</p>
              </div>
            </div>
            {dietStats && (
              <div className="mt-3 pt-3 border-t border-border/50 grid grid-cols-2 gap-3 text-center">
                <div>
                  <p className="font-mono text-sm font-bold">{dietStats.avgCalories} kcal/dia</p>
                  <p className="text-[10px] text-muted-foreground">Média Ingerida</p>
                </div>
                <div>
                  <p className="font-mono text-sm font-bold">{dietStats.avgProtein}g/dia</p>
                  <p className="text-[10px] text-muted-foreground">Proteína Média</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Sets per Muscle Group */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-primary" /> Séries por Músculo ({periodLabel})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {setsPerMuscle.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">Nenhum treino no período</p>
            ) : (
              <div className="space-y-2">
                {setsPerMuscle.map(([muscle, sets]) => {
                  const maxSets = setsPerMuscle[0]?.[1] || 1;
                  const pct = (sets / maxSets) * 100;
                  return (
                    <div key={muscle} className="flex items-center gap-3">
                      <span className="text-xs font-medium w-20 truncate capitalize">{muscle}</span>
                      <div className="flex-1 h-5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono text-xs text-muted-foreground w-12 text-right">{sets} sets</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Exercise Progression */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-success" /> Progressão por Exercício
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {exerciseProgression.length === 0 ? (
              <p className="text-sm text-muted-foreground italic text-center py-4">Nenhum exercício registrado no período</p>
            ) : (
              exerciseProgression.slice(0, 10).map(ex => {
                const first = ex.entries[0];
                const last = ex.entries[ex.entries.length - 1];
                const diff = last.maxWeight - first.maxWeight;
                return (
                  <div key={ex.name} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/50">
                    <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ex.name}</p>
                      <p className="text-[10px] text-muted-foreground capitalize">{ex.muscle_group}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm font-bold">{last.maxWeight}kg</p>
                      {ex.entries.length > 1 && (
                        <p className={`font-mono text-[10px] ${diff > 0 ? 'text-success' : diff < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                          {diff > 0 ? '+' : ''}{diff}kg
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Body Weight History */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <Weight className="h-4 w-4 text-info" /> Histórico de Peso Corporal
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bodyWeights.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Weight className="h-8 w-8 mx-auto text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground italic">Registre seu peso para acompanhar a evolução</p>
                <Button variant="outline" size="sm" onClick={() => setShowLogWeight(true)}>Registrar Peso</Button>
              </div>
            ) : (
              <div className="space-y-1">
                {bodyWeights.slice(-10).reverse().map((entry, i) => (
                  <div key={entry.id || i} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                    <span className="text-muted-foreground text-xs">
                      {new Date(entry.measured_at).toLocaleDateString('pt-BR')}
                    </span>
                    <span className="font-mono font-bold">{entry.weight_kg} kg</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Cardio Summary */}
      {cardioStats.sessionsCount > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Activity className="h-4 w-4 text-attr-end" /> Resumo Cardio ({periodLabel})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="font-mono text-lg font-bold">{cardioStats.sessionsCount}</p>
                  <p className="text-[10px] text-muted-foreground">Sessões</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold">{cardioStats.totalMinutes}min</p>
                  <p className="text-[10px] text-muted-foreground">Duração Total</p>
                </div>
                <div>
                  <p className="font-mono text-lg font-bold">{cardioStats.totalDistance.toFixed(1)}km</p>
                  <p className="text-[10px] text-muted-foreground">Distância</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Weekly Report Dialog (auto-shown on Saturday) */}
      <Dialog open={showWeeklyReport} onOpenChange={setShowWeeklyReport}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg">📊 Relatório Semanal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card>
                <CardContent className="pt-3 text-center">
                  <p className="font-mono text-xl font-bold">{weeklyReport.sessionsCount}</p>
                  <p className="text-[10px] text-muted-foreground">Treinos</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3 text-center">
                  <p className="font-mono text-xl font-bold">{weeklyReport.totalVolume.toLocaleString()}kg</p>
                  <p className="text-[10px] text-muted-foreground">Volume Total</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3 text-center">
                  <p className="font-mono text-xl font-bold">{weeklyReport.totalSets}</p>
                  <p className="text-[10px] text-muted-foreground">Séries Totais</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-3 text-center">
                  <p className="font-mono text-xl font-bold">{weeklyReport.cardioMinutes}min</p>
                  <p className="text-[10px] text-muted-foreground">Cardio</p>
                </CardContent>
              </Card>
            </div>

            {weightChange && (
              <div className="p-3 rounded-lg bg-secondary/50 text-center">
                <p className="text-xs text-muted-foreground">Peso Corporal</p>
                <p className="font-mono text-lg font-bold">{weightChange.last}kg</p>
                <p className={`font-mono text-xs ${weightChange.diff < 0 ? 'text-success' : weightChange.diff > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                  {weightChange.diff > 0 ? '+' : ''}{weightChange.diff}kg no período
                </p>
              </div>
            )}

            {weeklyReport.bestLifts.length > 0 && (
              <div>
                <p className="text-xs font-display font-bold mb-2">🏆 Melhores Cargas da Semana</p>
                <div className="space-y-1">
                  {weeklyReport.bestLifts.map(([name, weight]) => (
                    <div key={name} className="flex items-center justify-between text-sm py-1">
                      <span className="truncate">{name}</span>
                      <span className="font-mono font-bold">{weight}kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button onClick={() => setShowWeeklyReport(false)} className="w-full">Arrasou! 💪</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Also allow manual view of weekly report */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Button variant="outline" className="w-full" onClick={() => setShowWeeklyReport(true)}>
          📊 Ver Relatório Semanal
        </Button>
      </motion.div>

      {/* Log Weight Dialog */}
      <Dialog open={showLogWeight} onOpenChange={setShowLogWeight}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Registrar Peso</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Peso atual (kg)</Label>
              <Input type="number" placeholder="Ex: 82.5" value={newWeight} onChange={e => setNewWeight(e.target.value)} onKeyDown={e => e.key === 'Enter' && logBodyWeight()} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLogWeight(false)}>Cancelar</Button>
            <Button onClick={logBodyWeight} disabled={!newWeight}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Custom Period Dialog */}
      <Dialog open={showCustom} onOpenChange={setShowCustom}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Período Personalizado</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Data início</Label>
              <Input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} />
            </div>
            <div>
              <Label>Data fim</Label>
              <Input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowCustom(false); setPeriod('7d'); }}>Cancelar</Button>
            <Button onClick={() => setShowCustom(false)} disabled={!customStart || !customEnd}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
