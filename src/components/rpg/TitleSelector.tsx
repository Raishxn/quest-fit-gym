import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetchUserTitles, updateSelectedTitle, fetchAllTitles, unlockTitle } from '@/lib/titles';
import { Check, Star, Lock, Unlock } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

interface TitleSelectorProps {
  currentTitleId?: string | null;
  onTitleChange?: () => void;
}

export function TitleSelector({ currentTitleId, onTitleChange }: TitleSelectorProps) {
  const { user, profile } = useAuth();
  const [userTitles, setUserTitles] = useState<any[]>([]);
  const [allTitles, setAllTitles] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('unlocked');

  useEffect(() => {
    if (isOpen && user) {
      loadTitles();
    }
  }, [isOpen, user]);

  const loadTitles = async () => {
    setLoading(true);
    const [uTitles, aTitles] = await Promise.all([
      fetchUserTitles(user!.id),
      fetchAllTitles()
    ]);
    
    setUserTitles(uTitles);
    setAllTitles(aTitles);
    setLoading(false);
  };

  const handleSelect = async (id: string | null) => {
    try {
      await updateSelectedTitle(user!.id, id);
      toast.success('Título atualizado com sucesso!');
      setIsOpen(false);
      if (onTitleChange) onTitleChange();
    } catch (err) {
      toast.error('Erro ao atualizar título');
    }
  };

  const handleClaim = async (titleId: string) => {
    try {
      await unlockTitle(user!.id, titleId);
      toast.success('Título Reivindicado! 🎉');
      await loadTitles();
    } catch (err) {
      toast.error('Erro ao reivindicar título.');
    }
  };

  const getRequirementText = (type: string, value: number) => {
    switch (type) {
      case 'level': return `Chegar ao Nível ${value}`;
      case 'streak': return `Manter ofensiva de ${value} dias`;
      case 'str_attr': return `Atingir ${value} de Força`;
      case 'agi_attr': return `Atingir ${value} de Agilidade`;
      case 'vit_attr': return `Atingir ${value} de Vitalidade`;
      case 'end_attr': return `Atingir ${value} de Resistência`;
      case 'manual': return `Conquista Oculta / Evento`;
      default: return `Requisito Desconhecido`;
    }
  };

  const checkEligibility = (type: string, value: number) => {
    if (!profile) return false;
    switch (type) {
      case 'level': return profile.level >= value;
      case 'streak': return profile.streak >= value;
      case 'str_attr': return profile.strAttr >= value;
      case 'agi_attr': return profile.agiAttr >= value;
      case 'vit_attr': return profile.vitAttr >= value;
      case 'end_attr': return profile.endAttr >= value;
      case 'manual': return false; // Somente via admin
      default: return false;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/20">
          Trocar Título
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl bg-card/95 backdrop-blur-xl border-border max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Seus Títulos</DialogTitle>
          <DialogDescription>Desbloqueie conquistas e se exiba no ranking!</DialogDescription>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={setTab} className="mt-2 flex-col flex overflow-hidden">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="unlocked">Desbloqueados</TabsTrigger>
            <TabsTrigger value="locked">Próximas Conquistas</TabsTrigger>
          </TabsList>
          
          <TabsContent value="unlocked" className="space-y-2 mt-4 overflow-y-auto px-1 custom-scrollbar pb-6 flex-1">
            <button
              onClick={() => handleSelect(null)}
              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${!currentTitleId ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
            >
              <span className="text-sm font-medium">Nenhum Título</span>
              {!currentTitleId && <Check className="w-4 h-4 text-primary" />}
            </button>
            
            {loading ? (
               <p className="text-center text-sm text-muted-foreground py-4">Carregando...</p>
            ) : userTitles.length === 0 ? (
               <p className="text-center text-sm text-muted-foreground py-4">Você ainda não possui títulos disponíveis.</p>
            ) : (
              userTitles.map((t) => (
                <button
                  key={t.title.id}
                  onClick={() => handleSelect(t.title.id)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${currentTitleId === t.title.id ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      {t.title.is_unique && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                      <span className={`text-sm font-bold ${t.title.is_unique ? 'text-yellow-500' : 'text-primary'}`}>
                        {t.title.name}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.title.description}</p>
                    <p className="text-[10px] text-accent font-bold mt-1 uppercase">+{t.title.buff_value}% {t.title.buff_type}</p>
                  </div>
                  {currentTitleId === t.title.id && <Check className="w-4 h-4 text-primary" />}
                </button>
              ))
            )}
          </TabsContent>

          <TabsContent value="locked" className="space-y-2 mt-4 overflow-y-auto px-1 custom-scrollbar pb-6 flex-1">
            {loading ? (
               <p className="text-center text-sm text-muted-foreground py-4">Carregando...</p>
            ) : allTitles.length === 0 ? (
               <p className="text-center text-sm text-muted-foreground py-4">Nenhum título encontrado.</p>
            ) : (
              allTitles
                .filter(a => !userTitles.some(u => u.title_id === a.id))
                .filter(a => !a.is_unique || checkEligibility(a.requirement_type, a.requirement_value)) // Hide unique if not eligible
                .map((t) => {
                  const eligible = checkEligibility(t.requirement_type, t.requirement_value);

                  return (
                    <div
                      key={t.id}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border border-secondary/20 bg-secondary/10 text-left opacity-80`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-bold text-foreground">
                            {t.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[10px] bg-secondary px-2 py-0.5 rounded text-foreground">
                             Requisito: {getRequirementText(t.requirement_type, t.requirement_value)}
                           </span>
                           <span className="text-[10px] text-accent font-bold uppercase">
                             Buff: +{t.buff_value}% {t.buff_type}
                           </span>
                        </div>
                      </div>
                      
                      {eligible ? (
                        <Button 
                          size="sm" 
                          variant="default"
                          className="shrink-0 ml-4 font-bold"
                          onClick={() => handleClaim(t.id)}
                        >
                          <Unlock className="w-3 h-3 mr-1" /> Reivindicar
                        </Button>
                      ) : (
                        <span className="text-[10px] font-bold text-muted-foreground ml-4 uppercase tracking-wider shrink-0 bg-secondary/40 px-2 py-1 rounded">
                          Bloqueado
                        </span>
                      )}
                    </div>
                  );
                })
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
