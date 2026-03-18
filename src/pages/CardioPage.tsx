import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Timer, Route, Flame as FlameIcon, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const cardioTypes = [
  { type: 'running', label: 'Corrida', emoji: '🏃' },
  { type: 'cycling', label: 'Bike', emoji: '🚴' },
  { type: 'swimming', label: 'Natação', emoji: '🏊' },
  { type: 'walking', label: 'Caminhada', emoji: '🚶' },
  { type: 'elliptical', label: 'Elíptico', emoji: '⛹️' },
  { type: 'rowing', label: 'Remo', emoji: '🚣' },
  { type: 'jump_rope', label: 'Pular Corda', emoji: '🎯' },
  { type: 'other', label: 'Outro', emoji: '💪' },
];

export default function CardioPage() {
  const { user, profile } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [showNewSession, setShowNewSession] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [duration, setDuration] = useState(30);
  const [distance, setDistance] = useState<number | ''>('');
  const [calories, setCalories] = useState<number | ''>('');

  useEffect(() => {
    if (!user) return;
    supabase.from('cardio_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(20)
      .then(({ data }) => setSessions(data || []));
  }, [user]);

  const saveSession = async () => {
    if (!user || !selectedType) return;
    const xpGained = Math.floor(duration * 1.5 + (Number(distance) || 0) * 5);

    const { error } = await supabase.from('cardio_sessions').insert({
      user_id: user.id,
      type: selectedType,
      duration_minutes: duration,
      distance_km: Number(distance) || null,
      calories_burned: Number(calories) || null,
      xp_gained: xpGained,
    });

    if (error) { toast.error('Erro ao salvar'); return; }

    // Add XP
    await supabase.from('xp_transactions').insert({ user_id: user.id, amount: xpGained, source: 'cardio' });

    toast.success(`Cardio salvo! +${xpGained} XP 🏃`);
    setShowNewSession(false);
    setSelectedType('');
    
    // Reload
    const { data } = await supabase.from('cardio_sessions').select('*').eq('user_id', user.id).order('started_at', { ascending: false }).limit(20);
    setSessions(data || []);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Activity className="h-8 w-8 text-attr-end" /> Cardio
        </h1>
        <p className="text-muted-foreground">Registre suas sessões de cardio e acompanhe seu progresso.</p>
      </motion.div>

      {/* Type Selector */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Nova Sessão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {cardioTypes.map(ct => (
                <Button key={ct.type} variant="outline" className="h-auto py-3 flex-col gap-1 hover:border-primary hover:bg-primary/5"
                  onClick={() => { setSelectedType(ct.type); setShowNewSession(true); }}>
                  <span className="text-2xl">{ct.emoji}</span>
                  <span className="text-[10px]">{ct.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Attributes */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4 text-center space-y-2">
              <span className="text-2xl">🛡️</span>
              <p className="text-xs text-muted-foreground">END (Resistência)</p>
              <p className="font-mono text-2xl font-bold">{profile?.endAttr || 1}</p>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-attr-end rounded-full" style={{ width: `${Math.min(100, (profile?.endAttr || 1))}%` }} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 text-center space-y-2">
              <span className="text-2xl">⚡</span>
              <p className="text-xs text-muted-foreground">AGI (Agilidade)</p>
              <p className="font-mono text-2xl font-bold">{profile?.agiAttr || 1}</p>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <div className="h-full bg-attr-agi rounded-full" style={{ width: `${Math.min(100, (profile?.agiAttr || 1))}%` }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Recent Sessions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display">Últimas Sessões</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {sessions.length === 0 ? (
              <div className="text-center py-6 space-y-2">
                <Activity className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground italic">Nenhuma sessão de cardio ainda — dê o primeiro passo!</p>
              </div>
            ) : (
              sessions.map(session => {
                const ct = cardioTypes.find(t => t.type === session.type);
                return (
                  <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
                    <span className="text-2xl">{ct?.emoji || '💪'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{ct?.label || session.type}</p>
                      <div className="flex gap-3 text-xs text-muted-foreground font-mono">
                        <span className="flex items-center gap-1"><Timer className="h-3 w-3" />{session.duration_minutes}min</span>
                        {session.distance_km && <span className="flex items-center gap-1"><Route className="h-3 w-3" />{session.distance_km}km</span>}
                        {session.calories_burned && <span className="flex items-center gap-1"><FlameIcon className="h-3 w-3" />{session.calories_burned}kcal</span>}
                        <span className="text-primary">+{session.xp_gained} XP</span>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{new Date(session.started_at).toLocaleDateString('pt-BR')}</span>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* New Session Dialog */}
      <Dialog open={showNewSession} onOpenChange={setShowNewSession}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {cardioTypes.find(t => t.type === selectedType)?.emoji} Registrar {cardioTypes.find(t => t.type === selectedType)?.label}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Duração (min)</Label>
              <Input type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Distância (km) — opcional</Label>
              <Input type="number" value={distance} onChange={e => setDistance(e.target.value ? Number(e.target.value) : '')} />
            </div>
            <div className="space-y-2">
              <Label>Calorias — opcional</Label>
              <Input type="number" value={calories} onChange={e => setCalories(e.target.value ? Number(e.target.value) : '')} />
            </div>
            <Button className="w-full font-display" onClick={saveSession}>Salvar Sessão</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
