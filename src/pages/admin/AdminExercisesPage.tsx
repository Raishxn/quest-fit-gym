import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash, ActivitySquare, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface ExerciseItem {
  id: string;
  name: string;
  muscle_group: string;
  equipment: string;
  is_deleted: boolean;
}

export default function AdminExercisesPage() {
  const [exercises, setExercises] = useState<ExerciseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEx, setEditingEx] = useState<ExerciseItem | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ name: '', muscle_group: '', equipment: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('exercises' as any)
      .select('*')
      .order('name');
      
    if (error) {
      toast.error('Erro ao buscar exercícios: ' + error.message);
    } else {
      setExercises((data as any[]) || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (ex?: ExerciseItem) => {
    if (ex) {
      setEditingEx(ex);
      setFormData({ name: ex.name, muscle_group: ex.muscle_group, equipment: ex.equipment });
    } else {
      setEditingEx(null);
      setFormData({ name: '', muscle_group: '', equipment: '' });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.muscle_group || !formData.equipment) {
      toast.error('Preencha os campos obrigatórios.');
      return;
    }

    setSaving(true);
    let error;

    if (editingEx) {
      // Update
      const res = await supabase.from('exercises' as any).update({
        name: formData.name,
        muscle_group: formData.muscle_group,
        equipment: formData.equipment
      }).eq('id', editingEx.id);
      error = res.error;
    } else {
      // Insert
      const res = await supabase.from('exercises' as any).insert({
        name: formData.name,
        muscle_group: formData.muscle_group,
        equipment: formData.equipment,
        is_deleted: false,
      });
      error = res.error;
    }

    setSaving(false);

    if (error) {
      toast.error('Erro ao salvar exercício: ' + error.message);
    } else {
      toast.success(editingEx ? 'Exercício atualizado com sucesso!' : 'Exercício criado com sucesso!');
      setIsDialogOpen(false);
      fetchExercises();
    }
  };

  const handleToggleDelete = async (id: string, currentlyDeleted: boolean) => {
    const { error } = await supabase.from('exercises' as any).update({
      is_deleted: !currentlyDeleted
    }).eq('id', id);

    if (error) {
      toast.error('Erro ao alterar status: ' + error.message);
    } else {
      toast.success(currentlyDeleted ? 'Exercício restaurado.' : 'Exercício inativado.');
      fetchExercises();
    }
  };

  const filteredExercises = exercises.filter(e => 
    e.name.toLowerCase().includes(search.toLowerCase()) || 
    e.muscle_group.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-2">
             <ActivitySquare className="h-8 w-8" /> Base de Exercícios
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie os exercícios oficiais (QuestFit Default) da plataforma.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Buscar exercício..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button onClick={() => handleOpenDialog()} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Novo Exercício
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Grupo Muscular</TableHead>
                <TableHead>Equipamento</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Carregando catálogo...</TableCell>
                </TableRow>
              ) : filteredExercises.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Nenhum exercício encontrado.</TableCell>
                </TableRow>
              ) : (
                filteredExercises.map((ex) => (
                  <TableRow key={ex.id} className={ex.is_deleted ? 'opacity-50' : ''}>
                    <TableCell className="font-medium">{ex.name}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded">{ex.muscle_group}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-secondary/50 px-2 py-0.5 rounded">{ex.equipment}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      {ex.is_deleted ? (
                        <span className="text-[10px] uppercase font-bold text-destructive bg-destructive/10 px-2 py-1 rounded">Deletado/Inativo</span>
                      ) : (
                        <span className="text-[10px] uppercase font-bold text-primary bg-primary/10 px-2 py-1 rounded">Ativo</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenDialog(ex)} title="Editar Exercício">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant={ex.is_deleted ? "secondary" : "destructive"} 
                          size="sm" 
                          onClick={() => handleToggleDelete(ex.id, ex.is_deleted)}
                          title={ex.is_deleted ? "Restaurar" : "Inativar"}
                        >
                          {ex.is_deleted ? <RefreshCw className="h-4 w-4" /> : <Trash className="h-4 w-4" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insert / Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingEx ? 'Editar Exercício' : 'Novo Exercício'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome do Exercício</Label>
              <Input 
                placeholder="Ex: Supino Reto" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Grupo Muscular</Label>
                <Input 
                  placeholder="Ex: peito" 
                  value={formData.muscle_group} 
                  onChange={(e) => setFormData({...formData, muscle_group: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Equipamento</Label>
                <Input 
                  placeholder="Ex: barra" 
                  value={formData.equipment} 
                  onChange={(e) => setFormData({...formData, equipment: e.target.value})} 
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
