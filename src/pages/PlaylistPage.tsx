import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ListMusic, Plus, Trash2, Edit3, ChevronRight, ChevronDown,
  Dumbbell, ArrowUp, ArrowDown, Loader2, Archive, ArchiveRestore, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Exercise {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
}

interface PlannedExercise {
  id: string;
  exercise_id: string;
  order: number;
  default_sets: number;
  default_reps: number;
  rest_seconds: number;
  notes: string | null;
  exercise?: Exercise;
}

interface WorkoutDay {
  id: string;
  name: string;
  order: number;
  planned_exercises: PlannedExercise[];
}

interface Playlist {
  id: string;
  name: string;
  description: string | null;
  is_archived: boolean;
  created_at: string;
  workout_days: WorkoutDay[];
}

export default function PlaylistPage() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Create playlist dialog
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');

  // Edit playlist state
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  // Add day dialog
  const [showAddDay, setShowAddDay] = useState(false);
  const [newDayName, setNewDayName] = useState('');

  // Add exercise dialog
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [addExerciseDayId, setAddExerciseDayId] = useState<string | null>(null);
  const [exerciseSearch, setExerciseSearch] = useState('');

  // Show archived
  const [showArchived, setShowArchived] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);

    const [playlistsRes, exercisesRes] = await Promise.all([
      supabase
        .from('workout_programs')
        .select('*, workout_days(*, planned_exercises(*, exercises(*)))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('exercises')
        .select('id, name, muscle_group, equipment')
        .eq('is_deleted', false)
        .order('name'),
    ]);

    const raw = (playlistsRes.data || []) as any[];
    const mapped: Playlist[] = raw.map(p => ({
      id: p.id,
      name: p.name,
      description: p.description,
      is_archived: p.is_archived,
      created_at: p.created_at,
      workout_days: (p.workout_days || [])
        .sort((a: any, b: any) => a.order - b.order)
        .map((d: any) => ({
          id: d.id,
          name: d.name,
          order: d.order,
          planned_exercises: (d.planned_exercises || [])
            .sort((a: any, b: any) => a.order - b.order)
            .map((pe: any) => ({
              id: pe.id,
              exercise_id: pe.exercise_id,
              order: pe.order,
              default_sets: pe.default_sets,
              default_reps: pe.default_reps,
              rest_seconds: pe.rest_seconds,
              notes: pe.notes,
              exercise: pe.exercises,
            })),
        })),
    }));

    setPlaylists(mapped);
    setExercises((exercisesRes.data || []) as Exercise[]);
    setLoading(false);
  };

  // ---- CRUD: Playlist ----

  const createPlaylist = async () => {
    if (!user || !newName.trim()) return;
    setActionLoading('create');

    const { data, error } = await supabase.from('workout_programs').insert({
      user_id: user.id,
      name: newName.trim(),
      description: newDesc.trim() || null,
    }).select().single();

    if (error) {
      toast.error('Erro ao criar playlist');
      setActionLoading(null);
      return;
    }

    toast.success('🎵 Playlist criada!');
    setNewName('');
    setNewDesc('');
    setShowCreate(false);
    await loadData();

    // Open the newly created playlist for editing
    const newPlaylist: Playlist = {
      ...data,
      workout_days: [],
    };
    setEditingPlaylist(newPlaylist);
    setActionLoading(null);
  };

  const deletePlaylist = async (playlistId: string) => {
    setActionLoading(playlistId);
    const { error } = await supabase.from('workout_programs').delete().eq('id', playlistId);
    if (error) {
      toast.error('Erro ao excluir playlist');
      setActionLoading(null);
      return;
    }
    toast.success('Playlist excluída');
    if (editingPlaylist?.id === playlistId) setEditingPlaylist(null);
    await loadData();
    setActionLoading(null);
  };

  const toggleArchive = async (playlist: Playlist) => {
    setActionLoading(playlist.id);
    await supabase.from('workout_programs')
      .update({ is_archived: !playlist.is_archived })
      .eq('id', playlist.id);
    toast.success(playlist.is_archived ? 'Playlist restaurada' : 'Playlist arquivada');
    await loadData();
    setActionLoading(null);
  };

  // ---- CRUD: Days ----

  const addDay = async () => {
    if (!editingPlaylist || !newDayName.trim()) return;
    setActionLoading('add-day');

    const order = editingPlaylist.workout_days.length + 1;
    const { error } = await supabase.from('workout_days').insert({
      program_id: editingPlaylist.id,
      name: newDayName.trim(),
      order,
    });

    if (error) {
      toast.error('Erro ao adicionar dia');
      setActionLoading(null);
      return;
    }

    toast.success('Dia adicionado!');
    setNewDayName('');
    setShowAddDay(false);
    await loadData();
    // Refresh editing playlist
    const updated = (await supabase.from('workout_programs')
      .select('*, workout_days(*, planned_exercises(*, exercises(*)))')
      .eq('id', editingPlaylist.id)
      .single()).data;
    if (updated) {
      const mapped = mapPlaylist(updated);
      setEditingPlaylist(mapped);
    }
    setActionLoading(null);
  };

  const deleteDay = async (dayId: string) => {
    if (!editingPlaylist) return;
    setActionLoading(dayId);
    await supabase.from('workout_days').delete().eq('id', dayId);
    toast.success('Dia removido');
    await refreshEditingPlaylist();
    setActionLoading(null);
  };

  // ---- CRUD: Exercises ----

  const addExerciseToDay = async (exercise: Exercise) => {
    if (!addExerciseDayId || !editingPlaylist) return;
    setActionLoading(exercise.id);

    const day = editingPlaylist.workout_days.find(d => d.id === addExerciseDayId);
    const order = (day?.planned_exercises.length || 0) + 1;

    const { error } = await supabase.from('planned_exercises').insert({
      day_id: addExerciseDayId,
      exercise_id: exercise.id,
      order,
      default_sets: 3,
      default_reps: 10,
      rest_seconds: 90,
    });

    if (error) {
      toast.error('Erro ao adicionar exercício');
      setActionLoading(null);
      return;
    }

    toast.success(`${exercise.name} adicionado!`);
    setShowAddExercise(false);
    setExerciseSearch('');
    await refreshEditingPlaylist();
    setActionLoading(null);
  };

  const removeExercise = async (exerciseId: string) => {
    setActionLoading(exerciseId);
    await supabase.from('planned_exercises').delete().eq('id', exerciseId);
    await refreshEditingPlaylist();
    setActionLoading(null);
  };

  const moveExercise = async (dayId: string, exerciseIdx: number, direction: 'up' | 'down') => {
    if (!editingPlaylist) return;
    const day = editingPlaylist.workout_days.find(d => d.id === dayId);
    if (!day) return;

    const swapIdx = direction === 'up' ? exerciseIdx - 1 : exerciseIdx + 1;
    if (swapIdx < 0 || swapIdx >= day.planned_exercises.length) return;

    const current = day.planned_exercises[exerciseIdx];
    const swap = day.planned_exercises[swapIdx];

    await Promise.all([
      supabase.from('planned_exercises').update({ order: swap.order }).eq('id', current.id),
      supabase.from('planned_exercises').update({ order: current.order }).eq('id', swap.id),
    ]);

    await refreshEditingPlaylist();
  };

  const updateExerciseConfig = async (peId: string, field: string, value: number) => {
    await supabase.from('planned_exercises').update({ [field]: value }).eq('id', peId);
    await refreshEditingPlaylist();
  };

  // ---- Helpers ----

  const mapPlaylist = (raw: any): Playlist => ({
    id: raw.id,
    name: raw.name,
    description: raw.description,
    is_archived: raw.is_archived,
    created_at: raw.created_at,
    workout_days: (raw.workout_days || [])
      .sort((a: any, b: any) => a.order - b.order)
      .map((d: any) => ({
        id: d.id,
        name: d.name,
        order: d.order,
        planned_exercises: (d.planned_exercises || [])
          .sort((a: any, b: any) => a.order - b.order)
          .map((pe: any) => ({
            id: pe.id,
            exercise_id: pe.exercise_id,
            order: pe.order,
            default_sets: pe.default_sets,
            default_reps: pe.default_reps,
            rest_seconds: pe.rest_seconds,
            notes: pe.notes,
            exercise: pe.exercises,
          })),
      })),
  });

  const refreshEditingPlaylist = async () => {
    if (!editingPlaylist) return;
    const { data } = await supabase.from('workout_programs')
      .select('*, workout_days(*, planned_exercises(*, exercises(*)))')
      .eq('id', editingPlaylist.id)
      .single();
    if (data) {
      const mapped = mapPlaylist(data);
      setEditingPlaylist(mapped);
    }
    await loadData();
  };

  const toggleDay = (dayId: string) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      if (next.has(dayId)) next.delete(dayId);
      else next.add(dayId);
      return next;
    });
  };

  const totalExercises = (playlist: Playlist) =>
    playlist.workout_days.reduce((sum, d) => sum + d.planned_exercises.length, 0);

  const filteredExercises = exercises.filter(e =>
    e.name.toLowerCase().includes(exerciseSearch.toLowerCase()) ||
    e.muscle_group.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  const activePlaylists = playlists.filter(p => !p.is_archived);
  const archivedPlaylists = playlists.filter(p => p.is_archived);

  // ---- LOADING ----
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando playlists...</p>
      </div>
    );
  }

  // ---- EDITING VIEW ----
  if (editingPlaylist) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setEditingPlaylist(null)}>
              ← Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-display font-bold flex items-center gap-2">
                <ListMusic className="h-6 w-6 text-primary" />
                {editingPlaylist.name}
              </h1>
              {editingPlaylist.description && (
                <p className="text-sm text-muted-foreground">{editingPlaylist.description}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Days */}
        <div className="space-y-3">
          {editingPlaylist.workout_days.map((day, dayIdx) => (
            <motion.div
              key={day.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: dayIdx * 0.05 }}
            >
              <Card>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => toggleDay(day.id)}>
                  <CardTitle className="text-sm font-display flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {expandedDays.has(day.id) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      {day.name}
                      <span className="text-xs text-muted-foreground font-normal">
                        ({day.planned_exercises.length} exercício{day.planned_exercises.length !== 1 ? 's' : ''})
                      </span>
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={(e) => { e.stopPropagation(); deleteDay(day.id); }}
                      disabled={actionLoading === day.id}
                    >
                      {actionLoading === day.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                    </Button>
                  </CardTitle>
                </CardHeader>

                <AnimatePresence>
                  {expandedDays.has(day.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      <CardContent className="space-y-2 pt-0">
                        {day.planned_exercises.map((pe, peIdx) => (
                          <div key={pe.id} className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50">
                            <div className="flex flex-col gap-0.5">
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                                disabled={peIdx === 0}
                                onClick={() => moveExercise(day.id, peIdx, 'up')}
                              >
                                <ArrowUp className="h-3 w-3" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-5 w-5"
                                disabled={peIdx === day.planned_exercises.length - 1}
                                onClick={() => moveExercise(day.id, peIdx, 'down')}
                              >
                                <ArrowDown className="h-3 w-3" />
                              </Button>
                            </div>
                            <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{pe.exercise?.name}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {pe.exercise?.muscle_group} • {pe.default_sets}×{pe.default_reps} • {pe.rest_seconds}s descanso
                              </p>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                              <Input
                                type="number"
                                value={pe.default_sets}
                                onChange={e => updateExerciseConfig(pe.id, 'default_sets', Number(e.target.value))}
                                className="h-7 w-12 text-xs text-center font-mono"
                                title="Séries"
                              />
                              <span className="text-[10px] text-muted-foreground">×</span>
                              <Input
                                type="number"
                                value={pe.default_reps}
                                onChange={e => updateExerciseConfig(pe.id, 'default_reps', Number(e.target.value))}
                                className="h-7 w-12 text-xs text-center font-mono"
                                title="Reps"
                              />
                            </div>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                              onClick={() => removeExercise(pe.id)}
                              disabled={actionLoading === pe.id}
                            >
                              {actionLoading === pe.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <X className="h-3 w-3" />}
                            </Button>
                          </div>
                        ))}

                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full border-dashed"
                          onClick={() => {
                            setAddExerciseDayId(day.id);
                            setShowAddExercise(true);
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Adicionar Exercício
                        </Button>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add Day Button */}
        <Button
          variant="outline"
          className="w-full h-12 border-dashed"
          onClick={() => setShowAddDay(true)}
        >
          <Plus className="h-5 w-5 mr-2" /> Adicionar Dia
        </Button>

        {/* Add Day Dialog */}
        <Dialog open={showAddDay} onOpenChange={setShowAddDay}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Novo Dia de Treino</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Nome do dia</Label>
                <Input
                  placeholder="Ex: Dia A — Peito e Tríceps"
                  value={newDayName}
                  onChange={e => setNewDayName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addDay()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDay(false)}>Cancelar</Button>
              <Button onClick={addDay} disabled={!newDayName.trim() || actionLoading === 'add-day'}>
                {actionLoading === 'add-day' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Criar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Exercise Dialog */}
        <Dialog open={showAddExercise} onOpenChange={setShowAddExercise}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Adicionar Exercício</DialogTitle>
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
                  onClick={() => addExerciseToDay(ex)}
                  disabled={actionLoading === ex.id}
                >
                  <div className="text-left flex items-center gap-3 w-full">
                    <Dumbbell className="h-4 w-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{ex.name}</p>
                      <p className="text-xs text-muted-foreground">{ex.muscle_group} • {ex.equipment}</p>
                    </div>
                    {actionLoading === ex.id && <Loader2 className="h-4 w-4 animate-spin" />}
                  </div>
                </Button>
              ))}
              {filteredExercises.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum exercício encontrado</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ---- DEFAULT LIST VIEW ----
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <ListMusic className="h-8 w-8 text-primary" /> Playlists de Treino
        </h1>
        <p className="text-muted-foreground">Crie e organize suas rotinas de treino.</p>
      </motion.div>

      {/* Create Button */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Button className="w-full h-14 font-display text-base" onClick={() => setShowCreate(true)}>
          <Plus className="h-5 w-5 mr-2" /> Nova Playlist
        </Button>
      </motion.div>

      {/* Active Playlists */}
      <div className="space-y-3">
        {activePlaylists.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8 space-y-3">
                  <ListMusic className="h-12 w-12 mx-auto text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground italic">
                    Nenhuma playlist ainda — crie sua primeira rotina de treino!
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          activePlaylists.map((playlist, idx) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + idx * 0.05 }}
            >
              <Card className="hover:border-primary/30 transition-colors cursor-pointer group"
                onClick={() => { setEditingPlaylist(playlist); setExpandedDays(new Set(playlist.workout_days.map(d => d.id))); }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <ListMusic className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-bold truncate">{playlist.name}</h3>
                      {playlist.description && (
                        <p className="text-xs text-muted-foreground truncate">{playlist.description}</p>
                      )}
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground font-mono">
                        <span>{playlist.workout_days.length} dia{playlist.workout_days.length !== 1 ? 's' : ''}</span>
                        <span>{totalExercises(playlist)} exercício{totalExercises(playlist) !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-yellow-500"
                        onClick={(e) => { e.stopPropagation(); toggleArchive(playlist); }}
                        disabled={actionLoading === playlist.id}
                        title="Arquivar"
                      >
                        {actionLoading === playlist.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Archive className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id); }}
                        disabled={actionLoading === playlist.id}
                        title="Excluir"
                      >
                        {actionLoading === playlist.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </Button>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Archived */}
      {archivedPlaylists.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground text-sm"
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? 'Ocultar' : 'Mostrar'} arquivadas ({archivedPlaylists.length})
          </Button>
          <AnimatePresence>
            {showArchived && archivedPlaylists.map(playlist => (
              <motion.div
                key={playlist.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2"
              >
                <Card className="opacity-60">
                  <CardContent className="py-3 flex items-center gap-3">
                    <ListMusic className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{playlist.name}</p>
                      <p className="text-xs text-muted-foreground">Arquivada</p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleArchive(playlist)}
                      disabled={actionLoading === playlist.id}
                    >
                      {actionLoading === playlist.id
                        ? <Loader2 className="h-3 w-3 animate-spin" />
                        : <><ArchiveRestore className="h-3 w-3 mr-1" /> Restaurar</>
                      }
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deletePlaylist(playlist.id)}
                      disabled={actionLoading === playlist.id}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Create Playlist Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">Nova Playlist de Treino</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome da playlist</Label>
              <Input
                placeholder="Ex: Push Pull Legs, Upper Lower..."
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createPlaylist()}
              />
            </div>
            <div>
              <Label>Descrição (opcional)</Label>
              <Input
                placeholder="Ex: 6x na semana, foco hipertrofia"
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={createPlaylist} disabled={!newName.trim() || actionLoading === 'create'}>
              {actionLoading === 'create' ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
