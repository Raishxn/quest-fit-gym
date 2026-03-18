import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Users, Copy, Play } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (val: boolean) => void;
  onStartPartyWorkout: (partyId: string) => void;
}

export function PartyLobbyDialog({ open, onOpenChange, onStartPartyWorkout }: Props) {
  const { user } = useAuth();
  const [activeParty, setActiveParty] = useState<any>(null);
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    if (open && user) {
      checkExistingParty();
    }
  }, [open, user]);

  const checkExistingParty = async () => {
    setLoading(true);
    const { data: memberData } = (await supabase.from('party_members' as any).select('party_id').eq('user_id', user!.id).maybeSingle()) as any;
    if (memberData) {
      loadPartyDetails(memberData.party_id);
    } else {
      setActiveParty(null);
      setLoading(false);
    }
  };

  const loadPartyDetails = async (partyId: string) => {
    const { data: party } = await supabase.from('workout_parties' as any).select('*').eq('id', partyId).single();
    setActiveParty(party);
    
    // Load members
    const { data: mems } = await supabase.from('party_members' as any).select('*, profiles(name)').eq('party_id', partyId);
    setMembers(mems || []);
    setLoading(false);
  };

  const createParty = async () => {
    setLoading(true);
    const { data: party, error } = (await supabase.from('workout_parties' as any).insert({ leader_id: user!.id, status: 'waiting' }).select().single()) as any;
    if (error) { toast.error('Erro ao criar party'); setLoading(false); return; }
    
    await supabase.from('party_members' as any).insert({ party_id: party.id, user_id: user!.id });
    toast.success('Party criada localmente!');
    loadPartyDetails(party.id);
  };

  const joinParty = async () => {
    if (!joinCode) return;
    setLoading(true);
    const { error } = await supabase.from('party_members' as any).insert({ party_id: joinCode, user_id: user!.id });
    if (error) { toast.error('Código inválido ou party cheia.'); setLoading(false); return; }
    toast.success('Você entrou na party!');
    loadPartyDetails(joinCode);
  };

  const leaveParty = async () => {
    setLoading(true);
    await supabase.from('party_members' as any).delete().eq('user_id', user!.id);
    setActiveParty(null);
    setMembers([]);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" /> Lobby da Party
          </DialogTitle>
          <DialogDescription>Treine com seus amigos simultaneamente.</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {loading ? (
            <p className="text-center text-muted-foreground animate-pulse">Carregando...</p>
          ) : activeParty ? (
            <div className="space-y-4">
               <div className="bg-secondary/50 border border-border p-4 rounded-xl text-center">
                 <p className="text-xs text-muted-foreground mb-1">Código da Party (Envie aos amigos)</p>
                 <div className="flex items-center justify-center gap-2">
                    <p className="font-mono text-sm font-bold truncate max-w-[200px]">{activeParty.id}</p>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => { navigator.clipboard.writeText(activeParty.id); toast('Código copiado!'); }}>
                      <Copy className="h-3 w-3" />
                    </Button>
                 </div>
               </div>

               <div>
                 <Label className="text-xs text-muted-foreground">Membros na Party ({members.length})</Label>
                 <div className="mt-2 space-y-2 max-h-[150px] overflow-y-auto">
                    {members.map(m => (
                      <div key={m.id} className="flex justify-between items-center text-sm p-2 rounded bg-background border border-border">
                        <span className="font-bold">{m.profiles?.name || 'Desconhecido'} {m.user_id === activeParty.leader_id && '👑'}</span>
                        <span className="text-xs text-success">Pronto</span>
                      </div>
                    ))}
                 </div>
               </div>

               <div className="flex gap-2 pt-2">
                 <Button variant="outline" className="flex-1" onClick={leaveParty}>Sair da Party</Button>
                 <Button className="flex-1 font-display" onClick={() => onStartPartyWorkout(activeParty.id)}>
                   <Play className="h-4 w-4 mr-1" /> Começar!
                 </Button>
               </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Button className="w-full h-12" onClick={createParty}>Criar Nova Party</Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Ou Junte-se</span></div>
              </div>

              <div className="space-y-2">
                <Label>Código da Party</Label>
                <div className="flex gap-2">
                  <Input placeholder="Cole o código aqui..." value={joinCode} onChange={e=>setJoinCode(e.target.value)} />
                  <Button variant="secondary" onClick={joinParty}>Entrar</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
