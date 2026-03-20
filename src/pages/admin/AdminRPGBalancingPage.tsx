import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Swords, Trophy, Medal, Edit2, Trash2, Plus, Loader2, Search, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { fetchAllTitles, unlockTitle } from '@/lib/titles';

// --- Classes Tab ---
function ClassesTab() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    id: '', name: '', archetype: '', rarity: 'common', icon_emoji: '⚔️',
    bonus_type: 'xp', bonus_value: 0, debuff_type: '', debuff_value: 0,
    description: '', unlock_requirement: ''
  });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('classes').select('*').order('name');
    setClasses(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    const payload = {
      name: form.name, archetype: form.archetype, rarity: form.rarity,
      icon_emoji: form.icon_emoji, bonus_type: form.bonus_type, bonus_value: form.bonus_value,
      debuff_type: form.debuff_type || null, debuff_value: form.debuff_value || null,
      description: form.description || null, unlock_requirement: form.unlock_requirement || null
    };
    const { error } = form.id
      ? await supabase.from('classes').update(payload).eq('id', form.id)
      : await supabase.from('classes').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(form.id ? 'Classe atualizada!' : 'Classe criada!'); setDialogOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm('Excluir esta classe?')) return;
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deletada.'); load(); }
  };

  const openEdit = (c: any) => {
    setForm({ id: c.id, name: c.name, archetype: c.archetype, rarity: c.rarity, icon_emoji: c.icon_emoji,
      bonus_type: c.bonus_type, bonus_value: c.bonus_value, debuff_type: c.debuff_type || '',
      debuff_value: c.debuff_value || 0, description: c.description || '', unlock_requirement: c.unlock_requirement || '' });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setForm({ id: '', name: '', archetype: '', rarity: 'common', icon_emoji: '⚔️',
      bonus_type: 'xp', bonus_value: 0, debuff_type: '', debuff_value: 0, description: '', unlock_requirement: '' });
    setDialogOpen(true);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Gerencie classes, bônus e debuffs do sistema RPG.</p>
        <Button size="sm" onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Nova Classe</Button>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? 'Editar Classe' : 'Nova Classe'}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Nome</Label><Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><Label>Arquétipo</Label><Input value={form.archetype} onChange={e => setForm({...form, archetype: e.target.value})} placeholder="strength, agility..." /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><Label>Raridade</Label>
                <Select value={form.rarity} onValueChange={v => setForm({...form, rarity: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="rare">Rare</SelectItem>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="legendary">Legendary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Emoji</Label><Input value={form.icon_emoji} onChange={e => setForm({...form, icon_emoji: e.target.value})} /></div>
              <div><Label>Bônus Tipo</Label><Input value={form.bonus_type} onChange={e => setForm({...form, bonus_type: e.target.value})} placeholder="xp, str, end..." /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Bônus Valor</Label><Input type="number" value={form.bonus_value} onChange={e => setForm({...form, bonus_value: Number(e.target.value)})} /></div>
              <div><Label>Debuff Tipo</Label><Input value={form.debuff_type} onChange={e => setForm({...form, debuff_type: e.target.value})} placeholder="Opcional" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Debuff Valor</Label><Input type="number" value={form.debuff_value} onChange={e => setForm({...form, debuff_value: Number(e.target.value)})} /></div>
              <div><Label>Requisito</Label><Input value={form.unlock_requirement} onChange={e => setForm({...form, unlock_requirement: e.target.value})} placeholder="Opcional" /></div>
            </div>
            <div><Label>Descrição</Label><Input value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
            <Button className="w-full" onClick={save}>{form.id ? 'Salvar' : 'Criar'}</Button>
          </div>
        </DialogContent>
      </Dialog>
      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto mt-8" /> : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader><TableRow>
              <TableHead></TableHead><TableHead>Nome</TableHead><TableHead>Arquétipo</TableHead>
              <TableHead>Raridade</TableHead><TableHead>Bônus</TableHead><TableHead>Debuff</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {classes.map(c => (
                <TableRow key={c.id}>
                  <TableCell className="text-xl">{c.icon_emoji}</TableCell>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell className="capitalize">{c.archetype}</TableCell>
                  <TableCell className="capitalize">{c.rarity}</TableCell>
                  <TableCell className="text-green-400">+{c.bonus_value} {c.bonus_type}</TableCell>
                  <TableCell className="text-red-400">{c.debuff_type ? `-${c.debuff_value} ${c.debuff_type}` : '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

// --- Titles Tab ---
function TitlesTab() {
  const [titles, setTitles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantDialog, setGrantDialog] = useState(false);
  const [grantTitleId, setGrantTitleId] = useState('');
  const [grantEmail, setGrantEmail] = useState('');
  const [granting, setGranting] = useState(false);

  const load = async () => {
    setLoading(true);
    const data = await fetchAllTitles();
    setTitles(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const grantTitle = async () => {
    if (!grantEmail || !grantTitleId) { toast.error('Preencha email e título.'); return; }
    setGranting(true);
    // Find user by email
    const { data: profiles } = await supabase.from('profiles').select('user_id').eq('email', grantEmail).limit(1);
    if (!profiles || profiles.length === 0) {
      toast.error('Usuário não encontrado com esse email.');
      setGranting(false);
      return;
    }
    const userId = profiles[0].user_id;
    // Check if already has title
    const { data: existing } = await (supabase as any).from('user_titles').select('id').eq('user_id', userId).eq('title_id', grantTitleId);
    if (existing && existing.length > 0) {
      toast.error('Usuário já possui esse título.');
      setGranting(false);
      return;
    }
    try {
      await unlockTitle(userId, grantTitleId);
      toast.success('Título concedido com sucesso!'); setGrantDialog(false); setGrantEmail('');
    } catch (e: any) {
      toast.error(e.message);
    }
    setGranting(false);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-muted-foreground">Lista de todos os títulos registrados no sistema.</p>
        <Button size="sm" variant="outline" onClick={() => setGrantDialog(true)}>
          <UserPlus className="w-4 h-4 mr-1" />Conceder Título
        </Button>
      </div>
      <Dialog open={grantDialog} onOpenChange={setGrantDialog}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle>Conceder Título a Usuário</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div><Label>Email do Usuário</Label><Input value={grantEmail} onChange={e => setGrantEmail(e.target.value)} placeholder="usuario@email.com" /></div>
            <div><Label>Título</Label>
              <Select value={grantTitleId} onValueChange={setGrantTitleId}>
                <SelectTrigger><SelectValue placeholder="Selecione um título" /></SelectTrigger>
                <SelectContent>
                  {titles.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button className="w-full" onClick={grantTitle} disabled={granting}>
              {granting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Conceder'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto mt-8" /> : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader><TableRow>
              <TableHead>Nome</TableHead><TableHead>Descrição</TableHead>
              <TableHead>Buff</TableHead><TableHead>Requisito</TableHead><TableHead>Único?</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {titles.map(t => (
                <TableRow key={t.id}>
                  <TableCell className="font-bold text-primary">{t.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{t.description}</TableCell>
                  <TableCell className="text-green-400">{t.buff_type ? `+${t.buff_value} ${t.buff_type}` : '—'}</TableCell>
                  <TableCell className="capitalize text-sm">{t.requirement_type ? `${t.requirement_type}: ${t.requirement_value}` : '—'}</TableCell>
                  <TableCell>{t.is_unique ? '✨ Sim' : 'Não'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

// --- Achievements Tab ---
function AchievementsTab() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase.from('achievements').select('*').order('category');
      setAchievements(data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <>
      <p className="text-sm text-muted-foreground mb-4">Conquistas registradas do sistema. Para adicionar/remover, edite diretamente no Supabase.</p>
      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto mt-8" /> : (
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader><TableRow>
              <TableHead></TableHead><TableHead>Nome</TableHead><TableHead>Descrição</TableHead>
              <TableHead>Categoria</TableHead><TableHead>XP</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {achievements.map(a => (
                <TableRow key={a.id}>
                  <TableCell className="text-xl">{a.icon_emoji}</TableCell>
                  <TableCell className="font-medium">{a.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-xs truncate">{a.description}</TableCell>
                  <TableCell className="capitalize">{a.category}</TableCell>
                  <TableCell className="text-yellow-400 font-bold">+{a.xp_reward}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}

// --- Main Page ---
export default function AdminRPGBalancingPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Swords className="w-8 h-8 text-primary" />
          Balanceamento RPG
        </h1>
        <p className="text-muted-foreground mt-1">Gerencie classes, títulos e conquistas do universo QuestFit.</p>
      </div>

      <Tabs defaultValue="classes" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="classes" className="flex items-center gap-1.5"><Swords className="w-4 h-4" />Classes</TabsTrigger>
          <TabsTrigger value="titles" className="flex items-center gap-1.5"><Medal className="w-4 h-4" />Títulos</TabsTrigger>
          <TabsTrigger value="achievements" className="flex items-center gap-1.5"><Trophy className="w-4 h-4" />Conquistas</TabsTrigger>
        </TabsList>

        <TabsContent value="classes" className="mt-6"><ClassesTab /></TabsContent>
        <TabsContent value="titles" className="mt-6"><TitlesTab /></TabsContent>
        <TabsContent value="achievements" className="mt-6"><AchievementsTab /></TabsContent>
      </Tabs>
    </div>
  );
}
