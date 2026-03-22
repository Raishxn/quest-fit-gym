import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Sword } from 'lucide-react';

interface ChallengeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetUser: any;
}

export function ChallengeDialog({ open, onOpenChange, targetUser }: ChallengeDialogProps) {
  const { user } = useAuth();
  const [challengeType, setChallengeType] = useState('volume_week');
  const [loading, setLoading] = useState(false);

  const handleSendChallenge = async () => {
    if (!user || !targetUser) return;
    setLoading(true);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7); // 7 days challenge

    const { error } = await supabase.from('challenges').insert({
      creator_id: user.id,
      target_id: targetUser.user_id || targetUser.id,
      type: challengeType,
      status: 'pending',
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString()
    });

    setLoading(false);

    if (error) {
      toast.error('Erro ao enviar desafio');
      console.error(error);
    } else {
      toast.success('Desafio enviado com sucesso! ⚔️');
      onOpenChange(false);
    }
  };

  if (!targetUser) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display text-xl text-primary">
            <Sword className="h-6 w-6" /> Desafiar Guerreiro
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 pt-4">
          <div className="text-center">
            <p className="text-muted-foreground mb-2">Você está desafiando:</p>
            <div className="flex items-center justify-center gap-3 bg-secondary/30 p-3 rounded-xl border border-border">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary border border-primary">
                {targetUser.avatar_url ? (
                  <img src={targetUser.avatar_url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-primary">
                     {targetUser.name?.charAt(0) || '?'}
                  </div>
                )}
              </div>
              <div className="text-left">
                <p className="font-bold font-display">{targetUser.name}</p>
                <p className="text-xs text-muted-foreground">Nv. {targetUser.level || 1} {targetUser.class_name}</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Tipo do Desafio (Duração: 7 Dias)</label>
            <Select value={challengeType} onValueChange={setChallengeType}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="volume_week">Quem levanta mais peso (Volume Total)</SelectItem>
                <SelectItem value="workouts_week">Quem conclui mais treinos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            className="w-full font-display text-lg h-12" 
            onClick={handleSendChallenge}
            disabled={loading}
          >
            {loading ? 'Enviando...' : 'Lançar Desafio! 🏹'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
