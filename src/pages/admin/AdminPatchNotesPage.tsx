import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { ScrollText, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPatchNotesPage() {
  const [updates, setUpdates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ id: '', title: '', version: '', body: '' });

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('app_updates').select('*').order('published_at', { ascending: false });
    setUpdates(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.title || !form.version || !form.body) { toast.error('Preencha todos os campos.'); return; }
    const payload = { title: form.title, version: form.version, body: form.body };
    const { error } = form.id
      ? await (supabase as any).from('app_updates').update(payload).eq('id', form.id)
      : await (supabase as any).from('app_updates').insert(payload);
    if (error) toast.error(error.message);
    else { toast.success(form.id ? 'Atualização editada!' : 'Patch Note publicado!'); setDialogOpen(false); load(); }
  };

  const del = async (id: string) => {
    if (!confirm('Excluir este patch note?')) return;
    const { error } = await (supabase as any).from('app_updates').delete().eq('id', id);
    if (error) toast.error(error.message); else { toast.success('Deletado.'); load(); }
  };

  const openEdit = (u: any) => {
    setForm({ id: u.id, title: u.title, version: u.version, body: u.body });
    setDialogOpen(true);
  };

  const openCreate = () => {
    setForm({ id: '', title: '', version: '', body: '' });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <ScrollText className="w-8 h-8 text-primary" />
            Patch Notes
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie atualizações e novidades do QuestFit.</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-1" />Novo Patch Note</Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle>{form.id ? 'Editar Patch Note' : 'Novo Patch Note'}</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Título</Label><Input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Ex: QuestCoins e Loja!" /></div>
              <div><Label>Versão</Label><Input value={form.version} onChange={e => setForm({...form, version: e.target.value})} placeholder="Ex: 1.5.0" /></div>
            </div>
            <div><Label>Conteúdo</Label><Textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} rows={6} placeholder="Novidades, melhorias, correções..." /></div>
            <Button className="w-full" onClick={save}>{form.id ? 'Salvar' : 'Publicar'}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto mt-8" /> : (
        <div className="space-y-4">
          {updates.length === 0 ? (
            <p className="text-muted-foreground text-center py-12 border border-dashed border-border rounded-xl">Nenhum patch note publicado ainda.</p>
          ) : updates.map(u => (
            <Card key={u.id} className="border-border">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{u.title}</CardTitle>
                    <CardDescription>v{u.version} — {new Date(u.published_at).toLocaleDateString('pt-BR')}</CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(u)}><Edit2 className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => del(u.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap leading-relaxed opacity-80">{u.body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
