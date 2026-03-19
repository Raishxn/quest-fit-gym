import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export function UpdatePopup() {
  const [update, setUpdate] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      // Busca a atualização mais recente do banco
      const { data, error } = await supabase
        .from('app_updates')
        .select('*')
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const lastSeen = localStorage.getItem('last_seen_update_version');
        // Só mostra se for uma versão nova que o usuário ainda não fechou
        if (lastSeen !== data.version) {
          setUpdate(data);
          setOpen(true);
        }
      }
    };
    
    checkUpdate();
  }, []);

  const handleClose = (isOpen: boolean) => {
    if (!isOpen && update) {
      localStorage.setItem('last_seen_update_version', update.version);
      setOpen(false);
    }
  };

  const handleAcknowledge = () => {
    if (update) {
      localStorage.setItem('last_seen_update_version', update.version);
    }
    setOpen(false);
  };

  if (!update) return null;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md border-primary/50 shadow-[0_0_40px_rgba(var(--primary),0.15)] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display text-primary">
            <Sparkles className="w-6 h-6" /> Atualização {update.version}
          </DialogTitle>
          <DialogDescription className="font-bold text-foreground text-lg pt-1">
            {update.title}
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground opacity-90">
            {update.body}
          </p>
        </div>
        
        <DialogFooter className="pt-4">
          <Button onClick={handleAcknowledge} className="w-full font-bold text-md h-12">
            Incrível! Entendido 🚀
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
