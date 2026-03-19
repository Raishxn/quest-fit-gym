import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Zap, Waves, Sparkles, Sword } from 'lucide-react';
import { InfoTooltip } from '@/components/ui/info-tooltip';

export function ClassSelectorDialog({ onSelected }: { onSelected?: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [classXPMap, setClassXPMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [archetypeFilter, setArchetypeFilter] = useState('Força');

  useEffect(() => {
    if (open) {
      fetchClasses();
    }
  }, [open]);

  const fetchClasses = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('classes' as any)
      .select('*')
      .order('bonus_value', { ascending: true });
    const { data: xpData } = await supabase.from('user_class_progress' as any).select('*').eq('user_id', user!.id);
    
    setClasses(data || []);
    if (xpData) {
      const xpMap: Record<string, number> = {};
      xpData.forEach((r: any) => xpMap[r.class_id] = r.class_xp);
      setClassXPMap(xpMap);
    }
    setLoading(false);
  };

  const archetypes = ['Força', 'Resistência', 'Equilíbrio', 'Agilidade', 'Cardio', 'Híbrido', 'Disciplina', 'Combate'];

  const selectClass = async (classId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ current_class_id: classId } as any)
      .eq('user_id', user!.id);

    if (error) {
      console.error('Class selection Error:', error);
      toast.error(`Erro ao escolher classe: ${error.message}`);
    } else {
      toast.success('Classe escolhida com sucesso! Seus buffs estão ativos.');
      await refreshProfile();
      setOpen(false);
      if (onSelected) onSelected();
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'text-slate-400';
      case 'Uncommon': return 'text-green-400';
      case 'Rare': return 'text-blue-400';
      case 'Epic': return 'text-purple-400';
      case 'Legendary': return 'text-orange-400';
      case 'Unique': return 'text-red-500 font-bold';
      default: return 'text-slate-400';
    }
  };

  const getRankStats = (xp: number) => {
     if (xp >= 10000) return { title: 'Grão-Mestre', mult: 3.0, next: 10000 };
     if (xp >= 5000) return { title: 'Mestre', mult: 2.5, next: 10000 };
     if (xp >= 2000) return { title: 'Especialista', mult: 2.0, next: 5000 };
     if (xp >= 800) return { title: 'Praticante', mult: 1.5, next: 2000 };
     if (xp >= 200) return { title: 'Aprendiz', mult: 1.2, next: 800 };
     return { title: 'Iniciante', mult: 1.0, next: 200 };
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-auto py-3 px-6 flex-col gap-1 border-primary/20 hover:border-primary/50 bg-primary/5">
          <span className="text-[10px] uppercase font-bold text-muted-foreground">Sua Classe</span>
          <span className="font-display font-bold flex items-center gap-2">
             {profile?.current_class_id ? 'Trocar Especialização' : 'Escolher Classe RPG'} ⚔️
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl flex items-center gap-2">
            O Caminho do Guerreiro
            <InfoTooltip title="Raridades Ocultas" content="As classes são divididas entre Comum, Incomum, Raro, Épico, Lendário e Único. Classes Lendárias ou Únicas fornecem o dobro ou triplo de bônus passivos de XP em comparação às Comuns! Você pode conquistar rolagens de classe novas em missões diárias ou baús que serão implementados." />
          </DialogTitle>
          <DialogDescription>Escolha sua classe para receber buffs passivos de acordo com seu estilo de treino.</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 p-2 overflow-x-auto no-scrollbar border-b border-border">
          {archetypes.map(a => (
            <Button 
              key={a} 
              variant={archetypeFilter === a ? 'default' : 'secondary'} 
              size="sm"
              onClick={() => setArchetypeFilter(a)}
              className="whitespace-nowrap rounded-full px-4"
            >
              {a}
            </Button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
             <div className="py-20 text-center animate-pulse">Consultando oráculos...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="wait">
                {classes.filter(c => c.archetype === archetypeFilter).map(c => {
                  const cxp = classXPMap[c.id] || 0;
                  const stats = getRankStats(cxp);
                  return (
                  <motion.div 
                    key={c.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <Card className={`relative overflow-hidden group border-2 ${profile?.current_class_id === c.id ? 'border-primary' : 'border-border'}`}>
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <span className="text-3xl">{c.icon_emoji}</span>
                          <span className={`text-[10px] font-bold uppercase ${getRarityColor(c.rarity)}`}>{c.rarity}</span>
                        </div>
                        <CardTitle className="text-lg">{c.name}</CardTitle>
                        <CardDescription className="text-xs leading-tight">{c.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="p-3 rounded bg-secondary/30 border border-border space-y-2">
                          <div className="flex justify-between text-[10px] mb-1">
                             <span className="font-bold text-primary">{stats.title}</span>
                             <span className="font-mono text-muted-foreground">{cxp} / {stats.next} XP</span>
                          </div>
                          <div className="w-full bg-black/50 rounded-full h-1.5 overflow-hidden">
                             <div className="bg-primary h-full" style={{ width: `${Math.min(100, (cxp / stats.next) * 100)}%` }} />
                          </div>
                          <div className="grid grid-cols-2 gap-2 mt-2">
                             <div className="bg-primary/10 p-1.5 rounded text-center border border-primary/20">
                               <p className="text-[10px] text-primary font-bold">BUFF</p>
                               <p className="text-xs font-mono">+{Math.round(c.bonus_value * stats.mult)}% {c.bonus_type.replace('_xp', '').substring(0,3).toUpperCase()}</p>
                             </div>
                             {(c.debuff_value && c.debuff_value > 0) ? (
                               <div className="bg-destructive/10 p-1.5 rounded text-center border border-destructive/20">
                                 <p className="text-[10px] text-destructive font-bold">DEBUFF</p>
                                 <p className="text-[10px] font-mono opacity-80 pt-0.5">-{Math.round(c.debuff_value * stats.mult)}% {c.debuff_type ? c.debuff_type.replace('_xp', '').substring(0,3).toUpperCase() : 'OUTROS'}</p>
                               </div>
                             ) : (
                               <div className="bg-secondary/10 p-1.5 rounded text-center border border-secondary/20">
                                 <p className="text-[10px] text-muted-foreground font-bold">DEBUFF</p>
                                 <p className="text-[10px] font-mono opacity-80 pt-0.5">NENHUM</p>
                               </div>
                             )}
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full font-bold" 
                          variant={profile?.current_class_id === c.id ? 'secondary' : 'default'}
                          disabled={profile?.current_class_id === c.id}
                          onClick={() => selectClass(c.id)}
                        >
                          {profile?.current_class_id === c.id ? 'Especializado' : 'Escolher Especialidade'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )})}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
