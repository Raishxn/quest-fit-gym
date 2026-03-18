import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { fetchUserTitles, updateSelectedTitle } from '@/lib/titles';
import { Check, Star } from 'lucide-react';
import { toast } from 'sonner';

interface TitleSelectorProps {
  currentTitleId?: string | null;
  onTitleChange?: () => void;
}

export function TitleSelector({ currentTitleId, onTitleChange }: TitleSelectorProps) {
  const { user } = useAuth();
  const [titles, setTitles] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && user) {
      loadTitles();
    }
  }, [isOpen, user]);

  const loadTitles = async () => {
    setLoading(true);
    const data = await fetchUserTitles(user!.id);
    setTitles(data);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 text-xs border-primary/30 text-primary hover:bg-primary/20">
          Trocar Título
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-border">
        <DialogHeader>
          <DialogTitle>Seus Títulos</DialogTitle>
          <DialogDescription>Escolha um título para exibir no seu perfil.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-2 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          <button
            onClick={() => handleSelect(null)}
            className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${!currentTitleId ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
          >
            <span className="text-sm font-medium">Nenhum Título</span>
            {!currentTitleId && <Check className="w-4 h-4 text-primary" />}
          </button>
          
          {loading ? (
             <p className="text-center text-sm text-muted-foreground py-4">Carregando títulos...</p>
          ) : titles.length === 0 ? (
             <p className="text-center text-sm text-muted-foreground py-4">Você ainda não desbloqueou nenhum título.</p>
          ) : (
            titles.map((t) => (
              <button
                key={t.title.id}
                onClick={() => handleSelect(t.title.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all text-left ${currentTitleId === t.title.id ? 'border-primary bg-primary/10' : 'border-border bg-background hover:border-primary/50'}`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    {(t.title.rarity === 'Legendary' || t.title.rarity === 'Lendário' || t.title.rarity === 'Mythic' || t.title.rarity === 'Mítico') ? <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" /> : null}
                    <span className={`text-sm font-bold ${(t.title.rarity === 'Legendary' || t.title.rarity === 'Lendário') ? 'text-yellow-500' : (t.title.rarity === 'Epic' || t.title.rarity === 'Épico') ? 'text-purple-500' : 'text-primary'}`}>
                      {t.title.name}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.title.description}</p>
                </div>
                {currentTitleId === t.title.id && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
