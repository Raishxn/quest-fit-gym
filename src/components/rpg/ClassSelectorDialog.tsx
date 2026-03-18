import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Target, Zap, Waves, Sparkles, Sword } from 'lucide-react';

export function ClassSelectorDialog({ onSelected }: { onSelected?: () => void }) {
  const { user, profile, refreshProfile } = useAuth();
  const [open, setOpen] = useState(false);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [archetypeFilter, setArchetypeFilter] = useState('Guerreiro');

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
    setClasses(data || []);
    setLoading(false);
  };

  const archetypes = ['Guerreiro', 'Ranger', 'Mago', 'Monge', 'Paladino', 'Assassino', 'Bardo', 'Druida'];

  const selectClass = async (classId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ current_class_id: classId } as any)
      .eq('user_id', user!.id);

    if (error) {
      toast.error('Erro ao escolher classe.');
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
          <DialogTitle className="font-display text-2xl">O Caminho do Guerreiro</DialogTitle>
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
                {classes.filter(c => c.archetype === archetypeFilter).map(c => (
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
                        <div className="p-2 rounded bg-secondary/50 border border-border">
                          <p className="text-xs font-mono text-primary flex items-center gap-1">
                             <Sparkles className="w-3 h-3"/> +{Math.round((c.bonus_value - 1) * 100)}% {c.bonus_type.replace('_xp', '').toUpperCase()}
                          </p>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full" 
                          variant={profile?.current_class_id === c.id ? 'secondary' : 'default'}
                          disabled={profile?.current_class_id === c.id}
                          onClick={() => selectClass(c.id)}
                        >
                          {profile?.current_class_id === c.id ? 'Especializado' : 'Escolher Especialidade'}
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
