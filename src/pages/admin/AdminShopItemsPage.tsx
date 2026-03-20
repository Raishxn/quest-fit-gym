import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, Edit2, Loader2, Store } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function AdminShopItemsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    price: 0,
    item_type: 'title',
    content: '',
    is_premium: false,
    image_url: ''
  });

  const loadItems = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('shop_items').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error('Erro ao carregar itens: ' + error.message);
    } else {
      setItems(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleCreateOrUpdate = async () => {
    if (!formData.name || !formData.item_type || formData.price <= 0) {
      toast.error('Preencha os campos obrigatórios básicos corretamente.');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description || null,
      price: formData.price,
      item_type: formData.item_type,
      content: formData.content || null,
      is_premium: formData.is_premium,
      image_url: formData.image_url || null
    };

    if (formData.id) {
      // Update
      const { error } = await supabase.from('shop_items').update(payload).eq('id', formData.id);
      if (error) toast.error('Erro ao atualizar: ' + error.message);
      else {
        toast.success('Item atualizado com sucesso!');
        setIsDialogOpen(false);
        loadItems();
      }
    } else {
      // Create
      const { error } = await supabase.from('shop_items').insert(payload);
      if (error) toast.error('Erro ao criar: ' + error.message);
      else {
        toast.success('Item criado com sucesso!');
        setIsDialogOpen(false);
        loadItems();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este item da loja permanentemente? (Pode quebrar relacionamentos se usuários já compraram)')) return;
    const { error } = await supabase.from('shop_items').delete().eq('id', id);
    if (error) {
      toast.error('Erro ao deletar: ' + error.message);
    } else {
      toast.success('Item deletado.');
      setItems(items.filter(i => i.id !== id));
    }
  };

  const openEdit = (item: any) => {
    setFormData({
      id: item.id,
      name: item.name,
      description: item.description || '',
      price: item.price,
      item_type: item.item_type,
      content: item.content || '',
      is_premium: item.is_premium || false,
      image_url: item.image_url || ''
    });
    setIsDialogOpen(true);
  };

  const openCreate = () => {
    setFormData({
      id: '',
      name: '',
      description: '',
      price: 100,
      item_type: 'title',
      content: '',
      is_premium: false,
      image_url: ''
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-2">
            <Store className="w-8 h-8 text-primary" />
            Loja IN-GAME
          </h1>
          <p className="text-muted-foreground mt-1">
            Crie, edite e remova os itens que os usuários podem comprar com QuestCoins.
          </p>
        </div>
        <Button onClick={openCreate} className="w-full md:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Novo Item
        </Button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{formData.id ? 'Editar Item' : 'Criar Novo Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Nome do Item</Label>
              <Input 
                value={formData.name} 
                onChange={e => setFormData({ ...formData, name: e.target.value })} 
                placeholder="Ex: Título Lendário, O Aniquilador"
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input 
                value={formData.description} 
                onChange={e => setFormData({ ...formData, description: e.target.value })} 
                placeholder="Descrição que aparece no card..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço (QuestCoins)</Label>
                <Input 
                  type="number"
                  value={formData.price} 
                  onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo do Item</Label>
                <Select value={formData.item_type} onValueChange={v => setFormData({ ...formData, item_type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Título de Perfil</SelectItem>
                    <SelectItem value="frame">Moldura</SelectItem>
                    <SelectItem value="consumable">Consumível</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Conteúdo Interno / Chave (Opcional)</Label>
              <Input 
                value={formData.content} 
                onChange={e => setFormData({ ...formData, content: e.target.value })} 
                placeholder="Ex: 'O Destruidor' se for title, 'frame-fire' se for moldura."
              />
              <p className="text-xs text-muted-foreground mt-1">Isso será usado no código para aplicar o cosmético.</p>
            </div>
            <div className="space-y-2">
              <Label>URL da Imagem (Opcional)</Label>
              <Input 
                value={formData.image_url} 
                onChange={e => setFormData({ ...formData, image_url: e.target.value })} 
                placeholder="https://sua-imagem..."
              />
            </div>
            <div className="flex items-center justify-between border border-border p-4 rounded-lg bg-secondary/20">
              <div className="space-y-0.5">
                <Label>Requer plano VIP/PRO?</Label>
                <p className="text-xs text-muted-foreground">Somente premium poderão comprar.</p>
              </div>
              <Switch 
                checked={formData.is_premium} 
                onCheckedChange={c => setFormData({ ...formData, is_premium: c })} 
              />
            </div>
            <Button className="w-full mt-4" onClick={handleCreateOrUpdate}>
              {formData.id ? 'Salvar Alterações' : 'Criar Item'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Itens Cadastrados</CardTitle>
          <CardDescription>Lista completa de itens disponíveis no shop.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>
          ) : (
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>VIP?</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                        Nenhum item cadastrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-yellow-500 font-bold">{item.price} QC</TableCell>
                        <TableCell className="capitalize">{item.item_type}</TableCell>
                        <TableCell>{item.is_premium ? 'Sim' : 'Não'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
