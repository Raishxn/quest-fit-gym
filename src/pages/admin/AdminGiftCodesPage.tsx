import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Copy, Gift, Settings2, ShieldCheck, Zap, Plus } from "lucide-react";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface GiftCodeRow {
  id: string;
  code: string;
  plan_granted: string;
  months_granted: number;
  status: string;
  created_at: string;
  expires_at: string;
  redeemed_at: string | null;
  redeemed_by_user_id: string | null;
  redeemed_by?: { name: string; username: string };
}

export default function AdminGiftCodesPage() {
  const { user } = useAuth();
  const [codes, setCodes] = useState<GiftCodeRow[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    quantity: 1,
    plan_granted: 'vip',
    months_granted: 1,
  });

  useEffect(() => {
    fetchCodes();
  }, []);

  const fetchCodes = async () => {
    setLoading(true);
    // Fetch codes
    const { data: codesData, error: codesError } = await supabase
      .from('gift_codes' as any)
      .select('*')
      .order('created_at', { ascending: false });
      
    if (codesError) {
      toast.error('Erro ao buscar códigos: ' + codesError.message);
      setLoading(false);
      return;
    }

    // Fetch profiles of redeemers if any
    const redeemerIds = Array.from(new Set(((codesData as any[]) || []).map(c => c.redeemed_by_user_id).filter(id => id)));
    
    let profilesDict: Record<string, any> = {};
    if (redeemerIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, name, username')
        .in('user_id', redeemerIds);

      profilesDict = (profilesData || []).reduce((acc: any, p: any) => {
        acc[p.user_id] = p;
        return acc;
      }, {});
    }

    const mappedCodes = ((codesData as any[]) || []).map(c => ({
      ...c,
      redeemed_by: c.redeemed_by_user_id ? profilesDict[c.redeemed_by_user_id] : undefined,
    }));

    setCodes(mappedCodes);
    setLoading(false);
  };

  const generateRandomCode = (plan: string) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${plan.toUpperCase()}-${code.substring(0,4)}-${code.substring(4,8)}`;
  };

  const handleGenerate = async () => {
    if (!user) return;
    if (formData.quantity < 1 || formData.quantity > 50) {
      toast.error('A quantidade deve ser entre 1 e 50.');
      return;
    }

    setSaving(true);

    const now = new Date();
    // Expiration: 30 days from now
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const newCodes = Array.from({ length: formData.quantity }).map(() => ({
      code: generateRandomCode(formData.plan_granted),
      creator_user_id: user.id,
      expires_at: expiresAt,
      months_granted: formData.months_granted,
      plan_granted: formData.plan_granted,
      source_interval: 'admin_manual',
      source_plan: 'admin_generated',
      status: 'active',
    }));

    const { error } = await supabase.from('gift_codes' as any).insert(newCodes);

    setSaving(false);

    if (error) {
       toast.error('Erro ao gerar códigos: ' + error.message);
    } else {
       toast.success(`${formData.quantity} código(s) gerado(s) com sucesso!`);
       setIsDialogOpen(false);
       fetchCodes();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Código copiado!');
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'active': return <span className="bg-success/20 text-success text-xs px-2 py-0.5 rounded uppercase font-bold">Ativo</span>;
          case 'redeemed': return <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded uppercase font-bold">Resgatado</span>;
          case 'expired': return <span className="bg-destructive/20 text-destructive text-xs px-2 py-0.5 rounded uppercase font-bold">Expirado</span>;
          default: return <span className="bg-secondary text-secondary-foreground text-xs px-2 py-0.5 rounded uppercase font-bold">{status}</span>;
      }
  };

  const getPlanBadge = (plan: string) => {
    if (plan === 'pro') return <span className="flex items-center gap-1 text-purple-400 text-xs font-bold"><Zap className="w-3 h-3"/> PRO</span>;
    if (plan === 'vip_plus') return <span className="flex items-center gap-1 text-yellow-500 text-xs font-bold"><ShieldCheck className="w-3 h-3"/> VIP+</span>;
    return <span className="flex items-center gap-1 text-primary text-xs font-bold"><Settings2 className="w-3 h-3"/> VIP</span>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary flex items-center gap-2">
             <Gift className="h-8 w-8" /> Códigos Promocionais
          </h1>
          <p className="text-muted-foreground mt-1">Gere e gerencie Gift Codes para distribuir planos especiais.</p>
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
           <Plus className="h-4 w-4" /> Gerar Códigos
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Plano (Meses)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Resgatado Por</TableHead>
                <TableHead>Data Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Carregando códigos...</TableCell>
                </TableRow>
              ) : codes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Nenhum código gerado ainda.</TableCell>
                </TableRow>
              ) : (
                codes.map((c) => (
                  <TableRow key={c.id} className={c.status !== 'active' ? 'opacity-60' : ''}>
                    <TableCell className="font-mono font-bold tracking-wider">{c.code}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                          {getPlanBadge(c.plan_granted)}
                          <span className="text-xs text-muted-foreground">({c.months_granted}m)</span>
                      </div>
                    </TableCell>
                    <TableCell>
                        {getStatusBadge(c.status)}
                    </TableCell>
                    <TableCell>
                        {c.redeemed_by ? (
                           <div className="flex flex-col">
                              <span className="text-sm font-medium">{c.redeemed_by.name}</span>
                              <span className="text-xs text-muted-foreground">@{c.redeemed_by.username}</span>
                           </div>
                        ) : (
                            <span className="text-xs text-muted-foreground italic">-</span>
                        )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                        {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard(c.code)} title="Copiar Código">
                        <Copy className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Generate Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Gerar Novos Códigos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Plano Concedido</Label>
                <Select value={formData.plan_granted} onValueChange={(v) => setFormData({...formData, plan_granted: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vip">VIP</SelectItem>
                    <SelectItem value="vip_plus">VIP+</SelectItem>
                    <SelectItem value="pro">PRO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duração (Meses)</Label>
                <Input 
                  type="number"
                  min="1"
                  max="12"
                  value={formData.months_granted} 
                  onChange={(e) => setFormData({...formData, months_granted: parseInt(e.target.value) || 1})} 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Quantidade a Gerar</Label>
              <Input 
                type="number"
                min="1"
                max="50"
                value={formData.quantity} 
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} 
              />
              <p className="text-[10px] text-muted-foreground">Máximo de 50 códigos por vez.</p>
            </div>
            
            <div className="bg-primary/5 p-3 rounded text-sm text-primary flex items-start gap-2 border border-primary/20">
               <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0" />
               <p>Estes códigos terão validade de <b>30 dias</b> a partir de agora para serem resgatados.</p>
            </div>

          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={saving}>Cancelar</Button>
            <Button onClick={handleGenerate} disabled={saving} className="font-display">
              {saving ? 'Gerando...' : '⚙️ Gerar Códigos'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
