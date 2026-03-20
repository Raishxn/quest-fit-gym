import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Props {
  onCreated: () => void;
  children: React.ReactNode;
}

export function CreateGuildDialog({ onCreated, children }: Props) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name) {
      toast.error('Preencha o nome da guilda.');
      return;
    }
    setLoading(true);
    // Insert guild
    const { data: guild, error } = await supabase
      .from('guilds')
      .insert({ name, description: desc, owner_id: user!.id })
      .select()
      .single();

    if (error) {
      console.error(error);
      toast.error('Erro ao criar guilda.');
      setLoading(false);
      return;
    }

    // Insert leader into members
    const { error: memberErr } = await supabase
      .from('guild_members')
      .insert({ guild_id: guild.id, user_id: user!.id, role: 'leader' });

    if (memberErr) {
      console.error(memberErr);
      toast.error('Erro ao entrar na guilda criada.');
    } else {
      toast.success('Guilda criada com sucesso!');
      setOpen(false);
      onCreated();
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Fundar Nova Guilda</DialogTitle>
          <DialogDescription>A glória aguarda. Crie seu clã.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nome da Guilda</Label>
            <Input placeholder="Ex: Guerreiros da Luz" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Input placeholder="Um lema para inspirar" value={desc} onChange={e => setDesc(e.target.value)} />
          </div>
          <Button onClick={handleCreate} disabled={loading} className="w-full">
            {loading ? 'Criando...' : 'Fundar Guilda'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
