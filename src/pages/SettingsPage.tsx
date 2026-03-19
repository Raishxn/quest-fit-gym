import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings, User, Palette, Dumbbell, Bell, Shield, CreditCard, Info, Copy, Check, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [giftCodes, setGiftCodes] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [loadingAccount, setLoadingAccount] = useState(false);
  const [shareStatus, setShareStatus] = useState(true);

  // Account States
  const [name, setName] = useState(profile?.name || '');
  const [username, setUsername] = useState(profile?.username || '');
  const [email, setEmail] = useState(profile?.email || '');

  useEffect(() => {
    if (profile) {
      setName(profile.name);
      setUsername(profile.username);
      setEmail(profile.email);
      fetchGiftCodes();
      loadPrivacySettings();
    }
  }, [profile]);

  const loadPrivacySettings = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('privacy_share_status')
      .eq('user_id', user.id)
      .single();
    if (data && 'privacy_share_status' in data) {
      setShareStatus(data.privacy_share_status as boolean ?? true);
    }
  };

  const toggleShareStatus = async (val: boolean) => {
    setShareStatus(val);
    if (!user) return;
    await supabase
      .from('profiles')
      .update({ privacy_share_status: val } as any)
      .eq('user_id', user.id);
  };

  const fetchGiftCodes = async () => {
    const { data } = await supabase
      .from('gift_codes' as any)
      .select('*')
      .eq('creator_user_id', user?.id)
      .order('created_at', { ascending: false });
    
    if (data) setGiftCodes(data);
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Código copiado para a área de transferência!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleManageSubscription = async () => {
    try {
      setLoadingPortal(true);
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        body: { userId: profile?.id }
      });
      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Não foi possível acessar o portal de assinaturas.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const handleSaveAccount = async () => {
    if (!user || !profile) return;
    setLoadingAccount(true);
    let emailChanged = false;

    // Update Profile
    if (name !== profile.name || username !== profile.username) {
      const { error } = await supabase.from('profiles').update({
        name,
        username
      }).eq('user_id', user.id);
      
      if (error) {
        toast.error(`Erro ao atualizar perfil: ${error.message}`);
        setLoadingAccount(false);
        return;
      }
    }

    // Update Email in Auth
    if (email !== profile.email) {
      const { error: authError } = await supabase.auth.updateUser({ email });
      if (authError) {
        toast.error(`Erro ao atualizar email: ${authError.message}`);
        setLoadingAccount(false);
        return;
      }
      emailChanged = true;
    }

    toast.success(emailChanged 
      ? 'Perfil salvo! Se você trocou o e-mail, verifique a caixa de entrada de AMBOS os e-mails para confirmar a mudança.' 
      : 'Perfil atualizado com sucesso!'
    );
    setLoadingAccount(false);
  };

  if (!profile) return null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-muted-foreground" /> Configurações
        </h1>
      </motion.div>

      <Tabs defaultValue="account">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="account" className="font-display text-xs"><User className="h-3 w-3 mr-1" />Conta</TabsTrigger>
          <TabsTrigger value="appearance" className="font-display text-xs"><Palette className="h-3 w-3 mr-1" />Aparência</TabsTrigger>
          <TabsTrigger value="training" className="font-display text-xs"><Dumbbell className="h-3 w-3 mr-1" />Treino</TabsTrigger>
          <TabsTrigger value="notifications" className="font-display text-xs"><Bell className="h-3 w-3 mr-1" />Notificações</TabsTrigger>
          <TabsTrigger value="privacy" className="font-display text-xs"><Shield className="h-3 w-3 mr-1" />Privacidade</TabsTrigger>
          <TabsTrigger value="plan" className="font-display text-xs"><CreditCard className="h-3 w-3 mr-1" />Plano</TabsTrigger>
          <TabsTrigger value="about" className="font-display text-xs"><Info className="h-3 w-3 mr-1" />Sobre</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader><CardTitle className="font-display">Conta</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Nome</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
                <div className="space-y-2"><Label>Username</Label><Input value={username} onChange={(e) => setUsername(e.target.value)} /></div>
                <div className="space-y-2"><Label>Email</Label><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
              </div>
              <Button className="font-display" onClick={handleSaveAccount} disabled={loadingAccount}>
                {loadingAccount ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader><CardTitle className="font-display">Aparência</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <ThemeSwitcher />
              <div className="space-y-3">
                <div className="flex items-center justify-between"><Label>Reduzir animações</Label><Switch /></div>
                <div className="flex items-center justify-between"><Label>Sons de level-up</Label><Switch defaultChecked /></div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader><CardTitle className="font-display">Treino e Nutrição</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">Metas calculadas pela anamnese. Ajuste manualmente se necessário (±30%).</p>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Meta Calórica (kcal)</Label><Input type="number" defaultValue="2400" /></div>
                <div className="space-y-2"><Label>Proteína (g)</Label><Input type="number" defaultValue="160" /></div>
                <div className="space-y-2"><Label>Gordura (g)</Label><Input type="number" defaultValue="67" /></div>
                <div className="space-y-2"><Label>Carboidratos (g)</Label><Input type="number" defaultValue="290" /></div>
              </div>
              <Button variant="outline" className="font-display" asChild><Link to="/anamnesis">🧠 Refazer Anamnese</Link></Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader><CardTitle className="font-display">Notificações</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['Streak em risco', 'Personal Record', 'Pedidos de amizade', 'Convites de Party', 'Level-up', 'Conquistas'].map((n) => (
                <div key={n} className="flex items-center justify-between"><Label>{n}</Label><Switch defaultChecked /></div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader><CardTitle className="font-display">Privacidade</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label>Visibilidade do perfil</Label>
                <div className="flex gap-2">
                  {['Público', 'Só amigos', 'Privado'].map((opt) => (
                    <Button key={opt} variant={opt === 'Público' ? 'default' : 'outline'} size="sm">{opt}</Button>
                  ))}
                </div>
              </div>
              {['Histórico de treinos', 'PRs', 'Conquistas'].map((item) => (
                <div key={item} className="flex items-center justify-between"><Label>Ocultar {item.toLowerCase()}</Label><Switch /></div>
              ))}
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compartilhar status de treino</Label>
                  <p className="text-xs text-muted-foreground">Amigos podem ver quando você está treinando e com qual playlist</p>
                </div>
                <Switch checked={shareStatus} onCheckedChange={toggleShareStatus} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center justify-between">
                <span>Plano Atual</span>
                {profile.plan !== 'free' && (
                  <Badge variant="default" className="bg-primary hover:bg-primary uppercase">{profile.plan.replace('_', '+')}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                {profile.plan === 'free' ? (
                  <>
                    <p className="font-display font-bold text-lg">🪨 Free</p>
                    <p className="text-sm text-muted-foreground">Plano Básico. Funcionalidades limitadas.</p>
                  </>
                ) : (
                  <>
                    <p className="font-display font-bold text-lg capitalize">👑 {profile.plan.replace('_', '+')}</p>
                    <p className="text-sm text-muted-foreground">Acesso premium liberado. Você está no topo!</p>
                  </>
                )}
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button className="font-display flex-1" asChild>
                  <Link to="/upgrade">⚔️ Explorar Planos</Link>
                </Button>
                {profile.plan !== 'free' && (
                  <Button variant="outline" className="font-display flex-1" onClick={handleManageSubscription} disabled={loadingPortal}>
                    {loadingPortal ? "Carregando..." : <><ExternalLink className="w-4 h-4 mr-2" /> Gerenciar Assinatura</>}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-display flex items-center gap-2">
                🎁 Meus Códigos de Presente
              </CardTitle>
              <CardDescription>
                Códigos gerados pelas suas compras semestrais ou anuais. Envie para seus amigos!
              </CardDescription>
            </CardHeader>
            <CardContent>
              {giftCodes.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground text-sm border border-dashed rounded-lg bg-secondary/20">
                  Você ainda não gerou nenhum código de presente.<br/>
                  Faça upgrade para um plano Semestral ou Anual para presentear amigos!
                </div>
              ) : (
                <div className="space-y-4">
                  {giftCodes.map((gift) => {
                    const isRedeemed = gift.status !== 'active';
                    return (
                      <div key={gift.id} className={`p-4 rounded-lg border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${isRedeemed ? 'bg-secondary/20 opcaity-80' : 'bg-secondary/50 border-primary/20'}`}>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono font-bold tracking-wider">{gift.code}</span>
                            <Badge variant={isRedeemed ? "outline" : "default"}>{isRedeemed ? 'Resgatado' : 'Disponível'}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Concede {gift.months_granted} {gift.months_granted > 1 ? 'meses' : 'mês'} de <span className="uppercase font-bold text-primary">{gift.plan_granted.replace('_', '+')}</span>
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Validade: {new Date(gift.expires_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button 
                          variant={isRedeemed ? 'outline' : 'secondary'} 
                          size="sm"
                          disabled={isRedeemed}
                          onClick={() => copyToClipboard(gift.code)}
                          className="shrink-0 w-full sm:w-auto"
                        >
                          {copiedCode === gift.code ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                          {copiedCode === gift.code ? 'Copiado' : 'Copiar Código'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="about">
          <Card>
            <CardHeader><CardTitle className="font-display">Quest Fit</CardTitle></CardHeader>
            <CardContent className="space-y-4 flex flex-col items-start">
              <p className="text-sm text-muted-foreground mb-2">Versão 1.0.0 Alpha</p>
              <Button variant="link" asChild className="p-0 h-auto text-primary text-sm font-medium"><Link to="/updates">Atualizações (Patch Notes)</Link></Button>
              <Button variant="link" asChild className="p-0 h-auto text-primary text-sm font-medium"><Link to="/terms">Termos de Uso</Link></Button>
              <Button variant="link" asChild className="p-0 h-auto text-primary text-sm font-medium"><Link to="/privacy">Política de Privacidade</Link></Button>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}
