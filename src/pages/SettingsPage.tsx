import { motion } from 'framer-motion';
import { Settings, User, Palette, Dumbbell, Bell, Shield, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ThemeSwitcher } from '@/components/shared/ThemeSwitcher';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { profile } = useAuth();
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
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader><CardTitle className="font-display">Conta</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2"><Label>Nome</Label><Input defaultValue={profile.name} /></div>
                <div className="space-y-2"><Label>Username</Label><Input defaultValue={profile.username} /></div>
                <div className="space-y-2"><Label>Email</Label><Input defaultValue={profile.email} disabled /></div>
              </div>
              <Button className="font-display">Salvar Alterações</Button>
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
              <Button variant="outline" className="font-display">🧠 Refazer Anamnese</Button>
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
              {['Histórico de treinos', 'PRs', 'Conquistas', 'Status online'].map((item) => (
                <div key={item} className="flex items-center justify-between"><Label>Ocultar {item.toLowerCase()}</Label><Switch /></div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="plan">
          <Card>
            <CardHeader><CardTitle className="font-display">Plano Atual</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                <p className="font-display font-bold text-lg">🪨 Free</p>
                <p className="text-sm text-muted-foreground">2 programas • 10 exercícios custom • histórico 30d</p>
              </div>
              <Button className="font-display w-full" asChild><a href="/upgrade">⚔️ Fazer Upgrade</a></Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
