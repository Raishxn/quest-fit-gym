import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dumbbell, Play, Clock, BarChart3, Users, ListMusic, Plus, X, Timer, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getRankTier, getNextRankInfo, getRankProgress, calculateRank, EXERCISE_RANK_CRITERIA, RANK_UP_MESSAGES } from '@/lib/exercise-ranks';
import { toast } from 'sonner';

interface WorkoutSession {
  id: string;
  status: string;
  started_at: string;
  ended_at: string | null;
  duration_min: number | null;
  total_volume_kg: number | null;
  total_sets: number | null;
  xp_gained: number;
  day_id: string | null;
  program_id: string | null;
}

interface ExerciseOption {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
}

interface SetLog {
  set_number: number;
  weight_kg: number;
  reps: number;
  type: 'warmup' | 'working' | 'backoff';
}

interface ActiveExercise {
  exerciseLogId: string;
  exercise: ExerciseOption;
  sets: SetLog[];
}

export default function WorkoutPage() {
  const { user } = useAuth();
  const [programs, setPrograms] = useState<any[]>([]);
  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [personalRecords, setPersonalRecords] = useState<any[]>([]);
  const [exerciseRanks, setExerciseRanks] = useState<any[]>([]);
  
  // Workout flow state
  const [showModeSelect, setShowModeSelect] = useState(false);
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'solo' | 'party'>('solo');
  
  // Active session state
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [exercises, setExercises] = useState<ExerciseOption[]>([]);
  const [activeExercises, setActiveExercises] = useState<ActiveExercise[]>([]);
  const [showExercisePicker, setShowExercisePicker] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState('');
  const [sessionTimer, setSessionTimer] = useState(0);
  
  // Rank up animation
  const [rankUpInfo, setRankUpInfo] = useState<{ exercise: string; oldRank: string; newRank: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  // Session timer
  useEffect(() => {
    if (!activeSession) return;
    const interval = setInterval(() => {
      const start = new Date(activeSession.started_at).getTime();
      setSessionTimer(Math.floor((Date.now() - start) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [activeSession]);

  const loadData = async () => {
    if (!user) return;
    
    const [programsRes, sessionsRes, prsRes, ranksRes, exercisesRes, activeRes] = await Promise.all([
      supabase.from('workout_programs').select('*, workout_days(*)').eq('user_id', user.id).eq('is_archived', false),
      supabase.from('workout_sessions').select('*').eq('user_id', user.id).eq('status', 'completed').order('started_at', { ascending: false }).limit(5),
      supabase.from('personal_records').select('*, exercises(name, muscle_group)').eq('user_id', user.id),
      supabase.from('exercise_ranks').select('*, exercises(name, muscle_group)').eq('user_id', user.id),
      supabase.from('exercises').select('*').eq('is_deleted', false).order('name'),
      supabase.from('workout_sessions').select('*').eq('user_id', user.id).eq('status', 'active').limit(1),
    ]);

    setPrograms(programsRes.data || []);
    setRecentSessions((sessionsRes.data || []) as WorkoutSession[]);
    setPersonalRecords(prsRes.data || []);
    setExerciseRanks(ranksRes.data || []);
    setExercises((exercisesRes.data || []) as ExerciseOption[]);
    
    if (activeRes.data && activeRes.data.length > 0) {
      setActiveSession(activeRes.data[0] as WorkoutSession);
      // Load exercise logs for active session
      const { data: logs } = await supabase
        .from('exercise_logs')
        .select('*, exercises(*), set_logs(*)')
        .eq('session_id', activeRes.data[0].id)
        .order('order');
      if (logs) {
        setActiveExercises(logs.map((log: any) => ({
          exerciseLogId: log.id,
          exercise: log.exercises,
          sets: (log.set_logs || []).map((s: any) => ({
            set_number: s.set_number,
            weight_kg: s.weight_kg,
            reps: s.reps,
            type: s.type,
          })),
        })));
      }
    }
  };

  const startWorkout = async (mode: 'avulso' | 'playlist', programId?: string, dayId?: string) => {
    if (!user) return;
    setShowTypeSelect(false);
    
    const { data, error } = await supabase.from('workout_sessions').insert({
      user_id: user.id,
      status: 'active' as const,
      program_id: programId || null,
      day_id: dayId || null,
    }).select().single();

    if (error) {
      toast.error('Erro ao iniciar treino: ' + error.message);
      return;
    }

    setActiveSession(data as WorkoutSession);
    setActiveExercises([]);
    toast.success('⚔️ Treino iniciado! Hora de conquistar!');
  };

  const addExerciseToSession = async (exercise: ExerciseOption) => {
    if (!activeSession || !user) return;
    setShowExercisePicker(false);
    setExerciseSearch('');

    const order = activeExercises.length + 1;
    const { data, error } = await supabase.from('exercise_logs').insert({
      session_id: activeSession.id,
      exercise_id: exercise.id,
      order,
    }).select().single();

    if (error) {
      toast.error('Erro ao adicionar exercício');
      return;
    }

    setActiveExercises(prev => [...prev, {
      exerciseLogId: data.id,
      exercise,
      sets: [],
    }]);
  };

  const addSet = async (exerciseIdx: number) => {
    const ae = activeExercises[exerciseIdx];
    if (!ae) return;

    const setNumber = ae.sets.length + 1;
    const lastSet = ae.sets[ae.sets.length - 1];

    const { error } = await supabase.from('set_logs').insert({
      exercise_log_id: ae.exerciseLogId,
      set_number: setNumber,
      weight_kg: lastSet?.weight_kg || 0,
      reps: lastSet?.reps || 10,
      type: 'working' as const,
    });

    if (error) {
      toast.error('Erro ao adicionar série');
      return;
    }

    setActiveExercises(prev => prev.map((e, i) =>
      i === exerciseIdx ? { ...e, sets: [...e.sets, { set_number: setNumber, weight_kg: lastSet?.weight_kg || 0, reps: lastSet?.reps || 10, type: 'working' as const }] } : e
    ));
  };

  const updateSet = async (exerciseIdx: number, setIdx: number, field: 'weight_kg' | 'reps', value: number) => {
    setActiveExercises(prev => prev.map((e, i) =>
      i === exerciseIdx ? {
        ...e,
        sets: e.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s),
      } : e
    ));
  };

  const saveSetToDb = async (exerciseIdx: number, setIdx: number) => {
    const ae = activeExercises[exerciseIdx];
    const set = ae?.sets[setIdx];
    if (!ae || !set) return;

    await supabase.from('set_logs')
      .update({ weight_kg: set.weight_kg, reps: set.reps })
      .eq('exercise_log_id', ae.exerciseLogId)
      .eq('set_number', set.set_number);

    // Check rank progression
    await checkRankProgression(ae.exercise, set.weight_kg, set.reps);
  };

  const checkRankProgression = async (exercise: ExerciseOption, weightKg: number, reps: number) => {
    if (!user) return;
    const criteria = EXERCISE_RANK_CRITERIA[exercise.name];
    if (!criteria) return;

    const newRank = calculateRank(exercise.name, weightKg, reps);
    const existing = exerciseRanks.find(r => r.exercise_id === exercise.id);
    const currentRank = existing?.current_rank || 'Ferro';

    const currentIdx = ['Ferro', 'Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante', 'Mestre', 'Grão-Mestre', 'Lendário', 'Transcendente'].indexOf(currentRank);
    const newIdx = ['Ferro', 'Bronze', 'Prata', 'Ouro', 'Platina', 'Diamante', 'Mestre', 'Grão-Mestre', 'Lendário', 'Transcendente'].indexOf(newRank);

    if (newIdx > currentIdx) {
      // Rank up!
      if (existing) {
        await supabase.from('exercise_ranks').update({
          current_rank: newRank,
          best_weight_kg: weightKg,
          best_reps: reps,
          updated_at: new Date().toISOString(),
        }).eq('id', existing.id);
      } else {
        await supabase.from('exercise_ranks').insert({
          user_id: user.id,
          exercise_id: exercise.id,
          current_rank: newRank,
          best_weight_kg: weightKg,
          best_reps: reps,
        });
      }

      setRankUpInfo({ exercise: exercise.name, oldRank: currentRank, newRank });
      setExerciseRanks(prev => {
        const filtered = prev.filter(r => r.exercise_id !== exercise.id);
        return [...filtered, { exercise_id: exercise.id, current_rank: newRank, best_weight_kg: weightKg, best_reps: reps, exercises: exercise }];
      });
    } else if (weightKg > (existing?.best_weight_kg || 0)) {
      // Update best without rank change
      if (existing) {
        await supabase.from('exercise_ranks').update({ best_weight_kg: weightKg, best_reps: reps }).eq('id', existing.id);
      } else {
        await supabase.from('exercise_ranks').insert({
          user_id: user.id,
          exercise_id: exercise.id,
          current_rank: 'Ferro',
          best_weight_kg: weightKg,
          best_reps: reps,
        });
      }
    }
  };

  const finishWorkout = async () => {
    if (!activeSession || !user) return;

    const totalSets = activeExercises.reduce((sum, e) => sum + e.sets.length, 0);
    const totalVolume = activeExercises.reduce((sum, e) =>
      sum + e.sets.reduce((s, set) => s + set.weight_kg * set.reps, 0), 0);
    const durationMin = Math.floor(sessionTimer / 60);
    const xpGained = Math.floor(totalSets * 5 + totalVolume * 0.01 + durationMin * 2);

    await supabase.from('workout_sessions').update({
      status: 'completed' as const,
      ended_at: new Date().toISOString(),
      duration_min: durationMin,
      total_volume_kg: totalVolume,
      total_sets: totalSets,
      xp_gained: xpGained,
    }).eq('id', activeSession.id);

    // Add XP
    await supabase.from('xp_transactions').insert({
      user_id: user.id,
      amount: xpGained,
      source: 'workout',
      source_id: activeSession.id,
    });

    // Update profile XP
    await supabase.from('profiles').update({
      xp: (await supabase.from('profiles').select('xp').eq('user_id', user.id).single()).data?.xp + xpGained,
    }).eq('user_id', user.id);

    toast.success(`🎉 Treino finalizado! +${xpGained} XP — ${totalSets} séries, ${totalVolume.toLocaleString()}kg volume`);
    setActiveSession(null);
    setActiveExercises([]);
    loadData();
  };

  const abandonWorkout = async () => {
    if (!activeSession) return;
    await supabase.from('workout_sessions').update({ status: 'abandoned' as const, ended_at: new Date().toISOString() }).eq('id', activeSession.id);
    setActiveSession(null);
    setActiveExercises([]);
    toast('Treino abandonado');
    loadData();
  };

  const formatTimer = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
  };

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    e.muscle_group.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  // ---- ACTIVE SESSION VIEW ----
  if (activeSession) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        {/* Timer Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-primary/30 glow-primary">
            <CardContent className="pt-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Timer className="h-6 w-6 text-primary animate-pulse" />
                <span className="font-mono text-3xl font-bold text-primary">{formatTimer(sessionTimer)}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="destructive" size="sm" onClick={abandonWorkout}>Abandonar</Button>
                <Button size="sm" onClick={finishWorkout} className="font-display">
                  <Check className="h-4 w-4 mr-1" /> Finalizar
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Exercises */}
        {activeExercises.map((ae, exIdx) => {
          const rank = exerciseRanks.find(r => r.exercise_id === ae.exercise.id);
          const rankTier = getRankTier(rank?.current_rank || 'Ferro');
          const nextRank = getNextRankInfo(ae.exercise.name, rank?.current_rank || 'Ferro');
          const progress = getRankProgress(ae.exercise.name, rank?.current_rank || 'Ferro', rank?.best_weight_kg || 0);

          return (
            <motion.div key={ae.exerciseLogId} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-display flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-primary" />
                      {ae.exercise.name}
                      <span className="text-xs text-muted-foreground">({ae.exercise.muscle_group})</span>
                    </span>
                    <span
                      className="text-sm cursor-help"
                      title={nextRank ? `Próximo: ${nextRank.nextRank.name} — ${nextRank.criteria.weightKg}kg × ${nextRank.criteria.reps}` : 'Rank máximo!'}
                      style={{ color: rankTier.color.startsWith('linear') ? '#F59E0B' : rankTier.color }}
                    >
                      {rankTier.icon} {rankTier.name}
                    </span>
                  </CardTitle>
                  {nextRank && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, backgroundColor: rankTier.color.startsWith('linear') ? '#F59E0B' : rankTier.color }} />
                      </div>
                      <span className="text-[10px] text-muted-foreground font-mono">{Math.round(progress)}%</span>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  {/* Set Headers */}
                  {ae.sets.length > 0 && (
                    <div className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 text-[10px] text-muted-foreground font-mono">
                      <span>Série</span><span>Peso (kg)</span><span>Reps</span><span></span>
                    </div>
                  )}
                  {ae.sets.map((set, setIdx) => (
                    <div key={setIdx} className="grid grid-cols-[40px_1fr_1fr_40px] gap-2 items-center">
                      <span className="font-mono text-xs text-muted-foreground text-center">{set.set_number}</span>
                      <Input
                        type="number"
                        value={set.weight_kg}
                        onChange={e => updateSet(exIdx, setIdx, 'weight_kg', Number(e.target.value))}
                        onBlur={() => saveSetToDb(exIdx, setIdx)}
                        className="h-8 font-mono text-sm"
                      />
                      <Input
                        type="number"
                        value={set.reps}
                        onChange={e => updateSet(exIdx, setIdx, 'reps', Number(e.target.value))}
                        onBlur={() => saveSetToDb(exIdx, setIdx)}
                        className="h-8 font-mono text-sm"
                      />
                      <Check className="h-4 w-4 text-success mx-auto" />
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full" onClick={() => addSet(exIdx)}>
                    <Plus className="h-3 w-3 mr-1" /> Série
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}

        {/* Add Exercise Button */}
        <Button variant="outline" className="w-full h-12 border-dashed" onClick={() => setShowExercisePicker(true)}>
          <Plus className="h-5 w-5 mr-2" /> Adicionar Exercício
        </Button>

        {/* Exercise Picker Dialog */}
        <Dialog open={showExercisePicker} onOpenChange={setShowExercisePicker}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Escolher Exercício</DialogTitle>
            </DialogHeader>
            <Input
              placeholder="Buscar exercício..."
              value={exerciseSearch}
              onChange={e => setExerciseSearch(e.target.value)}
              className="mb-3"
            />
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {filteredExercises.map(ex => (
                <Button
                  key={ex.id}
                  variant="ghost"
                  className="w-full justify-start h-auto py-2"
                  onClick={() => addExerciseToSession(ex)}
                >
                  <div className="text-left">
                    <p className="font-medium text-sm">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">{ex.muscle_group} • {ex.equipment}</p>
                  </div>
                </Button>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Rank Up Animation */}
        <AnimatePresence>
          {rankUpInfo && (
            <Dialog open={!!rankUpInfo} onOpenChange={() => setRankUpInfo(null)}>
              <DialogContent className="text-center space-y-4">
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 10 }}>
                  <p className="text-5xl mb-2">{getRankTier(rankUpInfo.newRank).icon}</p>
                  <h2 className="text-2xl font-display font-bold">RANK UP!</h2>
                  <p className="text-muted-foreground">{rankUpInfo.exercise}</p>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <span style={{ color: getRankTier(rankUpInfo.oldRank).color }}>{getRankTier(rankUpInfo.oldRank).icon} {rankUpInfo.oldRank}</span>
                    <span className="text-xl">→</span>
                    <span className="font-bold text-lg" style={{ color: getRankTier(rankUpInfo.newRank).color.startsWith('linear') ? '#F59E0B' : getRankTier(rankUpInfo.newRank).color }}>
                      {getRankTier(rankUpInfo.newRank).icon} {rankUpInfo.newRank}
                    </span>
                  </div>
                  <p className="text-sm text-primary italic mt-4">
                    {RANK_UP_MESSAGES[Math.floor(Math.random() * RANK_UP_MESSAGES.length)]}
                  </p>
                </motion.div>
                <Button onClick={() => setRankUpInfo(null)} className="font-display">Épico! ⚔️</Button>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ---- DEFAULT VIEW ----
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
              <p className="text-sm text-muted-foreground">Escolha como quer treinar</p>
              <Button className="w-full sm:w-auto font-display" onClick={() => setShowModeSelect(true)}>
                ⚔️ Começar Sessão
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Mode Select Dialog (Solo/Party) */}
      <Dialog open={showModeSelect} onOpenChange={setShowModeSelect}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Como quer treinar?</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-auto p-6 flex-col gap-2" onClick={() => { setSelectedMode('solo'); setShowModeSelect(false); setShowTypeSelect(true); }}>
              <Dumbbell className="h-8 w-8 text-primary" />
              <span className="font-display font-bold">Solo</span>
              <span className="text-xs text-muted-foreground">Treino individual</span>
            </Button>
            <Button variant="outline" className="h-auto p-6 flex-col gap-2 opacity-50" disabled>
              <Users className="h-8 w-8 text-muted-foreground" />
              <span className="font-display font-bold">Party</span>
              <span className="text-xs text-muted-foreground">Em breve — treine com amigos!</span>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Type Select Dialog (Avulso/Playlist) */}
      <Dialog open={showTypeSelect} onOpenChange={setShowTypeSelect}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Tipo de treino</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="outline" className="h-auto p-6 flex-col gap-2" onClick={() => startWorkout('avulso')}>
              <Plus className="h-8 w-8 text-primary" />
              <span className="font-display font-bold">Avulso</span>
              <span className="text-xs text-muted-foreground">Adicione exercícios livremente</span>
            </Button>
            <Button variant="outline" className="h-auto p-6 flex-col gap-2" disabled={programs.length === 0}
              onClick={() => {/* handled below via playlist selection */}}>
              <ListMusic className="h-8 w-8 text-primary" />
              <span className="font-display font-bold">Por Playlist</span>
              <span className="text-xs text-muted-foreground">
                {programs.length > 0 ? `${programs.length} playlist(s) salva(s)` : 'Nenhuma playlist — crie uma primeiro'}
              </span>
            </Button>
          </div>

          {/* Playlist selector */}
          {programs.length > 0 && (
            <div className="space-y-2 mt-4 border-t border-border pt-4">
              <p className="text-sm font-display font-medium">Escolha a playlist e o dia:</p>
              {programs.map((prog: any) => (
                <div key={prog.id} className="rounded-lg border border-border overflow-hidden">
                  <div className="p-3 bg-secondary/30">
                    <p className="font-medium text-sm flex items-center gap-2">
                      <ListMusic className="h-4 w-4 text-primary" />
                      {prog.name}
                    </p>
                  </div>
                  <div className="divide-y divide-border">
                    {(prog.workout_days || []).length === 0 ? (
                      <p className="text-xs text-muted-foreground italic p-3">Nenhum dia cadastrado</p>
                    ) : (
                      (prog.workout_days || [])
                        .sort((a: any, b: any) => a.order - b.order)
                        .map((day: any) => (
                          <Button
                            key={day.id}
                            variant="ghost"
                            className="w-full justify-start rounded-none h-auto py-2.5 px-4"
                            onClick={() => startWorkout('playlist', prog.id, day.id)}
                          >
                            <Dumbbell className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                            <span className="text-sm">{day.name}</span>
                          </Button>
                        ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Recent Sessions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" /> Histórico Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentSessions.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <Dumbbell className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="text-sm text-muted-foreground italic">Nenhuma sessão ainda — comece sua jornada!</p>
                </div>
              ) : (
                recentSessions.map(session => (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Dumbbell className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{new Date(session.started_at).toLocaleDateString('pt-BR')}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground font-mono">
                        <span>{session.duration_min}min</span>
                        <span>{session.total_volume_kg?.toLocaleString()}kg</span>
                        <span className="text-primary">+{session.xp_gained} XP</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Exercise Ranks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-display flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Ranks por Exercício
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exerciseRanks.length === 0 ? (
                <div className="text-center py-6 space-y-2">
                  <p className="text-2xl">⚙️</p>
                  <p className="text-sm text-muted-foreground italic">Todos os exercícios começam em Ferro. Registre séries para subir!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {exerciseRanks.map(rank => {
                    const tier = getRankTier(rank.current_rank);
                    return (
                      <div key={rank.exercise_id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                        <span style={{ color: tier.color.startsWith('linear') ? '#F59E0B' : tier.color }}>{tier.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium truncate">{rank.exercises?.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono" style={{ color: tier.color.startsWith('linear') ? '#F59E0B' : tier.color }}>
                            {tier.name} • {rank.best_weight_kg}kg × {rank.best_reps}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
